# AR-DEV-TEAM

Plugin de Claude Code con el estándar del equipo: convenciones y hooks que bloquean lo innegociable.

La versión 0.1.0 trae las skills de convenciones y los hooks. Los agentes revisores y el flujo guiado llegan en la versión siguiente.

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
  }
}
```

Al abrir el proyecto, Claude Code propone instalar el plugin.

## Qué incluye

| Pieza | Para qué |
|---|---|
| `skills/` | Las convenciones del equipo. Una regla vive en un solo archivo. |
| `hooks/` | Reglas que bloquean o avisan antes de escribir un archivo o ejecutar un comando. |

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
- Origen de las piezas de ECC: `docs/origen-ecc.md`

## Licencias

Parte del contenido se adaptó de ECC (MIT, Copyright (c) 2026 Affaan Mustafa). Ver `LICENSES/ECC-MIT.txt`.
