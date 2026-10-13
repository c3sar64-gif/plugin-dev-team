---
name: revisar
description: Lanza los agentes revisores del equipo sobre los cambios actuales y junta sus hallazgos en un solo informe. Úsala después de escribir o modificar código, antes de un commit o de un pull request, o cuando el usuario pida revisar sus cambios, una rama o unos archivos concretos.
argument-hint: "[archivos, carpeta o rama]"
---

# Revisar

Alcance pedido: $ARGUMENTS

## 1. Qué se revisa

- Sin argumento: los cambios sin confirmar (`git diff --name-only` y `git diff --staged --name-only`). Si no hay ninguno, el último commit (`git show --name-only HEAD`).
- Con una rama: sus cambios frente a la rama base.
- Con archivos o una carpeta: eso.

Si no hay nada que revisar, dilo y termina.

## 2. Qué revisores corresponden

| Si cambió | Revisores |
|---|---|
| Archivos `.cs` en `backend/` | `revisor-arquitectura` y `revisor-csharp` |
| Archivos `.ts` o `.tsx` en `web/` | `revisor-arquitectura` y `revisor-react` |
| `db/migrations/`, o un mapeo de EF en `Persistence/` | `revisor-base-datos` |
| Controladores, autenticación, configuración, `apiClient`, o cualquier endpoint nuevo | `revisor-seguridad` |

Lanza solo los que correspondan, **en paralelo**, cada uno con la lista de archivos de su parte.

## 3. Informe único

Junta los informes en uno solo:

1. Hallazgos ordenados por severidad: Bloqueante, Importante, Sugerencia.
2. Si dos revisores reportan lo mismo, se deja una vez y se nombra a los dos.
3. Cada hallazgo conserva su formato: archivo y línea, regla, problema y corrección.
4. Un veredicto final: el más severo de los recibidos.

```
Revisión de 6 archivos · revisores: arquitectura, csharp, base-datos

[Bloqueante] backend/src/Molino.Application/Pedidos/PedidoService.cs:41
Regla: las reglas de negocio viven en Core (convenciones-backend, regla 2)
Problema: el servicio compara pedido.Estado y asigna el nuevo estado.
Corrección: mover la regla a un método Pedido.Bloquear() y llamarlo desde el servicio.
Reportado por: revisor-arquitectura

Veredicto: bloqueado (1 Bloqueante, 2 Importantes, 3 Sugerencias)
```

## Reglas

- **Los revisores reportan; no corrigen.** No se aplica ninguna corrección sin que el usuario la pida.
- No se descarta un hallazgo por parecer menor: se muestra con su severidad.
- Si un revisor no pudo ejecutarse, se dice cuál y por qué. No se da la revisión por completa.
- Si un hallazgo contradice una decisión registrada en el proyecto, gana la decisión: se indica y se descarta.
