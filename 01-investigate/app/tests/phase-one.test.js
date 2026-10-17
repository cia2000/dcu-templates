import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compile, blank, validate, markdown, importMarkdown} from '../core.js';

const tools = [
  ['plan-investigacion-y-consentimiento', ['Preguntas de investigación','Método','Participantes previstos','Datos recogidos','Duración y lugar','Responsable','Riesgos y mitigación','Propósito de la actividad','Participación voluntaria y derecho a retirarse','Datos recogidos y uso previsto','Conservación y acceso','Autorización de grabación, si aplica','Aceptación de la persona participante']],
  ['guion-de-investigacion', ['Presentación y propósito','Confirmación de consentimiento','Pregunta final','Información sobre contacto y retirada de datos']],
  ['registro-de-evidencias', ['Identificadores anonimizados','Ubicación de registros originales','Fecha de borrado o revisión']],
  ['analisis-de-tareas-y-contexto', ['Persona o perfil','Objetivo','Contexto móvil','Inicio y resultado','Interrupciones o pérdida de conexión','Accesibilidad o alternativa necesaria']],
];
const templates = tools.map(([name]) => readFileSync(new URL(`../../${name}/plantilla.md`, import.meta.url),'utf8'));
const text = 'Texto de prueba: áéíóú ñ | ruta\\archivo\nSegunda línea <script>alert(1)</script> &amp; <br> [nota]';
for (const [index, [name, required]] of tools.entries()) {
  const template = templates[index], schema = compile(template);
  test(`${name}: estructura, campos oficiales y plantilla sin respuestas`, () => {
    assert.equal(schema.sections.length, 5);
    assert.equal(schema.checks.length, 6);
    const labels = schema.tables.flatMap(t => t.rows.map(row => row[0]));
    required.forEach(label => assert.ok(labels.includes(label), label));
    assert.deepEqual(importMarkdown(template,schema),blank(schema));
    assert.ok(schema.tables.some(t => t.dynamic));
  });
  test(`${name}: exportación/importación sin pérdidas y filas añadidas`, () => {
    const data = blank(schema);
    for (const f of schema.fields) data.fields[f.id] = text;
    for (const c of schema.checks) data.checks[c.id] = true;
    for (const t of schema.tables) {
      data.tables[t.id].forEach((row,ri) => row.forEach((_,ci) => { if(t.editable[ri][ci]) row[ci] = text; }));
      if(t.dynamic) data.tables[t.id].push(t.headers.map((_,ci) => t.numbered && ci===0 ? String(data.tables[t.id].length+1) : text));
    }
    assert.deepEqual(importMarkdown(markdown(data,schema),schema),data);
  });
  test(`${name}: rechaza otros artefactos y etiquetas modificadas`, () => {
    templates.forEach((other,i) => { if(i!==index) assert.throws(()=>importMarkdown(other,schema)); });
    const data = blank(schema);
    data.tables['table-0'][0][0] = 'Etiqueta ajena';
    assert.throws(()=>validate(data,schema));
  });
}

test('los controles de seguridad y la configuración son distintos por artefacto', () => {
  const keys=[],filenames=[];
  for(const [name] of tools){
    const html=readFileSync(new URL(`../../${name}/app/index.html`,import.meta.url),'utf8');
    keys.push(html.match(/data-tool="([^"]+)"/)[1]);
    filenames.push(html.match(/data-filename="([^"]+)"/)[1]);
    assert.ok(html.includes('../../app/editor.js'));
    assert.ok(html.includes('data-template="../plantilla.md"'));
    assert.ok(html.includes('id="back-to-sections"'));
  }
  assert.equal(new Set(keys).size,tools.length);
  assert.equal(new Set(filenames).size,tools.length);
});
