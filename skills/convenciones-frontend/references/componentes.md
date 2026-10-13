# Patrones de componentes y accesibilidad

## Patrones

- **Botones.** Relleno (`filled`) para la única acción principal de una vista. Tonal o con borde para las secundarias. De texto para las de poco énfasis. Como máximo un botón relleno por zona. Las acciones destructivas van en el color `error`.

- **Campos de texto.** Con borde (o rellenos) y etiqueta flotante. El texto de ayuda va debajo del campo; cuando la validación falla se reemplaza por el texto de error en color `error`. Los campos obligatorios se marcan. Se valida al salir del campo y al enviar, no en cada tecla.

- **Diálogos.** Título, contenido y acciones alineadas a la derecha, con la acción que confirma en el extremo derecho. Las acciones se nombran con verbos («Eliminar», «Guardar»), nunca «OK». Una confirmación destructiva dice qué se va a perder. No se apilan diálogos.

- **Snackbars.** Aviso breve abajo después de una acción («Guardado», «3 elementos eliminados» con un botón Deshacer). Se muestra uno a la vez y se cierra solo a los 4–10 segundos. Un error que impide seguir trabajando va en un diálogo, no en un snackbar.

- **Tablas de datos.** Fila de encabezado con columnas ordenables, mostrando la flecha de orden. Números alineados a la derecha con cifras tabulares; texto a la izquierda. Encabezado fijo en listas largas. Paginación abajo a la derecha. Las acciones de fila van en un botón de icono o un menú al final.

- **Listas y menús.** Filas de 48 a 56 px de alto, con un icono o avatar al inicio y un dato o acción al final. Un menú se abre junto al elemento que lo disparó.

- **Navegación.** Panel o riel de navegación en escritorio y panel modal en móvil. Una barra superior muestra el título de la página y las acciones globales.

- **Tarjetas.** Elevadas, rellenas o con borde. Una tarjeta trata un solo tema y sus acciones van abajo.

- **Chips.** De filtro para alternar opciones, de entrada para valores ingresados y de ayuda para acciones contextuales.

- **Progreso.** Indicador lineal arriba para la carga de una página o sección. Circular para una carga en línea o dentro de un botón. Esqueletos cuando se conoce la forma del contenido. El botón de envío se deshabilita mientras su petición está en curso.

- **Estados vacíos y de error.** Un icono, una explicación de una línea y la siguiente acción (por ejemplo un botón «Crear pedido»). Nunca se deja un área en blanco.

## Accesibilidad y ergonomía

- **Las áreas táctiles miden al menos 48 × 48 px,** aunque el elemento visible sea más chico. En tablets de planta esto es lo que evita errores al tocar con guantes o con prisa.
- **El contraste del texto es de al menos 4,5:1** (3:1 para texto grande y para los bordes de la interfaz). Se revisa en el tema claro y en el oscuro.
- **Todo elemento interactivo muestra un anillo de foco visible** y se alcanza con el teclado. Las librerías sin estilos se encargan de las trampas de foco, de `Esc` y de las flechas.
- **Los iconos usan Material Symbols** y llevan `aria-label` cuando aparecen sin texto.

## Mensajes

- Un error dice qué pasó y qué hacer, en el idioma del usuario: «No se pudo guardar el pedido. Revisa la conexión e inténtalo de nuevo.»
- El mensaje de una regla de negocio rota llega del servidor (código 409) y se muestra tal cual: ya está escrito para el usuario.
- Los nombres de botones, campos y estados usan los mismos términos que el dominio del proyecto.
