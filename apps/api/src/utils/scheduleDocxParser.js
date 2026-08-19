const AdmZip = require('adm-zip');
const { XMLParser } = require('fast-xml-parser');
const { PDFParse } = require('pdf-parse');
const WordExtractor = require('word-extractor');

const MONTHS = {
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4,
  may: 5, june: 6, jun: 6, july: 7, jul: 7, august: 8, aug: 8,
  september: 9, sep: 9, sept: 9, october: 10, oct: 10, november: 11, nov: 11,
  december: 12, dec: 12,
};

const DATE_RE = /([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})/;
const PHASE_RE = /^phase\s*\d+/i;

const xmlParser = new XMLParser({
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
 * Parses the "Phase N: ... / What / Who / When" table structure directly out
 * of a .docx's XML — the most reliable path, since cell boundaries are exact.
 */
function parseDocxTable(buffer) {
  const zip = new AdmZip(buffer);
  const entry = zip.getEntry('word/document.xml');
  if (!entry) throw new Error('Not a valid .docx file');
  const xml = entry.getData().toString('utf-8');
  const doc = xmlParser.parse(xml);

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
        if (PHASE_RE.test(heading)) currentPhase = heading;
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

  return { name: suggestedName, milestones, tableFound: tables.length > 0 };
}

/**
 * Best-effort fallback for plain text extracted from a .doc or .pdf, where
 * table cell boundaries aren't available. Looks for "Phase N" heading lines
 * and, on other lines, strips a trailing date if present — whatever's left
 * becomes the milestone name. Assignee isn't recoverable from flat text, so
 * it's left blank rather than guessed.
 */
function parseScheduleText(rawText) {
  const lines = rawText.split(/\r?\n/).map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const suggestedName = lines[0] || 'Imported Project';

  const milestones = [];
  let currentPhase = null;
  let idCounter = Date.now();

  for (const line of lines.slice(1)) {
    if (PHASE_RE.test(line)) {
      currentPhase = line;
      continue;
    }
    if (/^(what|who|when)$/i.test(line)) continue;

    const dateMatch = line.match(DATE_RE);
    if (!dateMatch) continue; // a line with no date is too ambiguous to treat as a milestone row

    const due_date = parseDate(dateMatch[0]);
    const name = (line.slice(0, dateMatch.index) + line.slice(dateMatch.index + dateMatch[0].length))
      .replace(/[|•·\-–—]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!name) continue;

    milestones.push({
      id: idCounter++,
      name,
      status: 'pending',
      due_date: due_date || '',
      phase: currentPhase || undefined,
      notes: due_date ? undefined : dateMatch[0],
    });
  }

  return { name: suggestedName, milestones };
}

async function parseScheduleDoc(buffer, originalName) {
  const ext = (originalName.split('.').pop() || '').toLowerCase();

  if (ext === 'docx') {
    const result = parseDocxTable(buffer);
    if (result.milestones.length > 0) return { name: result.name, milestones: result.milestones };
    // No table found (unusual doc) — fall back to plain text extraction of the same file.
    const zip = new AdmZip(buffer);
    const entry = zip.getEntry('word/document.xml');
    const xml = entry ? entry.getData().toString('utf-8') : '';
    const text = xml.replace(/<[^>]+>/g, '\n');
    return parseScheduleText(text);
  }

  if (ext === 'doc') {
    const doc = await new WordExtractor().extract(buffer);
    return parseScheduleText(doc.getBody());
  }

  if (ext === 'pdf') {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return parseScheduleText(result.text);
    } finally {
      await parser.destroy();
    }
  }

  throw new Error('Unsupported file type. Please upload a .docx, .doc, or .pdf file.');
}

module.exports = { parseScheduleDoc };
