# Vite

## Cómo funciona

- **En desarrollo** sirve los archivos fuente como módulos nativos del navegador, sin empaquetar. Por eso arranca rápido y actualiza solo lo que cambió.
- **Al compilar** empaqueta la aplicación para producción, quita el código sin usar y la divide en partes.
- **Las variables de entorno se insertan como texto al compilar.** Las que empiezan con `VITE_` quedan como constantes públicas dentro del paquete; las demás no llegan al código del navegador.

## Variables de entorno

```ts
const base = import.meta.env.VITE_API_BASE ?? '/api';
```

```
# web/.env.development
VITE_API_BASE=/api
```

- Solo se leen con `import.meta.env.VITE_*`.
- **Todo lo que empieza con `VITE_` es público:** cualquiera puede leerlo en el navegador. Nunca va ahí una clave, un token ni una cadena de conexión.
- Los valores por entorno van en `.env.development` y `.env.production`. Un archivo `.env.local` con valores propios de una máquina no se versiona.
- Se declaran los tipos para que TypeScript las conozca:

```ts
// web/src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
}
```

## Alias `@/`

El alias se declara en los dos lugares, o TypeScript y Vite no coinciden.

```ts
// web/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
```

```json
// web/tsconfig.json (fragmento)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

## Proxy hacia la API en desarrollo

Con el proxy de arriba, el navegador pide `/api/...` al servidor de Vite y este lo reenvía a la API local.

- El frontend y la API quedan en el mismo origen, así que la cookie del refresh token funciona sin configurar CORS en desarrollo.
- `VITE_API_BASE` queda en `/api` tanto en desarrollo como en producción, si en producción la API se sirve bajo la misma dirección.

## Comandos

| Para | Comando del proyecto |
|---|---|
| Desarrollar | `dev` |
| Revisar tipos | `tsc --noEmit` |
| Compilar para producción | `build` |
| Probar el paquete compilado en local | `preview` |

- **Vite no revisa tipos al compilar.** La revisión de tipos es un paso aparte y obligatorio antes de dar algo por terminado.
- `preview` sirve para comprobar el paquete en local. No es un servidor de producción.
- El gestor de paquetes lo define cada proyecto.

## Qué evitar

- Leer `process.env` en el código del navegador: no existe ahí.
- Poner secretos en variables `VITE_*`.
- Importaciones dinámicas con rutas armadas en tiempo de ejecución: Vite no puede seguirlas.
- Importar un paquete entero cuando se usa una sola función, si el paquete no permite quitar lo que sobra.
- Dar por bueno el modo de desarrollo: antes de publicar se compila y se prueba con `preview`.
