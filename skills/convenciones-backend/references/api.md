# Diseño de la API

## Rutas

```
GET    /api/pedidos/pedidos                listar (paginado)
GET    /api/pedidos/pedidos/{id}           obtener uno
POST   /api/pedidos/pedidos                crear
PUT    /api/pedidos/pedidos/{id}           reemplazar
DELETE /api/pedidos/pedidos/{id}           eliminar

POST   /api/produccion/echadas/{id}/iniciar    acción del dominio
```

- Forma: `/api/{contexto}/{recurso}`.
- Recursos en plural, en minúsculas y con guiones si tienen varias palabras: `/api/formulacion/versiones-formula`.
- **Una acción del dominio es un `POST` a un verbo** bajo el recurso: `/iniciar`, `/aprobar`, `/bloquear`. No se cambia el estado con un `PUT` genérico.
- Sin verbos en el resto de la ruta: `/api/pedidos/pedidos`, no `/api/pedidos/obtenerPedidos`.
- Los filtros van como parámetros de consulta, no en la ruta.

## Formato

- JSON en camelCase.
- Ids UUID.
- Fechas ISO 8601 en UTC. La interfaz las muestra en la zona horaria del proyecto.

## Códigos de respuesta

| Código | Cuándo |
|---|---|
| `200` | Lectura o acción correcta, con cuerpo |
| `201` | Recurso creado; incluye la cabecera `Location` |
| `204` | Correcto y sin cuerpo (por ejemplo, eliminar) |
| `400` | Error de validación, con los errores por campo |
| `401` | Sin sesión o token inválido |
| `403` | Con sesión, pero el rol no tiene permiso |
| `404` | No existe |
| `409` | Regla de negocio rota: `DomainException`, con el mensaje en español |
| `500` | Fallo inesperado; nunca se exponen detalles internos |

Errores comunes:

- Responder `200` con `"success": false` en el cuerpo. Se usa el código HTTP.
- Responder `500` ante un error de validación. Es `400`.
- Responder `400` ante una regla de negocio rota. Es `409`.

## Errores: ProblemDetails

Todas las respuestas de error usan ProblemDetails. Un manejador global convierte las excepciones; ningún controlador lo hace a mano.

```json
{
  "type": "https://httpstatuses.io/409",
  "title": "Regla de negocio",
  "status": 409,
  "detail": "No se puede bloquear un pedido ya despachado."
}
```

Para `400`, el cuerpo incluye además `errors`, con los mensajes por campo.

| Excepción | Código |
|---|---|
| `DomainException` | `409` |
| `NotFoundException` | `404` |
| Error de validación del modelo | `400` |
| Cualquier otra | `500`, se registra en el log y no se muestra al usuario |

## Paginación

Todos los listados se paginan por número de página.

```
GET /api/pedidos/pedidos?page=1&pageSize=20
```

```json
{
  "items": [],
  "total": 137,
  "page": 1,
  "pageSize": 20
}
```

```csharp
public sealed record PagedRequest(int Page = 1, int PageSize = 20)
{
    public const int MaxPageSize = 100;
    public int PageSizeEfectivo => Math.Clamp(PageSize, 1, MaxPageSize);
    public int Saltar => (Math.Max(Page, 1) - 1) * PageSizeEfectivo;
}

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Total, int Page, int PageSize);
```

- `pageSize` por defecto 20 y máximo 100. Un valor mayor se recorta, no da error.
- Toda consulta paginada lleva un `ORDER BY` estable. Sin orden, las páginas se repiten o saltan filas.

## Filtros, orden y búsqueda

```
GET /api/pedidos/pedidos?estado=pendiente&granjaId=…      igualdad
GET /api/pedidos/pedidos?desde=2026-01-01&hasta=2026-01-31  rango de fechas
GET /api/pedidos/pedidos?sort=-creadoEn                    orden; el guion indica descendente
GET /api/pedidos/pedidos?q=texto                           búsqueda de texto
```

- Los nombres de los parámetros van en camelCase, igual que los campos del DTO.
- Solo se ordena por campos permitidos explícitamente; nunca se pasa el valor de `sort` directo a la consulta.
