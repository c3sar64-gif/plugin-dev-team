# AR-DEV-TEAM

Plugin de Claude Code con el estándar del equipo: convenciones, hooks que bloquean lo innegociable, agentes revisores y un flujo guiado para construir cada funcionalidad en el mismo orden.

Stack que cubre: ASP.NET Core (.NET 10) en Onion con DDD, PostgreSQL con migraciones SQL a mano y React + Vite + TypeScript + Tailwind con Material 3.

## Instalar en un proyecto

Agrega esto al `.claude/settings.json` del proyecto y súbelo al repositorio:

```json
{
  "extraKnownMarketplaces": {
    "ar-dev-team": {
      "source": { "source": "github", "repo": "c3sar64-gif/plugin-dev-team" }
    }
  },
  "enabledPlugins": {
    "ar-dev-team@ar-dev-team": true
  },
  "permissions": {
    "allow": ["Read(~/.claude/plugins/cache/ar-dev-team/**)"]
  }
}
```

Al abrir el proyecto, Claude Code propone instalar el plugin.

La regla de `permissions` deja leer los archivos de referencia de las skills sin preguntar cada vez. Sin ella, las skills y los agentes funcionan igual con su resumen, pero Claude Code pide permiso al abrir cada referencia, porque el plugin vive fuera de la carpeta del proyecto.

## Qué incluye

| Pieza | Para qué |
|---|---|
| `skills/` | Las convenciones del equipo y los comandos del flujo. Una regla vive en un solo archivo. |
| `agents/` | Cinco revisores de solo lectura y tres agentes de trabajo. Toman las reglas de las skills; no las repiten. |
| `hooks/` | Reglas que bloquean o avisan antes de escribir un archivo o ejecutar un comando. |

## Comandos

| Comando | Qué hace |
|---|---|
| `/ar-dev-team:nueva-funcionalidad <descripción>` | El flujo completo: plan, migración, agregado con sus pruebas, servicio, controlador, frontend, verificación y revisión |
| `/ar-dev-team:revisar` | Lanza los revisores que correspondan a los cambios y junta sus hallazgos en un informe |
| `/ar-dev-team:verificar` | Compila, prueba, lint, tipos y migraciones, y reporta el resultado tal cual |
| `/ar-dev-team:nueva-migracion <qué cambia>` | Crea el siguiente archivo numerado de migración con su encabezado |
| `/ar-dev-team:commit` | Clasifica los cambios por propósito y propone un commit convencional por cada uno |

## Skills de convenciones

| Skill | Cubre |
|---|---|
| `convenciones-backend` | Onion, agregados, eventos de dominio, servicios, API, persistencia, autenticación y roles |
| `convenciones-frontend` | Features, `apiClient`, Material 3 con Tailwind, componentes, estado y roles |
| `migraciones-sql` | Migraciones SQL a mano, entornos y PostgreSQL |
| `commits` | Conventional Commits |
| `pruebas-backend` | Prueba primero, pruebas de agregados e integración con Testcontainers |
| `decisiones` | Cómo se pregunta y se registra una decisión |

## Agentes

| Agente | Qué hace | Edita |
|---|---|---|
| `revisor-arquitectura` | Dependencias de Onion, reglas en Core, contextos aislados, límites entre features | No |
| `revisor-csharp` | Manejo de errores, async, nulabilidad y calidad de C# | No |
| `revisor-react` | Reglas de hooks, estado, tipos, accesibilidad y rendimiento | No |
| `revisor-base-datos` | Migraciones, tipos, índices y mapeo de EF | No |
| `revisor-seguridad` | Permisos, tokens, secretos e inyección | No |
| `planificador` | Convierte un pedido en un plan corto en el orden de la receta | No |
| `guia-pruebas` | Escribe primero la prueba que falla y después el código mínimo | Sí |
| `reparador-build` | Deja la compilación en verde con el cambio más pequeño | Sí |

Los revisores usan un formato único: severidad (Bloqueante, Importante o Sugerencia), archivo y línea, regla, problema y corrección.

## Reglas de los hooks

| Regla | Qué detecta | Acción |
|---|---|---|
| `sin-fetch-directo` | `fetch(` o `axios` en `web/src/` fuera de `shared/api/` | Bloquea |
| `sin-migraciones-ef` | Comandos de migraciones de EF o archivos en `Migrations/` | Bloquea |
| `dependencias-onion` | Referencias o `using` hacia una capa exterior | Bloquea |
| `limites-features` | Importar el interior de otra feature, o importar hacia arriba | Bloquea |
| `commit-convencional` | Mensaje de commit fuera de Conventional Commits | Bloquea |
| `sin-css-modules` | Crear archivos `.module.css` | Bloquea |
| `cruce-de-contextos` | Un contexto de Core que usa otro | Avisa |
| `estilos-en-linea` | `style={{` en componentes | Avisa |
| `migracion-existente` | Editar una migración que ya existe | Avisa |

Las reglas se guían por las carpetas `backend/`, `web/` y `db/`. Si un hook falla, deja pasar.

## Desactivar una regla en un caso excepcional

```bash
AR_DEV_TEAM_REGLAS_DESACTIVADAS=sin-fetch-directo claude
```

Acepta varios nombres separados por coma.

## Desarrollo del plugin

```bash
npm test
```

```bash
claude plugin validate . --strict
```

Para probarlo sin publicarlo:

```bash
claude --plugin-dir .
```

## Documentos

- Diseño: `docs/specs/2026-10-13-ar-dev-team-design.md`
- Plan de las etapas 1 a 3: `docs/plans/2026-10-13-etapas-1-3.md`
- Plan de las etapas 4 a 6: `docs/plans/2026-10-13-etapas-4-6.md`
- Proyecto de ejemplo para probar a los revisores: `pruebas/ejemplo-con-infracciones/ESPERADO.md`
- Origen de las piezas de ECC: `docs/origen-ecc.md`

## Licencias

Parte del contenido se adaptó de ECC (MIT, Copyright (c) 2026 Affaan Mustafa). Ver `LICENSES/ECC-MIT.txt`.
