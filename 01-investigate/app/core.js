// The original Markdown is the schema: no separate, abbreviated questionnaire.
export const VERSION = 1;
const placeholder = value => /\[[^\]]*\]/.test(value);
export const plain = value => value.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '');
export function splitRow(line) {
  const input = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = []; let cell = '';
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '\\' && ['|', '\\'].includes(input[i + 1])) cell += input[++i];
    else if (input[i] === '|') { cells.push(cell.trim()); cell = ''; }
    else cell += input[i];
  }
  cells.push(cell.trim());
  return cells;
}
export const encode = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\\', '\\\\').replaceAll('|', '\\|').replaceAll('\n', '<br>');
export const decode = value => value.replace(/<br\s*\/?>/gi, '\n').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
export function compile(template) {
  const lines = template.replace(/\r\n/g, '\n').split('\n');
  const tokens = [], sections = [], tables = [], fields = [], checks = [];
  let active = false, section = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^## 0\./.test(line)) active = true;
    if (/^## Continuidad/.test(line)) active = false;
    if (active && /^## \d\./.test(line)) {
      section = { title: line.slice(3), id: `section-${sections.length}`, tokens: [] };
      sections.push(section);
    }
    let token = { type: 'text', raw: line };
    if (active && line.startsWith('|') && /^\|[\s:|\-]+$/.test(lines[i + 1] || '')) {
      const headers = splitRow(line), separator = lines[++i], rows = [];
      while (lines[i + 1]?.startsWith('|')) rows.push(splitRow(lines[++i]));
      const editable = rows.map(row => row.map(placeholder));
      const dynamic = rows.every(row => row.every(placeholder)) || rows.every(row => /^\d+$/.test(row[0]) && row.slice(1).every(placeholder));
      token = { type: 'table', id: `table-${tables.length}`, headers, separator, rows, editable, dynamic, numbered: dynamic && /^\d+$/.test(rows[0][0]) };
      tables.push(token);
    } else if (active && /^- \[ \] /.test(line)) {
      token = { type: 'check', id: `check-${checks.length}`, label: line.slice(6), raw: line };
      checks.push(token);
    } else if (active && placeholder(line) && (/^\*\*.+?:\*\* /.test(line) || /^- \*\*.+?:\*\* /.test(line) || /^> \[/.test(line))) {
      const index = line.indexOf('[');
      token = { type: 'field', id: `field-${fields.length}`, section: section.title, prefix: line.slice(0, index), hint: line.slice(index), label: line.startsWith('>') ? 'Formulación inicial del problema' : plain(line.slice(0, index)).replace(/^- /, '').trim().replace(/:$/, '') };
      fields.push(token);
    }
    tokens.push(token);
    if (active) section.tokens.push(token);
  }
  return { tokens, sections, tables, fields, checks };
}
export function blank(schema) {
  return { version: VERSION, fields: Object.fromEntries(schema.fields.map(f => [f.id, ''])), tables: Object.fromEntries(schema.tables.map(t => [t.id, t.rows.map((r, ri) => r.map((v, ci) => t.editable[ri][ci] ? '' : v))])), checks: Object.fromEntries(schema.checks.map(c => [c.id, false])) };
}
export function validate(data, schema) {
  if (!data || data.version !== VERSION || !data.fields || !data.tables || !data.checks) throw new Error('El archivo no tiene el formato de este brief.');
  for (const f of schema.fields) if (typeof data.fields[f.id] !== 'string') throw new Error('Faltan respuestas de texto.');
  for (const c of schema.checks) if (typeof data.checks[c.id] !== 'boolean') throw new Error('Lista de comprobación incompleta.');
  for (const t of schema.tables) {
    const rows = data.tables[t.id];
    if (!Array.isArray(rows) || rows.length < 1 || rows.length > 200 || (!t.dynamic && rows.length !== t.rows.length)) throw new Error('Número de filas no válido.');
    rows.forEach((row, ri) => {
      if (!Array.isArray(row) || row.length !== t.headers.length || row.some(v => typeof v !== 'string')) throw new Error('Tabla incompleta.');
      if (!t.dynamic) row.forEach((v, ci) => { if (!t.editable[ri][ci] && v !== t.rows[ri][ci]) throw new Error('Se ha modificado una etiqueta fija de la plantilla.'); });
      if (t.numbered && row[0] !== String(ri + 1)) throw new Error('Numeración de pasos no válida.');
    });
  }
  return data;
}
export function markdown(data, schema) {
  validate(data, schema);
  return schema.tokens.map(t => {
    if (t.type === 'field') return t.prefix + (data.fields[t.id] ? encode(data.fields[t.id]) : t.hint);
    if (t.type === 'check') return `- [${data.checks[t.id] ? 'x' : ' '}] ${t.label}`;
    if (t.type === 'table') return [`| ${t.headers.join(' | ')} |`, t.separator, ...data.tables[t.id].map((r, ri) => `| ${r.map((v, ci) => {
      const editable = t.dynamic ? !(t.numbered && ci === 0) : t.editable[ri][ci];
      return editable ? (v ? encode(v) : '[Completar]') : v;
    }).join(' | ')} |`)].join('\n');
    return t.raw;
  }).join('\n');
}
export function importMarkdown(text, schema) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const next = blank(schema);
  const expectedHeadings = schema.tokens.filter(t => t.type === 'text' && /^##? /.test(t.raw)).map(t => t.raw);
  const actualHeadings = lines.filter(line => /^##? /.test(line));
  if (JSON.stringify(actualHeadings) !== JSON.stringify(expectedHeadings)) throw new Error('El Markdown no conserva los apartados de esta plantilla. Importa la plantilla cumplimentada o un brief descargado con esta herramienta.');
  // Skip the explanatory tables before section 0.
  const start = lines.findIndex(line => /^## 0\./.test(line));
  const end = lines.findIndex(line => /^## Continuidad/.test(line));
  const body = lines.slice(start, end < 0 ? undefined : end);
  let tableIndex = 0;
  for (let i = 0; i < body.length; i++) {
    if (!body[i].startsWith('|') || !/^\|[\s:|\-]+$/.test(body[i + 1] || '')) continue;
    const t = schema.tables[tableIndex++];
    if (!t || JSON.stringify(splitRow(body[i])) !== JSON.stringify(t.headers)) throw new Error('Las tablas no corresponden a esta plantilla.');
    const rows = []; i++;
    while (body[i + 1]?.startsWith('|')) rows.push(splitRow(body[++i]));
    next.tables[t.id] = rows.map((row, ri) => row.map((v, ci) => {
      const editable = t.dynamic ? !(t.numbered && ci === 0) : t.editable[ri]?.[ci];
      return editable ? (v === t.rows[ri]?.[ci] && placeholder(v) || /^\[Completar\]$/.test(v) ? '' : decode(v)) : v;
    }));
  }
  if (tableIndex !== schema.tables.length) throw new Error('Faltan tablas del brief.');
  for (const f of schema.fields) {
    const from = body.indexOf(`## ${f.section}`);
    const nextHeading = body.findIndex((line, index) => index > from && /^## /.test(line));
    const sectionLines = body.slice(from, nextHeading < 0 ? undefined : nextHeading);
    const matches = sectionLines.filter(line => line.startsWith(f.prefix));
    if (matches.length !== 1) throw new Error(`No se reconoce el campo «${f.label}».`);
    const value = matches[0].slice(f.prefix.length);
    next.fields[f.id] = value === f.hint ? '' : decode(value.replace(/\\([\\|])/g, '$1'));
  }
  for (const c of schema.checks) {
    const matches = body.filter(line => /^- \[[ xX]\] /.test(line) && line.slice(6) === c.label);
    if (matches.length !== 1) throw new Error('No se reconoce la lista de comprobación.');
    next.checks[c.id] = /^- \[[xX]\]/.test(matches[0]);
  }
  return validate(next, schema);
}
export function progress(data, schema) {
  let total = schema.fields.length, filled = schema.fields.filter(f => data.fields[f.id].trim()).length;
  for (const t of schema.tables) data.tables[t.id].forEach((row, ri) => row.forEach((v, ci) => {
    const editable = t.dynamic ? !(t.numbered && ci === 0) : t.editable[ri][ci];
    if (editable) { total++; if (v.trim()) filled++; }
  }));
  return { total, filled };
}
