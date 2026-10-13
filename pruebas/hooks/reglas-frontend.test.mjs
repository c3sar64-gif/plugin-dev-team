import { test } from 'node:test';
import assert from 'node:assert/strict';
import { archivo, comando } from './ayuda.mjs';
import sinFetchDirecto from '../../hooks/reglas/sin-fetch-directo.mjs';
import limitesFeatures from '../../hooks/reglas/limites-features.mjs';
import sinCssModules from '../../hooks/reglas/sin-css-modules.mjs';
import estilosEnLinea from '../../hooks/reglas/estilos-en-linea.mjs';

const SRC = 'C:/r/web/src';

test('sin-fetch-directo bloquea fetch y axios fuera de la capa HTTP', () => {
  const ruta = `${SRC}/features/pedidos/api.ts`;
  for (const contenido of ['const r = await fetch(url);', 'window.fetch(url)', "import axios from 'axios';",
    'const axios = require("axios");']) {
    assert.ok(sinFetchDirecto.detectar(archivo(ruta, contenido)), contenido);
  }
});

test('sin-fetch-directo deja pasar la capa HTTP, las pruebas y lo que no es fetch global', () => {
  assert.equal(sinFetchDirecto.detectar(archivo(`${SRC}/shared/api/apiClient.ts`, 'await fetch(url)')), null);
  assert.equal(sinFetchDirecto.detectar(archivo(`${SRC}/features/pedidos/api.test.ts`, 'globalThis.fetch(url)')), null);
  assert.equal(sinFetchDirecto.detectar(archivo(`${SRC}/features/pedidos/hooks/usePedidos.ts`, 'refetch(); apiClient.fetch(x);')), null);
  assert.equal(sinFetchDirecto.detectar(archivo('C:/r/db/scripts/apply.mjs', 'await fetch(url)')), null);
  assert.equal(sinFetchDirecto.detectar(comando('curl http://x')), null);
});

test('limites-features bloquea importar el interior de otra feature', () => {
  const desde = `${SRC}/features/despacho/components/Lista.tsx`;
  assert.ok(limitesFeatures.detectar(archivo(desde, "import { Fila } from '@/features/pedidos/components/Fila';")));
  assert.ok(limitesFeatures.detectar(archivo(desde, "import { Fila } from '../../pedidos/components/Fila';")));
  assert.ok(limitesFeatures.detectar(archivo(`${SRC}/app/pedidos/page.tsx`, "import type { Pedido } from '@/features/pedidos/types';")));
});

test('limites-features bloquea que shared o una feature importen hacia arriba', () => {
  assert.ok(limitesFeatures.detectar(archivo(`${SRC}/shared/ui/Boton.tsx`, "import { x } from '@/features/pedidos';")));
  assert.ok(limitesFeatures.detectar(archivo(`${SRC}/shared/lib/rutas.ts`, "import { r } from '../../app/rutas';")));
  assert.ok(limitesFeatures.detectar(archivo(`${SRC}/features/pedidos/index.ts`, "export * from '@/app/layout';")));
});

test('limites-features permite los imports correctos', () => {
  const desde = `${SRC}/features/despacho/components/Lista.tsx`;
  for (const contenido of ["import { PedidosScreen } from '@/features/pedidos';",
    "import { x } from '@/features/pedidos/index';", "import { Fila } from './Fila';",
    "import { useDespacho } from '../hooks/useDespacho';", "import { Button } from '@/shared/ui/Button';",
    "import { useState } from 'react';"]) {
    assert.equal(limitesFeatures.detectar(archivo(desde, contenido)), null, contenido);
  }
  assert.equal(limitesFeatures.detectar(archivo(`${SRC}/app/pedidos/page.tsx`, "import { PedidosScreen } from '@/features/pedidos';")), null);
  assert.equal(limitesFeatures.detectar(archivo('C:/r/backend/x.ts', "import a from '@/features/pedidos/interno';")), null);
});

test('sin-css-modules bloquea crear un CSS module y deja pasar el resto', () => {
  assert.ok(sinCssModules.detectar(archivo(`${SRC}/features/pedidos/Lista.module.css`)));
  assert.ok(sinCssModules.detectar(archivo(`${SRC}/shared/ui/Boton.module.scss`)));
  assert.equal(sinCssModules.detectar(archivo(`${SRC}/app/globals.css`)), null);
  assert.equal(sinCssModules.detectar(archivo(`${SRC}/features/pedidos/Lista.module.css`, '', { existe: true })), null);
});

test('estilos-en-linea avisa en componentes y calla en lo demás', () => {
  assert.equal(estilosEnLinea.accion, 'avisar');
  assert.ok(estilosEnLinea.detectar(archivo(`${SRC}/features/pedidos/components/Fila.tsx`, '<div style={{ width: ancho }} />')));
  assert.equal(estilosEnLinea.detectar(archivo(`${SRC}/features/pedidos/components/Fila.tsx`, '<div className="w-4" />')), null);
  assert.equal(estilosEnLinea.detectar(archivo(`${SRC}/features/pedidos/utils.ts`, 'const style = {{}}')), null);
});
