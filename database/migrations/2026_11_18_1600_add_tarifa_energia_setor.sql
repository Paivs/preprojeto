USE db_voltHouse;

SET @tarifa_existe = (
  SELECT COUNT(*)
    FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'setor'
     AND COLUMN_NAME = 'tarifa_energia'
);

SET @sql_tarifa = IF(
  @tarifa_existe = 0,
  'ALTER TABLE setor ADD COLUMN tarifa_energia DECIMAL(24, 12) NOT NULL DEFAULT 0.000000000000 AFTER consumo_geral',
  'SELECT 1'
);

PREPARE adicionar_tarifa FROM @sql_tarifa;
EXECUTE adicionar_tarifa;
DEALLOCATE PREPARE adicionar_tarifa;

UPDATE setor
   SET tarifa_energia = CAST(
     CAST(custo AS DECIMAL(30, 14)) / consumo_geral
     AS DECIMAL(24, 12)
   )
 WHERE consumo_geral > 0
   AND custo > 0
   AND id_setor > 0
   AND tarifa_energia = 0;
