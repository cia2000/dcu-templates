import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compile, blank, validate, markdown, importMarkdown, progress} from '../core.js';

const template = readFileSync(new URL('../../brief-problema-y-ciclo.md', import.meta.url), 'utf8');
const schema = compile(template);
const example = 'Información ficticia: áéíóú ñ | ruta\\con\\barras\nOtra línea <script>alert(1)</script> &amp; <br> [nota]';

test('el formulario conserva los cinco apartados, cinco tablas y revisión final', () => {
  assert.equal(schema.sections.length, 5);
  assert.equal(schema.tables.length, 5);
  assert.equal(schema.checks.length, 7);
  assert.equal(schema.fields.length, 1);
  assert.equal(progress(blank(schema), schema).filled, 0);
});

test('están presentes todos los campos de la plantilla oficial', () => {
  const fields = schema.tables.flatMap(t => t.rows.map(row => row[0]));
  for (const required of ['Ciclo','Equipo','Problema','Personas afectadas','Objetivo del ciclo','Alcance','Fuera de alcance','Supuestos y riesgos','Evidencia necesaria']) assert.ok(fields.includes(required), required);
});

test('la plantilla original se importa como un brief sin respuestas precargadas', () => {
  assert.deepEqual(importMarkdown(template, schema), blank(schema));
});

test('se recuperan todas las respuestas, checks y filas del historial sin pérdidas', () => {
  const data = blank(schema);
  for (const f of schema.fields) data.fields[f.id] = example;
  for (const c of schema.checks) data.checks[c.id] = true;
  for (const t of schema.tables) {
    data.tables[t.id].forEach((row, ri) => row.forEach((_, ci) => { if (t.editable[ri][ci]) row[ci] = example; }));
    if (t.dynamic) data.tables[t.id].push(t.headers.map(() => example));
  }
  assert.deepEqual(importMarkdown(markdown(data, schema), schema), data);
});

test('rechaza otro documento sin alterar el borrador', () => {
  const data = blank(schema), before = structuredClone(data);
  assert.throws(() => importMarkdown('# Reporte de otra actividad\nOtro contenido', schema));
  assert.deepEqual(data, before);
});

test('rechaza etiquetas modificadas y tablas mal formadas', () => {
  const data = blank(schema);
  data.tables['table-0'][0][0] = 'Otro identificador';
  assert.throws(() => validate(data, schema));
  assert.throws(() => importMarkdown(template.replace('| Campo | Contenido |', '| Otra | Tabla |'), schema));
});

test('el historial admite filas vacías y el progreso solo cuenta respuestas escritas', () => {
  const data = blank(schema), history = schema.tables.find(t => t.dynamic);
  data.tables[history.id].push(history.headers.map(() => ''));
  assert.deepEqual(importMarkdown(markdown(data, schema), schema), data);
  data.tables['table-0'][0][1] = 'ciclo-01-brief';
  assert.equal(progress(data, schema).filled, 1);
});

test('la aplicación carga una sola plantilla y usa almacenamiento propio por ruta', () => {
  const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  assert.ok(app.includes("fetch('../brief-problema-y-ciclo.md')"));
  assert.ok(app.includes('dcu-problem-cycle-brief-v1:'));
  assert.ok(app.includes("new URL('.', window.location.href).pathname"));
  assert.ok(!app.includes("const KEY = 'analisis-inicial-dcu-v1'"));
});
