# AR-DEV-TEAM · Diseño del plugin del equipo

Fecha: 2026-10-13 · Estado: en revisión

## 1. Propósito

Un plugin de Claude Code que hace que todo el equipo construya igual: la misma forma de código, los mismos pasos y la misma revisión, en Molino Rolón y en los proyectos que vengan.

Hoy el equipo tiene una sola skill (`fullstack-dotnet-nextjs`, escrita por el master) y ningún agente. Esa skill además contradice decisiones ya tomadas en Molino Rolón. El plugin la reemplaza por una versión corregida y le suma lo útil de ECC, adaptado.

**Se considera logrado cuando:**

1. Un desarrollador nuevo abre un proyecto, acepta instalar el plugin y queda con las mismas reglas que el resto, sin configurar nada a mano.
2. Las infracciones graves y detectables se bloquean antes de escribirse.
3. Una funcionalidad hecha con el flujo guiado pasa por los mismos pasos, la haga quien la haga.
4. Cada regla está escrita en un solo archivo.

## 2. Decisiones tomadas

| # | Decisión | Detalle |
|---|---|---|
| 1 | Nombre | Identificador `ar-dev-team`; nombre visible «AR-DEV-TEAM». |
| 2 | Alcance | Varios proyectos. Todos usan el stack de Molino Rolón. |
| 3 | Stack que cubre | ASP.NET Core (.NET 10) en Onion con DDD, PostgreSQL con migraciones SQL a mano, React + Vite + TypeScript + Tailwind con Material 3, login propio con JWT, xUnit + Testcontainers. |
| 4 | Exigencia | Bloquea lo innegociable que se puede detectar con certeza. Lo demás lo cubren los revisores. |
| 5 | Primera versión | Núcleo más flujo guiado. |
| 6 | Relación con ECC | Se copia y adapta solo lo útil (ECC 2.2.3, licencia MIT). ECC no es dependencia. |
| 7 | Skill del master | Es la base de las skills de convenciones, corregida. Se retira de los proyectos al adoptar el plugin. |
| 8 | Alojamiento | Repositorio privado en GitHub, propio del plugin. |
| 9 | Idioma | Todo en español. Nombres de código en español del dominio, sin tildes. |

## 3. Capas y precedencia

```
1. CLAUDE.md + docs/ del proyecto   qué se construye: dominio, contextos, roles, decisiones
2. AR-DEV-TEAM                      cómo construye el equipo: reglas, hooks, flujo, agentes
```

Si el plugin y el proyecto se contradicen, gana el proyecto. No debería ocurrir: una regla general vive solo en el plugin y una decisión de dominio vive solo en el proyecto.

## 4. Estructura del repositorio

```
ar-dev-team/
├─ .claude-plugin/
│  ├─ marketplace.json           # el repo es su propio marketplace
│  └─ plugin.json
├─ skills/
│  ├─ convenciones-backend/      SKILL.md + references/
│  ├─ convenciones-frontend/     SKILL.md + references/
│  ├─ migraciones-sql/           SKILL.md + references/
│  ├─ commits/                   SKILL.md
│  ├─ pruebas-backend/           SKILL.md + references/
│  ├─ verificacion/              SKILL.md
│  ├─ decisiones/                SKILL.md
│  └─ nueva-funcionalidad/       SKILL.md   (flujo guiado, se invoca con /)
├─ agents/
│  ├─ revisor-arquitectura.md
│  ├─ revisor-csharp.md
│  ├─ revisor-react.md
│  ├─ revisor-base-datos.md
│  ├─ revisor-seguridad.md
│  ├─ planificador.md
│  ├─ guia-pruebas.md
│  └─ reparador-build.md
├─ hooks/
│  ├─ hooks.json
│  ├─ despachador.mjs            # lee el evento y ejecuta las reglas
│  └─ reglas/                    # una regla por archivo
├─ pruebas/
│  ├─ hooks/                     # pruebas automáticas de cada regla
│  └─ ejemplo-con-infracciones/  # mini proyecto para probar los revisores
├─ docs/
│  ├─ specs/
│  └─ origen-ecc.md              # qué pieza viene de qué archivo de ECC
├─ LICENSES/ECC-MIT.txt
├─ README.md
└─ CHANGELOG.md
```

## 5. Skills

Cada `SKILL.md` es corto: dice cuándo aplica, las reglas y a qué referencia ir. El detalle y los ejemplos van en `references/`, que se carga solo cuando hace falta.

| Skill | Se activa al | Contenido | Origen |
|---|---|---|---|
| `convenciones-backend` | tocar `backend/` | Dependencias de Onion, contextos como carpetas, agregados y eventos de dominio propios, `DomainException` → 409, servicio Scoped que orquesta y devuelve DTOs, controlador delgado, paginación `PagedRequest` / `PagedResult<T>`, DI por contexto, EF con snake_case y UTC, adaptadores, auth y roles | Skill del master + ECC `dotnet-patterns`, `api-design`, `hexagonal-architecture` |
| `convenciones-frontend` | tocar `web/` | `app → features → shared`, `index.ts` como única puerta, `apiClient` con renovación single-flight, estado local, primitivos Material 3 con Tailwind, reglas de interfaz, roles en la interfaz | Skill del master + ECC `react-patterns`, `vite-patterns` |
| `migraciones-sql` | tocar `db/` o cambiar un mapeo de EF | `db/migrations/NNNN_descripcion.sql`, DDL aditivo e idempotente, la migración va antes que el código, verificar el entorno antes de algo destructivo, índices y tipos de PostgreSQL | Skill del master + ECC `database-migrations` (solo SQL puro), `postgres-patterns` |
| `commits` | preparar un commit | Conventional Commits, un commit por propósito, separar hunks, commit y push solo cuando se pide | Skill del master + ECC `git-workflow` |
| `pruebas-backend` | escribir o cambiar pruebas en `backend/tests/` | Prueba primero, pruebas unitarias de agregados, integración con Testcontainers, nombres y estructura | ECC `csharp-testing`, `tdd-workflow` |
| `verificacion` | antes de decir que algo está listo | Compilar, pruebas, lint, tipos; reportar los fallos tal cual; no afirmar nada que no se ejecutó | ECC `verification-loop` + definición de terminado de Molino |
| `decisiones` | aparece una decisión no registrada | Preguntar con opciones y una recomendada; registrar en `docs/decisiones.md` | ECC `architecture-decision-records` |
| `nueva-funcionalidad` | lo invoca el desarrollador | El flujo guiado de la sección 8 | Propio |

### Correcciones a la skill del master

| Tema | Skill del master | AR-DEV-TEAM |
|---|---|---|
| Lógica de negocio | En los servicios; entidades sin lógica | En Core; el servicio carga, llama y guarda |
| Arquitectura | Clean Architecture, `Core/Models/` | Onion con DDD; contextos como carpetas en cada capa |
| Versión | .NET 8+ | .NET 10 LTS |
| Frontend | Next.js App Router | React + Vite |
| Base de datos | Supabase | PostgreSQL en Docker |
| Migraciones | `supabase/migrations/YYYYMMDDHHMMSS_…` | `db/migrations/NNNN_…` |
| Auth | JWT emitido por Supabase | Login propio: access 15 min, refresh 7 días rotativo en cookie httpOnly |
| Paginación | `PagedResultDto<T>` | `PagedRequest` / `PagedResult<T>`, máximo 100 |
| Registro DI | Un solo archivo | Uno por contexto: `AddPedidos()`, `AddProduccion()` |
| Acceso | Filtro por filas | Por rol, por defecto |

Dos patrones del master se conservan como referencias opcionales, porque dependen del dominio de cada proyecto: el filtro por filas (`references/acceso-por-filas.md`) y el inventario con cabecera y detalle (`references/inventario.md`).

## 6. Agentes

| Agente | Qué hace | Carga la skill | Origen |
|---|---|---|---|
| `revisor-arquitectura` | Dirección de dependencias, reglas en Core, un agregado por operación, contextos aislados, límites entre features | `convenciones-backend`, `convenciones-frontend` | Propio |
| `revisor-csharp` | Calidad de C#: async, nulabilidad, manejo de errores, rendimiento | `convenciones-backend` | ECC `csharp-reviewer`, sin Minimal APIs |
| `revisor-react` | Hooks, renderizado, tipos, accesibilidad básica | `convenciones-frontend` | ECC `react-reviewer` + `typescript-reviewer`, sin Next.js |
| `revisor-base-datos` | Migraciones aditivas e idempotentes, numeración, tipos, índices, que cada cambio de mapeo tenga su migración | `migraciones-sql` | ECC `database-reviewer` |
| `revisor-seguridad` | `[Authorize]` en cada endpoint, JWT y cookies, claves de API, secretos en el código, inyección | `convenciones-backend` | ECC `security-reviewer` |
| `planificador` | Convierte un pedido en un plan corto que sigue la receta | `convenciones-backend`, `convenciones-frontend` | ECC `planner` |
| `guia-pruebas` | Exige la prueba antes que la regla; escribe pruebas de agregados y de integración | `pruebas-backend` | ECC `tdd-guide` |
| `reparador-build` | Arregla errores de `dotnet build`, `tsc` y Vite con cambios mínimos, sin rediseñar | — | ECC `build-error-resolver` + `react-build-resolver` |

**Reglas comunes:**

- Los cinco revisores no tienen herramientas de edición: leen, buscan y ejecutan comandos de consulta. Reportan, no corrigen.
- Ningún agente repite reglas. Las toma de la skill que carga.
- Un agente nuevo se agrega solo cuando una necesidad real se repite.

**Formato único de hallazgos de los revisores:**

```
[Bloqueante | Importante | Sugerencia] archivo:línea
Regla: <nombre de la regla y skill donde está>
Problema: <qué pasa, con la evidencia del código>
Corrección: <qué cambiar>
```

Solo se reporta lo que tiene evidencia en el código. Si no hay hallazgos, se dice así.

## 7. Hooks

Un despachador en Node (`hooks/despachador.mjs`) recibe el evento antes de escribir un archivo o ejecutar un comando y le pasa los datos a cada regla. Cada regla es una función pura en su propio archivo: recibe el evento y devuelve «bloquear», «avisar» o nada.

| Regla | Qué detecta | Acción |
|---|---|---|
| `sin-fetch-directo` | `fetch(` o `axios` en `web/src/` fuera de `shared/api/` | Bloquea |
| `sin-migraciones-ef` | `dotnet ef migrations`, `dotnet ef database update` o archivos en una carpeta `Migrations/` | Bloquea |
| `dependencias-onion` | Referencias de proyecto o de paquete prohibidas en un `.csproj`; un `using` de Infrastructure o Api desde Core o Application | Bloquea |
| `limites-features` | Importar una feature saltando su `index.ts`; `shared` importando de `features` o `app`; `features` importando de `app` | Bloquea |
| `commit-convencional` | `git commit` con un mensaje que no sigue Conventional Commits | Bloquea |
| `sin-css-modules` | Crear archivos `.module.css` | Bloquea |
| `cruce-de-contextos` | Un archivo de un contexto de Core con `using` del espacio de nombres de otro contexto (se excluye `Common`) | Avisa |
| `estilos-en-linea` | `style={{` en componentes | Avisa |
| `migracion-existente` | Editar un archivo ya existente en `db/migrations/` | Avisa |

**Comportamiento:**

- **Bloquear** detiene la acción y muestra: la regla, por qué existe y cómo hacerlo bien.
- **Avisar** deja pasar y añade el aviso a la conversación.
- **Por convención:** las reglas se guían por `backend/`, `web/` y `db/`. Si el repo no tiene esas carpetas, no hacen nada.
- **Si el despachador o una regla falla, deja pasar.** Un error del hook nunca traba al desarrollador.
- **Salida de emergencia:** la variable `AR_DEV_TEAM_REGLAS_DESACTIVADAS` recibe nombres de reglas separados por coma.

Las tres reglas que avisan tienen casos legítimos. Se suben a bloqueo cuando el código real de un proyecto lo confirme.

**Límite conocido:** un hook no puede detectar «hay lógica de negocio en el controlador» ni «el servicio decide en vez de orquestar». Eso lo cubre `revisor-arquitectura`.

## 8. Flujo guiado: `/ar-dev-team:nueva-funcionalidad`

1. **Contexto.** Lee el `CLAUDE.md` y los `docs/` del proyecto. Si falta una decisión, aplica la skill `decisiones`.
2. **Plan.** El `planificador` propone un plan corto. **Se detiene hasta que el desarrollador lo aprueba.**
3. **Migración SQL**, revisada por `revisor-base-datos`.
4. **Core.** La `guia-pruebas` exige la prueba del agregado antes que la regla.
5. **DTOs → servicio → controlador → registro DI.**
6. **Frontend.** Feature con su `index.ts` y página delgada.
7. **Verificación** con la skill `verificacion`. Si algo no compila, entra el `reparador-build`.
8. **Revisión en paralelo.** Solo los revisores que correspondan a los archivos tocados. Lo bloqueante se corrige y se vuelve al paso 7.
9. **Commits** por propósito, con la skill `commits`. **Solo si el desarrollador lo pide.**

Se saltan los pasos que no aplican. Un cambio solo de frontend empieza en el 6.

## 9. Adaptación de las piezas de ECC

A cada pieza copiada se le aplica lo mismo:

1. Se traduce al español.
2. Se quita lo que no aplica al stack: otros lenguajes, Minimal APIs, Prisma, Drizzle, Django, Next.js, componentes de servidor.
3. Donde ECC opina distinto, se escribe la decisión del equipo.
4. El material de patrones se fusiona dentro de las skills del equipo. No queda como skill aparte, para no tener dos fuentes.
5. Los agentes cargan las skills del equipo en lugar de repetir reglas.
6. Se anota el origen en `docs/origen-ecc.md`: archivo de ECC, versión 2.2.3 y qué se cambió.

**Licencia.** ECC es MIT (Copyright (c) 2026 Affaan Mustafa). El texto completo de su licencia se conserva en `LICENSES/ECC-MIT.txt` y el README lo menciona.

## 10. Distribución

El repositorio es su propio marketplace. Cada proyecto versiona un `.claude/settings.json` como este:

```json
{
  "extraKnownMarketplaces": {
    "ar-dev-team": {
      "source": { "source": "github", "repo": "<cuenta>/ar-dev-team" }
    }
  },
  "enabledPlugins": {
    "ar-dev-team@ar-dev-team": true
  }
}
```

Al abrir el proyecto, Claude Code propone instalar el plugin. Como el repositorio es privado, cada desarrollador necesita acceso de lectura en GitHub.

**Versiones:** semver, con Conventional Commits.

- Mayor: una regla nueva que bloquea, o un cambio que rompe el flujo.
- Menor: una skill, un agente o una regla que solo avisa.
- Parche: correcciones.

## 11. Pruebas del plugin

| Pieza | Prueba |
|---|---|
| Hooks | Pruebas automáticas con el ejecutor de pruebas de Node. Por cada regla: un caso que debe bloquear o avisar y uno que debe pasar. Corren en GitHub Actions en cada pull request. |
| Manifiestos | Validación de la estructura del plugin antes de cada versión. |
| Revisores | `pruebas/ejemplo-con-infracciones/` tiene infracciones sembradas y una lista de lo que cada revisor debe encontrar. No es determinista: es una lista de control que se corre antes de publicar. |
| Flujo guiado | Piloto real con la entrega E0 de Molino Rolón. |

Todo en Node, sin scripts de bash, para que funcione igual en Windows, macOS y Linux.

## 12. Orden de construcción

Cada etapa deja algo usable.

1. **Esqueleto:** repo, manifiestos, licencia de ECC, README, instalación local comprobada.
2. **Skills de convenciones:** `convenciones-backend`, `convenciones-frontend`, `migraciones-sql`, `commits`.
3. **Hooks** con sus pruebas y GitHub Actions.
4. **Revisores (5)** con el proyecto de ejemplo.
5. **Agentes de trabajo (3)** y las skills `pruebas-backend`, `verificacion`, `decisiones`.
6. **Flujo `nueva-funcionalidad`.**
7. **Adopción en Molino Rolón.**

La entrega E0 de Molino puede empezar al terminar la etapa 3. Las etapas 4 a 6 se construyen en paralelo con E0, para ajustarlas contra código real.

## 13. Adopción en Molino Rolón (etapa 7)

1. Agregar `.claude/settings.json` con el marketplace y el plugin.
2. Acortar el `CLAUDE.md` del proyecto. Pasan al plugin la receta, las trampas conocidas, la definición de terminado y las reglas generales de arquitectura, frontend, interfaz y commits. Queda en el proyecto lo propio del molino: dominio, los 7 contextos, roles, integraciones, «todos ven todo según su rol», hora de Bolivia, plan de entregas y cómo trabajar con el usuario.
3. Retirar `.claude/skills/fullstack-dotnet-nextjs/`.
4. Actualizar la decisión 19 de `docs/decisiones.md`: las convenciones son las de AR-DEV-TEAM.

La lista exacta de lo que se mueve se le muestra al usuario antes de editar. Ningún archivo se elimina sin su aprobación.

## 14. Mantenimiento

- Los cambios entran por pull request y los aprueba una persona responsable del plugin.
- `CHANGELOG.md` al día en cada versión.
- Al salir una versión nueva de ECC, `docs/origen-ecc.md` permite comparar las piezas copiadas y decidir si se trae algo.

## 15. Fuera de la primera versión

- Generador de proyecto nuevo (`proyecto-nuevo`).
- Skill de pruebas de frontend.
- De ECC: `architect`, `code-reviewer` genérico, `e2e-runner`, `a11y-architect`, `silent-failure-hunter`, y las skills de Docker, E2E y accesibilidad.
- Pruebas de arquitectura y reglas de ESLint en CI. Van en cada proyecto como parte de su E0.

## 16. Puntos abiertos

| # | Punto | Bloquea |
|---|---|---|
| 1 | Cuenta u organización de GitHub y nombre del repositorio del plugin | Etapa 1 (publicar) |
| 2 | Quién aprueba los cambios al plugin | Etapa 1 (publicar) |
| 3 | Gestor de paquetes del frontend. La skill del master usa pnpm | Etapa 5 (`verificacion`) |
| 4 | Si habrá pruebas de frontend y con qué herramienta | Nada de la primera versión |
| 5 | Convivencia con otros plugins (ECC, superpowers) en las máquinas del equipo: duplican agentes y flujos. Propuesta: el README recomienda no activarlos en proyectos que usan AR-DEV-TEAM | Etapa 7 |
