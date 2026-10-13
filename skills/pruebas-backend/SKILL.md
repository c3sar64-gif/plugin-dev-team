---
name: pruebas-backend
description: Cómo escribe pruebas el equipo en el backend .NET, con xUnit y Testcontainers sobre PostgreSQL. Úsala al escribir o cambiar pruebas en backend/tests/, al agregar o modificar una regla de un agregado, al probar un servicio o un handler, o al decidir si algo necesita prueba unitaria o de integración.
---

# Pruebas de backend

El `CLAUDE.md` y los `docs/` del proyecto mandan sobre esta skill. Si el proyecto define qué contextos llevan pruebas completas, se respeta.

## Principios

1. **La prueba va primero.** Se escribe, se ejecuta y se ve fallar. Recién entonces se escribe el código que la hace pasar.
2. **Una regla, una prueba.** Cada regla de un agregado tiene al menos una prueba que falla si la regla desaparece.
3. **Se prueba el comportamiento, no la implementación.** Lo que el código hace visible: el estado final, el evento agregado, la excepción, la respuesta.
4. **Cada prueba es independiente.** Crea sus propios datos y no depende del orden ni de otra prueba.
5. **Una prueba que nunca falló no prueba nada.**

## Qué se prueba y dónde

| Qué | Proyecto | Cómo |
|---|---|---|
| Reglas de agregados y objetos valor | `<Proyecto>.Core.Tests` | Unitarias puras. Sin base de datos y sin dobles |
| Servicios y handlers de eventos | `<Proyecto>.Application.Tests` | Integración contra PostgreSQL real con Testcontainers |
| Adaptadores a sistemas externos | `<Proyecto>.Application.Tests` | Integración contra un servidor simulado; cubre la traducción en los dos sentidos |

Los servicios se prueban con la base real porque solo orquestan: lo que puede fallar es la carga, el mapeo de EF y la transacción.

## Ciclo

1. **Rojo.** Escribe la prueba y ejecútala. Debe fallar por la razón correcta: falta la regla, no un error de compilación ajeno.
2. **Verde.** Escribe el mínimo código que la hace pasar.
3. **Refactor.** Limpia nombres y duplicación con las pruebas en verde.

Si la prueba pasa antes de escribir el código, la prueba está mal o la regla ya existía.

## Nombres

`Metodo_Condicion_Resultado`, en español del dominio:

```
Bloquear_PedidoDespachado_LanzaDomainException
Bloquear_PedidoAceptado_AgregaEventoPedidoBloqueado
ListarAsync_PaginaDos_DevuelveLosSiguientesVeinte
```

## Casos que no se olvidan

- El camino normal.
- Cada regla rota: una prueba por cada `DomainException` posible.
- Valores límite: cero, negativo, el máximo permitido, justo por encima del máximo.
- Listas vacías y valores nulos donde el tipo los permite.
- La operación repetida: llamar dos veces no duplica ni rompe.
- En integración: que si un handler falla, no queda nada guardado.

## Qué evitar

- Probar detalles internos (campos privados, cuántas veces se llamó un método).
- Pruebas que dependen de datos que dejó otra prueba.
- Afirmar demasiado poco: una prueba que solo comprueba que «no lanza».
- Un doble de la base de datos para probar un servicio: esconde justo los errores de mapeo y de transacción.
- Dormir el hilo (`Thread.Sleep`) para esperar algo.

Para los puertos hacia sistemas externos se usa un doble escrito a mano. Agregar una librería de dobles o de aserciones es una decisión del proyecto: se pregunta antes.

## Comandos

```
dotnet test                                          todas
dotnet test --filter "FullyQualifiedName~Pedido"      las de un agregado
```

## Referencias

| Necesitas | Lee |
|---|---|
| Ejemplos de pruebas de agregados, objetos valor y eventos | [references/agregados.md](references/agregados.md) |
| Testcontainers, aplicar las migraciones y probar servicios y handlers | [references/integracion.md](references/integracion.md) |
