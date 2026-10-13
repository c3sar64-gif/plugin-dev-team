# Estilo de C#

## Principios

### Inmutable por defecto

Un dato que no necesita cambiar no debe poder cambiar. La mutabilidad es una decisión explícita.

```csharp
// Bien: objeto valor inmutable
public sealed record Dinero(decimal Monto, string Moneda);

// Bien: DTO con propiedades de solo inicialización
public sealed record CreatePedidoRequestDto
{
    public required Guid GranjaId { get; init; }
    public required IReadOnlyList<LineaDto> Lineas { get; init; }
}

// Mal: modelo con setters públicos
public class Pedido
{
    public Guid GranjaId { get; set; }
    public List<Linea> Lineas { get; set; }
}
```

En un agregado las propiedades tienen `private set` y cambian solo por sus métodos.

### Explícito antes que implícito

- Modificadores de acceso siempre escritos.
- Tipos de referencia anulables activados (`<Nullable>enable</Nullable>`). Un `?` significa «puede faltar» y se maneja.
- Clases `sealed` salvo que estén pensadas para heredarse.

### Depender de abstracciones

Los servicios reciben interfaces por el constructor. Nunca crean sus dependencias con `new`.

```csharp
public sealed class PedidoService(IPedidoRepository pedidos, IUnitOfWork unitOfWork) : IPedidoService
{
    // ...
}
```

## Async

```csharp
// Bien: async de punta a punta, con CancellationToken
public async Task<PedidoDto> ObtenerAsync(Guid id, CancellationToken cancellationToken)
{
    var pedido = await pedidos.ObtenerAsync(id, cancellationToken)
        ?? throw new NotFoundException("El pedido no existe.");
    return PedidoDto.Desde(pedido);
}

// Mal: bloquear sobre una tarea
var pedido = pedidos.ObtenerAsync(id, CancellationToken.None).Result;
```

- Todo método que hace entrada o salida es `async`, termina en `Async` y recibe un `CancellationToken` que pasa hacia abajo.
- Nunca `.Result` ni `.Wait()`: pueden bloquear la aplicación.
- Nunca `async void`, salvo en manejadores de eventos de interfaz.
- Operaciones independientes se lanzan juntas con `Task.WhenAll`. **Excepción:** dos consultas sobre el mismo `DbContext` no pueden correr a la vez; esas van una tras otra.

## Opciones de configuración

Cada sección de configuración se enlaza a una clase con tipos.

```csharp
public sealed class JwtOptions
{
    public const string Seccion = "Jwt";

    public required string Emisor { get; init; }
    public required string ClaveFirma { get; init; }
    public int MinutosAccessToken { get; init; } = 15;
}

// Registro
services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.Seccion));

// Uso
public sealed class GeneradorDeTokens(IOptions<JwtOptions> opciones)
{
    private readonly JwtOptions _jwt = opciones.Value;
}
```

No se lee `IConfiguration["Jwt:Emisor"]` suelto por el código. Los secretos llegan por variables de entorno.

## Cláusulas de guarda

Valida al inicio y sal temprano. El camino normal queda sin anidar.

```csharp
public void AgregarLinea(Guid productoId, decimal quintales)
{
    if (Estado != EstadoPedido.Borrador)
        throw new DomainException("Solo se pueden agregar líneas a un pedido en borrador.");
    if (quintales <= 0)
        throw new DomainException("La cantidad debe ser mayor que cero.");

    _lineas.Add(new LineaPedido(productoId, quintales));
}
```

- Regla de negocio rota: `DomainException`.
- Argumento inválido por error de programación: `ArgumentNullException.ThrowIfNull(x)` y las demás excepciones de argumento.

## Qué evitar

| Problema | Solución |
|---|---|
| Métodos `async void` | Devolver `Task` |
| `.Result` o `.Wait()` | `await` |
| `catch (Exception) { }` | Manejar el error o relanzarlo con contexto |
| `new Servicio()` dentro de un constructor | Inyección por constructor |
| Campos `public` | Propiedades con el acceso adecuado |
| `dynamic` en lógica de negocio | Genéricos o tipos explícitos |
| Estado `static` mutable | Un servicio registrado en DI |
| Concatenar texto en un bucle | `StringBuilder` |
| Números y textos mágicos repetidos | Constantes con nombre |
