# AR-DEV-TEAM

Plugin de Claude Code con el estándar del equipo: convenciones, hooks que bloquean lo innegociable, revisores y un flujo guiado.

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
