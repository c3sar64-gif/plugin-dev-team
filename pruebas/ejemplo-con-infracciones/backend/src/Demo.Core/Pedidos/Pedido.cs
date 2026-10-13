using Demo.Infrastructure.Persistence;

namespace Demo.Core.Pedidos;

public class Pedido
{
    public Guid Id { get; set; }
    public string Estado { get; set; } = "Recibido";
    public List<LineaPedido> Lineas { get; set; } = new();
    public DateTime CreadoEn { get; set; }
}

public class LineaPedido
{
    public Guid ProductoId { get; set; }
    public double Quintales { get; set; }
}
