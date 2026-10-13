---
name: nueva-funcionalidad
description: Flujo guiado del equipo para construir una funcionalidad de punta a punta, de la migración a la revisión, siempre en el mismo orden. Úsala cuando el usuario pida agregar una funcionalidad, un endpoint con su pantalla, un caso de uso nuevo o un cambio que toque base de datos, backend y frontend.
argument-hint: "<descripción de la funcionalidad>"
---

# Nueva funcionalidad

Funcionalidad pedida: $ARGUMENTS

Sigue los pasos en orden. Salta los que no apliquen y dilo: un cambio solo de frontend empieza en el paso 6.

**Hay dos paradas obligatorias:** después del plan (paso 2) y antes de los commits (paso 9).

## 1. Contexto

- Lee el `CLAUDE.md` y los `docs/` del proyecto que toquen esta funcionalidad.
- Comprueba que pertenece a la entrega en curso. Si es de otra entrega, dilo y detente.
- Identifica el contexto del dominio y el agregado.
- Si falta una decisión, aplica la skill `decisiones` antes de seguir.

## 2. Plan

Lanza el agente `planificador` con la funcionalidad y lo que encontraste en el paso 1.

**Muestra el plan y detente hasta que el usuario lo apruebe.**

## 3. Migración SQL

Solo si cambia el esquema.

- Crea la migración con la skill `migraciones-sql` (o `nueva-migracion`).
- Aplícala en local.
- Lanza el agente `revisor-base-datos` sobre ella y corrige lo Bloqueante y lo Importante.

## 4. Core

Lanza el agente `guia-pruebas` para el agregado o la entidad: primero la prueba de cada regla, después la regla.

Las reglas de negocio quedan en métodos del agregado. Ver la skill `convenciones-backend`.

## 5. Application y Api

En este orden:

1. DTOs.
2. Interfaz y servicio. El servicio carga, llama al agregado y guarda.
3. Prueba de integración del servicio (skill `pruebas-backend`).
4. Controlador delgado, con `[Authorize(Roles = …)]`.
5. Registro en el método DI del contexto.
6. Mapeo de EF, si hay tabla o columna nueva.

## 6. Frontend

Con la skill `convenciones-frontend`:

1. `types.ts` que refleja los DTOs.
2. `api.ts` sobre `apiClient`.
3. Componentes y hooks de la feature, con los estados cargando, error y vacío.
4. `index.ts`.
5. Página delgada y, si corresponde, la entrada del menú con sus roles.

## 7. Verificación

Aplica la skill `verificar`. Si algo no compila, lanza el agente `reparador-build`.

No se pasa al paso 8 con la verificación en rojo.

## 8. Revisión

Aplica la skill `revisar`: lanza en paralelo solo los revisores que correspondan a los archivos tocados.

- Lo **Bloqueante** y lo **Importante** se corrige, y se vuelve al paso 7.
- Las **Sugerencias** se muestran al usuario; no se aplican sin que las pida.

## 9. Commits

**Detente y pregunta.** Solo si el usuario lo pide, aplica la skill `commit`: un commit por propósito, sin push.

## Cierre

Informa en pocas líneas:

- Qué se construyó y en qué archivos.
- El resultado de la verificación, tal cual.
- Los hallazgos de la revisión que quedaron sin aplicar.
- Qué falta para la definición de terminado, en particular que lo pruebe la persona que lo va a usar.
