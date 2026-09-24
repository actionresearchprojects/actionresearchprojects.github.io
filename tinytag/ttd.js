/* Tinytag .ttd reader and CSV / XLSX writers. No dependencies.
 *
 * A .ttd saved by Tinytag Explorer 4.x is a short text header followed by an
 * ordinary zip archive. Inside, each channel's raw logger memory sits in
 * <n>/data.ttd (proprietary, uncalibrated ADC codes), but Explorer also writes
 * export/readings.csv and export/statistics.csv: the same table its own
 * "Export" produces, calibrated, with derived channels such as dew point.
 * We read those two files and never touch the raw channels.
 *
 * Works in the browser and in Node 18+ (needs DecompressionStream).
 */
(function (root) {
'use strict';

/* ---------- zip reading ---------- */

const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

async function inflateRaw(bytes) {
  const ds = new DecompressionStream('deflate-raw');
  const out = new Response(new Blob([bytes]).stream().pipeThrough(ds));
  return new Uint8Array(await out.arrayBuffer());
}

// Returns { name: Uint8Array } for every entry. Offsets in the central
// directory are relative to the start of the zip, which here is not the start
// of the file, so the base is worked out from where the directory actually is.
async function unzip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (u32(buf, i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('not a zip archive');
  const count = u16(buf, eocd + 10);
  const cdSize = u32(buf, eocd + 12);
  const cdOff = u32(buf, eocd + 16);
  const base = eocd - cdSize - cdOff;
  const files = {};
  let p = base + cdOff;
  for (let n = 0; n < count; n++) {
    if (u32(buf, p) !== 0x02014b50) throw new Error('corrupt zip directory');
    const method = u16(buf, p + 10);
    const csize = u32(buf, p + 20);
    const nlen = u16(buf, p + 28), xlen = u16(buf, p + 30), clen = u16(buf, p + 32);
    const local = base + u32(buf, p + 42);
    const name = new TextDecoder().decode(buf.subarray(p + 46, p + 46 + nlen));
    p += 46 + nlen + xlen + clen;
    const start = local + 30 + u16(buf, local + 26) + u16(buf, local + 28);
    const data = buf.subarray(start, start + csize);
    if (method === 0) files[name] = data;
    else if (method === 8) files[name] = await inflateRaw(data);
    // other methods: skip; nothing in a .ttd uses them
  }
  return files;
}

/* ---------- CSV ---------- */

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const csvCell = v => {
  const s = v == null ? '' : String(v);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const toCsv = rows => rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';

/* ---------- .ttd ---------- */

// Explorer writes these files in Windows-1252: the degree sign is byte 0xB0.
const decode = bytes => {
  let s = new TextDecoder('windows-1252').decode(bytes);
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
};

const NUM_UNIT = /^\s*([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)\s*(.*?)\s*$/;

async function readTtd(arrayBuffer) {
  const buf = new Uint8Array(arrayBuffer);
  const head = new TextDecoder('latin1').decode(buf.subarray(0, 64));
  const files = await unzip(buf).catch(() => {
    throw new Error(/^file format/i.test(head)
      ? 'The file looks like a Tinytag file but its contents could not be read. It may be damaged.'
      : 'This is not a Tinytag Explorer .ttd file.');
  });
  if (!files['export/readings.csv']) {
    throw new Error('This .ttd has no embedded readings table. Open it in Tinytag Explorer 4 and save it again, then retry.');
  }

  const raw = parseCsv(decode(files['export/readings.csv'])).filter(r => r.some(c => c !== ''));
  const nCh = raw[0].length - 2;

  // Header rows (S/N, Type, Description, Property, ...) run until the first
  // row whose first cell is a reading number.
  const meta = {};
  let i = 1;
  for (; i < raw.length && !/^\d+$/.test(raw[i][0]); i++) meta[raw[i][0]] = raw[i].slice(2);

  const channels = [];
  for (let c = 0; c < nCh; c++) {
    channels.push({
      serial: (meta['S/N'] || [])[c] || '',
      type: (meta['Type'] || [])[c] || '',
      description: (meta['Description'] || [])[c] || '',
      property: (meta['Property'] || [])[c] || 'Channel ' + (c + 1),
      unit: '',
    });
  }

  const readings = [];
  for (; i < raw.length; i++) {
    const r = raw[i];
    const vals = new Array(nCh);
    for (let c = 0; c < nCh; c++) {
      const s = (r[c + 2] || '').trim();
      if (s === '') { vals[c] = null; continue; }
      const m = NUM_UNIT.exec(s);
      if (m) {
        vals[c] = parseFloat(m[1]);
        if (!channels[c].unit && m[2]) channels[c].unit = m[2];
      } else vals[c] = s;   // e.g. an out-of-range marker; keep it as text
    }
    readings.push({ n: +r[0], time: r[1], vals });
  }

  // Column names. The serial is only added where the file mixes loggers, and
  // anything still identical (two runs of one logger) gets a run number.
  const serials = new Set(channels.map(c => c.serial));
  channels.forEach(c => {
    c.label = (serials.size > 1 ? c.serial + ' ' : '') + c.property + (c.unit ? ' (' + c.unit + ')' : '');
  });
  const seen = {};
  channels.forEach(c => { seen[c.label] = (seen[c.label] || 0) + 1; });
  const idx = {};
  channels.forEach(c => {
    if (seen[c.label] > 1) { idx[c.label] = (idx[c.label] || 0) + 1; c.label += ' [run ' + idx[c.label] + ']'; }
  });

  // Unlike the CSVs, the title is UTF-8 (with a BOM, which TextDecoder drops).
  const title = files['0/title.txt'] ? new TextDecoder().decode(files['0/title.txt']).trim() : '';
  const statistics = files['export/statistics.csv']
    ? parseCsv(decode(files['export/statistics.csv'])).filter(r => r.some(c => c !== ''))
    : [];

  return { title, channels, readings, statistics };
}

/* ---------- output tables ---------- */

function readingsTable(ttd, keep) {
  const cols = ttd.channels.map((c, k) => k).filter(k => keep[k]);
  const rows = [['#', 'Time', ...cols.map(k => ttd.channels[k].label)]];
  for (const r of ttd.readings) {
    if (cols.every(k => r.vals[k] == null)) continue;
    rows.push([r.n, r.time, ...cols.map(k => r.vals[k])]);
  }
  return rows;
}

function statisticsTable(ttd, keep) {
  if (!ttd.statistics.length) return [];
  const cols = ttd.channels.map((c, k) => k).filter(k => keep[k]);
  return ttd.statistics.map((r, j) => [j === 0 ? '' : r[0], ...cols.map(k => r[k + 1] == null ? '' : r[k + 1])]);
}

/* ---------- zip writing ---------- */

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(b) {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

async function deflateRaw(bytes) {
  const cs = new CompressionStream('deflate-raw');
  const out = new Response(new Blob([bytes]).stream().pipeThrough(cs));
  return new Uint8Array(await out.arrayBuffer());
}

// entries: [{ name, data: Uint8Array | string }]
async function zip(entries) {
  const enc = new TextEncoder();
  const parts = [], central = [];
  let off = 0;
  const now = new Date();
  const dtime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const ddate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  for (const e of entries) {
    const name = enc.encode(e.name);
    const data = typeof e.data === 'string' ? enc.encode(e.data) : e.data;
    const crc = crc32(data);
    let body = data, method = 0;
    if (typeof CompressionStream !== 'undefined' && data.length > 256) {
      const z = await deflateRaw(data);
      if (z.length < data.length) { body = z; method = 8; }
    }
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true);
    h.setUint16(8, method, true); h.setUint16(10, dtime, true); h.setUint16(12, ddate, true);
    h.setUint32(14, crc, true); h.setUint32(18, body.length, true); h.setUint32(22, data.length, true);
    h.setUint16(26, name.length, true);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true); c.setUint16(10, method, true); c.setUint16(12, dtime, true);
    c.setUint16(14, ddate, true); c.setUint32(16, crc, true); c.setUint32(20, body.length, true);
    c.setUint32(24, data.length, true); c.setUint16(28, name.length, true); c.setUint32(42, off, true);
    parts.push(new Uint8Array(h.buffer), name, body);
    central.push(new Uint8Array(c.buffer), name);
    off += 30 + name.length + body.length;
  }
  const cdSize = central.reduce((s, b) => s + b.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true); end.setUint32(12, cdSize, true); end.setUint32(16, off, true);
  return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
}

/* ---------- XLSX ---------- */

const xmlEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
const DATETIME = /^(\d{4})-(\d\d)-(\d\d)[ T](\d\d):(\d\d)(?::(\d\d))?$/;
const colName = n => { let s = ''; n++; while (n) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; } return s; };

// Times are written as Excel dates in the logger's own clock, exactly as
// Tinytag Explorer displays them: no timezone conversion happens anywhere.
function excelSerial(m) {
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)) / 86400000 + 25569;
}

// style ids: 0 plain, 1 date-time, 2 header
function sheetXml(rows, widths, freeze) {
  const out = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'];
  if (freeze) out.push('<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>');
  out.push('<cols>' + widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('') + '</cols><sheetData>');
  rows.forEach((row, ri) => {
    const cells = [];
    row.forEach((v, ci) => {
      if (v == null || v === '') return;
      const ref = colName(ci) + (ri + 1);
      const hs = freeze && ri === 0 ? ' s="2"' : '';
      let m;
      if (typeof v === 'number' && isFinite(v)) cells.push(`<c r="${ref}"${hs}><v>${v}</v></c>`);
      else if (typeof v === 'string' && !hs && (m = DATETIME.exec(v))) cells.push(`<c r="${ref}" s="1"><v>${excelSerial(m)}</v></c>`);
      else if (typeof v === 'string' && !hs && /^[-+]?\d+(\.\d+)?$/.test(v.trim())) cells.push(`<c r="${ref}"><v>${+v}</v></c>`);
      else cells.push(`<c r="${ref}" t="inlineStr"${hs}><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`);
    });
    out.push(`<row r="${ri + 1}">${cells.join('')}</row>`);
  });
  out.push('</sheetData></worksheet>');
  return out.join('');
}

async function xlsx(sheets) {
  const ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
    + sheets.map((s, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') + '</Types>';
  const rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
  const wb = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
    + sheets.map((s, i) => `<sheet name="${xmlEsc(s.name.slice(0, 31))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + '</sheets></workbook>';
  const wbRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    + sheets.map((s, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')
    + `<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
  const styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="yyyy-mm-dd hh:mm:ss"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
  return zip([
    { name: '[Content_Types].xml', data: ct },
    { name: '_rels/.rels', data: rels },
    { name: 'xl/workbook.xml', data: wb },
    { name: 'xl/_rels/workbook.xml.rels', data: wbRels },
    { name: 'xl/styles.xml', data: styles },
    ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(s.rows, s.widths, s.freeze) })),
  ]).then(b => new Blob([b], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
}

function toXlsx(ttd, keep) {
  const rd = readingsTable(ttd, keep);
  const sheets = [{ name: 'Readings', rows: rd, freeze: true, widths: [7, 20, ...rd[0].slice(2).map(h => Math.max(12, h.length + 2))] }];
  const st = statisticsTable(ttd, keep);
  if (st.length) sheets.push({ name: 'Statistics', rows: st, freeze: false, widths: [26, ...st[0].slice(1).map(() => 22)] });
  return xlsx(sheets);
}

function toCsvBlob(rows) {
  // BOM so Excel opens the degree sign correctly.
  return new Blob(['﻿' + toCsv(rows)], { type: 'text/csv;charset=utf-8' });
}

root.TTD = { readTtd, readingsTable, statisticsTable, toXlsx, toCsvBlob, zip, parseCsv };
})(typeof window !== 'undefined' ? window : globalThis);
