import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizar } from '../../hooks/evento.mjs';
import { evaluar, redactar, VARIABLE_DESACTIVAR } from '../../hooks/motor.mjs';

const nunca = () => false;

test('normalizar convierte rutas de Windows y toma el contenido de Write', () => {
  const evento = normalizar(
    { tool_name: 'Write', tool_input: { file_path: 'C:\\repo\\web\\src\\a.ts', content: 'x' } },
    { existe: nunca },
  );
  assert.deepEqual(evento, {
    tipo: 'archivo', herramienta: 'Write', ruta: 'C:/repo/web/src/a.ts', contenido: 'x', existe: false,
  });
});

test('normalizar toma new_string de Edit y une los de MultiEdit', () => {
  const edit = normalizar({ tool_name: 'Edit', tool_input: { file_path: '/r/a.cs', new_string: 'nuevo' } }, { existe: nunca });
  assert.equal(edit.contenido, 'nuevo');
  const multi = normalizar(
    { tool_name: 'MultiEdit', tool_input: { file_path: '/r/a.cs', edits: [{ new_string: 'uno' }, { new_string: 'dos' }] } },
    { existe: nunca },
  );
  assert.equal(multi.contenido, 'uno\ndos');
});

test('normalizar deja el contenido vacío cuando falta', () => {
  const evento = normalizar({ tool_name: 'Edit', tool_input: { file_path: '/r/a.cs' } }, { existe: nunca });
  assert.equal(evento.contenido, '');
});

test('normalizar reconoce comandos de Bash y de PowerShell', () => {
  for (const herramienta of ['Bash', 'PowerShell']) {
    assert.deepEqual(
      normalizar({ tool_name: herramienta, tool_input: { command: 'git status' } }),
      { tipo: 'comando', herramienta, comando: 'git status' },
    );
  }
});

test('normalizar devuelve null con herramientas desconocidas o datos incompletos', () => {
  for (const entrada of [undefined, null, {}, { tool_name: 'Read', tool_input: { file_path: '/a' } },
    { tool_name: 'Write', tool_input: {} }, { tool_name: 'Bash', tool_input: {} }]) {
    assert.equal(normalizar(entrada), null);
  }
});

const base = { porQue: 'motivo', comoHacerlo: 'solución' };
const bloquea = { ...base, nombre: 'r-bloquea', accion: 'bloquear', detectar: () => 'detalle' };
const avisa = { ...base, nombre: 'r-avisa', accion: 'avisar', detectar: () => 'ojo' };
const calla = { ...base, nombre: 'r-calla', accion: 'bloquear', detectar: () => null };
const revienta = { ...base, nombre: 'r-revienta', accion: 'bloquear', detectar: () => { throw new Error('x'); } };
const entrada = { tool_name: 'Bash', tool_input: { command: 'ls' } };

test('evaluar separa bloqueos y avisos', () => {
  const { bloqueos, avisos } = evaluar(entrada, { env: {}, reglas: [bloquea, avisa, calla] });
  assert.deepEqual(bloqueos.map((b) => b.regla.nombre), ['r-bloquea']);
  assert.deepEqual(avisos.map((a) => a.regla.nombre), ['r-avisa']);
});

test('evaluar ignora una regla que lanza un error', () => {
  const { bloqueos } = evaluar(entrada, { env: {}, reglas: [revienta, bloquea] });
  assert.deepEqual(bloqueos.map((b) => b.regla.nombre), ['r-bloquea']);
});

test('evaluar respeta la variable de reglas desactivadas', () => {
  const env = { [VARIABLE_DESACTIVAR]: ' r-bloquea , otra ' };
  const { bloqueos, avisos } = evaluar(entrada, { env, reglas: [bloquea, avisa] });
  assert.equal(bloqueos.length, 0);
  assert.equal(avisos.length, 1);
});

test('evaluar no hace nada con una entrada que no reconoce', () => {
  assert.deepEqual(evaluar(null, { env: {}, reglas: [bloquea] }), { bloqueos: [], avisos: [] });
});

test('redactar incluye regla, detalle, motivo, solución y salida de emergencia', () => {
  const texto = redactar({ regla: bloquea, detalle: 'detalle' });
  for (const parte of ['Bloqueado', 'r-bloquea', 'detalle', 'motivo', 'solución', `${VARIABLE_DESACTIVAR}=r-bloquea`]) {
    assert.ok(texto.includes(parte), `falta «${parte}»`);
  }
  assert.ok(redactar({ regla: avisa, detalle: 'ojo' }).includes('Aviso'));
});
