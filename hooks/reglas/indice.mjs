import sinMigracionesEf from './sin-migraciones-ef.mjs';
import commitConvencional from './commit-convencional.mjs';
import migracionExistente from './migracion-existente.mjs';
import dependenciasOnion from './dependencias-onion.mjs';
import cruceDeContextos from './cruce-de-contextos.mjs';

export const REGLAS = [
  sinMigracionesEf, commitConvencional, migracionExistente,
  dependenciasOnion, cruceDeContextos,
];
