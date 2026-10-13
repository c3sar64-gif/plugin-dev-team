---
name: nueva-migracion
description: Crea el siguiente archivo numerado de migración SQL del proyecto, con su encabezado y el DDL aditivo e idempotente. Úsala cuando haga falta una tabla, una columna, un índice o una restricción nueva, o cuando un cambio en un agregado necesite cambiar el esquema de la base.
argument-hint: "<qué cambia en el esquema>"
---

# Nueva migración

Cambio pedido: $ARGUMENTS

Las reglas están en la skill `migraciones-sql`. Aquí va solo el procedimiento.

## Pasos

1. **Lee las migraciones existentes** en `db/migrations/` para conocer el último número y el esquema actual de las tablas que vas a tocar.

2. **Calcula el nombre:** `NNNN_descripcion.sql`.
   - `NNNN` es el último número más uno, con cuatro dígitos.
   - La descripción va en snake_case y dice qué cambia: `0008_pedidos_observacion.sql`.

3. **Crea el archivo** con este encabezado:

   ```sql
   -- NNNN_descripcion.sql
   -- Por qué: <el motivo, en una línea>
   -- Mapea: <Entidad.Propiedad o la tabla nueva>
   ```

4. **Escribe el DDL**, aditivo e idempotente:
   - `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`.
   - Una columna `NOT NULL` nueva lleva valor por defecto.
   - Toda clave foránea lleva su índice.
   - Nombres en snake_case; fechas en `timestamptz`.

5. **Si el cambio es destructivo** (eliminar o renombrar), detente y explica el plan en pasos de la referencia `escribir-migraciones.md`. No lo escribas en una sola migración.

6. **Muestra el archivo al usuario.**

7. **Aplícala solo en local**, con el script `apply` de `db/scripts/`, y ejecuta `check`.

8. **Recuerda el paso siguiente:** ajustar el mapeo de EF para que coincida con el SQL.

## Qué no hace

- No aplica nada fuera de la base local.
- No edita una migración que ya existe: crea otra.
- No mezcla cambios de esquema con cambios de datos en el mismo archivo.
