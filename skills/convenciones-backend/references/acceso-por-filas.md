# Acceso por filas

Opcional. Aplica solo si el proyecto decide filtrar por filas; por defecto el acceso es por rol.

Úsalo cuando un usuario debe ver solo una parte de los datos de un recurso, según a qué está asignado dentro de una jerarquía (por ejemplo Empresa → Sede → Unidad → Elemento).

## Cómo funciona

1. `ICurrentUser` expone un contexto de acceso que se carga una vez por petición: los ids que el usuario puede ver en cada nivel de la jerarquía.
2. Cada consulta de listado o lectura filtra por esos ids.
3. `EsAdmin` salta todos los filtros.

El filtro se aplica **en el servidor**, en la consulta. La interfaz no decide qué filas existen.

## Las asignaciones se resuelven en los dos sentidos

- **Hacia abajo:** una asignación sobre un padre da acceso a todos sus descendientes.
- **Hacia arriba:** una asignación sobre un hijo da visibilidad de lectura sobre sus ancestros, para poder mostrarlo en su contexto.

Por eso un usuario puede estar asignado a un hijo sin estarlo a su padre.

## Trampa

Cuando un método de listado o lectura ya filtra por los ids de hijos permitidos, **no** se llama además a una verificación de acceso sobre el padre.

- El filtro es la frontera de seguridad.
- La verificación extra rechazaría a quien está asignado solo al hijo, antes de que el filtro llegue a ejecutarse.

Las verificaciones explícitas de acceso se usan solo en **modificaciones** (`POST`, `PUT`, `DELETE`) que apuntan a una entidad padre concreta.

## Pruebas mínimas

- Un usuario asignado a un padre ve a todos sus hijos.
- Un usuario asignado solo a un hijo ve ese hijo y sus ancestros, pero no a los hermanos.
- Un usuario sin asignaciones no ve nada.
- Un administrador ve todo.
- Un usuario no puede modificar una entidad fuera de sus asignaciones, aunque conozca su id.
