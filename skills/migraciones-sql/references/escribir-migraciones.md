# Escribir migraciones seguras

## Principios

1. **Todo cambio es una migración.** Nunca se altera una base a mano.
2. **Solo hacia adelante.** Para deshacer algo se escribe una migración nueva.
3. **El esquema y los datos van en migraciones separadas.** No se mezcla DDL con una carga o corrección de datos.
4. **Una migración aplicada no se toca.** Editarla hace que los entornos dejen de coincidir.
5. **Piensa en el tamaño real.** Una migración que funciona con 100 filas puede bloquear una tabla de millones.

## Antes de aplicar

- [ ] El archivo empieza con un comentario: por qué existe y qué entidad o propiedad mapea.
- [ ] El número es el siguiente al último de `db/migrations/`.
- [ ] Es idempotente: ejecutarla dos veces no da error ni cambia nada la segunda vez.
- [ ] Las columnas nuevas admiten nulos o tienen valor por defecto.
- [ ] Los índices sobre tablas con datos se crean con `CONCURRENTLY`.
- [ ] No mezcla cambios de esquema con cambios de datos.
- [ ] No borra ni renombra nada que el código desplegado todavía use.
- [ ] Se probó en local.

## Agregar una columna

```sql
-- Bien: admite nulos, sin bloqueo
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS observacion text;

-- Bien: con valor por defecto (es inmediato, no reescribe la tabla)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS urgente boolean NOT NULL DEFAULT false;

-- Mal: NOT NULL sin valor por defecto en una tabla con datos
ALTER TABLE pedidos ADD COLUMN prioridad text NOT NULL;
-- Falla si hay filas, y rompe el código ya desplegado que no envía esa columna
```

## Crear una tabla

```sql
CREATE TABLE IF NOT EXISTS pedido_lineas (
  id          uuid PRIMARY KEY,
  pedido_id   uuid NOT NULL REFERENCES pedidos (id),
  producto_id uuid NOT NULL,
  quintales   numeric(12,2) NOT NULL,
  creado_en   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_pedido_lineas_pedido_id ON pedido_lineas (pedido_id);
```

Toda clave foránea lleva su índice.

## Crear un índice sin bloquear

```sql
-- Mal: bloquea las escrituras mientras se construye
CREATE INDEX ix_pedidos_estado ON pedidos (estado);

-- Bien: no bloquea
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_pedidos_estado ON pedidos (estado);
```

`CONCURRENTLY` no puede ejecutarse dentro de una transacción. Esa migración va sola en su archivo y se marca en el comentario inicial para que el script de aplicación no la envuelva en una transacción.

En una tabla recién creada o vacía, el índice normal es suficiente.

## Renombrar una columna: expandir, migrar, contraer

Nunca se renombra directamente una columna que el código desplegado usa.

| Paso | Qué se hace |
|---|---|
| 1. Expandir | Migración que agrega la columna nueva, con nulos permitidos |
| 2. Desplegar | El código escribe en las dos columnas |
| 3. Migrar datos | Migración de datos que copia los valores existentes |
| 4. Desplegar | El código lee solo de la columna nueva |
| 5. Contraer | Migración que elimina la columna vieja |

## Eliminar una columna o una tabla

1. Se quita del código toda referencia.
2. Se despliega ese código.
3. Recién entonces, en otra migración, se elimina.

```sql
ALTER TABLE pedidos DROP COLUMN IF EXISTS estado_antiguo;
```

Una eliminación es destructiva: antes de aplicarla en cualquier entorno se confirma la cadena de conexión y se pide aprobación.

## Cambios de datos grandes

```sql
-- Mal: actualiza todas las filas en una sola transacción y bloquea la tabla
UPDATE pedidos SET numero_normalizado = upper(numero);
```

Una corrección sobre muchas filas se hace por lotes (por ejemplo de 10 000), confirmando cada lote, y va en su propia migración de datos.

## Qué evitar

| Error | Por qué falla | Qué hacer |
|---|---|---|
| SQL a mano en producción | No queda registro y no se puede repetir | Siempre un archivo de migración |
| Editar una migración ya aplicada | Los entornos dejan de coincidir | Crear una migración nueva |
| `NOT NULL` sin valor por defecto | Falla o bloquea, y rompe el código desplegado | Con valor por defecto, o nulos permitidos y luego la restricción |
| Índice normal en una tabla grande | Bloquea las escrituras | `CREATE INDEX CONCURRENTLY` |
| Esquema y datos en la misma migración | Transacción larga y difícil de deshacer | Migraciones separadas |
| Eliminar una columna antes de quitarla del código | La aplicación falla al no encontrarla | Primero el código, después la columna |
| Una migración que no se puede repetir | Falla al reaplicarla en un entorno a medias | `IF NOT EXISTS` / `IF EXISTS` |
