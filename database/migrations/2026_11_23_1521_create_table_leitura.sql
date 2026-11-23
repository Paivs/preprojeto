CREATE TABLE IF NOT EXISTS leitura_consumo_equipamento (
  id_leitura BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_equipamento INT NOT NULL,
  consumo_kwh DECIMAL(11, 2) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_leitura),
  KEY idx_leitura_consumo_equipamento_periodo (id_equipamento, criado_em),
  CONSTRAINT fk_leitura_consumo_equipamento
    FOREIGN KEY (id_equipamento)
    REFERENCES equipamento (id_equipamento)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
