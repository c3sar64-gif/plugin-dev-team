const MIGRACION = /\/db\/migrations\/[^/]+\.sql$/;

export default {
  nombre: 'migracion-existente',
  accion: 'avisar',
  porQue: 'Una migración ya aplicada en algún entorno no se vuelve a ejecutar; el cambio no llegaría a esa base.',
  comoHacerlo: 'Si ya se aplicó en cualquier entorno, crea una migración nueva con el número siguiente.',
  detectar(evento) {
    if (evento.tipo !== 'archivo' || !evento.existe) return null;
    return MIGRACION.test(evento.ruta) ? `${evento.ruta} ya existe y se está modificando.` : null;
  },
};
