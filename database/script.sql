CREATE DATABASE db_voltHouse

-- 1. Tabela Usuario (Empresa)
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome_empresa VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);


-- 2. Tabela Setor
CREATE TABLE setor (
    id_setor INT AUTO_INCREMENT PRIMARY KEY,
    nome_setor VARCHAR(100) NOT NULL,
    descricao TEXT,
    consumo_geral DECIMAL(10, 2) DEFAULT 0.00,
    custo_energia DECIMAL(10, 2) DEFAULT 0.00,
    id_usuario INT NOT NULL,
    CONSTRAINT fk_setor_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);


-- 3. Tabela Equipamento
CREATE TABLE equipamento (
    id_equipamento INT AUTO_INCREMENT PRIMARY KEY,
    nome_equipamento VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    consumo_atual DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50),
    id_setor INT NOT NULL,
    CONSTRAINT fk_equipamento_setor FOREIGN KEY (id_setor) 
        REFERENCES setor(id_setor) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);


-- 4. Nova Tabela Pagamento
CREATE TABLE pagamento (
    id_pagamento INT AUTO_INCREMENT PRIMARY KEY,
    valor DECIMAL(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATETIME NULL,
    status ENUM('pago', 'nao_pago', 'atrasado', 'cancelado') NOT NULL DEFAULT 'nao_pago',
    forma_pagamento VARCHAR(50) NOT NULL,
    id_usuario INT NOT NULL,
    CONSTRAINT fk_pagamento_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Inserts --

INSERT INTO pagamento 
(valor, data_vencimento, data_pagamento, status, forma_pagamento, id_usuario)
VALUES
(250.00, '2026-10-05', '2026-10-04 10:30:00', 'pago', 'Pix', 1),

(350.00, '2026-10-10', '2026-10-09 14:20:00', 'pago', 'Cartão de crédito', 2),

(180.00, '2026-11-10', NULL, 'nao_pago', 'Boleto', 3),

(420.00, '2026-10-20', NULL, 'atrasado', 'Boleto', 4),

(290.00, '2026-11-15', NULL, 'nao_pago', 'Pix', 5),

(500.00, '2026-10-25', '2026-10-24 16:45:00', 'pago', 'Transferência bancária', 6),

(150.00, '2026-10-15', NULL, 'cancelado', 'Cartão de crédito', 7),

(380.00, '2026-11-20', NULL, 'nao_pago', 'Pix', 8),

(220.00, '2026-10-28', NULL, 'atrasado', 'Boleto', 9),

(450.00, '2026-11-25', '2026-11-03 09:15:00', 'pago', 'Cartão de crédito', 10);