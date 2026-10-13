# Pruebas de agregados

Son pruebas unitarias puras, en `<Proyecto>.Core.Tests`. No usan base de datos, ni DI, ni dobles: se crea el agregado, se llama al método y se comprueba el resultado.

## Una regla que se cumple

```csharp
public sealed class PedidoTests
{
    [Fact]
    public void Bloquear_PedidoAceptado_CambiaElEstadoABloqueado()
    {
        var pedido = PedidoDePrueba.Aceptado();

        pedido.Bloquear();

        Assert.Equal(EstadoPedido.Bloqueado, pedido.Estado);
    }
}
```

## Una regla rota

```csharp
[Fact]
public void Bloquear_PedidoDespachado_LanzaDomainException()
{
    var pedido = PedidoDePrueba.Despachado();

    var error = Assert.Throws<DomainException>(() => pedido.Bloquear());

    Assert.Equal("No se puede bloquear un pedido ya despachado.", error.Message);
}
```

Se comprueba también el mensaje: es lo que verá el usuario.

## El evento de dominio

```csharp
[Fact]
public void Bloquear_PedidoAceptado_AgregaEventoPedidoBloqueado()
{
    var pedido = PedidoDePrueba.Aceptado();

    pedido.Bloquear();

    var evento = Assert.Single(pedido.DomainEvents.OfType<PedidoBloqueado>());
    Assert.Equal(pedido.Id, evento.PedidoId);
}
```

## La operación repetida

```csharp
[Fact]
public void Bloquear_PedidoYaBloqueado_NoAgregaOtroEvento()
{
    var pedido = PedidoDePrueba.Aceptado();
    pedido.Bloquear();
    pedido.ClearDomainEvents();

    pedido.Bloquear();

    Assert.Empty(pedido.DomainEvents);
}
```

## Varios valores límite

```csharp
[Theory]
[InlineData(0)]
[InlineData(-1)]
[InlineData(-0.01)]
public void AgregarLinea_CantidadNoPositiva_LanzaDomainException(decimal quintales)
{
    var pedido = PedidoDePrueba.EnBorrador();

    Assert.Throws<DomainException>(() => pedido.AgregarLinea(Guid.NewGuid(), quintales));
}
```

## Objetos valor

```csharp
public sealed class PesoTests
{
    [Fact]
    public void Constructor_KilosNegativos_LanzaDomainException()
        => Assert.Throws<DomainException>(() => new Peso(-1));

    [Fact]
    public void Igualdad_MismosKilos_SonIguales()
        => Assert.Equal(new Peso(50), new Peso(50));
}
```

## Datos de prueba

Un constructor de datos por agregado, en el proyecto de pruebas, deja cada prueba en tres líneas:

```csharp
internal static class PedidoDePrueba
{
    public static Pedido EnBorrador() => Pedido.Crear(Guid.NewGuid(), granjaId: Guid.NewGuid());

    public static Pedido Aceptado()
    {
        var pedido = EnBorrador();
        pedido.AgregarLinea(Guid.NewGuid(), quintales: 40);
        pedido.Aceptar();
        pedido.ClearDomainEvents();
        return pedido;
    }

    public static Pedido Despachado()
    {
        var pedido = Aceptado();
        pedido.Despachar();
        pedido.ClearDomainEvents();
        return pedido;
    }
}
```

- Llega al estado deseado **por los métodos del agregado**, nunca asignando propiedades ni con reflexión. Si no se puede llegar por los métodos, el agregado tiene un estado inalcanzable.
- Limpia los eventos de la preparación, para que la prueba vea solo los del método que prueba.

## Estructura de cada prueba

Preparar, actuar y comprobar, separados por una línea en blanco. Una sola acción por prueba. Si hacen falta dos acciones para comprobar algo, son dos pruebas.
