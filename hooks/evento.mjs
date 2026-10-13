import { existsSync } from 'node:fs';

const DE_ARCHIVO = new Set(['Write', 'Edit', 'MultiEdit']);
const DE_COMANDO = new Set(['Bash', 'PowerShell']);

function contenidoDe(herramienta, datos) {
  if (herramienta === 'Write') return String(datos.content ?? '');
  if (herramienta === 'Edit') return String(datos.new_string ?? '');
  return (datos.edits ?? []).map((edicion) => String(edicion?.new_string ?? '')).join('\n');
}

export function normalizar(entrada, { existe = existsSync } = {}) {
  const herramienta = entrada?.tool_name;
  const datos = entrada?.tool_input ?? {};
  if (DE_COMANDO.has(herramienta)) {
    if (typeof datos.command !== 'string') return null;
    return { tipo: 'comando', herramienta, comando: datos.command };
  }
  if (DE_ARCHIVO.has(herramienta)) {
    if (typeof datos.file_path !== 'string') return null;
    return {
      tipo: 'archivo',
      herramienta,
      ruta: datos.file_path.replaceAll('\\', '/'),
      contenido: contenidoDe(herramienta, datos),
      existe: existe(datos.file_path),
    };
  }
  return null;
}
