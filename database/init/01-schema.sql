CREATE DATABASE db_voltHouse;
use db_voltHouse;

-- 1. Tabela Usuario (Empresa)
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome_empresa VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nivel_permissao ENUM('admin', 'cliente') DEFAULT 'cliente'
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

ALTER TABLE usuario
ADD COLUMN consumo_total DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN consumo_maximo DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE setor
CHANGE COLUMN custo_energia custo DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE equipamento
CHANGE COLUMN consumo_atual consumo_minimo DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN consumo_maximo DECIMAL(10,2);
