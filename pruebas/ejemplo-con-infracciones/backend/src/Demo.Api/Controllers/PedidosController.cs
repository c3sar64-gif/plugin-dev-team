using Demo.Application.Pedidos;
using Demo.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Demo.Api.Controllers;

[ApiController]
[Route("api/pedidos/pedidos")]
public class PedidosController : ControllerBase
{
    private const string ClaveJwt = "clave-de-ejemplo-sembrada-para-la-prueba-123";

    private readonly AppDbContext _db;

    public PedidosController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IActionResult Listar(string granja)
    {
        var pedidos = _db.Pedidos
            .FromSqlRaw($"SELECT * FROM pedidos WHERE granja = '{granja}'")
            .ToList();

        return Ok(pedidos);
    }

    [HttpPost("{id}/bloquear")]
    public IActionResult Bloquear(Guid id)
    {
        try
        {
            var servicio = new PedidoService(_db);
            return Ok(servicio.Bloquear(id));
        }
        catch (Exception e)
        {
            return StatusCode(500, e.ToString());
        }
    }
}
