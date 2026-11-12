-- Aplicar apenas em bancos criados com a versão anterior de 02-schema.sql. Para banco novo, o 02-schema.sql já contém estas mudanças.
USE tenken_db;

ALTER TABLE turmas_projetos
    ADD COLUMN token_acesso VARCHAR(8) NULL UNIQUE;

ALTER TABLE agendamentos
    MODIFY COLUMN token_acesso VARCHAR(20) NULL;

ALTER TABLE agendamentos
    DROP INDEX token_acesso;

ALTER TABLE checkins
    ADD COLUMN aprovado_em DATETIME NULL;
