const MODULO_CSS = /\/web\/.+\.module\.(css|scss|sass|less)$/;

export default {
  nombre: 'sin-css-modules',
  accion: 'bloquear',
  porQue: 'El estilo se hace solo con Tailwind y primitivos de shared/ui. Un segundo sistema de estilos rompe la consistencia visual.',
  comoHacerlo: 'Usa clases de Tailwind. Si el estilo se repite, crea o amplía un primitivo en shared/ui.',
  detectar(evento) {
    if (evento.tipo !== 'archivo' || evento.existe) return null;
    return MODULO_CSS.test(evento.ruta) ? `${evento.ruta} es un CSS module nuevo.` : null;
  },
};
