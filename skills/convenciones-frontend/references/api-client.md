# apiClient: la única capa HTTP

`shared/api/apiClient.ts` es el único lugar del frontend que llama a `fetch`.

## Qué hace

- **Resuelve la URL base** desde el entorno: `import.meta.env.VITE_API_BASE`, con `/api` como valor por defecto.
- **Agrega el access token** como `Authorization: Bearer`.
- **Envía las cookies** (`credentials: 'include'`), porque el refresh token viaja en una cookie httpOnly.
- **Ante un 401, renueva el token una sola vez** y reintenta la petición original.
- **Si la renovación falla,** limpia la sesión y redirige a `/login`.
- **Expone** `get`, `post`, `put`, `patch` y `delete` para JSON, y `upload(ruta, formData)` para archivos.
- **Convierte los errores** de la API (ProblemDetails) en un error con `status` y `detail`, para que la interfaz muestre el mensaje.

Al subir archivos no se pone `Content-Type`: el navegador agrega el delimitador del `FormData`.

## Renovación single-flight

Si cinco peticiones reciben 401 a la vez, solo una llama a `/auth/refresh`. Las otras cuatro esperan la misma promesa.

```ts
let renovando: Promise<string | null> | null = null;

async function renovarUnaVez(): Promise<string | null> {
  if (!renovando) {
    renovando = renovarToken().finally(() => {
      renovando = null;
    });
  }
  return renovando;
}
```

Sin esto, las peticiones en paralelo compiten: la primera gasta el refresh token rotativo y las demás fallan con uno ya usado, lo que cierra la sesión del usuario sin motivo.

## El access token vive en memoria

- El access token se guarda en una variable del módulo, no en `localStorage`.
- Al recargar la página se pide uno nuevo con `/auth/refresh`, que usa la cookie.
- El refresh token nunca es accesible desde JavaScript.

## `api.ts` de una feature

```ts
// features/pedidos/api.ts
import { apiClient } from '@/shared/api/apiClient';
import type { PagedResult } from '@/shared/types';
import type { Pedido, CrearPedido } from './types';

export const listarPedidos = (page = 1, pageSize = 20) =>
  apiClient.get<PagedResult<Pedido>>(`/pedidos/pedidos?page=${page}&pageSize=${pageSize}`);

export const crearPedido = (datos: CrearPedido) =>
  apiClient.post<Pedido>('/pedidos/pedidos', datos);

export const bloquearPedido = (id: string) =>
  apiClient.post<Pedido>(`/pedidos/pedidos/${id}/bloquear`);
```

```ts
// shared/types/paginacion.ts
export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

- Una función por endpoint, con el tipo de la respuesta.
- Los componentes no llaman a `apiClient` directamente: usan las funciones de `api.ts`, normalmente a través de un hook de la feature.
- Los tipos de `types.ts` reflejan los DTOs del backend campo por campo, en camelCase.

## La regla

**Nunca se llama a `fetch` desde un componente ni desde el código de una feature.** El código que se salta el cliente no renueva el token ni cierra la sesión, y falla con 401 silenciosos a mitad de sesión.

El hook `sin-fetch-directo` bloquea `fetch(` y `axios` en `web/src/` fuera de `shared/api/`.
