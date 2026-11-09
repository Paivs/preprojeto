-- Atualiza bancos existentes para armazenar o nome da atividade da reserva.
-- Execute uma única vez no banco tenken_db; o schema inicial já inclui a coluna.
USE tenken_db;

ALTER TABLE agendamentos
    ADD COLUMN atividade VARCHAR(120) NULL AFTER turma_id;
