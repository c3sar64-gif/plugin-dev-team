---
name: verificar
description: Comprobación del equipo antes de dar un cambio por terminado, con compilación, pruebas, lint, tipos y migraciones. Úsala antes de decir que algo está listo, antes de un commit o de un push, al terminar una funcionalidad o cuando el usuario pide verificar el estado del proyecto.
---

# Verificar

Nada está «listo» por parecerlo. Está listo cuando se ejecutó la comprobación y se leyó el resultado.

## Reglas

1. **Ejecuta, no supongas.** «Debería pasar» no es un resultado.
2. **Reporta los fallos tal cual**, con la salida del comando. No los resumas hasta volverlos inofensivos.
3. **Si un paso no se ejecutó, se dice.** Nunca se afirma que algo está verificado si se saltó un paso.
4. **No se arregla dentro de la verificación.** Primero se reporta; arreglar es otro paso.

## Pasos

Se ejecutan solo los que correspondan a lo que cambió. Los comandos de frontend usan el gestor de paquetes del proyecto.

### Backend (si cambió algo en `backend/`)

1. `dotnet build` desde `backend/`. Sin errores. Las advertencias nuevas se reportan.
2. `dotnet test`. Las pruebas de integración necesitan Docker en ejecución; si no está, se reporta como paso no ejecutado.

### Frontend (si cambió algo en `web/`)

1. Lint del proyecto.
2. `tsc --noEmit`. La compilación de Vite no revisa tipos.
3. Las pruebas, si el proyecto las tiene.
4. La compilación de producción, antes de un push.

### Base de datos (si cambió algo en `db/` o un mapeo de EF)

1. El script `check` de `db/scripts/`: no debe quedar ninguna migración pendiente en local.
2. Cada propiedad nueva mapeada en EF tiene su columna en una migración.

### El cambio en sí

1. `git status` y `git diff`: solo están los archivos que deben estar.
2. Sin secretos, claves ni archivos de entorno.
3. Sin restos de depuración: `Console.WriteLine`, `console.log`, código comentado.

## Si algo falla

- **No compila:** se reporta y se usa el agente `reparador-build`.
- **Una prueba falla:** se reporta con su mensaje. No se cambia la prueba para que pase sin entender por qué falla.
- **Queda una migración pendiente:** se aplica en local con `apply`; en cualquier otro entorno la aplica una persona.

## Informe

```
Verificación
- dotnet build        correcto
- dotnet test         correcto (142 pruebas)
- lint                correcto
- tsc --noEmit        FALLA: 2 errores (ver abajo)
- compilación web     no ejecutado (falló el paso anterior)
- migraciones (check) correcto, sin pendientes

Resultado: NO LISTO
```

Debajo va la salida textual de cada paso que falló.

## Definición de terminado

- Compila y pasan las pruebas.
- La migración está aplicada donde corresponde.
- Los commits son convencionales, uno por propósito.
- Lo probó la persona que lo va a usar.

Los dos primeros puntos los cubre esta verificación. El último no lo puede cubrir ningún comando: se pregunta.
