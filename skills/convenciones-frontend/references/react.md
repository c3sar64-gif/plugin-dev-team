# React

## Principios

### 1. El render es una función pura de props y estado

Lo que se puede calcular a partir de props o de estado se calcula durante el render. No se guarda en otro estado.

```tsx
// Bien: se deriva durante el render
function Resumen({ lineas }: { lineas: Linea[] }) {
  const total = lineas.reduce((suma, l) => suma + l.quintales, 0);
  return <span>{formatearNumero(total)}</span>;
}

// Mal: estado derivado guardado aparte
function Resumen({ lineas }: { lineas: Linea[] }) {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    setTotal(lineas.reduce((suma, l) => suma + l.quintales, 0));
  }, [lineas]);
  return <span>{formatearNumero(total)}</span>;
}
```

El estado derivado dentro de un `useEffect` agrega un render de más, se puede desincronizar y esconde el flujo de los datos.

### 2. Los efectos van fuera del render

Las llamadas a la API, las suscripciones y cualquier cambio fuera del componente van en un manejador de evento o en un `useEffect`. Nunca en el cuerpo del render.

### 3. Composición antes que herencia

Los componentes se combinan con `children`, con props que reciben componentes o con hooks.

## Disciplina de hooks

- Solo en el nivel superior del componente; nunca dentro de un `if` ni de un bucle.
- Todo efecto limpia lo que abre: suscripciones, intervalos, escuchas.
- Cuando el estado nuevo depende del anterior, se usa la forma funcional: `setX(previo => previo + 1)`.
- **Por defecto no se memoriza.** `useMemo` y `useCallback` se agregan solo cuando una medición o una cadena de dependencias demuestra que hacen falta.
- Un hook propio se extrae cuando la misma secuencia de hooks aparece en dos o más componentes.

## Dónde vive el estado

```
¿Lo usa un solo componente?
  → useState dentro de él

¿Lo usan un padre y algunos descendientes?
  → se sube al ancestro común más cercano

¿Lo usan ramas lejanas y cambia poco (sesión, rol)?
  → un contexto de React

¿Viene del servidor?
  → un hook de la feature que llama a su api.ts
```

La mayoría de las pantallas no necesita un contexto. No se agrega un store global ni una librería de estado.

## Formularios

- **Campos controlados** (`value` + `onChange`) cuando el valor afecta a otra parte de la pantalla o hay que formatearlo.
- **Se valida al salir del campo y al enviar.** El error se muestra debajo del campo.
- **El botón de envío se deshabilita mientras la petición está en curso,** para que no se envíe dos veces.
- **El envío llama a una función del `api.ts` de la feature.** Si el servidor responde 409, se muestra su mensaje; si responde 400, se marcan los campos con los errores que devuelve.

```tsx
async function alEnviar(evento: React.FormEvent) {
  evento.preventDefault();
  if (!validar()) return;
  setEnviando(true);
  try {
    await crearPedido(datos);
    alGuardar();
  } catch (e) {
    setError(e instanceof Error ? e.message : 'No se pudo guardar.');
  } finally {
    setEnviando(false);
  }
}
```

Un formulario con varios pasos, listas dinámicas de campos o validaciones cruzadas justifica una librería de formularios. Agregarla es una decisión del proyecto: se pregunta antes.

## Recetas de composición

```tsx
// Hueco con children
<Tarjeta>
  <Encabezado />
  <Contenido>{detalle}</Contenido>
</Tarjeta>

// Huecos con nombre
<Pagina encabezado={<Barra />} lateral={<Filtros />}>
  <Resultados />
</Pagina>

// Componentes compuestos: comparten estado por un contexto interno
<Tabs defaultValue="datos">
  <Tabs.List>
    <Tabs.Trigger value="datos">Datos</Tabs.Trigger>
    <Tabs.Trigger value="historial">Historial</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="datos"><Datos /></Tabs.Panel>
  <Tabs.Panel value="historial"><Historial /></Tabs.Panel>
</Tabs>
```

Cuando un componente necesita pasar datos a lo que muestra, normalmente un hook (`usePedido(id)`) es más claro que una función como hijo.

## Rendimiento

`React.memo` ayuda solo cuando se cumplen las tres condiciones:

1. El componente se vuelve a renderizar seguido.
2. Sus props casi siempre son las mismas entre renders.
3. Su render es costoso, medido.

Si las props cambian casi siempre, la comparación es costo puro.

Para evitar renders en cascada:

- Baja el estado al componente que lo usa, en vez de subirlo.
- Un contexto por asunto: un cambio en un contexto no debe volver a renderizar a quienes usan otro.

Listas:

- `key` estable: el id del dato, nunca el índice del arreglo.
- Una lista larga con filas complejas (más de unas 50 visibles) se virtualiza. Con paginación de 20 a 100 filas normalmente no hace falta.

## Accesibilidad en la composición

- HTML semántico primero (`<button>`, `<a>`, `<nav>`, `<main>`), antes de recurrir a `role`.
- Todo elemento interactivo se alcanza con el teclado.
- Todo campo tiene etiqueta: `<label htmlFor>`, o `aria-label` si lo identifica solo un icono.
- El foco se maneja al cambiar de ruta y al abrir o cerrar un diálogo.
