# Inventario con cabecera y detalle

Opcional. Aplica solo si el proyecto maneja existencias.

## El patrón

- Cada movimiento de stock es un documento: una **cabecera** (fecha, tipo, origen, responsable) y sus líneas de **detalle** (producto, ubicación, cantidad).
- Hay una tabla de **saldos** por producto y ubicación.
- **Un único método mueve el stock.** Todo cambio de existencias, venga de donde venga, pasa por él.

```csharp
public interface IInventarioService
{
    Task RegistrarMovimientoAsync(MovimientoInventario movimiento, CancellationToken cancellationToken);
}
```

Ese método, en una sola transacción:

1. Valida el movimiento (cantidades, que el saldo no quede negativo si no se permite).
2. Guarda la cabecera y el detalle.
3. Actualiza los saldos.

## Por qué un solo método

Si dos partes del código actualizan saldos por su cuenta, tarde o temprano los saldos dejan de coincidir con los movimientos. Con un solo punto de entrada, el saldo siempre es la suma de los movimientos.

Ningún otro código escribe en la tabla de saldos. Para corregir un saldo se registra un movimiento de ajuste, no se edita el número.

## Consumo por lotes en orden de llegada

Cuando un inventario se consume por lotes, del más antiguo al más nuevo:

- La lógica de qué lote consumir vive en el servicio de ese dominio, no en el servicio general de inventario.
- El estado del lote es explícito y avanza en un solo sentido, por ejemplo `Abierto → Recibido → Cerrado`.
- Un lote cerrado no admite más movimientos.

## Pruebas mínimas

- Después de cualquier secuencia de movimientos, el saldo es igual a la suma de los detalles.
- Un movimiento que dejaría un saldo negativo se rechaza y no guarda nada.
- Si falla la actualización del saldo, tampoco quedan guardados la cabecera ni el detalle.
- El consumo toma primero el lote más antiguo con existencias.
