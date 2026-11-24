USE db_voltHouse;

SET @consumo_mensal_existe = (
  SELECT COUNT(*)
    FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'equipamento'
     AND COLUMN_NAME = 'consumo_mensal'
);

SET @sql_consumo_mensal = IF(
  @consumo_mensal_existe = 0,
  'ALTER TABLE equipamento ADD COLUMN consumo_mensal DECIMAL(11, 2) NOT NULL DEFAULT 0.00 AFTER consumo_maximo',
  'SELECT 1'
);

PREPARE adicionar_consumo_mensal FROM @sql_consumo_mensal;
EXECUTE adicionar_consumo_mensal;
DEALLOCATE PREPARE adicionar_consumo_mensal;

SET @consumo_mensal_atualizado_existe = (
  SELECT COUNT(*)
    FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'equipamento'
     AND COLUMN_NAME = 'consumo_mensal_atualizado_em'
);

SET @sql_consumo_mensal_atualizado = IF(
  @consumo_mensal_atualizado_existe = 0,
  'ALTER TABLE equipamento ADD COLUMN consumo_mensal_atualizado_em DATETIME NULL AFTER consumo_mensal',
  'SELECT 1'
);

PREPARE adicionar_data_consumo_mensal FROM @sql_consumo_mensal_atualizado;
EXECUTE adicionar_data_consumo_mensal;
DEALLOCATE PREPARE adicionar_data_consumo_mensal;

SET @incremento_consumo_existe = (
  SELECT COUNT(*)
    FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'equipamento'
     AND COLUMN_NAME = 'incremento_consumo_simulado'
);

SET @sql_incremento_consumo = IF(
  @incremento_consumo_existe = 0,
  'ALTER TABLE equipamento ADD COLUMN incremento_consumo_simulado DECIMAL(11, 2) NOT NULL DEFAULT 0.00 AFTER consumo_mensal_atualizado_em',
  'SELECT 1'
);

PREPARE adicionar_incremento_consumo FROM @sql_incremento_consumo;
EXECUTE adicionar_incremento_consumo;
DEALLOCATE PREPARE adicionar_incremento_consumo;

UPDATE equipamento
   SET incremento_consumo_simulado = ROUND(0.10 + id_equipamento / 100, 2)
 WHERE incremento_consumo_simulado <= 0;

SET @leitura_consumo_existe = (
  SELECT COUNT(*)
    FROM information_schema.TABLES
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'leitura_consumo_equipamento'
);

SET @sql_migrar_leituras = IF(
  @leitura_consumo_existe > 0,
  'UPDATE equipamento e INNER JOIN (SELECT id_equipamento, ROUND(SUM(consumo_kwh), 2) AS consumo_mensal, MAX(criado_em) AS atualizado_em FROM leitura_consumo_equipamento WHERE criado_em >= DATE_FORMAT(CURRENT_DATE, ''%Y-%m-01'') AND criado_em < DATE_FORMAT(DATE_ADD(CURRENT_DATE, INTERVAL 1 MONTH), ''%Y-%m-01'') GROUP BY id_equipamento) l ON l.id_equipamento = e.id_equipamento SET e.consumo_mensal = l.consumo_mensal, e.consumo_mensal_atualizado_em = l.atualizado_em',
  'SELECT 1'
);

PREPARE migrar_leituras_consumo FROM @sql_migrar_leituras;
EXECUTE migrar_leituras_consumo;
DEALLOCATE PREPARE migrar_leituras_consumo;

DROP TABLE IF EXISTS leitura_consumo_equipamento;
