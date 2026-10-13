---
name: convenciones-frontend
description: Convenciones del equipo para el frontend React + Vite + TypeScript + Tailwind con estilo Material 3, organizado por features. Úsala al crear o modificar cualquier cosa en web/, por ejemplo una feature, una pantalla, un componente, una llamada a la API, un primitivo de shared/ui, estilos, formularios o la visibilidad por rol.
---

# Convenciones de frontend

El `CLAUDE.md` y los `docs/` del proyecto mandan sobre esta skill. Antes de escribir código nuevo, lee una feature existente completa y copia su forma.

## Estructura

```
web/src/
├─ app/         rutas y layout; páginas delgadas
├─ features/    una carpeta por feature, con su index.ts
└─ shared/      ui/ (primitivos), api/apiClient.ts, hooks/, lib/, types/
```

## Reglas innegociables

1. **Dependencias `app → features → shared`.** `shared` nunca importa de `features` ni de `app`.
2. **Una feature se importa solo por su `index.ts`.** `@/features/pedidos` sí; `@/features/pedidos/components/Fila` no.
3. **Nunca `fetch` directo.** Todo pasa por `shared/api/apiClient.ts`, que renueva el token una sola vez (single-flight) y reintenta la petición.
4. **Estado local**, con `useState` o un hook de la feature. Sin store global.
5. **Solo Tailwind**, con primitivos Material 3 en `shared/ui`. Sin otra librería de componentes, sin CSS modules y sin estilos en línea, salvo un valor realmente dinámico.
6. **Tokens, no valores sueltos.** Colores por rol (`primary`, `surface`, `error`…), nunca hex ni valores arbitrarios.
7. **La interfaz solo oculta; el servidor prohíbe.**
8. **Página delgada.** Importa la pantalla desde la feature y la muestra. Sin datos ni lógica.

## Reglas de interfaz

- Un solo botón principal por zona.
- Validar al salir del campo y al enviar, no en cada tecla.
- Diálogos con verbos («Aprobar versión», «Eliminar»), nunca «OK».
- Estados vacíos con una explicación y una acción.
- Botón de envío deshabilitado mientras la petición está en curso.
- Áreas táctiles de 48 × 48 px como mínimo.
- Las fechas se muestran en la zona horaria que define el proyecto.

## Receta para una feature

1. `features/<x>/types.ts`: tipos que reflejan los DTOs del backend.
2. `features/<x>/api.ts`: funciones construidas sobre `apiClient`.
3. `components/` y `hooks/` de la feature.
4. `index.ts`: lo único que otros pueden importar.
5. Página delgada en `app/` que muestra la pantalla exportada.

## Referencias

| Necesitas | Lee |
|---|---|
| Carpetas, alias `@/` y reglas de importación | [references/estructura.md](references/estructura.md) |
| `apiClient`, renovación del token y `api.ts` de una feature | [references/api-client.md](references/api-client.md) |
| Tokens de Material 3 en Tailwind y el primitivo `Button` | [references/material3.md](references/material3.md) |
| Patrones de componentes y accesibilidad | [references/componentes.md](references/componentes.md) |
| Estado, contexto de sesión y roles en la interfaz | [references/estado-y-roles.md](references/estado-y-roles.md) |
| Hooks, composición, formularios y rendimiento en React | [references/react.md](references/react.md) |
| Variables de entorno, alias y proxy en Vite | [references/vite.md](references/vite.md) |
