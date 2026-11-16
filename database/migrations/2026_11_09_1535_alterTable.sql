ALTER TABLE usuario
ADD COLUMN consumo_total DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN consumo_maximo DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE setor
CHANGE COLUMN custo_energia custo DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE equipamento
CHANGE COLUMN consumo_atual consumo_minimo DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN consumo_maximo DECIMAL(10,2);