# Capas y carpetas

## Estructura de `backend/`

```
backend/
├─ <Proyecto>.sln
├─ src/
│  ├─ <Proyecto>.Core/               sin dependencias
│  │  ├─ Common/                     Entity, AggregateRoot, IDomainEvent, DomainException y objetos valor compartidos
│  │  └─ <Contexto>/                 agregados, entidades, objetos valor, eventos e interfaz del repositorio
│  ├─ <Proyecto>.Application/        depende solo de Core
│  │  ├─ Common/                     IEventHandler<T>, IDomainEventDispatcher, IUnitOfWork, ICurrentUser, PagedRequest, PagedResult<T>
│  │  ├─ Puertos/                    interfaces hacia sistemas externos: I<Sistema>Gateway
│  │  └─ <Contexto>/                 Dtos/, I<X>Service + <X>Service, Handlers/
│  ├─ <Proyecto>.Infrastructure/     implementa las interfaces de Core y Application
│  │  ├─ Persistence/                DbContext, Configurations/, Repositories/
│  │  ├─ Events/                     DomainEventDispatcher, Outbox/
│  │  ├─ Adapters/                   una carpeta por sistema externo
│  │  └─ Auth/                       JWT, refresh y lectura del rol
│  └─ <Proyecto>.Api/
│     ├─ Controllers/                delgados
│     └─ Program.cs                  un registro DI por contexto
└─ tests/
   ├─ <Proyecto>.Core.Tests/         reglas de cada agregado
   └─ <Proyecto>.Application.Tests/  servicios y handlers; integración contra PostgreSQL
```

Hay un solo juego de proyectos. Un contexto nuevo es una carpeta nueva en cada capa, no un proyecto nuevo.

## Qué puede referenciar cada capa

| Capa | Puede referenciar | No puede referenciar |
|---|---|---|
| Core | Nada: ni proyectos ni paquetes | Application, Infrastructure, Api, EF Core, ASP.NET |
| Application | Core | Infrastructure, Api |
| Infrastructure | Core y Application | Api |
| Api | Application (y Infrastructure solo en `Program.cs`, para registrar) | — |
| Proyectos de pruebas | Lo que necesiten probar | — |

El hook `dependencias-onion` bloquea las referencias de proyecto y los `using` que rompen esta tabla.

## Correspondencia con puertos y adaptadores

| Concepto | Dónde vive |
|---|---|
| Modelo de dominio: reglas, entidades, objetos valor | Core, sin tipos de ningún framework |
| Casos de uso: orquestan el dominio | Servicios de Application |
| Puertos de salida: lo que la aplicación necesita de afuera | Interfaces de repositorio en Core; `IUnitOfWork`, `ICurrentUser` y `Puertos/` en Application |
| Adaptadores: implementan los puertos | Infrastructure (repositorios, clientes de API externas) y Api (controladores) |
| Raíz de composición: donde se conecta todo | `Program.cs` y los métodos `Add<Contexto>()` |

Un puerto describe una capacidad («guardar un pedido», «consultar saldos»), no una tecnología.

## Errores típicos

- Una entidad de Core que usa atributos o tipos de EF Core o de ASP.NET.
- Un servicio que lee `HttpContext` en vez de recibir `ICurrentUser`.
- Un servicio que devuelve la entidad, o la fila de la base, en vez de un DTO.
- Un adaptador que llama a otro adaptador directamente, sin pasar por un servicio.
- Registros DI repartidos por muchos archivos, o servicios creados con `new` dentro de otro servicio.
- Un contexto que usa una entidad de otro contexto en vez de guardar solo su id.
