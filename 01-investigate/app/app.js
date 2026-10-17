import { compile, blank, validate, markdown, importMarkdown, plain, progress } from './core.js';
const KEY = `dcu-problem-cycle-brief-v1:${new URL('.', window.location.href).pathname}`;
const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let schema, data, dirty = false, storageBlocked = false;
function status(message, error = false) { $('#status').textContent = message; $('#status').classList.toggle('error', error); }
function save() {
  dirty = true;
  if (storageBlocked) { status('El borrador anterior no se ha sustituido. Descarga tu trabajo para conservarlo.', true); updateProgress(); return; }
  try { localStorage.setItem(KEY, JSON.stringify(data)); status(`Guardado en este navegador · ${new Date().toLocaleTimeString('es', {hour:'2-digit',minute:'2-digit'})}`); }
  catch { status('No se ha podido guardar en este navegador. Descarga ahora una copia .md para no perder el trabajo.', true); }
  updateProgress();
}
function updateProgress() {
  const {filled, total} = progress(data, schema);
  $('#count').textContent = `${filled} de ${total} respuestas escritas`;
  $('#progress').value = total ? Math.round(100 * filled / total) : 0;
}
function field(label, value, attributes, hint = '') {
  return `<label class="field"><span>${esc(plain(label))}</span><textarea ${attributes} placeholder="${esc(plain(hint).replace(/^\[|\]\.?$/g, ''))}" spellcheck="true">${esc(value)}</textarea></label>`;
}
function tableHTML(t) {
  const rows = data.tables[t.id];
  return `<div class="table-editor" data-editor="${t.id}"><div class="cards">${rows.map((row, ri) => {
    const fixedLabels = row.filter((_, ci) => !t.dynamic && !t.editable[ri][ci]);
    const title = t.numbered ? `Paso ${ri + 1}` : fixedLabels.length ? plain(fixedLabels[0]) : `Entrada ${ri + 1}`;
    return `<div class="card"><div class="row-tools"><h4>${esc(title)}</h4>${t.dynamic && rows.length > 1 ? `<button type="button" data-remove="${t.id}" data-row="${ri}" aria-label="Eliminar entrada ${ri + 1} de ${esc(t.headers.join(', '))}">Eliminar</button>` : ''}</div>${row.map((v, ci) => {
      const editable = t.dynamic ? !(t.numbered && ci === 0) : t.editable[ri][ci];
      if (!editable) return ci > 0 ? `<p>${esc(plain(v))}</p>` : '';
      return field(t.headers[ci], v, `data-table="${t.id}" data-row="${ri}" data-col="${ci}"`, t.rows[Math.min(ri, t.rows.length - 1)][ci]);
    }).join('')}</div>`;
  }).join('')}</div>${t.dynamic ? `<button class="add" type="button" data-add="${t.id}" ${rows.length >= 200 ? 'disabled' : ''}>+ Añadir ${t.numbered ? 'paso' : 'entrada'}</button>` : ''}</div>`;
}
function tokenHTML(t, section) {
  if (t.type === 'table') return tableHTML(t);
  if (t.type === 'field') return field(t.label, data.fields[t.id], `data-field="${t.id}"`, t.hint);
  if (t.type === 'check') return `<label class="check"><input type="checkbox" data-check="${t.id}" ${data.checks[t.id] ? 'checked' : ''}><span>${esc(t.label)}</span></label>`;
  if (!t.raw || t.raw === `## ${section.title}`) return '';
  if (t.raw.startsWith('### ')) return `<h3>${esc(t.raw.slice(4))}</h3>`;
  return `<p>${esc(plain(t.raw)).replace(/^&gt; /, '')}</p>`;
}
function render() {
  $('#navigation').innerHTML = schema.sections.map((s, i) => `<a href="#${s.id}">${i}. ${esc(s.title.split('. ').slice(1).join('. '))}</a>`).join('');
  $('#sections').innerHTML = schema.sections.map((s, i) => `<details id="${s.id}" class="report-section" ${i === 0 ? 'open' : ''}><summary>${esc(s.title)}</summary><div class="section-content">${s.tokens.map(t => tokenHTML(t, s)).join('')}</div></details>`).join('');
  updateProgress();
}
function hasWork() { return dirty || progress(data, schema).filled > 0 || Object.values(data.checks).some(Boolean); }
function confirmReplace(message) {
  return new Promise(resolve => {
    const dialog = $('#confirmation'); $('#dialog-message').textContent = message;
    dialog.returnValue = 'cancel';
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), {once:true});
    dialog.showModal();
  });
}
$('#sections').addEventListener('submit', e => e.preventDefault());
$('#sections').addEventListener('input', e => {
  const target = e.target;
  if (target.dataset.field) data.fields[target.dataset.field] = target.value;
  if (target.dataset.table) data.tables[target.dataset.table][Number(target.dataset.row)][Number(target.dataset.col)] = target.value;
  if (target.dataset.check) data.checks[target.dataset.check] = target.checked;
  save();
});
$('#sections').addEventListener('click', async e => {
  const button = e.target.closest('button'); if (!button) return;
  const id = button.dataset.add || button.dataset.remove;
  const t = schema.tables.find(item => item.id === id); if (!t) return;
  const rows = data.tables[id];
  if (button.dataset.add) {
    if (rows.length >= 200) return;
    rows.push(t.headers.map((_, ci) => t.numbered && ci === 0 ? String(rows.length + 1) : ''));
  } else {
    if (rows.length <= 1) return;
    if (rows[Number(button.dataset.row)].some((v, ci) => v.trim() && !(t.numbered && ci === 0)) && !await confirmReplace('Se eliminará esta entrada y sus respuestas.')) return;
    rows.splice(Number(button.dataset.row), 1);
    if (t.numbered) rows.forEach((r, i) => { r[0] = String(i + 1); });
  }
  const editor = button.closest('.table-editor'); editor.outerHTML = tableHTML(t);
  save();
  const fresh = document.querySelector(`[data-editor="${id}"]`);
  const focus = button.dataset.add ? fresh.querySelector('.card:last-child textarea') : fresh.querySelector('textarea');
  focus?.focus();
});
$('#navigation').addEventListener('click', e => {
  const link = e.target.closest('a'); if (link) document.querySelector(link.getAttribute('href')).open = true;
});
$('#back-to-sections').addEventListener('click', () => {
  const navigation = $('#navigation');
  navigation.querySelector('a')?.focus({preventScroll:true});
  navigation.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'start',
  });
});
$('#download').addEventListener('click', () => {
  const content = markdown(data, schema);
  const url = URL.createObjectURL(new Blob([content], {type:'text/markdown;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = 'ciclo-01-brief-problema-y-ciclo.md'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status('Brief .md preparado. Comprueba la descarga y conserva una copia o entrégalo por el canal acordado.');
});
$('#import').addEventListener('change', async e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file || !schema) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error('El archivo supera el límite de 5 MB.');
    const next = importMarkdown(await file.text(), schema);
    if ((hasWork() || storageBlocked) && !await confirmReplace('La importación sustituirá el borrador actual completo, no combinará las respuestas.')) return;
    storageBlocked = false; data = next; render(); save();
  } catch (error) { status(`No se ha importado ni modificado el borrador: ${error.message}`, true); }
});
$('#reset').addEventListener('click', async () => {
  if (!await confirmReplace('Se borrará el brief guardado en este navegador y se abrirá una plantilla vacía.')) return;
  storageBlocked = false; data = blank(schema); render(); save(); dirty = false;
});
window.addEventListener('storage', event => {
  if (event.key === KEY) { storageBlocked = true; status('El borrador cambió en otra pestaña. Descarga tu versión antes de continuar o recarga para abrir la otra. No se sobrescribirá automáticamente.', true); }
});
async function init() {
  try {
    const response = await fetch('../brief-problema-y-ciclo.md');
    if (!response.ok) throw new Error('No se pudo descargar la plantilla.');
    schema = compile(await response.text()); data = blank(schema);
    let warning = '';
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) data = validate(JSON.parse(saved), schema);
    } catch { storageBlocked = true; warning = 'No se ha podido recuperar el guardado local. No se sobrescribirá. Importa una copia .md o inicia un nuevo análisis; descarga lo que escribas para conservarlo.'; }
    render(); $('#download').disabled = false; $('#reset').disabled = false; $('#back-to-sections').disabled = false;
    status(warning || 'Borrador listo. Los cambios se guardarán en este navegador.', !!warning);
  } catch (error) { status(`${error.message} Puedes descargar la plantilla original y completarla con un editor de texto.`, true); $('#sections').textContent = 'No se ha podido abrir el formulario.'; }
}
init();
