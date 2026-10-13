---
name: commits
description: Reglas del equipo para commits con Conventional Commits, que además definen el número de versión. Úsala al preparar, redactar o dividir un commit, al decidir su tipo (feat, fix, chore y los demás) o antes de hacer push.
---

# Commits

## Formato

```
<tipo>(<ámbito opcional>): <descripción>
```

La descripción va en minúsculas, en imperativo y sin punto final: `feat(pedidos): agrega el bloqueo al iniciar la echada`.

## Tipos

| Tipo | Cuándo | Versión |
|---|---|---|
| `feat` | Endpoint, componente o pantalla nueva | Menor |
| `fix` | Bug, regresión, consulta o interfaz rota | Parche |
| `refactor`, `perf`, `test`, `build`, `ci`, `style` | Cambia el código sin cambiar lo que ve el usuario | Sin cambio |
| `docs`, `chore` | Documentación, dependencias, tareas de mantenimiento | Sin cambio |
| `revert` | Deshace un commit anterior | Según lo que deshace |
| `feat!`, `fix!` | Rompe compatibilidad | Mayor |

## Reglas

1. **Un commit por propósito, nunca uno por sesión.**
2. **Clasifica antes de preparar.** Separa lo nuevo, lo corregido y lo de mantenimiento en commits distintos.
3. **La migración lleva el mismo tipo que el cambio al que sirve.**
4. **Si un archivo mezcla una funcionalidad y una corrección, prepara los fragmentos por separado** con `git add -p`. Meter un `fix` dentro de un `feat` lo esconde del registro de cambios e infla la versión.
5. **Commit y push solo cuando el usuario lo pide.**
6. **No se saltan las verificaciones** (`--no-verify`).
7. **No se reescribe historia ya publicada.**

## Cuerpo del mensaje

Opcional. Se usa cuando el porqué no cabe en la primera línea.

```
fix(echadas): evita iniciar una echada con la tolva ocupada

El panelista podía iniciar dos echadas seguidas porque la validación
leía el estado anterior. Ahora se valida dentro del agregado.
```

- Una línea en blanco separa la descripción del cuerpo.
- El cuerpo explica por qué, no repite qué cambió: eso lo muestra el diff.

## Qué evitar

- Mensajes que no dicen nada: «cambios», «arreglos varios», «wip».
- Un commit gigante con todo lo del día.
- Commits que dejan el proyecto sin compilar.
- Subir archivos de entorno, claves o datos de prueba con información real.

## Verificación automática

El hook `commit-convencional` del plugin bloquea un `git commit` cuyo mensaje no siga este formato.
