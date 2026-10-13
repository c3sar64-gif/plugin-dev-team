# Origen de las piezas tomadas de ECC

Todas vienen de ECC 2.2.3 (https://github.com/affaan-m/ECC), licencia MIT. El texto de la licencia está en `LICENSES/ECC-MIT.txt`.

A cada pieza se le aplicó lo mismo: traducción al español, se quitó lo que no aplica al stack y se reemplazó la opinión de ECC por la decisión del equipo donde difieren.

| Archivo del plugin | Archivo de ECC | Secciones tomadas | Qué se cambió |
|---|---|---|---|
| `skills/convenciones-backend/references/capas.md` | `skills/hexagonal-architecture/SKILL.md` | Core Concepts, Anti-Patterns to Avoid | Se expresó como tabla de correspondencia con las cuatro capas de Onion del equipo; los ejemplos de TypeScript no se tomaron |
| `skills/convenciones-backend/references/api.md` | `skills/api-design/SKILL.md` | Resource Design, HTTP Methods and Status Codes, Pagination, Filtering Sorting and Search | Rutas `/api/{contexto}/{recurso}` sin versión; solo paginación por página con la forma `{ items, total, page, pageSize }`; errores en ProblemDetails; se quitaron 422 y 429, el cursor y los campos parciales |
| `skills/convenciones-backend/references/persistencia.md` | `skills/dotnet-patterns/SKILL.md` | Repository Pattern with EF Core | Un repositorio por agregado, sin `SaveChanges` dentro del repositorio; carga con seguimiento para modificar |
| `skills/convenciones-backend/references/adaptadores.md` | `skills/hexagonal-architecture/SKILL.md` | How It Works | Puertos en `Application/Puertos`, adaptadores en `Infrastructure/Adapters`; se agregó el outbox y la idempotencia del equipo |
| `skills/convenciones-backend/references/csharp.md` | `skills/dotnet-patterns/SKILL.md` | Core Principles, Async/Await Patterns, Options Pattern, Guard Clauses, Anti-Patterns to Avoid | Ejemplos con el dominio del equipo; `DomainException` en las guardas de negocio; no se tomaron Result Pattern, Middleware ni las APIs sin controladores |
| `skills/convenciones-frontend/references/react.md` | `skills/react-patterns/SKILL.md` | Core Principles, Hooks Discipline, State Location Decision Tree, Forms, Composition Recipes, Performance, Accessibility-First Composition | Estado local sin store global ni librería de estado de servidor; formularios con campos controlados y el `api.ts` de la feature; no se tomaron el renderizado en servidor, la matriz de obtención de datos ni las rutas |
| `skills/convenciones-frontend/references/vite.md` | `skills/vite-patterns/SKILL.md` | How It Works, Examples (variables de entorno, proxy), Quick Reference | Alias `@/` declarado a mano en Vite y en TypeScript; proxy hacia la API local; no se tomaron plugins, modo librería, renderizado en servidor ni optimización de paquetes |
| `skills/migraciones-sql/references/escribir-migraciones.md` | `skills/database-migrations/SKILL.md` | Core Principles, Migration Safety Checklist, PostgreSQL Patterns, Zero-Downtime Migration Strategy, Anti-Patterns | SQL escrito a mano, idempotente y solo hacia adelante; ejemplos con el dominio del equipo; no se tomó ninguna sección de herramientas de migración de otros lenguajes |
| `skills/migraciones-sql/references/postgres.md` | `skills/postgres-patterns/SKILL.md` | Quick Reference | Ids `uuid`; nombres en snake_case del equipo; paginación por página; no se tomaron las políticas de seguridad por fila ni la plantilla de configuración del servidor |
| `skills/commits/SKILL.md` | `skills/git-workflow/SKILL.md` | Commit Messages, Anti-Patterns | Tipos y reglas de versión del equipo; se descartaron ramas, merge, pull requests, versiones y configuración de git |
