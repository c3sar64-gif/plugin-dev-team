# Qué debe encontrar cada revisor

Este proyecto de ejemplo tiene errores sembrados a propósito. Sirve para comprobar que los revisores los encuentran. **No es código a imitar.**

Un revisor pasa si reporta, como mínimo, los hallazgos de su lista con la severidad indicada o una mayor. Puede reportar más. No es una prueba automática: el resultado varía entre ejecuciones, así que es una lista de control que se corre antes de publicar una versión.

## Cómo se corre

Desde esta carpeta, con el plugin cargado:

```bash
claude --plugin-dir ../..
```

Y se pide, por ejemplo: «Lanza el agente revisor-arquitectura sobre los archivos de backend/ y web/ de esta carpeta. No es un repositorio propio: lee los archivos directamente.»

Los hooks del plugin bloquean la edición de estos archivos, porque contienen justo lo que prohíben. Para cambiarlos se desactiva la regla que corresponda con `AR_DEV_TEAM_REGLAS_DESACTIVADAS`.

## Última corrida

13 de octubre de 2026, versión 0.2.0, en sesiones reales de Claude Code con el plugin cargado.

| Revisor | Encontrados | Notas |
|---|---|---|
| `revisor-arquitectura` | 12 de 12 | Skills precargadas |
| `revisor-base-datos` | 10 de 10 | Skills precargadas |
| `revisor-csharp` | 6 de 6 | |
| `revisor-react` | 7 de 7 | |
| `revisor-seguridad` | 5 de 6 | S6 lo mencionó en una nota, sin severidad. Después se agregó esa regla a su lista; falta volver a correrlo |

En las dos primeras corridas los revisores no pudieron leer los archivos de `references/` de sus skills, por falta de permiso de lectura fuera de la carpeta del proyecto. Se resolvió con la regla de `permissions` del README; con ella las referencias se leen.

Los agentes `planificador`, `guia-pruebas` y `reparador-build` y el flujo `nueva-funcionalidad` no se probaron con este ejemplo: necesitan un proyecto que compile. Se prueban con la primera entrega de un proyecto real.

## revisor-arquitectura

| # | Archivo | Qué debe reportar | Severidad mínima |
|---|---|---|---|
| A1 | `Demo.Core/Pedidos/Pedido.cs` | Core usa el espacio de nombres de Infrastructure | Bloqueante |
| A2 | `Demo.Application/Pedidos/PedidoService.cs` | Application usa Infrastructure y el `DbContext` directamente | Bloqueante |
| A3 | `Demo.Application/Pedidos/PedidoService.cs` | La regla de negocio (comparar y asignar `Estado`) está en el servicio, no en el agregado | Bloqueante |
| A4 | `Demo.Application/Pedidos/PedidoService.cs` | El servicio devuelve la entidad en vez de un DTO | Bloqueante |
| A5 | `Demo.Api/Controllers/PedidosController.cs` | El controlador tiene una consulta y un `try/catch`; crea el servicio con `new` | Bloqueante |
| A6 | `Demo.Api/Controllers/PedidosController.cs` | El listado no está paginado | Bloqueante |
| A7 | `Demo.Core/Pedidos/Pedido.cs` | Setters públicos y colección `Lineas` expuesta | Importante |
| A8 | `Demo.Application/Pedidos/PedidoService.cs` | La regla rota devuelve `null` en vez de lanzar `DomainException` | Importante |
| A9 | `web/.../PedidosLista.tsx` | `fetch` directo fuera de `shared/api/` | Bloqueante |
| A10 | `web/.../PedidosLista.tsx` | Importa el interior de la feature `despacho` | Bloqueante |
| A11 | `web/src/shared/ui/Boton.tsx` | `shared` importa de `features` | Bloqueante |
| A12 | `web/src/shared/ui/Boton.tsx` | Color en hex y valores arbitrarios de Tailwind | Importante |

## revisor-csharp

| # | Archivo | Qué debe reportar | Severidad mínima |
|---|---|---|---|
| C1 | `PedidoService.cs` | Bloqueo sobre una tarea con `.Result` | Bloqueante |
| C2 | `PedidoService.cs` | Bloque `catch` vacío | Bloqueante |
| C3 | `PedidosController.cs` | SQL armado con interpolación | Bloqueante |
| C4 | `PedidoService.cs` | Método con entrada y salida que no es asíncrono ni recibe `CancellationToken` | Importante |
| C5 | `PedidoService.cs` | Posible nulo sin comprobar al usar `pedido` | Importante |
| C6 | `Pedido.cs`, `PedidoService.cs` | Textos mágicos para los estados | Importante |

## revisor-react

| # | Archivo | Qué debe reportar | Severidad mínima |
|---|---|---|---|
| R1 | `PedidosLista.tsx` | Hook llamado dentro de un `if` | Bloqueante |
| R2 | `PedidosLista.tsx` | Token de sesión leído de `localStorage` | Bloqueante |
| R3 | `PedidosLista.tsx` | Estado derivado (`total`) dentro de un efecto | Importante |
| R4 | `PedidosLista.tsx` | `key={indice}` en la lista | Importante |
| R5 | `PedidosLista.tsx` | `<div onClick>` no alcanzable con el teclado | Importante |
| R6 | `PedidosLista.tsx` | `any` sin justificación | Importante |
| R7 | `PedidosLista.tsx` | Promesa sin manejo de error | Importante |

## revisor-base-datos

| # | Archivo | Qué debe reportar | Severidad mínima |
|---|---|---|---|
| B1 | `0003_pedidos_prioridad.sql` | El número deja un hueco: falta la 0002 | Bloqueante |
| B2 | `0003_pedidos_prioridad.sql` | No es idempotente: falta `IF NOT EXISTS` | Bloqueante |
| B3 | `0003_pedidos_prioridad.sql` | Columna `NOT NULL` nueva sin valor por defecto | Bloqueante |
| B4 | `0003_pedidos_prioridad.sql` | Fecha en `timestamp` sin zona | Bloqueante |
| B5 | `0003_pedidos_prioridad.sql` | Peso en coma flotante | Bloqueante |
| B6 | `0003_pedidos_prioridad.sql` | Mezcla esquema y datos (`UPDATE`) | Bloqueante |
| B7 | `0003_pedidos_prioridad.sql` | Falta el comentario inicial | Importante |
| B8 | `0003_pedidos_prioridad.sql` | Columna con mayúsculas entre comillas, fuera de snake_case | Importante |
| B9 | `0003_pedidos_prioridad.sql` | Índice normal sobre una tabla con datos, sin `CONCURRENTLY` | Importante |
| B10 | `PedidosController.cs` | SQL armado con interpolación | Bloqueante |

## revisor-seguridad

| # | Archivo | Qué debe reportar | Severidad mínima |
|---|---|---|---|
| S1 | `PedidosController.cs` | Endpoints sin `[Authorize]` | Bloqueante |
| S2 | `PedidosController.cs` | Secreto en el código (`ClaveJwt`) | Bloqueante |
| S3 | `PedidosController.cs` | Inyección de SQL por interpolación | Bloqueante |
| S4 | `PedidosController.cs` | La respuesta de error filtra la traza (`e.ToString()`) | Importante |
| S5 | `PedidosLista.tsx` | Token de sesión en `localStorage` | Importante |
| S6 | `PedidosController.cs` | El controlador devuelve las entidades completas | Importante |
