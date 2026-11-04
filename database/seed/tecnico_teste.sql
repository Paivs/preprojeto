-- Conta de tecnico padrao para testes locais.
-- Execute depois de criar o esquema: mysql tenken_db < database/seed/tecnico_teste.sql
-- Login: TEC001 | Senha: TenkenTec123!
USE tenken_db;

INSERT INTO usuarios (nome, email, senha_hash, perfil, matricula, ativo)
VALUES (
    'Tecnico de Teste',
    'tecnico.teste@tenken.local',
    '$2b$12$/kayYDxtJJWMnkSxYsgro.EIryaJa3hz9OWp2mFxPYgjEEs1L0sC.',
    'TECNICO',
    'TEC001',
    TRUE
)
ON DUPLICATE KEY UPDATE
    nome = VALUES(nome),
    email = VALUES(email),
    senha_hash = VALUES(senha_hash),
    perfil = VALUES(perfil),
    ativo = VALUES(ativo);
