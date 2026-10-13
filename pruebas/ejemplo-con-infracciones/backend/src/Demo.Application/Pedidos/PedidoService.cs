using Demo.Core.Pedidos;
using Demo.Infrastructure.Persistence;

namespace Demo.Application.Pedidos;

public class PedidoService
{
    private readonly AppDbContext _db;

    public PedidoService(AppDbContext db)
    {
        _db = db;
    }

    public Pedido Bloquear(Guid id)
    {
        var pedido = _db.Pedidos.FindAsync(id).Result;

        if (pedido.Estado == "Despachado")
            return null;

        pedido.Estado = "Bloqueado";

        try
        {
            _db.SaveChanges();
        }
        catch (Exception)
        {
        }

        return pedido;
    }
}
