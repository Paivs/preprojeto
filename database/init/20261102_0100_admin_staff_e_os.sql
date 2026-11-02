USE tenken_db;

-- TABELA: pre_cadastros_staff
-- Pré-cadastro exclusivo de PROFESSOR/TECNICO; mantém o fluxo de alunos separado.
CREATE TABLE pre_cadastros_staff (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    perfil ENUM('PROFESSOR', 'TECNICO') NOT NULL,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    utilizada BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

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
