---
name: convenciones-backend
description: Convenciones del equipo para el backend ASP.NET Core (.NET 10) en arquitectura Onion con DDD sobre PostgreSQL. Úsala al crear o modificar cualquier cosa en backend/, por ejemplo agregados, entidades, eventos de dominio, servicios, DTOs, controladores, registro DI, mapeos de EF Core, adaptadores a sistemas externos, autenticación o roles.
---

# Convenciones de backend

El `CLAUDE.md` y los `docs/` del proyecto mandan sobre esta skill. Antes de escribir código nuevo, lee una funcionalidad existente de punta a punta y copia su forma.

## Capas

```
<Proyecto>.Api ──▶ <Proyecto>.Application ──▶ <Proyecto>.Core
<Proyecto>.Infrastructure ──implementa las interfaces de──▶ Core y Application
```

Hay un solo juego de proyectos. Cada contexto del dominio es una carpeta dentro de cada capa.

## Reglas innegociables

1. **Dependencias hacia el centro.** Core no referencia ningún proyecto ni paquete. Application conoce solo a Core. Infrastructure implementa las interfaces. Api solo llama a los servicios.
2. **Las reglas de negocio viven en Core**, en métodos del agregado. El servicio solo orquesta: carga, llama al método y guarda.
3. **Un agregado se modifica solo por su raíz.** Una operación cambia un solo agregado. Si otro debe cambiar, se entera por un evento de dominio.
4. **Un contexto no usa entidades de otro.** Solo ids, DTOs o eventos.
5. **Una regla rota lanza `DomainException`.** La API la devuelve como HTTP 409 con el mensaje en español.
6. **Controladores delgados.** Llaman al servicio y devuelven el resultado. Sin consultas, validaciones ni mapeos.
7. **Servicios Scoped que devuelven DTOs**, nunca entidades.
8. **Todo listado se pagina** con `PagedRequest` y `PagedResult<T>`: `?page=1&pageSize=20`, máximo 100.
9. **El servidor prohíbe; la interfaz solo oculta.** Cada endpoint lleva `[Authorize(Roles = …)]`. El rol se lee de la base en cada petición. Un rol no reconocido es `GUEST`.
10. **Lo que viene de afuera entra por su adaptador** en `Infrastructure/Adapters`.
11. **Eventos de dominio propios y simples**, sin librerías de mediación.
12. **Sin migraciones de EF.** El esquema cambia con SQL escrito a mano (skill `migraciones-sql`).

## Receta para una funcionalidad

1. Migración SQL (skill `migraciones-sql`).
2. Entidad o agregado en Core, con sus reglas y sus pruebas.
3. DTOs en Application.
4. Interfaz y servicio en Application.
5. Controlador delgado en Api.
6. Registro en el método DI del contexto: `services.Add<Contexto>()`.

## Trampas conocidas

- Usa `timestamptz` con `DateTime` en UTC. Normaliza el `Kind` antes de comparar una fecha leída de la base con una calculada.
- Mapea cada columna de EF explícitamente a snake_case. Una entidad sin mapear usa nombres por convención que no coinciden con el SQL escrito a mano.
- Los nombres de clases, métodos y tablas van en español del dominio, sin tildes: `OrdenFabricacion`, `PesarNucleo()`.

## Referencias

| Necesitas | Lee |
|---|---|
| Carpetas de cada proyecto y qué puede referenciar cada capa | [references/capas.md](references/capas.md) |
| Agregados, objetos valor, `DomainException` y eventos de dominio | [references/agregados-y-eventos.md](references/agregados-y-eventos.md) |
| Servicios, DTOs, controladores y registro DI | [references/servicios-y-controladores.md](references/servicios-y-controladores.md) |
| Rutas, códigos HTTP, errores y paginación | [references/api.md](references/api.md) |
| EF Core, mapeos, repositorios y unidad de trabajo | [references/persistencia.md](references/persistencia.md) |
| Login, tokens, roles y claves de API | [references/auth-y-roles.md](references/auth-y-roles.md) |
| Integraciones con sistemas externos | [references/adaptadores.md](references/adaptadores.md) |
| Estilo de C#: async, opciones, cláusulas de guarda | [references/csharp.md](references/csharp.md) |
| Filtro por filas (solo si el proyecto lo decide) | [references/acceso-por-filas.md](references/acceso-por-filas.md) |
| Inventario con cabecera y detalle (solo si el proyecto lo necesita) | [references/inventario.md](references/inventario.md) |
