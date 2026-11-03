USE tenken_db;

-- TABELA: ordens_servico
-- Vinculada 1:1 a um chamado de manutenção.
CREATE TABLE ordens_servico (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chamado_id BIGINT UNSIGNED NOT NULL,
    numero VARCHAR(20) NOT NULL UNIQUE,
    emitida_por BIGINT UNSIGNED NOT NULL,
    status ENUM('EMITIDA', 'EM_EXECUCAO', 'FINALIZADA', 'CANCELADA') NOT NULL DEFAULT 'EMITIDA',
    emitida_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finalizada_em DATETIME,
    UNIQUE (chamado_id),
    FOREIGN KEY (chamado_id) REFERENCES chamados_manutencao(id),
    FOREIGN KEY (emitida_por) REFERENCES usuarios(id)
) ENGINE=InnoDB;
