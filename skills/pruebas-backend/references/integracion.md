# Pruebas de integración con PostgreSQL

Los servicios, los handlers y los repositorios se prueban contra un PostgreSQL real, levantado con Testcontainers. Necesita Docker en ejecución.

## Un contenedor para toda la colección

El contenedor se levanta una vez y se le aplican las mismas migraciones SQL del proyecto. Así la prueba usa el esquema real, no uno generado por EF.

```csharp
public sealed class PostgresFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _contenedor = new PostgreSqlBuilder()
        .WithImage("postgres:17")
        .Build();

    public string CadenaConexion => _contenedor.GetConnectionString();

    public async Task InitializeAsync()
    {
        await _contenedor.StartAsync();
        await AplicarMigracionesAsync();
    }

    public Task DisposeAsync() => _contenedor.DisposeAsync().AsTask();

    private async Task AplicarMigracionesAsync()
    {
        await using var conexion = new NpgsqlConnection(CadenaConexion);
        await conexion.OpenAsync();
        foreach (var archivo in Directory.GetFiles(RutaMigraciones(), "*.sql").Order())
        {
            await using var comando = new NpgsqlCommand(await File.ReadAllTextAsync(archivo), conexion);
            await comando.ExecuteNonQueryAsync();
        }
    }

    private static string RutaMigraciones()
    {
        var carpeta = new DirectoryInfo(AppContext.BaseDirectory);
        while (carpeta is not null && !Directory.Exists(Path.Combine(carpeta.FullName, "db", "migrations")))
            carpeta = carpeta.Parent;
        return Path.Combine(carpeta!.FullName, "db", "migrations");
    }
}

[CollectionDefinition("postgres")]
public sealed class PostgresCollection : ICollectionFixture<PostgresFixture>;
```

La firma de `IAsyncLifetime` cambia entre versiones mayores de xUnit; se usa la de la versión instalada en el proyecto.

## Probar un servicio

```csharp
[Collection("postgres")]
public sealed class PedidoServiceTests(PostgresFixture postgres)
{
    [Fact]
    public async Task BloquearAsync_PedidoAceptado_GuardaElEstado()
    {
        await using var ambito = AmbitoDePrueba.Crear(postgres.CadenaConexion);
        var pedidoId = await ambito.SembrarPedidoAceptadoAsync();
        var servicio = ambito.Obtener<IPedidoService>();

        var dto = await servicio.BloquearAsync(pedidoId, CancellationToken.None);

        Assert.Equal("Bloqueado", dto.Estado);
        var guardado = await ambito.NuevoContexto().Pedidos.AsNoTracking().SingleAsync(p => p.Id == pedidoId);
        Assert.Equal(EstadoPedido.Bloqueado, guardado.Estado);
    }
}
```

- `AmbitoDePrueba` arma el contenedor de DI igual que `Program.cs` (los mismos `Add<Contexto>()` y `AddInfrastructure`), apuntando a la base de prueba. No se arma el servicio a mano con `new`.
- **Se comprueba lo guardado con un contexto nuevo.** El contexto que usó el servicio tiene los objetos en memoria y escondería un mapeo roto.

## Probar un handler y la transacción

```csharp
[Fact]
public async Task IniciarAsync_PrimeraEchada_BloqueaElPedidoEnLaMismaTransaccion()
{
    await using var ambito = AmbitoDePrueba.Crear(postgres.CadenaConexion);
    var (pedidoId, echadaId) = await ambito.SembrarPedidoConEchadaAsync();

    await ambito.Obtener<IEchadaService>().IniciarAsync(echadaId, CancellationToken.None);

    var pedido = await ambito.NuevoContexto().Pedidos.AsNoTracking().SingleAsync(p => p.Id == pedidoId);
    Assert.Equal(EstadoPedido.Bloqueado, pedido.Estado);
}

[Fact]
public async Task IniciarAsync_SiElHandlerFalla_NoGuardaNada()
{
    await using var ambito = AmbitoDePrueba.Crear(postgres.CadenaConexion);
    var echadaId = await ambito.SembrarEchadaConPedidoDespachadoAsync();

    await Assert.ThrowsAsync<DomainException>(
        () => ambito.Obtener<IEchadaService>().IniciarAsync(echadaId, CancellationToken.None));

    var echada = await ambito.NuevoContexto().Echadas.AsNoTracking().SingleAsync(e => e.Id == echadaId);
    Assert.Equal(EstadoEchada.Numerada, echada.Estado);
}
```

La segunda prueba es la que demuestra el «o se guarda todo, o nada».

## Datos entre pruebas

- Cada prueba crea sus datos con ids nuevos (`Guid.NewGuid()`), así no choca con las demás aunque compartan la base.
- Una prueba no supone que una tabla está vacía. Si necesita contar, cuenta solo sus propias filas.
- No se borra la base entre pruebas: es lento y esconde dependencias de orden.

## Puertos hacia sistemas externos

En las pruebas de servicios y handlers, el puerto se reemplaza por un doble escrito a mano que registra lo que recibió:

```csharp
internal sealed class SistemaXGatewayFalso : ISistemaXGateway
{
    public List<FabricacionRegistrada> Registradas { get; } = [];

    public Task RegistrarFabricacionAsync(FabricacionRegistrada datos, CancellationToken cancellationToken)
    {
        Registradas.Add(datos);
        return Task.CompletedTask;
    }

    public Task<decimal> ConsultarSaldoAsync(string codigoProducto, CancellationToken cancellationToken)
        => Task.FromResult(0m);
}
```

El adaptador real se prueba aparte, contra un servidor simulado.

## Qué deben cubrir, como mínimo

- Cada operación de un servicio: camino normal contra la base real.
- Cada handler: que el otro agregado cambia en la misma transacción.
- Un caso de fallo que demuestre que no queda nada a medias.
- Los listados: orden estable, segunda página y tope de 100.
- El mapeo de cada entidad nueva: guardar, leer con un contexto nuevo y comparar.
