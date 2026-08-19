const AdmZip = require('adm-zip');
const { XMLParser } = require('fast-xml-parser');

const MONTHS = {
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4,
  may: 5, june: 6, jun: 6, july: 7, jul: 7, august: 8, aug: 8,
  september: 9, sep: 9, sept: 9, october: 10, oct: 10, november: 11, nov: 11,
  december: 12, dec: 12,
};

const DATE_RE = /([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})/;

const parser = new XMLParser({
  ignoreAttributes: true,
  trimValues: false, // preserve significant spaces Word splits across adjacent <w:r> runs
  isArray: (name) => ['w:tr', 'w:tc', 'w:p', 'w:r', 'w:tbl'].includes(name),
});

// Recursively collects every string leaf under a parsed-XML node/array.
function collectText(node) {
  if (node == null) return [];
  if (typeof node === 'string') return [node];
  if (typeof node === 'number' || typeof node === 'boolean') return [String(node)];
  if (Array.isArray(node)) return node.flatMap(collectText);
  if (typeof node === 'object') return Object.values(node).flatMap(collectText);
  return [];
}

function cellText(tc) {
  const paragraphs = Array.isArray(tc?.['w:p']) ? tc['w:p'] : (tc?.['w:p'] ? [tc['w:p']] : []);
  return paragraphs
    .map(p => collectText(p).join('').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' — ');
}

function parseDate(text) {
  const match = text.match(DATE_RE);
  if (!match) return null;
  const month = MONTHS[match[1].toLowerCase()];
  if (!month) return null;
  const day = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  if (!month || !day || year < 2000 || year > 2100) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Parses a "Phase N: ... / What / Who / When" style project schedule table
 * (the format used in EVOBRAND's client schedule docs) into a suggested
 * project name and a milestones array matching the client_projects schema.
 */
function parseScheduleDocx(buffer) {
  const zip = new AdmZip(buffer);
  const entry = zip.getEntry('word/document.xml');
  if (!entry) throw new Error('Not a valid .docx file');
  const xml = entry.getData().toString('utf-8');
  const doc = parser.parse(xml);

  const body = doc?.['w:document']?.['w:body'];
  if (!body) throw new Error('Could not read document body');

  const paragraphs = Array.isArray(body['w:p']) ? body['w:p'] : (body['w:p'] ? [body['w:p']] : []);
  const suggestedName = (collectText(paragraphs[0]).join('').replace(/\s+/g, ' ').trim()) || 'Imported Project';

  const tables = Array.isArray(body['w:tbl']) ? body['w:tbl'] : (body['w:tbl'] ? [body['w:tbl']] : []);
  const milestones = [];
  let currentPhase = null;
  let idCounter = Date.now();

  for (const table of tables) {
    const rows = Array.isArray(table['w:tr']) ? table['w:tr'] : (table['w:tr'] ? [table['w:tr']] : []);
    for (const row of rows) {
      const cells = Array.isArray(row['w:tc']) ? row['w:tc'] : (row['w:tc'] ? [row['w:tc']] : []);
      const texts = cells.map(cellText);

      if (texts.length !== 3) {
        const heading = texts.join(' ').trim();
        if (/^phase\s*\d+/i.test(heading)) currentPhase = heading;
        continue;
      }

      const what = texts[0].trim();
      const who = texts[1].trim();
      const when = texts[2].trim();
      if (what.toLowerCase() === 'what') continue; // column header row
      if (!what) continue;

      const due_date = parseDate(when);
      milestones.push({
        id: idCounter++,
        name: what,
        status: 'pending',
        due_date: due_date || '',
        phase: currentPhase || undefined,
        assignee: who || undefined,
        notes: due_date ? undefined : (when || undefined),
      });
    }
  }

  return { name: suggestedName, milestones };
}

module.exports = { parseScheduleDocx };
