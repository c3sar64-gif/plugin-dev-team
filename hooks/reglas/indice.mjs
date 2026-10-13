import sinMigracionesEf from './sin-migraciones-ef.mjs';
import commitConvencional from './commit-convencional.mjs';
import migracionExistente from './migracion-existente.mjs';

export const REGLAS = [sinMigracionesEf, commitConvencional, migracionExistente];
