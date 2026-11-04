-- Conta de professor padrao para testes locais.
-- Execute depois de criar o esquema: mysql tenken_db < database/seed/professor_teste.sql
-- Login: PROF001 | Senha: TenkenProf123!
USE tenken_db;

INSERT INTO usuarios (nome, email, senha_hash, perfil, matricula, ativo)
VALUES (
    'Professor de Teste',
    'professor.teste@tenken.local',
    '$2b$12$jyjvfEI.YITI/LINRTOJsOs1nkYeNpEtK6wcg2LND660tlxFOcsMy',
    'PROFESSOR',
    'PROF001',
    TRUE
)
ON DUPLICATE KEY UPDATE
    nome = VALUES(nome),
    email = VALUES(email),
    senha_hash = VALUES(senha_hash),
    perfil = VALUES(perfil),
    ativo = VALUES(ativo);
