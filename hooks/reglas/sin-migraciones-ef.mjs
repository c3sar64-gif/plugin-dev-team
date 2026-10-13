const COMANDO_EF = /\bdotnet(\.exe)?\s+ef\s+(migrations|database)\b|\b(Add-Migration|Update-Database|Remove-Migration)\b/i;
const ARCHIVO_EF = /\/backend\/(.*\/)?Migrations\/[^/]+\.cs$/;

export default {
  nombre: 'sin-migraciones-ef',
  accion: 'bloquear',
  porQue: 'El esquema se cambia con SQL escrito a mano. Las migraciones de EF generan un segundo historial que no coincide.',
  comoHacerlo: 'Crea db/migrations/NNNN_descripcion.sql y ajusta el mapeo de EF a mano. Ver la skill migraciones-sql.',
  detectar(evento) {
    if (evento.tipo === 'comando') {
      return COMANDO_EF.test(evento.comando) ? 'El comando usa migraciones de Entity Framework.' : null;
    }
    return ARCHIVO_EF.test(evento.ruta) ? `${evento.ruta} es un archivo de migración de Entity Framework.` : null;
  },
};
