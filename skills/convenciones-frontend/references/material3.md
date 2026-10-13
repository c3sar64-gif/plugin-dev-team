# Material 3 con Tailwind

Se sigue **Material Design 3** en el lenguaje visual y en los patrones de interacción, implementado con tokens de Tailwind, primitivos en `shared/ui` y librerías de comportamiento sin estilos. No se instala ninguna librería de componentes con estilos propios.

## Reglas de estilo

- **Solo clases de Tailwind.** Sin CSS modules, sin `styled-components` y sin `style={}` en línea. La única excepción es un valor realmente dinámico, como un ancho calculado.
- **El aspecto reutilizable vive en primitivos de `shared/ui/`.** Las features componen primitivos; no repiten cadenas largas de clases.
- **Comportamiento accesible con librerías sin estilos** (Radix UI o Headless UI) para diálogos, menús, listas desplegables y tooltips. No se programan a mano las trampas de foco ni el manejo del teclado.
- **Las variantes van en un mapa** (o con `cva`). No se arman nombres de clase con fragmentos: Tailwind no detecta `bg-${color}-500`.
- **Móvil primero.** Las clases base apuntan a pantallas chicas; `sm:`, `md:` y `lg:` agregan los diseños más anchos. Las tablas anchas van dentro de un contenedor con `overflow-x-auto`.
- **Modo oscuro** con la variante `dark:`, manejado por los tokens.

## `cn()` para combinar clases

```ts
// shared/lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

Permite que el `className` de quien usa el primitivo sobrescriba sus valores por defecto.

## Un primitivo: `Button`

```tsx
// shared/ui/Button.tsx
const variantes = {
  filled:   'bg-primary text-on-primary shadow-elev-0 hover:shadow-elev-1',
  tonal:    'bg-secondary-container text-on-secondary-container hover:shadow-elev-1',
  outlined: 'border border-outline text-primary',
  text:     'text-primary px-3',
  danger:   'bg-error text-on-error',
} as const;

export function Button({ variant = 'filled', className, ...props }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variantes }) {
  return (
    <button
      className={cn(
        'relative inline-flex h-10 min-w-12 items-center justify-center gap-2 overflow-hidden',
        'rounded-full px-6 text-label-lg font-medium transition-shadow duration-short',
        // capa de estado: superposición del color del contenido con las opacidades de Material
        'before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity',
        'hover:before:opacity-[.08] focus-visible:before:opacity-[.10] active:before:opacity-[.10]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:pointer-events-none disabled:opacity-[.38]',
        variantes[variant],
        className,
      )}
      {...props}
    />
  );
}
```

## Tokens

Los tokens de diseño viven en un solo lugar: `@theme` en `globals.css`.

- Se nombran por **rol de color de Material**: `primary`, `on-primary`, `primary-container`, `secondary-container`, `surface`, `surface-container`, `on-surface`, `on-surface-variant`, `outline`, `error`, `on-error`.
- No se usan valores de paleta sueltos ni valores arbitrarios como `text-[#3a7]` o `p-[13px]`.
- Las opacidades de las capas de estado de Material son la única excepción.

## Fundamentos

| Fundamento | Estándar | En Tailwind |
|---|---|---|
| Espaciado | Rejilla de 4 y 8 px: base de 8, y 4 para separaciones chicas | Escala por defecto (`1` = 4 px, `2` = 8 px, `4` = 16 px, `6` = 24 px). Solo múltiplos de 4 px |
| Tipografía | display, headline, title, body y label, cada uno en lg, md y sm | `text-headline-sm`, `text-title-md`, `text-body-md`, `text-label-lg`… definidos en `@theme` |
| Roles de color | primary, secondary, tertiary y error, cada uno con su `on-*` y su `*-container`; niveles de surface y surface-container; outline | Tokens semánticos; nunca hex en un componente |
| Forma | Radios xs 4, sm 8, md 12, lg 16, xl 28 y completo | `rounded-xs` … `rounded-xl`, `rounded-full` |
| Elevación | Niveles 0 a 5 (tarjetas 1, menús 2 o 3, diálogos 3) | `shadow-elev-0` … `shadow-elev-5`. En modo oscuro la elevación se muestra con tonos más claros de surface-container |
| Capas de estado | hover 8 %, foco 10 %, presionado 10 %, arrastrado 16 % (superposición del color del contenido) | El patrón `before:` del `Button` |
| Deshabilitado | Contenido al 38 % de opacidad y contenedor al 12 % | `disabled:opacity-[.38]` |
| Movimiento | Corto 100–200 ms, medio 250–400 ms, curvas estándar y enfatizada | `duration-short`, `duration-medium`, `ease-standard`. Se respeta `motion-reduce:` |
