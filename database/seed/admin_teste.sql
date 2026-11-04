-- Conta administrativa padrao para testes locais.
-- Execute depois de criar o esquema: mysql tenken_db < database/seed/admin_teste.sql
-- Login: ADMIN001 | Senha: TenkenAdmin123!
USE tenken_db;

INSERT INTO usuarios (nome, email, senha_hash, perfil, matricula, ativo)
VALUES (
    'Administrador de Teste',
    'admin.teste@tenken.local',
    '$2b$12$iwqmGJla4dFZfYgg7/bSMu.ZcV7qdvjPSh2lfYsLiXjHJdyw514O.',
    'ADMIN',
    'ADMIN001',
    TRUE
)
ON DUPLICATE KEY UPDATE
    nome = VALUES(nome),
    email = VALUES(email),
    senha_hash = VALUES(senha_hash),
    perfil = VALUES(perfil),
    ativo = VALUES(ativo);
