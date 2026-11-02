const { validateLead, normalizeEmail, tomorrow, invalid, text, STAGES, STAGE_LABELS } = require('./salesFields');

function createSalesService(db) {
  async function initialize() {
    await db.query(`CREATE TABLE IF NOT EXISTS sales_leads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL DEFAULT '',
      company VARCHAR(255) NOT NULL DEFAULT '',
      phone VARCHAR(50) NOT NULL DEFAULT '',
      source VARCHAR(40) NOT NULL DEFAULT 'manual',
      stage ENUM('new','consultation','proposal','signed','won','lost') NOT NULL DEFAULT 'new',
      value DECIMAL(12,2) NOT NULL DEFAULT 0,
      next_action VARCHAR(500) NOT NULL DEFAULT '',
      follow_up_date DATE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX follow_up (stage, follow_up_date)
    )`);
    await db.query(`CREATE TABLE IF NOT EXISTS sales_activities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lead_id INT NOT NULL,
      kind VARCHAR(30) NOT NULL,
      description TEXT NOT NULL,
      created_by INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES sales_leads(id) ON DELETE CASCADE,
      INDEX lead_timeline (lead_id, created_at)
    )`);
    await db.query(`CREATE TABLE IF NOT EXISTS sales_sync_events (
      event_key VARCHAR(80) PRIMARY KEY,
      lead_id INT NOT NULL,
      processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES sales_leads(id) ON DELETE CASCADE
    )`);
  }

  // No subscription/list changes: an inquiry is not marketing consent.
  async function captureLead(input, source = 'manual') {
    const email = normalizeEmail(input.email);
    const [result] = await db.query(`INSERT INTO sales_leads
      (email, name, company, phone, source, next_action, follow_up_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
    [email, String(input.name || '').trim().slice(0, 255), String(input.company || '').trim().slice(0, 255),
      String(input.phone || '').trim().slice(0, 50), source,
      source === 'inquiry' ? 'Review inquiry and respond' : 'Review audit and invite to a consultation', tomorrow()]);
    return result.insertId;
  }

  async function importAudits() {
    for (const [table, source] of [['brand_audits', 'brand_audit'], ['accessibility_audits', 'accessibility_audit']]) {
      await db.query(`INSERT INTO sales_leads (email, name, company, phone, source, next_action, follow_up_date)
        SELECT LOWER(TRIM(email)), COALESCE(MAX(first_name), ''), MAX(business_name), COALESCE(MAX(phone), ''), ?,
          'Review audit and invite to a consultation', ?
        FROM ${table} WHERE TRIM(email) REGEXP '^[^[:space:]@<>]+@[^[:space:]@<>]+[.][^[:space:]@<>]+$'
        GROUP BY LOWER(TRIM(email))
        ON DUPLICATE KEY UPDATE id = sales_leads.id`, [source, tomorrow()]);
    }
  }

  async function getLead(id, executor = db, lock = false) {
    const [rows] = await executor.query(`SELECT * FROM sales_leads WHERE id = ?${lock ? ' FOR UPDATE' : ''}`, [id]);
    if (!rows.length) { const error = new Error('Lead not found'); error.status = 404; throw error; }
    return rows[0];
  }

  async function transaction(work) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const result = await work(conn);
      await conn.commit();
      return result;
    } catch (error) { await conn.rollback(); throw error; }
    finally { conn.release(); }
  }

  async function advanceFromSource({ eventKey, email, name, source, target, description }) {
    email = normalizeEmail(email);
    return transaction(async conn => {
      // Upsert and lock the contact before recording the event, so concurrent
      // bookings/signatures cannot create duplicate contacts or regress a stage.
      await conn.query(`INSERT INTO sales_leads (email, name, source) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`, [email, String(name || '').slice(0, 255), source]);
      const [[lead]] = await conn.query('SELECT * FROM sales_leads WHERE email = ? FOR UPDATE', [email]);
      const [seen] = await conn.query('SELECT event_key FROM sales_sync_events WHERE event_key = ?', [eventKey]);
      if (seen.length) return lead;
      await conn.query('INSERT INTO sales_sync_events (event_key, lead_id) VALUES (?, ?)', [eventKey, lead.id]);
      const advances = !['won', 'lost'].includes(lead.stage) && STAGES.indexOf(lead.stage) < STAGES.indexOf(target);
      if (advances) await conn.query('UPDATE sales_leads SET stage = ? WHERE id = ?', [target, lead.id]);
      const outcome = advances
        ? `Stage: ${STAGE_LABELS[STAGES.indexOf(lead.stage)]} → ${STAGE_LABELS[STAGES.indexOf(target)]}`
        : `Kept ${STAGE_LABELS[STAGES.indexOf(lead.stage)]}; automatic updates never reopen closed leads or move stages backward`;
      await conn.query(`INSERT INTO sales_activities (lead_id, kind, description) VALUES (?, 'automation', ?)`, [lead.id, `${description}. ${outcome}.`]);
      return getLead(lead.id, conn);
    });
  }

  async function syncBooking(id) {
    const [[meeting]] = await db.query(`SELECT m.id, m.type, m.status, m.date, m.time, u.email, u.name
      FROM meetings m JOIN users u ON m.user_id = u.id WHERE m.id = ?`, [id]);
    if (!meeting || meeting.status === 'canceled' || !['discovery', 'strategy'].includes(meeting.type)) return null;
    return advanceFromSource({ eventKey: `booking:${meeting.id}`, email: meeting.email, name: meeting.name,
      source: 'booking', target: 'consultation', description: `Consultation booked automatically: meeting #${meeting.id}, ${meeting.date} ${meeting.time} CT` });
  }

  async function syncContract(id) {
    const [[contract]] = await db.query(`SELECT c.id, c.status, c.title, c.contract_data,
      COALESCE(NULLIF(TRIM(c.client_email), ''), u.email) email, u.name
      FROM contracts c LEFT JOIN users u ON c.client_user_id = u.id WHERE c.id = ?`, [id]);
    if (!contract || contract.status !== 'signed') return null;
    const data = typeof contract.contract_data === 'string' ? JSON.parse(contract.contract_data) : contract.contract_data;
    // An NDA signature is not acceptance of a paid services agreement.
    if (data?.agreementType === 'mutual-nda' || !contract.email) return null;
    return advanceFromSource({ eventKey: `contract:${contract.id}`, email: contract.email, name: contract.name,
      source: 'contract', target: 'signed', description: `Contract signed automatically: #${contract.id} ${contract.title}` });
  }

  async function reconcile() {
    // Recover any source write whose immediate synchronization failed. Event IDs
    // make retries safe and preserve later manual stage decisions after a restart.
    const [bookings] = await db.query(`SELECT m.id FROM meetings m
      LEFT JOIN sales_sync_events e ON e.event_key = CONCAT('booking:', m.id)
      WHERE e.event_key IS NULL AND m.status != 'canceled' AND m.type IN ('discovery', 'strategy')`);
    const [contracts] = await db.query(`SELECT c.id FROM contracts c
      LEFT JOIN sales_sync_events e ON e.event_key = CONCAT('contract:', c.id)
      WHERE e.event_key IS NULL AND c.status = 'signed'
        AND COALESCE(JSON_UNQUOTE(JSON_EXTRACT(c.contract_data, '$.agreementType')), '') != 'mutual-nda'`);
    for (const [records, sync] of [[bookings, syncBooking], [contracts, syncContract]]) {
      for (const record of records) {
        try { await sync(record.id); }
        catch (error) { console.error(`Sales synchronization failed for source #${record.id}:`, error.message); }
      }
    }
  }

  async function create(input, actor) {
    const fields = validateLead(input, true);
    return transaction(async conn => {
      const [result] = await conn.query(`INSERT INTO sales_leads (email, name, company, phone, next_action, follow_up_date)
        VALUES (?, ?, ?, ?, ?, ?)`, [fields.email, fields.name || '', fields.company || '', fields.phone || '', fields.next_action || 'Contact prospect', 'follow_up_date' in fields ? fields.follow_up_date : tomorrow()]);
      await conn.query(`INSERT INTO sales_activities (lead_id, kind, description, created_by) VALUES (?, 'created', 'Lead added manually', ?)`, [result.insertId, actor]);
      return updateFields(conn, result.insertId, fields, actor);
    });
  }

  async function updateFields(conn, id, fields, actor) {
    const before = await getLead(id, conn, true);
    delete fields.email;
    const stage = fields.stage || before.stage;
    if (['won', 'lost'].includes(stage)) fields.follow_up_date = null;
    if (['won', 'lost'].includes(stage) && fields.next_action) invalid('Reopen the lead before setting a next action');
    if (['won', 'lost'].includes(stage)) fields.next_action = '';
    const changes = Object.entries(fields).filter(([key, value]) => String(before[key] ?? '') !== String(value ?? ''));
    if (changes.length) {
      await conn.query(`UPDATE sales_leads SET ${changes.map(([key]) => `${key} = ?`).join(', ')} WHERE id = ?`, [...changes.map(([, value]) => value), id]);
      const labels = changes.map(([key, value]) => key === 'stage' ? `Stage: ${STAGE_LABELS[STAGES.indexOf(before.stage)]} → ${STAGE_LABELS[STAGES.indexOf(value)]}` : key === 'follow_up_date' ? `Follow-up: ${value || 'cleared'}` : `${key.replace('_', ' ')} updated`);
      await conn.query(`INSERT INTO sales_activities (lead_id, kind, description, created_by) VALUES (?, 'updated', ?, ?)`, [id, labels.join('; '), actor]);
    }
    return getLead(id, conn);
  }

  async function update(id, input, actor) {
    const fields = validateLead(input);
    return transaction(conn => updateFields(conn, id, fields, actor));
  }

  async function addActivity(id, input, actor) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) invalid('Activity details are required');
    const description = text(input.description, 'Activity', 5000, true);
    if (!['note', 'follow_up'].includes(input.kind)) invalid('Invalid activity type');
    return transaction(async conn => {
      await getLead(id, conn, true);
      await conn.query('INSERT INTO sales_activities (lead_id, kind, description, created_by) VALUES (?, ?, ?, ?)', [id, input.kind, description, actor]);
      if (input.kind === 'follow_up') await conn.query("UPDATE sales_leads SET follow_up_date = NULL, next_action = '' WHERE id = ?", [id]);
      return getLead(id, conn);
    });
  }

  async function history(id) {
    const lead = await getLead(id);
    const [activities] = await db.query(`SELECT CONCAT('activity-', a.id) AS id, a.kind, a.description, a.created_at,
      u.name AS actor FROM sales_activities a LEFT JOIN users u ON a.created_by = u.id WHERE a.lead_id = ?`, [id]);
    // Source records remain authoritative; match a contact by normalized email.
    // Optional tables may not exist until their existing module is first used.
    const sources = [
      ['brand_audits', "SELECT CONCAT('brand-', id) id, 'audit' kind, CONCAT('Brand audit: ', business_name, ' · ', status) description, created_at FROM brand_audits WHERE LOWER(TRIM(email)) = ?"],
      ['accessibility_audits', "SELECT CONCAT('accessibility-', id) id, 'audit' kind, CONCAT('Accessibility check: ', business_name, ' · ', status) description, created_at FROM accessibility_audits WHERE LOWER(TRIM(email)) = ?"],
      ['contact_submissions', "SELECT CONCAT('inquiry-', id) id, 'inquiry' kind, CONCAT(COALESCE(service, 'Inquiry'), ': ', message) description, created_at FROM contact_submissions WHERE LOWER(TRIM(email)) = ?"],
      ['meetings', "SELECT CONCAT('meeting-', m.id) id, 'meeting' kind, CONCAT('Meeting: ', m.date, ' ', m.time, ' CT · ', m.status) description, m.created_at FROM meetings m JOIN users u ON m.user_id = u.id WHERE LOWER(TRIM(u.email)) = ?"],
      ['contracts', "SELECT CONCAT('contract-', id) id, 'contract' kind, CONCAT('Contract: ', title, ' · ', status) description, created_at FROM contracts WHERE LOWER(TRIM(client_email)) = ?"],
      ['client_projects', "SELECT CONCAT('project-', id) id, 'project' kind, CONCAT('Project: ', name, ' · ', status) description, created_at FROM client_projects WHERE LOWER(TRIM(client_email)) = ?"],
    ];
    for (const [, sql] of sources) {
      try { const [rows] = await db.query(sql, [lead.email]); activities.push(...rows); }
      catch (error) { if (error.code !== 'ER_NO_SUCH_TABLE') throw error; }
    }
    return { lead, activities: activities.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)) || String(b.id).localeCompare(String(a.id))) };
  }

  return { initialize, captureLead, importAudits, getLead, create, update, addActivity, history, syncBooking, syncContract, reconcile };
}

module.exports = { createSalesService };
