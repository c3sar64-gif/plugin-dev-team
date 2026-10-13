import { posix } from 'node:path';

const EN_SRC = /^(.*\/web\/src)\/(.+\.(?:ts|tsx|js|jsx|mjs))$/;
const IMPORTS = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\(\s*)(['"])([^'"\n]+)\1/g;
const ES_INDICE = /^index(\.(ts|tsx|js|jsx))?$/;

function zona(relativa) {
  const partes = relativa.split('/');
  if (partes[0] === 'features') {
    return { capa: 'features', feature: partes[1] ?? '', interno: partes.slice(2).join('/') };
  }
  return { capa: partes[0] === 'shared' || partes[0] === 'app' ? partes[0] : 'otra' };
}

function destino(especificador, raizSrc, carpeta) {
  if (especificador.startsWith('@/')) return especificador.slice(2);
  if (!especificador.startsWith('.')) return null;
  const absoluta = posix.normalize(posix.join(carpeta, especificador));
  return absoluta.startsWith(`${raizSrc}/`) ? absoluta.slice(raizSrc.length + 1) : null;
}

export default {
  nombre: 'limites-features',
  accion: 'bloquear',
  porQue: 'Las dependencias van app → features → shared, y cada feature expone solo su index.ts. Así el interior de una feature puede cambiar sin romper a las demás.',
  comoHacerlo: 'Exporta lo que necesitas desde el index.ts de la feature dueña e impórtalo como @/features/<feature>. Si es genérico, muévelo a shared.',
  detectar(evento) {
    if (evento.tipo !== 'archivo') return null;
    const coincidencia = EN_SRC.exec(evento.ruta);
    if (!coincidencia) return null;
    const [, raizSrc, relativa] = coincidencia;
    const origen = zona(relativa);
    const carpeta = posix.dirname(evento.ruta);
    for (const [, , especificador] of evento.contenido.matchAll(IMPORTS)) {
      const relativaDestino = destino(especificador, raizSrc, carpeta);
      if (relativaDestino === null) continue;
      const dst = zona(relativaDestino);
      if (origen.capa === 'shared' && (dst.capa === 'features' || dst.capa === 'app')) {
        return `shared importa de ${dst.capa} («${especificador}»).`;
      }
      if (origen.capa === 'features' && dst.capa === 'app') {
        return `La feature ${origen.feature} importa de app («${especificador}»).`;
      }
      const mismaFeature = origen.capa === 'features' && origen.feature === dst.feature;
      if (dst.capa === 'features' && !mismaFeature && dst.interno !== '' && !ES_INDICE.test(dst.interno)) {
        return `Se importa el interior de la feature ${dst.feature} («${especificador}»).`;
      }
    }
    return null;
  },
};
