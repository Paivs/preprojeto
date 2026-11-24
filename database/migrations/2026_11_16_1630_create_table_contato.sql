CREATE TABLE IF NOT EXISTS contato (
    id_contato INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) NULL,
    telefone VARCHAR(20) NULL,
    mensagem TEXT NOT NULL,
    situacao ENUM('pendente', 'respondido', 'ignorado') NOT NULL DEFAULT 'pendente'
);

-- Rollback manual, se necessário: DROP TABLE contato;
-- Atenção: o rollback exclui permanentemente os contatos registrados.
