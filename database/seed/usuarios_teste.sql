-- Contas padrao para testes locais (admin, professor e tecnico).
-- Execute depois de criar o esquema: mysql tenken_db < database/seed/usuarios_teste.sql
-- Logins: ADMIN001 / TenkenAdmin123!, PROF001 / TenkenProf123!, TEC001 / TenkenTec123!
USE tenken_db;

INSERT INTO usuarios (nome, email, senha_hash, perfil, matricula, ativo)
VALUES ('Administrador de Teste', 'admin.teste@tenken.local', '$2b$12$iwqmGJla4dFZfYgg7/bSMu.ZcV7qdvjPSh2lfYsLiXjHJdyw514O.', 'ADMIN', 'ADMIN001', TRUE)
ON DUPLICATE KEY UPDATE nome = VALUES(nome), email = VALUES(email), senha_hash = VALUES(senha_hash), perfil = VALUES(perfil), ativo = VALUES(ativo);

INSERT INTO usuarios (nome, email, senha_hash, perfil, matricula, ativo)
VALUES ('Professor de Teste', 'professor.teste@tenken.local', '$2b$12$jyjvfEI.YITI/LINRTOJsOs1nkYeNpEtK6wcg2LND660tlxFOcsMy', 'PROFESSOR', 'PROF001', TRUE)
ON DUPLICATE KEY UPDATE nome = VALUES(nome), email = VALUES(email), senha_hash = VALUES(senha_hash), perfil = VALUES(perfil), ativo = VALUES(ativo);

INSERT INTO usuarios (nome, email, senha_hash, perfil, matricula, ativo)
VALUES ('Tecnico de Teste', 'tecnico.teste@tenken.local', '$2b$12$/kayYDxtJJWMnkSxYsgro.EIryaJa3hz9OWp2mFxPYgjEEs1L0sC.', 'TECNICO', 'TEC001', TRUE)
ON DUPLICATE KEY UPDATE nome = VALUES(nome), email = VALUES(email), senha_hash = VALUES(senha_hash), perfil = VALUES(perfil), ativo = VALUES(ativo);
