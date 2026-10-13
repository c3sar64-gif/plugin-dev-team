---
name: commit
description: Clasifica los cambios pendientes por propósito y arma un commit convencional por cada uno, mostrando la propuesta antes de confirmar. Úsala cuando el usuario pida hacer commit, guardar o confirmar los cambios, o dividir un cambio grande en varios commits.
---

# Commit

Las reglas y los tipos están en la skill `commits`. Aquí va solo el procedimiento.

## Pasos

1. **Mira qué hay:** `git status` y `git diff` (más `git diff --staged` si ya hay algo preparado).

2. **Si no se verificó el cambio, aplica antes la skill `verificar`.** No se confirma código que no compila.

3. **Clasifica cada cambio por propósito:**

   | Cambio | Tipo |
   |---|---|
   | Endpoint, componente o pantalla nueva | `feat` |
   | Bug, regresión, consulta o interfaz rota | `fix` |
   | Migración | El mismo tipo que el cambio al que sirve |
   | Pruebas, reordenar código, formato, dependencias | `test`, `refactor`, `style`, `chore` |
   | Documentación | `docs` |

4. **Propón la lista de commits y espera el visto bueno:**

   ```
   Propongo 3 commits:

   1. feat(pedidos): agrega el bloqueo al iniciar la echada
      db/migrations/0008_pedidos_bloqueado_en.sql
      backend/src/Molino.Core/Pedidos/Pedido.cs
      backend/src/Molino.Application/Pedidos/…
   2. fix(pedidos): corrige el orden de la bandeja de aceptados
      web/src/features/pedidos/hooks/usePedidos.ts
   3. test(pedidos): cubre el bloqueo de un pedido despachado
      backend/tests/Molino.Core.Tests/PedidoTests.cs

   ¿Los confirmo así?
   ```

5. **Confirma uno por uno**, preparando solo los archivos de cada commit. Si un archivo mezcla dos propósitos, prepara los fragmentos por separado con `git add -p`.

6. **Muestra el resultado:** `git log --oneline` de los commits creados.

## Reglas

- **No se hace push.** Solo si el usuario lo pide de forma explícita.
- No se usa `--no-verify` ni `--amend` sobre un commit ya publicado.
- No se agregan archivos de entorno, claves ni datos reales. Si aparecen entre los cambios, se avisa y se dejan fuera.
- Si hay cambios que no pertenecen a la tarea, se preguntan; no se incluyen ni se descartan por cuenta propia.
- El hook `commit-convencional` bloquea un mensaje que no siga el formato.
