const COMPONENTE = /\/web\/src\/.+\.(tsx|jsx)$/;
const ESTILO = /\bstyle\s*=\s*\{\{/;

export default {
  nombre: 'estilos-en-linea',
  accion: 'avisar',
  porQue: 'Los estilos en línea se saltan los tokens de diseño. Solo se aceptan para un valor realmente dinámico, como un ancho calculado.',
  comoHacerlo: 'Usa clases de Tailwind con tokens. Deja style solo para valores calculados en tiempo de ejecución.',
  detectar(evento) {
    if (evento.tipo !== 'archivo' || !COMPONENTE.test(evento.ruta)) return null;
    return ESTILO.test(evento.contenido) ? `${evento.ruta} usa estilos en línea.` : null;
  },
};
