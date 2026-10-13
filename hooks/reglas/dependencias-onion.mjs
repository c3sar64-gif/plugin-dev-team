import { escaparRegex } from './util.mjs';

const EN_CAPA = /\/([\w.]+)\.(Core|Application|Infrastructure)\/(?:.*\/)?[^/]+\.(cs|csproj)$/;
const PROHIBIDAS = {
  Core: ['Application', 'Infrastructure', 'Api'],
  Application: ['Infrastructure', 'Api'],
  Infrastructure: ['Api'],
};

function enProyecto(capa, contenido) {
  if (capa === 'Core' && /<(ProjectReference|PackageReference)\b/.test(contenido)) {
    return 'El proyecto Core no puede referenciar ningún proyecto ni paquete.';
  }
  const haciaAfuera = new RegExp(`<ProjectReference[^>]*\\.(${PROHIBIDAS[capa].join('|')})\\.csproj`);
  const hallada = haciaAfuera.exec(contenido);
  return hallada ? `El proyecto ${capa} no puede referenciar a ${hallada[1]}.` : null;
}

function enCodigo(prefijo, capa, contenido) {
  const using = new RegExp(
    `^\\s*(?:global\\s+)?using\\s+(?:static\\s+)?(?:\\w+\\s*=\\s*)?${escaparRegex(prefijo)}\\.(${PROHIBIDAS[capa].join('|')})\\b`,
    'm',
  );
  const hallado = using.exec(contenido);
  return hallado ? `${capa} no puede usar el espacio de nombres ${prefijo}.${hallado[1]}.` : null;
}

export default {
  nombre: 'dependencias-onion',
  accion: 'bloquear',
  porQue: 'En Onion las dependencias apuntan al centro. Si Core o Application conocen la infraestructura, las reglas dejan de poder probarse solas.',
  comoHacerlo: 'Declara una interfaz en Core o en Application e impleméntala en Infrastructure. Ver la skill convenciones-backend.',
  detectar(evento) {
    if (evento.tipo !== 'archivo') return null;
    const coincidencia = EN_CAPA.exec(evento.ruta);
    if (!coincidencia) return null;
    const [, prefijo, capa, extension] = coincidencia;
    return extension === 'csproj' ? enProyecto(capa, evento.contenido) : enCodigo(prefijo, capa, evento.contenido);
  },
};
