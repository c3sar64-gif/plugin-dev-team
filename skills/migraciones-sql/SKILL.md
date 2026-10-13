---
name: migraciones-sql
description: Reglas del equipo para cambiar el esquema de PostgreSQL con migraciones SQL escritas a mano. Úsala al crear o revisar un archivo en db/migrations/, al cambiar un mapeo de EF Core que necesita una tabla o columna nueva, al aplicar migraciones a un entorno o antes de ejecutar cualquier consulta destructiva.
---

# Migraciones SQL

El `CLAUDE.md` y los `docs/` del proyecto mandan sobre esta skill.

## Reglas innegociables

1. **El esquema cambia solo con un archivo de migración.** Nunca con SQL suelto contra una base y nunca con migraciones de EF.
2. **Un archivo nuevo por cambio:** `db/migrations/NNNN_descripcion.sql`, con el número siguiente al último. Una migración ya aplicada no se edita; se corrige con otra.
3. **Aditiva e idempotente.** `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`. Una columna `NOT NULL` nueva lleva valor por defecto, para que el código ya desplegado siga funcionando.
4. **La migración va antes que el código.** El código que lee una columna nueva no llega a producción antes que su migración.
5. **Antes de algo destructivo, lee la cadena de conexión** (host y usuario) y confirma a qué entorno apunta. Los archivos de entorno a veces están cruzados.
6. **Producción la aplica una persona, a mano,** después de probar en local.
7. **Nombres en snake_case y fechas en `timestamptz`.**
8. **«Escribe un SQL» significa escribirlo para revisión.** No se ejecuta salvo que lo pidan.

## Receta

1. Mira el último número en `db/migrations/`.
2. Crea el archivo. Empieza con un comentario que diga por qué existe y qué entidad o propiedad mapea.
3. Escribe el DDL aditivo e idempotente.
4. Aplícala en local con el script `apply` de `db/scripts/`.
5. Ajusta el mapeo de EF para que coincida con el SQL.
6. Ejecuta el script `check` y confirma que no queda nada pendiente.

## Ejemplo

```sql
-- 0007_pedidos_observacion.sql
-- Por qué: el encargado necesita anotar una observación al aprobar el pedido.
-- Mapea: Pedido.Observacion (texto opcional).
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS observacion text;
```

## Verificación automática

- El hook `sin-migraciones-ef` bloquea los comandos de migraciones de EF y los archivos en una carpeta `Migrations/`.
- El hook `migracion-existente` avisa cuando se edita una migración que ya existe.

## Referencias

| Necesitas | Lee |
|---|---|
| Patrones seguros: columnas, índices, renombres, borrados y datos | [references/escribir-migraciones.md](references/escribir-migraciones.md) |
| Entornos, orden de despliegue y scripts `check`, `apply`, `push`, `dump` | [references/entornos-y-despliegue.md](references/entornos-y-despliegue.md) |
| Tipos de datos e índices de PostgreSQL | [references/postgres.md](references/postgres.md) |
