ALTER TABLE pedidos ADD COLUMN "Prioridad" varchar(255) NOT NULL;
ALTER TABLE pedidos ADD COLUMN entregado_en timestamp;
ALTER TABLE pedidos ADD COLUMN peso_total float;

CREATE INDEX idx_estado ON pedidos (estado);

UPDATE pedidos SET peso_total = 0;
