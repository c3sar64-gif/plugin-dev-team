# Agregados y eventos de dominio

## Piezas base (`Core/Common`)

```csharp
public interface IDomainEvent
{
    DateTime OcurridoEn { get; }
}

public abstract class Entity
{
    public Guid Id { get; protected set; }
}

public abstract class AggregateRoot : Entity
{
    private readonly List<IDomainEvent> _domainEvents = [];
    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents;

    protected void AddDomainEvent(IDomainEvent evento) => _domainEvents.Add(evento);
    public void ClearDomainEvents() => _domainEvents.Clear();
}

public sealed class DomainException(string mensaje) : Exception(mensaje);
```

## Un agregado

```csharp
public sealed class Pedido : AggregateRoot
{
    public EstadoPedido Estado { get; private set; }

    public void Bloquear()
    {
        if (Estado == EstadoPedido.Despachado)
            throw new DomainException("No se puede bloquear un pedido ya despachado.");
        if (Estado == EstadoPedido.Bloqueado)
            return;

        Estado = EstadoPedido.Bloqueado;
        AddDomainEvent(new PedidoBloqueado(Id, DateTime.UtcNow));
    }
}

public sealed record PedidoBloqueado(Guid PedidoId, DateTime OcurridoEn) : IDomainEvent;
```

Reglas:

- **Las propiedades se cambian solo desde métodos del agregado** (`private set`). Nadie asigna `Estado` desde afuera.
- **El método lleva el nombre de lo que pasa en el negocio:** `Bloquear()`, `Iniciar()`, `Aprobar()`. No `SetEstado()`.
- **Si la regla no se cumple, lanza `DomainException`** con un mensaje en español que el usuario pueda leer.
- **Las entidades internas se tocan a través de la raíz.** Si `Pedido` tiene líneas, se agregan con `pedido.AgregarLinea(…)`, no con `pedido.Lineas.Add(…)`.
- **Una operación cambia un solo agregado.** Si otro debe reaccionar, lo hace por un evento.
- **Referencia a otro agregado: solo su id.** `Echada` guarda `PedidoId`, no un `Pedido`.

## Objetos valor

Usa un objeto valor cuando un dato tiene reglas propias y no tiene identidad: un peso, una cantidad con unidad, un número correlativo.

```csharp
public sealed record Peso
{
    public decimal Kilos { get; }

    public Peso(decimal kilos)
    {
        if (kilos < 0)
            throw new DomainException("El peso no puede ser negativo.");
        Kilos = kilos;
    }
}
```

Es inmutable, se compara por valor y valida en el constructor. Así un `Peso` inválido no puede existir.

## Flujo de un evento de dominio

1. El método del agregado agrega el evento a su lista `DomainEvents`.
2. El servicio llama a `IUnitOfWork.SaveChangesAsync()`.
3. La unidad de trabajo entrega los eventos al `DomainEventDispatcher`, que busca en DI los `IEventHandler<T>` de cada uno.
4. **Los handlers internos corren en la misma transacción**: o se guarda todo, o no se guarda nada.
5. **Las integraciones con sistemas externos no se llaman dentro de la transacción.** El handler deja un registro en la tabla outbox y un `BackgroundService` lo envía después, con reintentos.

```csharp
public interface IEventHandler<in TEvento> where TEvento : IDomainEvent
{
    Task HandleAsync(TEvento evento, CancellationToken cancellationToken);
}

public sealed class BloquearPedidoAlIniciarEchada(IPedidoRepository pedidos)
    : IEventHandler<EchadaIniciada>
{
    public async Task HandleAsync(EchadaIniciada evento, CancellationToken cancellationToken)
    {
        var pedido = await pedidos.ObtenerAsync(evento.PedidoId, cancellationToken)
            ?? throw new DomainException("El pedido de la echada no existe.");
        pedido.Bloquear();
    }
}
```

- El handler vive en `Application/<Contexto>/Handlers/` del contexto que reacciona.
- Su nombre dice qué hace y cuándo: `BloquearPedidoAlIniciarEchada`.
- No llama a `SaveChangesAsync`: la unidad de trabajo que despachó el evento guarda todo junto.
- Son cuatro o cinco clases propias. No se usa ninguna librería de mediación.

## Pruebas

Cada regla de un agregado tiene su prueba unitaria en `<Proyecto>.Core.Tests`, sin base de datos: se crea el agregado, se llama al método y se comprueba el estado, el evento agregado o la `DomainException`.
