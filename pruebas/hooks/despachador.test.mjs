import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DESPACHADOR = fileURLToPath(new URL('../../hooks/despachador.mjs', import.meta.url));

export const ejecutar = (stdin, env = {}) => spawnSync(process.execPath, [DESPACHADOR], {
  input: stdin, encoding: 'utf8', env: { ...process.env, ...env },
});

test('termina con 0 ante una entrada rota, vacía o desconocida', () => {
  for (const stdin of ['', 'esto no es json', '{}', JSON.stringify({ tool_name: 'Read', tool_input: {} })]) {
    const resultado = ejecutar(stdin);
    assert.equal(resultado.status, 0, `entrada: ${stdin}`);
    assert.equal(resultado.stderr, '');
  }
});

test('termina con 0 y sin salida ante un comando inofensivo', () => {
  const resultado = ejecutar(JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'git status' } }));
  assert.equal(resultado.status, 0);
  assert.equal(resultado.stdout, '');
});

test('bloquea con código 2 y explica la regla, también con ruta de Windows', () => {
  const resultado = ejecutar(JSON.stringify({
    tool_name: 'Write',
    tool_input: { file_path: 'C:\\r\\web\\src\\features\\pedidos\\api.ts', content: 'await fetch(url)' },
  }));
  assert.equal(resultado.status, 2);
  assert.match(resultado.stderr, /sin-fetch-directo/);
  assert.match(resultado.stderr, /Cómo hacerlo/);
});

test('avisa con código 0 y un JSON en la salida', () => {
  const resultado = ejecutar(JSON.stringify({
    tool_name: 'Write',
    tool_input: { file_path: '/r/web/src/features/pedidos/components/Fila.tsx', content: '<div style={{ width: w }} />' },
  }));
  assert.equal(resultado.status, 0);
  const salida = JSON.parse(resultado.stdout);
  assert.match(salida.systemMessage, /estilos-en-linea/);
  assert.equal(salida.hookSpecificOutput.hookEventName, 'PreToolUse');
});

test('la variable de emergencia desactiva la regla', () => {
  const resultado = ejecutar(
    JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'git commit -m "wip"' } }),
    { AR_DEV_TEAM_REGLAS_DESACTIVADAS: 'commit-convencional' },
  );
  assert.equal(resultado.status, 0);
});
