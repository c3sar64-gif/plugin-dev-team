import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { REGLAS } from '../../hooks/reglas/indice.mjs';

const ESPERADAS = {
  'sin-fetch-directo': 'bloquear',
  'sin-migraciones-ef': 'bloquear',
  'dependencias-onion': 'bloquear',
  'limites-features': 'bloquear',
  'commit-convencional': 'bloquear',
  'sin-css-modules': 'bloquear',
  'cruce-de-contextos': 'avisar',
  'estilos-en-linea': 'avisar',
  'migracion-existente': 'avisar',
};

test('el catálogo tiene exactamente las nueve reglas de la especificación', () => {
  assert.deepEqual(
    Object.fromEntries(REGLAS.map((regla) => [regla.nombre, regla.accion])),
    ESPERADAS,
  );
});

test('cada regla explica por qué existe y cómo hacerlo bien', () => {
  for (const regla of REGLAS) {
    assert.ok(regla.porQue.length > 20, `${regla.nombre}: falta porQue`);
    assert.ok(regla.comoHacerlo.length > 20, `${regla.nombre}: falta comoHacerlo`);
  }
});

test('ninguna regla falla ni salta con contenido vacío', () => {
  const rutas = ['C:/r/web/src/features/pedidos/api.ts', 'C:/r/backend/src/Molino.Core/Pedidos/Pedido.cs',
    'C:/r/backend/src/Molino.Core/Molino.Core.csproj', 'C:/r/README.md'];
  for (const regla of REGLAS) {
    for (const ruta of rutas) {
      const evento = { tipo: 'archivo', herramienta: 'Edit', ruta, contenido: '', existe: false };
      assert.equal(regla.detectar(evento), null, `${regla.nombre} con ${ruta}`);
    }
    assert.equal(regla.detectar({ tipo: 'comando', herramienta: 'Bash', comando: '' }), null, regla.nombre);
  }
});

test('hooks.json conecta el despachador a PreToolUse para archivos y comandos', () => {
  const ruta = fileURLToPath(new URL('../../hooks/hooks.json', import.meta.url));
  assert.ok(existsSync(ruta), 'falta hooks/hooks.json');
  const [entrada] = JSON.parse(readFileSync(ruta, 'utf8')).hooks.PreToolUse;
  for (const herramienta of ['Write', 'Edit', 'MultiEdit', 'Bash', 'PowerShell']) {
    assert.ok(entrada.matcher.split('|').includes(herramienta), `el matcher no incluye ${herramienta}`);
  }
  assert.match(entrada.hooks[0].command, /despachador\.mjs/);
});
