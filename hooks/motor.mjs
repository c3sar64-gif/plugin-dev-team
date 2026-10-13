import { normalizar } from './evento.mjs';
import { REGLAS } from './reglas/indice.mjs';

export const VARIABLE_DESACTIVAR = 'AR_DEV_TEAM_REGLAS_DESACTIVADAS';

export function evaluar(entrada, { env = process.env, existe, reglas = REGLAS } = {}) {
  const resultado = { bloqueos: [], avisos: [] };
  const evento = normalizar(entrada, existe ? { existe } : undefined);
  if (!evento) return resultado;
  const desactivadas = new Set(
    String(env[VARIABLE_DESACTIVAR] ?? '').split(',').map((nombre) => nombre.trim()).filter(Boolean),
  );
  for (const regla of reglas) {
    if (desactivadas.has(regla.nombre)) continue;
    let detalle = null;
    try {
      detalle = regla.detectar(evento);
    } catch {
      continue;
    }
    if (!detalle) continue;
    (regla.accion === 'bloquear' ? resultado.bloqueos : resultado.avisos).push({ regla, detalle });
  }
  return resultado;
}

export function redactar({ regla, detalle }) {
  const titulo = regla.accion === 'bloquear' ? 'Bloqueado por' : 'Aviso de';
  return [
    `[AR-DEV-TEAM] ${titulo} la regla «${regla.nombre}»`,
    `Qué pasó: ${detalle}`,
    `Por qué: ${regla.porQue}`,
    `Cómo hacerlo: ${regla.comoHacerlo}`,
    `Caso excepcional: ${VARIABLE_DESACTIVAR}=${regla.nombre}`,
  ].join('\n');
}
