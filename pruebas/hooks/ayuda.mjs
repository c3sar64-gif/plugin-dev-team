export const archivo = (ruta, contenido = '', extra = {}) => ({
  tipo: 'archivo', herramienta: 'Write', ruta, contenido, existe: false, ...extra,
});

export const comando = (texto, herramienta = 'Bash') => ({
  tipo: 'comando', herramienta, comando: texto,
});
