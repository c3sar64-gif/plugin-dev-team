const ES_COMMIT = /\bgit\b[^|;&\n]*?\bcommit\b/;
const HEREDOC = /<<-?\s*['"]?(\w+)['"]?[^\n]*\r?\n([\s\S]*?)\r?\n\s*\1\b/;
const HERE_STRING = /@(['"])\r?\n([\s\S]*?)\r?\n\1@/;
const ENTRE_COMILLAS = /(?:^|\s)(?:-[a-zA-Z]*m|--message)(?:\s+|=)(['"])([\s\S]*?)\1/;
const FORMATO = /^(feat|fix|chore|docs|refactor|test|perf|build|ci|style|revert)(\([^()\s]+\))?!?: \S/;
const AUTOMATICO = /^(Merge |Revert "|fixup! |squash! )/;

export function extraerMensaje(comando) {
  const cuerpo = HEREDOC.exec(comando)?.[2] ?? HERE_STRING.exec(comando)?.[2] ?? ENTRE_COMILLAS.exec(comando)?.[2];
  if (cuerpo === undefined) return null;
  return cuerpo.split(/\r?\n/).map((linea) => linea.trim()).find((linea) => linea.length > 0) ?? null;
}

export default {
  nombre: 'commit-convencional',
  accion: 'bloquear',
  porQue: 'El tipo del commit define el número de versión y el registro de cambios.',
  comoHacerlo: 'Usa <tipo>(<ámbito opcional>): <descripción>, por ejemplo «feat(pedidos): agrega el bloqueo». Ver la skill commits.',
  detectar(evento) {
    if (evento.tipo !== 'comando') return null;
    const coincidencia = ES_COMMIT.exec(evento.comando);
    if (!coincidencia) return null;
    const mensaje = extraerMensaje(evento.comando.slice(coincidencia.index));
    if (mensaje === null || FORMATO.test(mensaje) || AUTOMATICO.test(mensaje)) return null;
    return `El mensaje «${mensaje}» no sigue Conventional Commits.`;
  },
};
