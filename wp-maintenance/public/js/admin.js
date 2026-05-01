// admin.js — EVOBRAND Maintenance CMS Frontend
const socket = io();
const api = (url, opts={}) => fetch('/api'+url, {headers:{'Content-Type':'application/json'},...opts}).then(r=>r.json());

// ── Toast ──────────────────────────────────────────────────────────────────
function toast(msg, type='info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast toast-${type} show`;
  setTimeout(() => t.className = 'toast', 3200);
}

// ── Navigation ─────────────────────────────────────────────────────────────
const pages = {
  dashboard: renderDashboard,
  clients: renderClients,
  maintenance: renderMaintenance,
  reports: renderReports,
  logs: renderLogs,
  settings: renderSettings,
};
const titles = {dashboard:'Dashboard',clients:'Clients',maintenance:'Run Maintenance',reports:'Reports',logs:'Logs',settings:'Settings'};

document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    navigate(el.dataset.page);
  });
});

function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  document.getElementById('page-title').textContent = titles[page] || page;
  const area = document.getElementById('content-area');
  area.innerHTML = '<div class="loader-wrap"><div class="spinner"></div></div>';
  pages[page]?.();
}

// ── Logout ─────────────────────────────────────────────────────────────────
document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetch('/auth/logout', {method:'POST'});
  location.href = '/login';
});

// ── Auth init ──────────────────────────────────────────────────────────────
fetch('/auth/status').then(r=>r.json()).then(d => {
  if (!d.authenticated) { location.href='/login'; return; }
  document.getElementById('admin-name').textContent = d.username || 'Admin';
  navigate('dashboard');
});

// ══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════
async function renderDashboard() {
  const d = await api('/dashboard');
  document.getElementById('content-area').innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-val">${d.totalClients}</div><div class="stat-lbl">Total Clients</div></div>
      <div class="stat-card"><div class="stat-val">${d.enabledClients}</div><div class="stat-lbl">Active Clients</div></div>
      <div class="stat-card"><div class="stat-val">${d.totalReports}</div><div class="stat-lbl">Reports Generated</div></div>
      <div class="stat-card"><div class="stat-val" style="font-size:16px;margin-top:6px">${d.lastRun||'Never'}</div><div class="stat-lbl">Last Run</div></div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Quick Actions</h2></div>
      <div class="card-body" style="display:flex;gap:12px;flex-wrap:wrap">
        <button class="btn-primary" onclick="navigate('maintenance')">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Run All Maintenance
        </button>
        <button class="btn-ghost" onclick="navigate('clients')">Manage Clients</button>
        <button class="btn-ghost" onclick="navigate('reports')">View Reports</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Live Job Feed</h2></div>
      <div class="card-body"><div class="log-panel" id="live-log"><div style="color:#444d56">Waiting for maintenance jobs...</div></div></div>
    </div>`;
}

// ══════════════════════════════════════════════════════════════════════════
// CLIENTS
// ══════════════════════════════════════════════════════════════════════════
async function renderClients() {
  const clients = await api('/clients');
  const rows = clients.length ? clients.map(c => `
    <tr>
      <td><strong>${c.name}</strong><br><span style="font-size:12px;color:#6b7280">${c.id}</span></td>
      <td>${c.email||'<span style="color:#9ca3af">—</span>'}</td>
      <td><span class="badge badge-${c.connection?.type==='ssh'?'ssh':'active'}">${c.connection?.type||'local'}</span></td>
      <td><code style="font-size:12px;background:#f3f4f6;padding:2px 7px;border-radius:4px">${c.connection?.sitePath||'—'}</code></td>
      <td>
        <label class="toggle"><input type="checkbox" ${c.enabled!==false?'checked':''} onchange="toggleClient('${c.id}',this)"/><span class="toggle-slider"></span></label>
      </td>
      <td style="display:flex;gap:8px;align-items:center">
        <button class="btn-ghost btn-sm" onclick="editClient('${c.id}')">Edit</button>
        <button class="btn-danger btn-sm" onclick="deleteClient('${c.id}','${c.name}')">Delete</button>
      </td>
    </tr>`).join('') : `<tr><td colspan="6"><div class="empty-state"><p>No clients yet. Add your first client.</p></div></td></tr>`;

  document.getElementById('content-area').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>${clients.length} Client${clients.length!==1?'s':''}</h2>
        <button class="btn-primary" onclick="openClientModal()">+ Add Client</button>
      </div>
      <div class="card-body" style="padding:0">
        <div class="table-wrap">
          <table><thead><tr><th>Client</th><th>Email</th><th>Type</th><th>Site Path</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>${rows}</tbody></table>
        </div>
      </div>
    </div>`;
}

window._clientsCache = [];
async function editClient(id) {
  const clients = await api('/clients');
  const c = clients.find(x=>x.id===id);
  if (!c) return;
  openClientModal(c);
}

async function toggleClient(id, el) {
  const r = await fetch(`/api/clients/${id}/toggle`, {method:'PATCH'});
  const d = await r.json();
  toast(d.enabled ? `${id} enabled` : `${id} disabled`, 'info');
}

async function deleteClient(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  await fetch(`/api/clients/${id}`, {method:'DELETE'});
  toast(`${name} deleted`, 'success');
  renderClients();
}

// ══════════════════════════════════════════════════════════════════════════
// MAINTENANCE
// ══════════════════════════════════════════════════════════════════════════
async function renderMaintenance() {
  const clients = await api('/clients');
  const enabled = clients.filter(c=>c.enabled!==false);

  const rows = enabled.map(c=>`
    <div class="client-run-row" id="row-${c.id}">
      <div class="client-run-info">
        <h4>${c.name}</h4>
        <p>${c.email||'No email configured'} · ${c.connection?.type||'local'} · ${c.connection?.sitePath||''}</p>
      </div>
      <div class="client-run-actions">
        <div class="run-options">
          <label><input type="checkbox" id="dry-${c.id}"/> Dry run</label>
        </div>
        <button class="btn-run" id="btn-${c.id}" onclick="runClient('${c.id}','${c.name}')">▶ Run</button>
        <span class="run-status" id="status-${c.id}"></span>
      </div>
    </div>`).join('');

  document.getElementById('content-area').innerHTML = `
    <div class="card" style="margin-bottom:20px">
      <div class="card-header">
        <h2>Run Maintenance</h2>
        <div style="display:flex;gap:10px;align-items:center">
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#6b7280;cursor:pointer">
            <input type="checkbox" id="dry-all"/> Dry run all
          </label>
          <button class="btn-primary" onclick="runAll()">▶ Run All Clients</button>
        </div>
      </div>
      <div class="card-body">
        ${enabled.length ? `<div class="client-run-grid">${rows}</div>` : '<div class="empty-state"><p>No active clients. Enable clients in the Clients tab first.</p></div>'}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Live Output</h2></div>
      <div class="card-body"><div class="log-panel" id="job-log"><span style="color:#444d56">Output will appear here when a job runs...</span></div></div>
    </div>`;
}

function appendLog(msg, level='info') {
  const panel = document.getElementById('job-log') || document.getElementById('live-log');
  if (!panel) return;
  const ts = new Date().toLocaleTimeString();
  const div = document.createElement('div');
  div.className = 'log-line';
  const colorClass = level==='error'?'msg-error':level==='warn'?'msg-warn':level==='success'?'msg-success':'msg-info';
  div.innerHTML = `<span class="ts">${ts}</span><span class="${colorClass}">${msg}</span>`;
  if (panel.firstChild?.style?.color==='#444d56') panel.innerHTML='';
  panel.appendChild(div);
  panel.scrollTop = panel.scrollHeight;
}

async function runClient(id, name) {
  const btn = document.getElementById(`btn-${id}`);
  const statusEl = document.getElementById(`status-${id}`);
  const dryRun = document.getElementById(`dry-${id}`)?.checked || false;
  btn.disabled = true; btn.textContent = '⏳ Running...';
  statusEl.innerHTML = '<span class="badge badge-running">Running</span>';
  appendLog(`Starting job for ${name}${dryRun?' [DRY RUN]':''}...`);

  const r = await fetch(`/api/jobs/run/${id}`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({dryRun})
  });
  const d = await r.json();
  if (!d.success) { toast(d.error,'error'); btn.disabled=false; btn.textContent='▶ Run'; }
}

async function runAll() {
  const dryRun = document.getElementById('dry-all')?.checked||false;
  appendLog(`Starting ALL clients maintenance${dryRun?' [DRY RUN]':''}...`);
  await fetch('/api/jobs/run-all', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({dryRun})
  });
  toast('Maintenance started for all active clients','info');
}

// Socket events
socket.on('job:log', ({clientId, level, message}) => {
  appendLog(message, level);
});
socket.on('job:complete', ({clientId, status, updatedPlugins, error}) => {
  const btn = document.getElementById(`btn-${clientId}`);
  const statusEl = document.getElementById(`status-${clientId}`);
  if (btn) { btn.disabled=false; btn.textContent='▶ Run'; }
  if (statusEl) statusEl.innerHTML = status==='success'
    ? `<span class="badge badge-success">✓ ${updatedPlugins} updated</span>`
    : `<span class="badge badge-error">Failed</span>`;
  appendLog(status==='success' ? `✓ Job complete — ${updatedPlugins} plugins updated` : `✗ Job failed: ${error}`, status==='success'?'success':'error');
  toast(status==='success' ? `Maintenance complete` : `Job failed: ${error}`, status==='success'?'success':'error');
});

// ══════════════════════════════════════════════════════════════════════════
// REPORTS
// ══════════════════════════════════════════════════════════════════════════
async function renderReports() {
  const reports = await api('/reports');
  const rows = reports.map(r => `
    <div class="report-row">
      <div class="report-info">
        <h4>${r.filename}</h4>
        <p>${r.clientId} · ${r.date} · ${(r.size/1024).toFixed(1)} KB</p>
      </div>
      <div class="report-actions">
        <a href="/api/reports/download/${r.filename}" class="btn-primary btn-sm" download>⬇ Download</a>
        <button class="btn-danger btn-sm" onclick="deleteReport('${r.filename}')">Delete</button>
      </div>
    </div>`).join('');

  document.getElementById('content-area').innerHTML = `
    <div class="card">
      <div class="card-header"><h2>${reports.length} Report${reports.length!==1?'s':''}</h2></div>
      <div class="card-body">
        ${reports.length ? rows : '<div class="empty-state"><p>No reports yet. Run maintenance to generate your first report.</p></div>'}
      </div>
    </div>`;
}

async function deleteReport(filename) {
  if (!confirm(`Delete ${filename}?`)) return;
  await fetch(`/api/reports/${filename}`, {method:'DELETE'});
  toast('Report deleted','success');
  renderReports();
}

// ══════════════════════════════════════════════════════════════════════════
// LOGS
// ══════════════════════════════════════════════════════════════════════════
async function renderLogs() {
  const logs = await api('/logs');
  const area = document.getElementById('content-area');

  if (!logs.length) {
    area.innerHTML = '<div class="card"><div class="card-body"><div class="empty-state"><p>No log files yet.</p></div></div></div>';
    return;
  }

  area.innerHTML = `<div class="card">
    <div class="card-header"><h2>Log Files</h2></div>
    <div class="card-body">
      <div class="log-file-list">${logs.map(l=>`
        <div class="log-file-item" onclick="viewLog('${l.filename}',this)">
          <div><div class="log-name">${l.filename}</div><div class="log-size">${(l.size/1024).toFixed(1)} KB</div></div>
          <span style="color:#22c8e5;font-size:12px">View ▸</span>
        </div>
        <div class="log-content-wrap" id="wrap-${l.filename}">
          <div class="log-raw" id="log-${l.filename}">Loading...</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

async function viewLog(filename, el) {
  const wrap = document.getElementById(`wrap-${filename}`);
  const isOpen = wrap.classList.contains('open');
  document.querySelectorAll('.log-content-wrap').forEach(w=>w.classList.remove('open'));
  if (isOpen) return;
  wrap.classList.add('open');
  const d = await api(`/logs/${filename}`);
  document.getElementById(`log-${filename}`).textContent = d.lines?.join('\n') || 'Empty log.';
}

// ══════════════════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════════════════
async function renderSettings() {
  const s = await api('/settings');
  document.getElementById('content-area').innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Email / SMTP</h2></div>
      <div class="card-body">
        <div class="settings-grid">
          <div class="settings-row">
            <div class="form-group"><label>SMTP Host</label><input id="s-host" value="${s.smtp.host}" placeholder="smtp.gmail.com"/></div>
            <div class="form-group"><label>SMTP Port</label><input id="s-port" value="${s.smtp.port}" placeholder="587"/></div>
          </div>
          <div class="settings-row">
            <div class="form-group"><label>SMTP Username</label><input id="s-user" value="${s.smtp.user}" placeholder="you@domain.com"/></div>
            <div class="form-group"><label>From Name</label><input id="s-fname" value="${s.smtp.fromName}"/></div>
          </div>
          <div class="form-group"><label>From Address</label><input id="s-faddr" value="${s.smtp.fromAddress}"/></div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Schedule (Cron)</h2></div>
      <div class="card-body settings-grid">
        <div class="settings-row">
          <div class="form-group"><label>Cron Expression</label><input id="s-cron" value="${s.cron.schedule}" placeholder="0 2 * * 0"/></div>
          <div class="form-group"><label>Status</label>
            <div style="padding:10px 0;font-size:13.5px;color:${s.cron.enabled?'#10b981':'#6b7280'}">
              ${s.cron.enabled?'✓ Cron enabled':'Cron disabled — set CRON_ENABLED=true in .env'}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>WP-CLI</h2></div>
      <div class="card-body">
        <div class="form-group" style="max-width:300px"><label>Default WP-CLI Binary</label><input id="s-wpcli" value="${s.wpcli.bin}" placeholder="wp"/></div>
      </div>
    </div>
    <div style="margin-top:8px">
      <p style="font-size:12.5px;color:#9ca3af">Settings are managed in your <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px">.env</code> file. Changes here are for reference only. Update <code>.env</code> and restart the server to apply.</p>
    </div>`;
}

// ══════════════════════════════════════════════════════════════════════════
// CLIENT MODAL
// ══════════════════════════════════════════════════════════════════════════
function openClientModal(client=null) {
  const modal = document.getElementById('client-modal');
  document.getElementById('modal-title').textContent = client ? 'Edit Client' : 'Add Client';
  document.getElementById('f-name').value = client?.name||'';
  document.getElementById('f-id').value = client?.id||'';
  document.getElementById('f-id').disabled = !!client;
  document.getElementById('f-email').value = client?.email||'';
  document.getElementById('f-type').value = client?.connection?.type||'local';
  document.getElementById('f-wpcli').value = client?.wpcli||'wp';
  document.getElementById('f-sitepath').value = client?.connection?.sitePath||'';
  document.getElementById('f-host').value = client?.connection?.host||'';
  document.getElementById('f-port').value = client?.connection?.port||22;
  document.getElementById('f-user').value = client?.connection?.username||'';
  document.getElementById('f-key').value = client?.connection?.privateKeyPath||'';
  document.getElementById('client-id-orig').value = client?.id||'';
  toggleSSHFields();
  modal.style.display = 'flex';
}

document.getElementById('f-type').addEventListener('change', toggleSSHFields);
function toggleSSHFields() {
  document.getElementById('ssh-fields').style.display = document.getElementById('f-type').value==='ssh'?'block':'none';
}

document.getElementById('f-name').addEventListener('input', () => {
  if (!document.getElementById('client-id-orig').value) {
    document.getElementById('f-id').value = document.getElementById('f-name').value.toLowerCase().trim().replace(/[^\w\s-]/g,'').replace(/[\s_]+/g,'-');
  }
});

document.getElementById('modal-close').onclick = () => document.getElementById('client-modal').style.display='none';
document.getElementById('modal-cancel').onclick = () => document.getElementById('client-modal').style.display='none';
document.getElementById('client-modal').addEventListener('click', e => { if(e.target===e.currentTarget) e.currentTarget.style.display='none'; });

document.getElementById('client-form').addEventListener('submit', async e => {
  e.preventDefault();
  const origId = document.getElementById('client-id-orig').value;
  const type = document.getElementById('f-type').value;
  const payload = {
    id: document.getElementById('f-id').value,
    name: document.getElementById('f-name').value,
    email: document.getElementById('f-email').value,
    wpcli: document.getElementById('f-wpcli').value||'wp',
    enabled: true,
    connection: {
      type,
      sitePath: document.getElementById('f-sitepath').value,
      ...(type==='ssh' ? {
        host: document.getElementById('f-host').value,
        port: parseInt(document.getElementById('f-port').value)||22,
        username: document.getElementById('f-user').value,
        privateKeyPath: document.getElementById('f-key').value,
      } : {}),
    }
  };

  const r = origId
    ? await fetch(`/api/clients/${origId}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)})
    : await fetch('/api/clients', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});

  const d = await r.json();
  if (d.error) { toast(d.error,'error'); return; }
  document.getElementById('client-modal').style.display='none';
  toast(origId ? 'Client updated' : 'Client added','success');
  renderClients();
});
