---
name: decisiones
description: Cómo se toman y se registran las decisiones técnicas y de dominio del proyecto. Úsala cuando haga falta decidir algo que no está en docs/decisiones.md, por ejemplo una librería, un patrón, un nombre que afecta a muchos archivos, un modelo de datos o un contrato con otro sistema, y cuando una pregunta abierta bloquee el trabajo.
---

# Decisiones

Las decisiones del proyecto las toma una persona, no Claude. El registro es `docs/decisiones.md`.

## Cuándo aplica

Antes de implementar algo, comprueba si la forma de hacerlo ya está decidida en `docs/decisiones.md`, en el `CLAUDE.md` o en las skills del plugin. Si no lo está y la elección cumple alguna de estas condiciones, **es una decisión y se pregunta**:

- Agrega una dependencia: una librería, un servicio, una herramienta.
- Fija un patrón que se repetirá en muchos archivos.
- Define o cambia el modelo de datos de un agregado.
- Define un contrato: una ruta de la API, un formato con otro sistema.
- Es difícil de deshacer después.
- Responde una pregunta de negocio: una regla, un límite, quién puede hacer qué.

No es una decisión, y se resuelve sin preguntar: el nombre de una variable local, el orden de unos métodos, cómo partir una función.

## Cómo se pregunta

1. **Detente antes de implementar.** No se escribe código «provisional» sobre una decisión pendiente.
2. **Presenta dos o tres opciones reales.** Para cada una: qué es, qué gana y qué cuesta.
3. **Recomienda una**, la primera de la lista, con el motivo en una frase.
4. **Espera la respuesta.**

```
Falta decidir: la librería de rutas del frontend.

1. React Router (recomendada): la más usada y documentada; cubre rutas anidadas y protección por rol.
2. TanStack Router: rutas con tipos de punta a punta; menos material y más configuración.

¿Cuál usamos?
```

## Cómo se registra

Cuando la persona decide, se agrega una fila al final de la tabla de `docs/decisiones.md`, con el número siguiente:

```
| 20 | Rutas del frontend | **React Router.** Se descartó TanStack Router por tener menos material. |
```

- La columna «Detalle» dice qué se eligió y, si ayuda, qué se descartó y por qué.
- Si la decisión cambia lo que dice otro documento de `docs/` o el `CLAUDE.md`, ese documento se actualiza en el mismo cambio.
- Una decisión que reemplaza a otra no borra la anterior: se agrega una fila nueva que dice a cuál reemplaza.

## Preguntas abiertas

- Si una pregunta de negocio sin responder bloquea el trabajo, **se dice**. No se inventa la respuesta ni se elige «lo más probable».
- Las preguntas abiertas del proyecto están en el plan de entregas. Al responderse una, se registra como decisión y se quita de la lista de abiertas.
- Mientras tanto se avanza con lo que no depende de esa respuesta.

## Qué evitar

- Decidir en silencio y contarlo después.
- Preguntar sin opciones: «¿cómo lo hago?» traslada todo el trabajo a la persona.
- Preguntar lo que ya está decidido. Primero se lee el registro.
- Ofrecer opciones que no son reales, solo para que la recomendada parezca mejor.
