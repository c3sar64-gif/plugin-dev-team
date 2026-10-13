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
