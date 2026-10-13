# PostgreSQL: tipos e índices

## Tipos de datos

| Para | Tipo | Evitar |
|---|---|---|
| Identificadores | `uuid` | `int`, texto libre |
| Texto | `text` | `varchar(255)` sin motivo |
| Fecha y hora | `timestamptz` | `timestamp` sin zona |
| Solo fecha | `date` | Texto |
| Cantidades y dinero | `numeric(p,s)`, por ejemplo `numeric(12,2)` | `float`, `double precision` |
| Sí o no | `boolean` | `int`, texto |
| Estados | `text` con una restricción `CHECK`, o un valor que mapea a un enum de C# | Números mágicos |

- Todas las fechas se guardan en UTC, en `timestamptz`.
- Un peso, un volumen o un monto nunca va en un tipo de coma flotante: acumula errores de redondeo.

## Nombres

- Tablas en plural y snake_case: `pedidos`, `ordenes_fabricacion`.
- Columnas en snake_case: `creado_en`, `pedido_id`.
- Clave foránea: `<tabla_en_singular>_id`.
- Índices: `ix_<tabla>_<columnas>`. Únicos: `ux_<tabla>_<columnas>`.

## Qué índice usar

| Consulta | Índice | Ejemplo |
|---|---|---|
| `WHERE col = valor` | B-tree (por defecto) | `CREATE INDEX ix_t_col ON t (col)` |
| `WHERE col > valor` | B-tree | `CREATE INDEX ix_t_col ON t (col)` |
| `WHERE a = x AND b > y` | Compuesto | `CREATE INDEX ix_t_a_b ON t (a, b)` |
| Búsqueda dentro de `jsonb` | GIN | `CREATE INDEX ix_t_col ON t USING gin (col)` |
| Búsqueda de texto completo | GIN | `CREATE INDEX ix_t_tsv ON t USING gin (tsv)` |
| Rangos de fecha en tablas muy grandes y solo de inserción | BRIN | `CREATE INDEX ix_t_col ON t USING brin (col)` |

## Patrones

**Orden en un índice compuesto:** primero las columnas de igualdad, después las de rango.

```sql
CREATE INDEX ix_pedidos_estado_creado_en ON pedidos (estado, creado_en);
-- Sirve para: WHERE estado = 'pendiente' AND creado_en > '2026-01-01'
```

**Índice parcial:** más chico, solo con las filas que se consultan.

```sql
CREATE INDEX ix_pedidos_pendientes ON pedidos (creado_en) WHERE estado = 'pendiente';
```

**Índice que cubre la consulta:** evita ir a la tabla.

```sql
CREATE INDEX ix_pedidos_numero ON pedidos (numero) INCLUDE (estado, creado_en);
```

**Unicidad como regla de negocio:** la garantiza la base, no solo el código.

```sql
CREATE UNIQUE INDEX IF NOT EXISTS ux_pedidos_numero_ventas ON pedidos (numero_ventas);
```

Así una integración que envía dos veces el mismo documento no crea un duplicado.

**Insertar o actualizar:**

```sql
INSERT INTO saldos (producto_id, ubicacion_id, cantidad)
VALUES ($1, $2, $3)
ON CONFLICT (producto_id, ubicacion_id)
DO UPDATE SET cantidad = EXCLUDED.cantidad;
```

**Tomar trabajo pendiente sin que dos procesos tomen el mismo** (por ejemplo, la tabla outbox):

```sql
UPDATE outbox SET estado = 'enviando'
WHERE id = (
  SELECT id FROM outbox
  WHERE estado = 'pendiente'
  ORDER BY creado_en
  LIMIT 1
  FOR UPDATE SKIP LOCKED
)
RETURNING *;
```

## Paginación

Los listados usan paginación por página (`LIMIT` y `OFFSET`) con un `ORDER BY` estable, que incluya el id como desempate:

```sql
SELECT * FROM pedidos ORDER BY creado_en DESC, id LIMIT 20 OFFSET 40;
```

Sin un orden estable, una fila puede aparecer en dos páginas o en ninguna.

## Comprobaciones útiles

Claves foráneas sin índice:

```sql
SELECT conrelid::regclass AS tabla, a.attname AS columna
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
WHERE c.contype = 'f'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid AND a.attnum = ANY (i.indkey)
  );
```

Son consultas de solo lectura y se pueden ejecutar en cualquier entorno.
