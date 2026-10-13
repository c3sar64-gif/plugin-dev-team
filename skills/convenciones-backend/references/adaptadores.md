# Adaptadores a sistemas externos

Todo lo que viene de otro sistema, o va hacia él, pasa por un adaptador. El dominio nunca conoce el formato ni los nombres del sistema externo.

## Estructura

```
Application/Puertos/
  ISistemaXGateway.cs                 el puerto: qué necesita la aplicación
Infrastructure/Adapters/SistemaX/
  SistemaXApiClient.cs                el adaptador: cómo se consigue
  SistemaXOptions.cs                  URL, tiempo de espera; se leen de la configuración
  Modelos/                            los DTO del sistema externo; no salen de esta carpeta
```

```csharp
// Application/Puertos
public interface ISistemaXGateway
{
    Task<decimal> ConsultarSaldoAsync(string codigoProducto, CancellationToken cancellationToken);
    Task RegistrarFabricacionAsync(FabricacionRegistrada datos, CancellationToken cancellationToken);
}
```

- El puerto describe una **capacidad** en el lenguaje propio («consultar saldo»), no la tecnología («llamar al endpoint 14»).
- El adaptador **traduce**: convierte el modelo externo al propio y al revés. Esa traducción no se filtra a los servicios.
- Los tipos del sistema externo se quedan en `Infrastructure/Adapters/<Sistema>/Modelos/`.

## Entradas: otro sistema llama a la API

- Entran por un controlador propio en `Controllers/Integraciones/`, con clave de API.
- El controlador traduce el cuerpo recibido a un DTO propio y llama a un servicio normal.
- **Son idempotentes.** Se identifican por una clave del sistema de origen (por ejemplo, su número de documento). Si la misma petición llega dos veces, la segunda no crea nada y responde igual que la primera.

## Salidas: la aplicación llama a otro sistema

No se llama al sistema externo dentro de la transacción del negocio. Se usa **outbox**:

1. El handler del evento de dominio guarda un registro en la tabla outbox, en la misma transacción que el cambio.
2. Un `BackgroundService` lee los pendientes y llama al adaptador.
3. Si falla, reintenta con espera creciente. Los tiempos los define cada proyecto.
4. Si se agotan los reintentos, el envío queda marcado como **fallido**, visible en pantalla y con opción de reintento manual.

Consecuencias:

- **Si el sistema externo no responde, la operación propia no se detiene.**
- El adaptador debe tolerar que un envío se repita: el sistema externo, o el propio adaptador, descarta duplicados.

## Lecturas en línea

Cuando hace falta un dato del otro sistema en el momento (por ejemplo, un saldo):

- Se llama por el puerto, con tiempo de espera corto.
- El servicio decide qué hacer si no responde: mostrar el dato como no disponible, no bloquear la pantalla.
- El resultado no se guarda como si fuera propio.

## Pruebas

- **Servicios y handlers:** con un doble del puerto, sin red.
- **Adaptador:** una prueba de integración contra el sistema real o un servidor simulado, que cubra la traducción en ambos sentidos.
