-- 0001_pedidos.sql
-- Por qué: tabla inicial de pedidos.
-- Mapea: Pedido.
CREATE TABLE IF NOT EXISTS pedidos (
  id        uuid PRIMARY KEY,
  granja    text NOT NULL,
  estado    text NOT NULL,
  creado_en timestamptz NOT NULL DEFAULT now()
);
