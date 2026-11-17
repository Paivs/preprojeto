ALTER TABLE contato
ADD COLUMN situacao ENUM('pendente', 'ignorado', 'convertido') NOT NULL DEFAULT 'pendente';
