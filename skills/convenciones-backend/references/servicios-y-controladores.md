# Servicios, DTOs y controladores

## Controlador delgado

```csharp
[ApiController]
[Route("api/pedidos/pedidos")]
[Authorize(Roles = Roles.Encargado)]
public sealed class PedidosController(IPedidoService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] PagedRequest paginacion, CancellationToken cancellationToken)
        => Ok(await service.ListarAsync(paginacion, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Obtener(Guid id, CancellationToken cancellationToken)
        => Ok(await service.ObtenerAsync(id, cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Crear(CreatePedidoRequestDto dto, CancellationToken cancellationToken)
    {
        var pedido = await service.CrearAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(Obtener), new { id = pedido.Id }, pedido);
    }

    [HttpPost("{id:guid}/bloquear")]
    public async Task<IActionResult> Bloquear(Guid id, CancellationToken cancellationToken)
        => Ok(await service.BloquearAsync(id, cancellationToken));
}
```

**Qué no va en un controlador:** consultas a la base, validaciones de negocio, mapeos de entidad a DTO, `try/catch` para convertir errores (lo hace el manejador global), lectura de la entidad para decidir algo.

## Servicio que orquesta

```csharp
public interface IPedidoService
{
    Task<PagedResult<PedidoDto>> ListarAsync(PagedRequest paginacion, CancellationToken cancellationToken);
    Task<PedidoDto> ObtenerAsync(Guid id, CancellationToken cancellationToken);
    Task<PedidoDto> CrearAsync(CreatePedidoRequestDto dto, CancellationToken cancellationToken);
    Task<PedidoDto> BloquearAsync(Guid id, CancellationToken cancellationToken);
}

public sealed class PedidoService(IPedidoRepository pedidos, IUnitOfWork unitOfWork) : IPedidoService
{
    public async Task<PedidoDto> BloquearAsync(Guid id, CancellationToken cancellationToken)
    {
        var pedido = await pedidos.ObtenerAsync(id, cancellationToken)   // 1. carga
            ?? throw new NotFoundException("El pedido no existe.");
        pedido.Bloquear();                                               // 2. llama al agregado
        await unitOfWork.SaveChangesAsync(cancellationToken);            // 3. guarda
        return PedidoDto.Desde(pedido);                                  // 4. devuelve un DTO
    }
}
```

**Qué no va en un servicio:** un `if` que decide una regla de negocio (va en el agregado), asignar propiedades de la entidad, devolver la entidad, usar `DbContext` directamente, leer `HttpContext`.

Si el servicio tiene un `if` sobre el estado de la entidad, esa regla está en el lugar equivocado.

- El usuario actual llega por `ICurrentUser`, inyectado.
- `NotFoundException` vive en `Application/Common` y la API la devuelve como 404.

## DTOs

| Para | Nombre | Ejemplo |
|---|---|---|
| Crear | `Create<X>RequestDto` | `CreatePedidoRequestDto` |
| Actualizar | `Update<X>RequestDto` | `UpdatePedidoRequestDto` |
| Devolver | `<X>Dto` | `PedidoDto` |

```csharp
public sealed record PedidoDto(Guid Id, string Numero, string Estado, DateTime CreadoEn)
{
    public static PedidoDto Desde(Pedido pedido)
        => new(pedido.Id, pedido.Numero.Valor, pedido.Estado.ToString(), pedido.CreadoEn);
}

public sealed record CreatePedidoRequestDto
{
    public required Guid GranjaId { get; init; }
    public required decimal Quintales { get; init; }
}
```

- Viven en `Application/<Contexto>/Dtos/`.
- Son inmutables: `record` o propiedades `init`.
- El mapeo de entidad a DTO está en el propio DTO (`Desde`), no en el controlador.
- Un DTO nunca expone una entidad ni un objeto valor: solo tipos simples.

## Registro DI por contexto

```csharp
public static class PedidosServiceCollectionExtensions
{
    public static IServiceCollection AddPedidos(this IServiceCollection services)
    {
        services.AddScoped<IPedidoService, PedidoService>();
        services.AddScoped<IEventHandler<EchadaIniciada>, BloquearPedidoAlIniciarEchada>();
        return services;
    }
}
```

- Un método `Add<Contexto>()` por contexto, en `Application/<Contexto>/`.
- Todos los servicios y handlers son **Scoped**.
- Los repositorios, el `DbContext` y los adaptadores se registran en `AddInfrastructure(configuration)`.
- `Program.cs` solo llama a esos métodos: `services.AddPedidos(); services.AddProduccion();`
