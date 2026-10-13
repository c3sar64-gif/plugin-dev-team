# Entornos y despliegue

## Entornos

- **Local:** PostgreSQL en Docker, levantado con el `docker-compose.yml` del proyecto. Todo el desarrollo y todas las pruebas se hacen aquí.
- **Producción:** los cambios de esquema y de datos los aplica **una persona, a mano**, después de verificarlos en local. Nada se aplica solo.

## Comprobaciones antes de tocar una base

1. **Lee la cadena de conexión:** host, usuario y nombre de la base. Los archivos de entorno a veces están cruzados entre desarrollo y producción; nunca se da por supuesto a dónde apunta.
2. **Investiga con scripts de solo lectura.** Cada escritura es deliberada.
3. **El esquema cambia solo con un archivo de migración,** nunca con SQL suelto.
4. **Cuando piden «escribe un SQL» o «escribe un script», se escribe para revisión.** No se ejecuta salvo que lo pidan.

Ante una operación destructiva (`DROP`, `TRUNCATE`, `DELETE` o `UPDATE` sin filtro acotado), se muestra a qué base apunta y se espera una confirmación explícita.

## Orden de despliegue

**La migración va antes que el código.**

Si al subir el código la API se despliega sola, pero las migraciones no se aplican solas, el código puede llegar a producción antes que el esquema que necesita. El resultado es una caída: la API pide una columna que no existe.

- Como las migraciones son aditivas, son compatibles con el código anterior: se pueden aplicar primero sin romper nada.
- Orden correcto: aplicar la migración en producción y **después** subir el código, o las dos cosas juntas.
- Antes de subir código que depende de una migración, confirma que esa migración está aplicada en el entorno de destino.

## Scripts de `db/scripts/`

Scripts pequeños en Node, para no depender de tener `psql` instalado.

| Script | Qué hace |
|---|---|
| `check` | Compara las migraciones de la carpeta con las registradas en la base y lista las pendientes. Solo lee |
| `apply` | Aplica las migraciones pendientes en la base local |
| `push` | Aplica las migraciones pendientes en el entorno indicado, mostrando antes a qué base apunta. Lo ejecuta una persona |
| `dump` | Saca una copia del esquema o de los datos |

Cómo aplican una migración:

- **El cuerpo de la migración y su registro como aplicada van en una sola transacción.** Si falla, no queda nada a medias ni registrado.
- Para saber qué falta, se compara el registro del entorno con la carpeta. Se vuelve a ejecutar `check`; no se confía en una nota antigua.
- Una migración con `CREATE INDEX CONCURRENTLY` se aplica fuera de transacción y se registra después.

## Base que ya existía

Si las tablas de producción existían antes de empezar a registrar migraciones, la migración inicial no figura como aplicada allí.

- No se aplica en producción: fallaría con «ya existe».
- Se registra como aplicada sin ejecutarla, o se excluye de toda comparación.

## Refrescar los datos locales

Conviene tener un script que traiga una copia de producción, reinicie el esquema local, cargue los datos y deje una clave conocida para el administrador local.

Atención a la diferencia de esquema: una columna que existe solo en producción puede romper la carga y dejar las tablas locales vacías sin avisar. Después de cargar, se comprueba que las tablas tengan filas.
