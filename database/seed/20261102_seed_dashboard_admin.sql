-- Massa ficticia para desenvolvimento/demo do dashboard administrativo.
-- Compatível com phpMyAdmin/MySQL: somente comandos SQL, sem procedures ou DELIMITER.
-- Execute uma única vez no banco tenken_db. Usuários de demonstração não têm senha válida.
USE tenken_db;

CREATE TEMPORARY TABLE seed_demo_n (n INT NOT NULL PRIMARY KEY);
INSERT INTO seed_demo_n (n) VALUES
(1),
(2),
(3),
(4),
(5),
(6),
(7),
(8),
(9),
(10),
(11),
(12),
(13),
(14),
(15),
(16),
(17),
(18),
(19),
(20),
(21),
(22),
(23),
(24),
(25),
(26),
(27),
(28),
(29),
(30),
(31),
(32),
(33),
(34),
(35),
(36),
(37),
(38),
(39),
(40),
(41),
(42),
(43),
(44),
(45),
(46),
(47),
(48),
(49),
(50);

START TRANSACTION;

-- 50 usuários: 1 admin, 5 professores, 5 técnicos e 39 alunos.
INSERT INTO usuarios (nome, email, senha_hash, perfil, matricula, ativo, criado_em)
SELECT CONCAT('Usuario Demo ', LPAD(n, 3, '0')),
       CONCAT('demo.usuario', LPAD(n, 3, '0'), '@tenken.local'),
       '!seed-sem-login!',
       CASE WHEN n = 1 THEN 'ADMIN' WHEN n <= 6 THEN 'PROFESSOR'
            WHEN n <= 11 THEN 'TECNICO' ELSE 'ALUNO' END,
       CONCAT('DEMO-', LPAD(n, 5, '0')),
       IF(MOD(n, 13) = 0, FALSE, TRUE),
       DATE_SUB(NOW(), INTERVAL MOD(n * 3, 180) DAY)
FROM seed_demo_n;

-- 50 projetos/turmas, equipamentos e componentes.
INSERT INTO turmas_projetos (nome, professor_id, criado_em)
SELECT CONCAT('Projeto Demo ', LPAD(n, 3, '0')),
       (SELECT id FROM usuarios WHERE email = 'demo.usuario002@tenken.local'),
       DATE_SUB(NOW(), INTERVAL MOD(n, 90) DAY)
FROM seed_demo_n;

INSERT INTO equipamentos (codigo_patrimonio, nome, tipo, localizacao, status, criado_em)
SELECT CONCAT('DEMO-PAT-', LPAD(n, 4, '0')),
       CONCAT(IF(MOD(n, 2) = 0, 'Bancada didatica ', 'Robo educacional '), LPAD(n, 2, '0')),
       IF(MOD(n, 2) = 0, 'BANCADA', 'ROBO'),
       ELT(MOD(n - 1, 5) + 1, 'Laboratorio A', 'Laboratorio B', 'Oficina 1', 'Oficina 2', 'Sala de Automacao'),
       ELT(MOD(n - 1, 5) + 1, 'DISPONIVEL', 'RESERVADO', 'EM_USO', 'EM_MANUTENCAO', 'INATIVO'),
       DATE_SUB(NOW(), INTERVAL MOD(n * 2, 240) DAY)
FROM seed_demo_n;

INSERT INTO componentes (nome, categoria, quantidade_total)
SELECT ELT(MOD(n - 1, 8) + 1, 'Sensor indutivo', 'Cabo de seguranca', 'Motor servo', 'Fonte 24V', 'Controlador PLC', 'Garra robotica', 'Encoder incremental', 'Botao de emergencia'),
       ELT(MOD(n - 1, 5) + 1, 'Automacao', 'Eletrica', 'Mecanica', 'Seguranca', 'Controle'),
       5 + MOD(n * 3, 46)
FROM seed_demo_n;

-- Vincula cada ativo a um componente do catálogo.
INSERT INTO equipamento_componentes (equipamento_id, componente_id, quantidade)
SELECT e.id, MIN(c.id), 1 + MOD(s.n, 4)
FROM seed_demo_n s
JOIN equipamentos e ON e.codigo_patrimonio = CONCAT('DEMO-PAT-', LPAD(s.n, 4, '0'))
JOIN componentes c ON c.nome = ELT(MOD(s.n - 1, 8) + 1, 'Sensor indutivo', 'Cabo de seguranca', 'Motor servo', 'Fonte 24V', 'Controlador PLC', 'Garra robotica', 'Encoder incremental', 'Botao de emergencia')
GROUP BY s.n, e.id;

-- Um aluno fictício em cada turma e 50 agendamentos concluídos, cancelados ou confirmados.
INSERT INTO turma_alunos (turma_id, aluno_id)
SELECT t.id, (SELECT id FROM usuarios WHERE perfil = 'ALUNO' ORDER BY id LIMIT 1)
FROM seed_demo_n s
JOIN turmas_projetos t ON t.nome = CONCAT('Projeto Demo ', LPAD(s.n, 3, '0'));

INSERT INTO agendamentos
  (responsavel_id, equipamento_id, turma_id, inicio, fim, token_acesso, status, criado_em)
SELECT (SELECT id FROM usuarios WHERE perfil = 'ALUNO' ORDER BY id LIMIT 1),
       e.id, t.id,
       DATE_SUB(NOW(), INTERVAL (MOD(s.n * 7, 26) + 1) DAY),
       DATE_ADD(DATE_SUB(NOW(), INTERVAL (MOD(s.n * 7, 26) + 1) DAY), INTERVAL 2 HOUR),
       CONCAT('D', LPAD(s.n, 5, '0'), 'TENKEN'),
       ELT(MOD(s.n - 1, 4) + 1, 'CONCLUIDO', 'CONCLUIDO', 'CANCELADO', 'CONFIRMADO'),
       DATE_SUB(NOW(), INTERVAL (MOD(s.n * 7, 26) + 1) DAY)
FROM seed_demo_n s
JOIN equipamentos e ON e.codigo_patrimonio = CONCAT('DEMO-PAT-', LPAD(s.n, 4, '0'))
JOIN turmas_projetos t ON t.nome = CONCAT('Projeto Demo ', LPAD(s.n, 3, '0'));

-- 50 chamados com variedade de status e severidade, incluindo chamados críticos abertos.
INSERT INTO chamados_manutencao
  (equipamento_id, solicitante_id, tecnico_id, titulo, descricao, tipo, severidade, status, aberto_em, concluido_em)
SELECT e.id,
       (SELECT id FROM usuarios WHERE email = 'demo.usuario001@tenken.local'),
       (SELECT id FROM usuarios WHERE email = 'demo.usuario007@tenken.local'),
       CONCAT('Chamado demonstrativo ', LPAD(s.n, 3, '0')),
       CONCAT('Registro ficticio para demonstracao. Inspecionar o ativo ', LPAD(s.n, 2, '0'), ' e documentar o reparo.'),
       IF(MOD(s.n, 3) = 0, 'PREVENTIVO', 'CORRETIVO'),
       ELT(MOD(s.n - 1, 4) + 1, 'BAIXA', 'MEDIA', 'ALTA', 'CRITICA'),
       ELT(MOD(s.n - 1, 5) + 1, 'ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_PECAS', 'CONCLUIDO', 'CANCELADO'),
       DATE_SUB(NOW(), INTERVAL (MOD(s.n * 11, 26) + 3) DAY),
       IF(MOD(s.n - 1, 5) = 3,
          DATE_ADD(DATE_SUB(NOW(), INTERVAL (MOD(s.n * 11, 26) + 3) DAY), INTERVAL (MOD(s.n, 48) + 1) HOUR),
          NULL)
FROM seed_demo_n s
JOIN equipamentos e ON e.codigo_patrimonio = CONCAT('DEMO-PAT-', LPAD(s.n, 4, '0'));

-- 50 ocorrências recentes, para preencher o indicador dos últimos 30 dias.
INSERT INTO ocorrencias_patrimoniais (agendamento_id, componente_id, tipo, quantidade, descricao, criada_em)
SELECT a.id, c.id,
       IF(MOD(s.n, 2) = 0, 'DANO', 'EXTRAVIO'),
       1 + MOD(s.n, 3),
       CONCAT('Ocorrencia ficticia de demonstracao #', LPAD(s.n, 3, '0')),
       DATE_SUB(NOW(), INTERVAL MOD(s.n, 28) DAY)
FROM seed_demo_n s
JOIN agendamentos a ON a.token_acesso = CONCAT('D', LPAD(s.n, 5, '0'), 'TENKEN')
JOIN equipamentos e ON e.codigo_patrimonio = CONCAT('DEMO-PAT-', LPAD(s.n, 4, '0'))
JOIN equipamento_componentes ec ON ec.equipamento_id = e.id
JOIN componentes c ON c.id = ec.componente_id;

COMMIT;
DROP TEMPORARY TABLE seed_demo_n;

-- Resumo dos registros demonstrativos criados.
SELECT 'usuarios' AS entidade, COUNT(*) AS total FROM usuarios WHERE email LIKE 'demo.usuario%@tenken.local'
UNION ALL SELECT 'turmas/projetos', COUNT(*) FROM turmas_projetos WHERE nome LIKE 'Projeto Demo %'
UNION ALL SELECT 'equipamentos', COUNT(*) FROM equipamentos WHERE codigo_patrimonio LIKE 'DEMO-PAT-%'
UNION ALL SELECT 'componentes', COUNT(*) FROM componentes WHERE nome IN ('Sensor indutivo','Cabo de seguranca','Motor servo','Fonte 24V','Controlador PLC','Garra robotica','Encoder incremental','Botao de emergencia')
UNION ALL SELECT 'agendamentos', COUNT(*) FROM agendamentos WHERE token_acesso LIKE 'D%TENKEN'
UNION ALL SELECT 'chamados', COUNT(*) FROM chamados_manutencao WHERE titulo LIKE 'Chamado demonstrativo %'
UNION ALL SELECT 'ocorrencias', COUNT(*) FROM ocorrencias_patrimoniais WHERE descricao LIKE 'Ocorrencia ficticia de demonstracao #%';

