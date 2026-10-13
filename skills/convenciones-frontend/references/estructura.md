# Estructura por features

El código se agrupa por **feature**, no por tipo técnico. Todo lo que una feature necesita vive en una sola carpeta. Las páginas quedan delgadas.

```
web/src/
├─ app/                              rutas y layout
│  ├─ <feature>/Pagina.tsx           delgada: lee parámetros y muestra la pantalla de la feature
│  ├─ Layout.tsx
│  └─ globals.css                    entrada de Tailwind y tokens de diseño
│
├─ features/
│  └─ <feature>/
│     ├─ components/                 componentes propios de la feature
│     │  ├─ PedidosLista.tsx
│     │  └─ PedidoFormulario.tsx
│     ├─ hooks/                      hooks de la feature (usePedidos, usePedidoFiltros)
│     ├─ api.ts                      llamadas a los endpoints de esta feature
│     ├─ types.ts                    interfaces que reflejan los DTOs del backend
│     ├─ utils.ts                    funciones puras (formato, orden, mapeo)
│     ├─ constants.ts                enumeraciones, listas de opciones, etiquetas
│     └─ index.ts                    superficie pública: lo que otros pueden importar
│
└─ shared/
   ├─ api/apiClient.ts               la ÚNICA capa HTTP
   ├─ ui/                            primitivos con Tailwind (Button, Input, Select, Modal, Table, Badge…)
   ├─ hooks/                         hooks genéricos (useDebounce, useDisclosure)
   ├─ lib/                           utilidades genéricas (cn, formato de números y fechas)
   ├─ contexts/                      AuthContext y contextos de datos compartidos
   └─ types/                         tipos entre features (PagedResult<T>, Role)
```

La librería de rutas la define cada proyecto. La regla no cambia: el archivo de ruta solo muestra una pantalla.

## Reglas de importación

1. **Una página es una cáscara delgada.** Importa `PedidosPantalla` desde `@/features/pedidos` y la muestra. Sin pedir datos ni lógica de negocio en el archivo de ruta.
2. **Una feature se importa solo por su `index.ts`.** `@/features/pedidos` está permitido; `@/features/pedidos/components/PedidoFila` no. Así el interior de cada feature es privado.
3. **Una feature no entra al interior de otra.** Si una segunda feature necesita algo, la dueña lo exporta desde su `index.ts`. Cuando sea de verdad genérico, se mueve a `shared/`.
4. **Dirección de las dependencias: `app → features → shared`.** `shared/` nunca importa de `features/` ni de `app/`. Una feature nunca importa de `app/`.
5. **Empieza dentro de la feature.** Se sube a `shared/` solo cuando una segunda feature lo necesita.
6. **Usa el alias `@/`** para importar desde la raíz de `src`. Evita rutas largas con `../../..`. Dentro de una misma feature se usan rutas relativas cortas.

El hook `limites-features` bloquea las importaciones que rompen las reglas 2, 3 y 4.

## El `index.ts` de una feature

```ts
// features/pedidos/index.ts
export { PedidosPantalla } from './components/PedidosPantalla';
export { usePedidoActual } from './hooks/usePedidoActual';
export type { Pedido, EstadoPedido } from './types';
```

- Exporta poco: la pantalla, y solo los hooks y tipos que otra feature usa de verdad.
- No uses `export *`: vuelve público todo el interior sin que nadie lo decida.

## Nombres

- Componentes en `PascalCase.tsx`, un componente por archivo.
- Hooks en `useAlgo.ts`.
- Carpetas de feature en minúsculas y en español del dominio: `pedidos`, `echadas`, `despacho`.
- Los tipos llevan el nombre del DTO sin el sufijo cuando representan lo mismo: `PedidoDto` del backend es `Pedido` en `types.ts`.
