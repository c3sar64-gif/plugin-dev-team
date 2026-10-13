import { escaparRegex } from './util.mjs';

const EN_CONTEXTO = /\/([\w.]+)\.Core\/(\w+)\/(?:.*\/)?[^/]+\.cs$/;

export default {
  nombre: 'cruce-de-contextos',
  accion: 'avisar',
  porQue: 'Un contexto no usa entidades de otro: solo ids, DTOs o eventos. Así cada contexto puede cambiar sin romper a los demás.',
  comoHacerlo: 'Guarda solo el id del otro agregado, o reacciona a su evento con un handler en Application.',
  detectar(evento) {
    if (evento.tipo !== 'archivo') return null;
    const coincidencia = EN_CONTEXTO.exec(evento.ruta);
    if (!coincidencia) return null;
    const [, prefijo, contexto] = coincidencia;
    if (contexto === 'Common') return null;
    const usos = new RegExp(`^\\s*(?:global\\s+)?using\\s+(?:static\\s+)?${escaparRegex(prefijo)}\\.Core\\.(\\w+)`, 'gm');
    for (const uso of evento.contenido.matchAll(usos)) {
      if (uso[1] !== contexto && uso[1] !== 'Common') {
        return `El contexto ${contexto} usa el espacio de nombres del contexto ${uso[1]}.`;
      }
    }
    return null;
  },
};
