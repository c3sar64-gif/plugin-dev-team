# Estado y roles en la interfaz

## Dónde vive el estado

| Estado | Dónde |
|---|---|
| La sesión y el rol del usuario | `AuthContext`, en `shared/contexts` |
| Datos que reutilizan selectores en cascada (padre → hijo) | Un contexto de datos compartidos, en `shared/contexts` |
| Todo lo demás | Local a la feature: `useState` y `useCallback`, o un hook en `features/<feature>/hooks/` |

**No hay store global.** No se agrega una librería de estado.

Antes de crear un contexto nuevo, comprueba que el dato de verdad se usa en ramas lejanas del árbol. Casi siempre basta con subir el estado al ancestro común más cercano.

## Un hook de feature

```ts
// features/pedidos/hooks/usePedidos.ts
export function usePedidos(page: number) {
  const [datos, setDatos] = useState<PagedResult<Pedido> | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setDatos(await listarPedidos(page));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los pedidos.');
    } finally {
      setCargando(false);
    }
  }, [page]);

  useEffect(() => { void cargar(); }, [cargar]);

  return { datos, cargando, error, recargar: cargar };
}
```

- El hook entrega los tres estados que toda pantalla debe mostrar: cargando, error y datos.
- Después de una acción que cambia datos (crear, bloquear), se llama a `recargar`.

## Roles

Los textos de rol son los mismos del backend, en mayúsculas, definidos una sola vez:

```ts
// shared/types/roles.ts
export const ROLES = {
  ADMIN: 'ADMIN',
  ENCARGADO: 'ENCARGADO',
  GUEST: 'GUEST',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
```

La lista concreta la define cada proyecto. En el código se usan las constantes, nunca el texto suelto.

## Visibilidad por rol

- Cada elemento del menú lleva un arreglo `allowedRoles` que decide si se muestra.
- Un botón que el rol no puede usar no se muestra.
- **La interfaz solo oculta. El servidor hace cumplir cada permiso.** Ocultar un botón no protege nada.

```ts
const menu = [
  { ruta: '/pedidos', etiqueta: 'Pedidos', allowedRoles: [ROLES.ADMIN, ROLES.ENCARGADO] },
  { ruta: '/usuarios', etiqueta: 'Usuarios', allowedRoles: [ROLES.ADMIN] },
];
```

## Inicio según el rol

- Un rol limitado puede recibir una pantalla de inicio simplificada, o una redirección a su propia pantalla, en vez del tablero general.
- **Espera a que termine la carga de la sesión** antes de decidir qué mostrar. Si no, el tablero general aparece un instante antes de la redirección.
- Un rol `GUEST` ve solo la pantalla de inicio, sin datos.
