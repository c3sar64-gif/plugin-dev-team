# Persistencia con EF Core y PostgreSQL

## Reglas

- **Un solo `DbContext`** para todo el sistema, en `Infrastructure/Persistence`.
- **El esquema lo define el SQL escrito a mano**, no EF. EF solo mapea. Nunca se generan migraciones de EF.
- **Cada entidad tiene su clase de configuración** con todos los nombres escritos explícitamente en snake_case.
- **Fechas en `timestamptz`** y `DateTime` siempre en UTC.
- **Un repositorio por agregado.** La interfaz vive en Core y la implementación en Infrastructure. No hay repositorio genérico.
- **`IQueryable` no sale de Infrastructure.** Un repositorio devuelve agregados o listas ya materializadas.
- **Solo la unidad de trabajo guarda.** Los repositorios no llaman a `SaveChangesAsync`.

## Configuración de una entidad

```csharp
public sealed class PedidoConfiguration : IEntityTypeConfiguration<Pedido>
{
    public void Configure(EntityTypeBuilder<Pedido> builder)
    {
        builder.ToTable("pedidos");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id).HasColumnName("id");
        builder.Property(p => p.GranjaId).HasColumnName("granja_id");
        builder.Property(p => p.Estado).HasColumnName("estado").HasConversion<string>();
        builder.Property(p => p.CreadoEn).HasColumnName("creado_en").HasColumnType("timestamptz");

        builder.Ignore(p => p.DomainEvents);
    }
}
```

Una propiedad sin `HasColumnName` usa el nombre por convención de EF (`CreadoEn`), que no existe en una tabla escrita a mano en snake_case. El error aparece recién al ejecutar la consulta.

## Repositorio

```csharp
// Core/Pedidos
public interface IPedidoRepository
{
    Task<Pedido?> ObtenerAsync(Guid id, CancellationToken cancellationToken);
    Task<(IReadOnlyList<Pedido> Items, int Total)> ListarAsync(int saltar, int tomar, CancellationToken cancellationToken);
    void Agregar(Pedido pedido);
}

// Infrastructure/Persistence/Repositories
public sealed class PedidoRepository(AppDbContext db) : IPedidoRepository
{
    public Task<Pedido?> ObtenerAsync(Guid id, CancellationToken cancellationToken)
        => db.Pedidos.Include(p => p.Lineas).FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public void Agregar(Pedido pedido) => db.Pedidos.Add(pedido);
}
```

- **Para modificar, carga con seguimiento** (sin `AsNoTracking`), para que EF detecte los cambios del agregado.
- **Para solo leer, usa `AsNoTracking`** y proyecta directo al DTO cuando el listado no necesita el agregado completo.
- El agregado se carga completo, con sus entidades internas (`Include`).
- Como Core no puede referenciar a Application, un repositorio recibe la paginación como tipos simples (`saltar`, `tomar`). El servicio los calcula a partir de `PagedRequest`.

## Unidad de trabajo

```csharp
public interface IUnitOfWork
{
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
```

Su implementación, en una sola transacción:

1. Recoge los eventos de dominio de los agregados con cambios.
2. Guarda los cambios.
3. Entrega los eventos al despachador. Los handlers pueden modificar otros agregados.
4. Guarda otra vez lo que cambiaron los handlers y confirma la transacción.

Si un handler falla, no se guarda nada.

## Trampas conocidas

- **`timestamptz` y `DateTime.Kind`.** Con el comportamiento antiguo de fechas de Npgsql, una fecha leída llega como `Local`. Comparar sus ticks con una fecha calculada en UTC puede no coincidir nunca, sin dar error. Guarda y compara siempre en UTC.
- **Nombres por convención.** Una entidad sin configuración usa nombres y tipos que no coinciden con el SQL. Toda entidad nueva lleva su clase de configuración en el mismo cambio que su migración.
- **Consultas dentro de un bucle.** Cargar hijos uno por uno multiplica las consultas. Usa `Include` o una sola consulta con `Where(x => ids.Contains(x.Id))`.
