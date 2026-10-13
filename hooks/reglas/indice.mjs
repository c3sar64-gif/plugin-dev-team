import sinMigracionesEf from './sin-migraciones-ef.mjs';
import commitConvencional from './commit-convencional.mjs';
import migracionExistente from './migracion-existente.mjs';
import dependenciasOnion from './dependencias-onion.mjs';
import cruceDeContextos from './cruce-de-contextos.mjs';
import sinFetchDirecto from './sin-fetch-directo.mjs';
import limitesFeatures from './limites-features.mjs';
import sinCssModules from './sin-css-modules.mjs';
import estilosEnLinea from './estilos-en-linea.mjs';

export const REGLAS = [
  sinMigracionesEf, commitConvencional, migracionExistente,
  dependenciasOnion, cruceDeContextos,
  sinFetchDirecto, limitesFeatures, sinCssModules, estilosEnLinea,
];
