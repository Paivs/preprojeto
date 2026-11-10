-- Seed integrada de desenvolvimento para o Tenken (MySQL/XAMPP).
-- Execute em banco de desenvolvimento com database/init/02-schema.sql aplicado.
-- Os dados usam identificadores próprios; execute uma única vez em banco limpo
-- ou remova previamente os registros deste conjunto antes de executar novamente.
-- Contas: admin.seed@tenken.local / TenkenAdmin123!
--         prof.seed@tenken.local / TenkenProf123!
--         tecnico.seed@tenken.local / TenkenTec123!
-- Alunos: matriculas ALU-SEED-001 a 003; defina senha pelo fluxo de cadastro.
USE tenken_db;
SET NAMES utf8mb4;
START TRANSACTION;

-- Usuários fictícios com perfis para testar administração, docência, manutenção e uso.
INSERT INTO usuarios (nome,email,senha_hash,perfil,matricula,ativo,criado_em) VALUES
('Mariana Costa','admin.seed@tenken.local','$2b$12$iwqmGJla4dFZfYgg7/bSMu.ZcV7qdvjPSh2lfYsLiXjHJdyw514O.','ADMIN','ADM-SEED-001',1,'2026-08-04 09:15:00'),
('Prof. Rafael Nogueira','prof.seed@tenken.local','$2b$12$jyjvfEI.YITI/LINRTOJsOs1nkYeNpEtK6wcg2LND660tlxFOcsMy','PROFESSOR','PROF-SEED-001',1,'2026-08-05 08:30:00'),
('João Pedro Almeida','aluno1.seed@tenken.local','!cadastro-pendente-seed!','ALUNO','ALU-SEED-001',1,'2026-08-12 14:10:00'),
('Lívia Martins','aluno2.seed@tenken.local','!cadastro-pendente-seed!','ALUNO','ALU-SEED-002',1,'2026-08-12 14:12:00'),
('Caio Henrique Souza','aluno3.seed@tenken.local','!cadastro-pendente-seed!','ALUNO','ALU-SEED-003',1,'2026-08-12 14:18:00'),
('André Luiz Ferreira','tecnico.seed@tenken.local','$2b$12$/kayYDxtJJWMnkSxYsgro.EIryaJa3hz9OWp2mFxPYgjEEs1L0sC.','TECNICO','TEC-SEED-001',1,'2026-08-06 07:50:00');

INSERT INTO pre_matriculas_alunos (nome,email,cpf,telefone,matricula,utilizada,criado_em) VALUES
('João Pedro Almeida','aluno1.seed@tenken.local','529.982.247-25','(11) 98765-4321','ALU-SEED-001',1,'2026-08-12 14:10:00'),
('Lívia Martins','aluno2.seed@tenken.local','111.444.777-35','(11) 97654-3210','ALU-SEED-002',1,'2026-08-12 14:12:00'),
('Caio Henrique Souza','aluno3.seed@tenken.local','935.411.347-80','(11) 96543-2109','ALU-SEED-003',1,'2026-08-12 14:18:00'),
('Beatriz Ramos','bia.ramos.seed@tenken.local','168.995.350-09','(11) 95432-1098','ALU-SEED-004',0,'2026-09-02 10:00:00'),
('Pedro Azevedo','pedro.azevedo.seed@tenken.local','012.345.678-90','(11) 94321-0987','ALU-SEED-005',0,'2026-09-02 10:05:00');

INSERT INTO turmas_projetos (nome,professor_id,criado_em) VALUES
('Automação Industrial — Turma A', (SELECT id FROM usuarios WHERE email='prof.seed@tenken.local'),'2026-08-10 08:00:00'),
('Robótica Aplicada — Projeto de Extensão', (SELECT id FROM usuarios WHERE email='prof.seed@tenken.local'),'2026-08-11 13:30:00');
INSERT INTO turma_alunos (turma_id,aluno_id) VALUES
((SELECT id FROM turmas_projetos WHERE nome='Automação Industrial — Turma A'),(SELECT id FROM usuarios WHERE email='aluno1.seed@tenken.local')),
((SELECT id FROM turmas_projetos WHERE nome='Automação Industrial — Turma A'),(SELECT id FROM usuarios WHERE email='aluno2.seed@tenken.local')),
((SELECT id FROM turmas_projetos WHERE nome='Automação Industrial — Turma A'),(SELECT id FROM usuarios WHERE email='aluno3.seed@tenken.local')),
((SELECT id FROM turmas_projetos WHERE nome='Robótica Aplicada — Projeto de Extensão'),(SELECT id FROM usuarios WHERE email='aluno1.seed@tenken.local')),
((SELECT id FROM turmas_projetos WHERE nome='Robótica Aplicada — Projeto de Extensão'),(SELECT id FROM usuarios WHERE email='aluno3.seed@tenken.local'));

INSERT INTO equipamentos (codigo_patrimonio,nome,tipo,localizacao,status,criado_em) VALUES
('TEN-LAB-BAN-014','Bancada didática de comandos elétricos','BANCADA','Laboratório de Automação — bancada 4','DISPONIVEL','2025-02-14 10:00:00'),
('TEN-LAB-BAN-021','Bancada CLP Siemens S7-1200','BANCADA','Laboratório de Automação — bancada 7','DISPONIVEL','2025-03-20 09:00:00'),
('TEN-LAB-ROB-006','Braço robótico colaborativo UR3e','ROBO','Laboratório de Robótica — célula 2','DISPONIVEL','2025-05-07 11:30:00'),
('TEN-LAB-ROB-011','Robô móvel de inspeção Rover-02','ROBO','Oficina de Prototipagem — área cercada','EM_MANUTENCAO','2025-06-18 15:00:00'),
('TEN-LAB-BAN-033','Bancada de instrumentação e sensores','BANCADA','Laboratório de Instrumentação — bancada 2','DISPONIVEL','2025-08-01 08:45:00');
INSERT INTO componentes (nome,categoria,quantidade_total) VALUES
('Sensor indutivo M12','Sensoriamento',12),('Cabo de segurança 4 mm','Segurança elétrica',20),('Servo motor 400 W','Acionamento',6),('Fonte chaveada 24 V / 10 A','Alimentação',8),('Controlador lógico S7-1200','Controle',5),('Garra paralela de dois dedos','Robótica',4),('Encoder incremental 1024 PPR','Instrumentação',7),('Botão de emergência com trava','Segurança',10);
INSERT INTO equipamento_componentes (equipamento_id,componente_id,quantidade)
SELECT e.id,c.id,x.q FROM (
 SELECT 'TEN-LAB-BAN-014' p,'Sensor indutivo M12' c,2 q UNION ALL SELECT 'TEN-LAB-BAN-014','Botão de emergência com trava',1 UNION ALL
 SELECT 'TEN-LAB-BAN-021','Controlador lógico S7-1200',1 UNION ALL SELECT 'TEN-LAB-BAN-021','Fonte chaveada 24 V / 10 A',1 UNION ALL
 SELECT 'TEN-LAB-ROB-006','Servo motor 400 W',3 UNION ALL SELECT 'TEN-LAB-ROB-006','Garra paralela de dois dedos',1 UNION ALL
 SELECT 'TEN-LAB-ROB-011','Encoder incremental 1024 PPR',2 UNION ALL SELECT 'TEN-LAB-ROB-011','Cabo de segurança 4 mm',2 UNION ALL
 SELECT 'TEN-LAB-BAN-033','Fonte chaveada 24 V / 10 A',1 UNION ALL SELECT 'TEN-LAB-BAN-033','Sensor indutivo M12',3
) x JOIN equipamentos e ON e.codigo_patrimonio=x.p JOIN componentes c ON c.nome=x.c;

INSERT INTO agendamentos (responsavel_id,equipamento_id,turma_id,inicio,fim,token_acesso,status,criado_em) VALUES
((SELECT id FROM usuarios WHERE email='aluno1.seed@tenken.local'),(SELECT id FROM equipamentos WHERE codigo_patrimonio='TEN-LAB-BAN-014'),(SELECT id FROM turmas_projetos WHERE nome='Automação Industrial — Turma A'),'2026-11-03 09:00:00','2026-11-03 11:00:00','SEED-AUT-0301','CONCLUIDO','2026-10-28 16:20:00'),
((SELECT id FROM usuarios WHERE email='aluno2.seed@tenken.local'),(SELECT id FROM equipamentos WHERE codigo_patrimonio='TEN-LAB-BAN-021'),(SELECT id FROM turmas_projetos WHERE nome='Automação Industrial — Turma A'),'2026-11-10 13:00:00','2026-11-10 15:00:00','SEED-AUT-1002','CONFIRMADO','2026-11-01 10:15:00'),
((SELECT id FROM usuarios WHERE email='aluno3.seed@tenken.local'),(SELECT id FROM equipamentos WHERE codigo_patrimonio='TEN-LAB-ROB-006'),(SELECT id FROM turmas_projetos WHERE nome='Robótica Aplicada — Projeto de Extensão'),'2026-11-12 14:00:00','2026-11-12 16:00:00','SEED-ROB-1203','CONFIRMADO','2026-11-02 09:40:00'),
((SELECT id FROM usuarios WHERE email='aluno1.seed@tenken.local'),(SELECT id FROM equipamentos WHERE codigo_patrimonio='TEN-LAB-BAN-033'),(SELECT id FROM turmas_projetos WHERE nome='Automação Industrial — Turma A'),'2026-10-29 08:00:00','2026-10-29 10:00:00','SEED-INS-2904','CONCLUIDO','2026-10-20 14:00:00'),
((SELECT id FROM usuarios WHERE email='aluno3.seed@tenken.local'),(SELECT id FROM equipamentos WHERE codigo_patrimonio='TEN-LAB-ROB-011'),(SELECT id FROM turmas_projetos WHERE nome='Robótica Aplicada — Projeto de Extensão'),'2026-11-05 10:00:00','2026-11-05 12:00:00','SEED-ROB-0505','CANCELADO','2026-10-25 12:30:00');
INSERT INTO checkins (agendamento_id,aluno_id,realizado_em) VALUES
((SELECT id FROM agendamentos WHERE token_acesso='SEED-AUT-0301'),(SELECT id FROM usuarios WHERE email='aluno1.seed@tenken.local'),'2026-11-03 08:55:00'),
((SELECT id FROM agendamentos WHERE token_acesso='SEED-AUT-0301'),(SELECT id FROM usuarios WHERE email='aluno2.seed@tenken.local'),'2026-11-03 08:58:00'),
((SELECT id FROM agendamentos WHERE token_acesso='SEED-INS-2904'),(SELECT id FROM usuarios WHERE email='aluno1.seed@tenken.local'),'2026-10-29 07:54:00');

INSERT INTO inspecoes (agendamento_id,modelo_id,professor_id,etapa,resultado,observacoes,realizada_em) VALUES
((SELECT id FROM agendamentos WHERE token_acesso='SEED-AUT-0301'),(SELECT id FROM checklist_modelos WHERE titulo='Inspeção de bancada — pré-uso'),(SELECT id FROM usuarios WHERE email='prof.seed@tenken.local'),'PRE_USO','APROVADO','Bancada liberada após conferência dos cabos e teste do botão de emergência.','2026-11-03 08:50:00'),
((SELECT id FROM agendamentos WHERE token_acesso='SEED-AUT-0301'),(SELECT id FROM checklist_modelos WHERE titulo='Inspeção de bancada — pós-uso'),(SELECT id FROM usuarios WHERE email='prof.seed@tenken.local'),'POS_USO','APROVADO_COM_RESSALVAS','Um cabo banana amarelo apresentou folga no conector; separado para avaliação.','2026-11-03 11:05:00'),
((SELECT id FROM agendamentos WHERE token_acesso='SEED-INS-2904'),(SELECT id FROM checklist_modelos WHERE titulo='Inspeção de bancada — pré-uso'),(SELECT id FROM usuarios WHERE email='prof.seed@tenken.local'),'PRE_USO','REPROVADO','Ponta de prova do canal 2 com isolamento rompido. Equipamento não foi utilizado.','2026-10-29 07:50:00');
INSERT INTO inspecao_respostas (inspecao_id,item_id,conforme,observacao) VALUES
((SELECT i.id FROM inspecoes i JOIN agendamentos a ON a.id=i.agendamento_id WHERE a.token_acesso='SEED-AUT-0301' AND i.etapa='PRE_USO'),(SELECT id FROM checklist_itens WHERE descricao='Botão de emergência interrompe o circuito ao ser acionado'),1,'Teste realizado antes da energização.'),
((SELECT i.id FROM inspecoes i JOIN agendamentos a ON a.id=i.agendamento_id WHERE a.token_acesso='SEED-AUT-0301' AND i.etapa='PRE_USO'),(SELECT id FROM checklist_itens WHERE descricao='Cabos e pontas de prova sem cobre exposto'),1,NULL),
((SELECT i.id FROM inspecoes i JOIN agendamentos a ON a.id=i.agendamento_id WHERE a.token_acesso='SEED-AUT-0301' AND i.etapa='PRE_USO'),(SELECT id FROM checklist_itens WHERE descricao='Bornes, seletores e instrumentos estão identificados e funcionando'),1,NULL),
((SELECT i.id FROM inspecoes i JOIN agendamentos a ON a.id=i.agendamento_id WHERE a.token_acesso='SEED-INS-2904' AND i.etapa='PRE_USO'),(SELECT id FROM checklist_itens WHERE descricao='Cabos e pontas de prova sem cobre exposto'),0,'Isolamento aberto próximo à ponta; acessório etiquetado e retirado de uso.'),
((SELECT i.id FROM inspecoes i JOIN agendamentos a ON a.id=i.agendamento_id WHERE a.token_acesso='SEED-INS-2904' AND i.etapa='PRE_USO'),(SELECT id FROM checklist_itens WHERE descricao='Bornes, seletores e instrumentos estão identificados e funcionando'),1,'Multímetro aprovado no autoteste.');
INSERT INTO inspecao_componentes (inspecao_id,componente_id,quantidade_esperada,quantidade_encontrada,quantidade_danificada) VALUES
((SELECT i.id FROM inspecoes i JOIN agendamentos a ON a.id=i.agendamento_id WHERE a.token_acesso='SEED-AUT-0301' AND i.etapa='POS_USO'),(SELECT id FROM componentes WHERE nome='Sensor indutivo M12'),2,2,0),
((SELECT i.id FROM inspecoes i JOIN agendamentos a ON a.id=i.agendamento_id WHERE a.token_acesso='SEED-AUT-0301' AND i.etapa='POS_USO'),(SELECT id FROM componentes WHERE nome='Botão de emergência com trava'),1,1,0);

INSERT INTO ocorrencias_patrimoniais (agendamento_id,componente_id,tipo,quantidade,descricao,criada_em) VALUES
((SELECT id FROM agendamentos WHERE token_acesso='SEED-AUT-0301'),(SELECT id FROM componentes WHERE nome='Cabo de segurança 4 mm'),'DANO',1,'Cabo banana amarelo com folga intermitente no conector; isolado em saco identificado para avaliação técnica.','2026-11-03 11:06:00'),
((SELECT id FROM agendamentos WHERE token_acesso='SEED-INS-2904'),(SELECT id FROM componentes WHERE nome='Sensor indutivo M12'),'DANO',1,'Ponta de prova danificada encontrada durante a inspeção antes da aula; registro associado ao ativo para rastreabilidade.','2026-10-29 07:51:00');
INSERT INTO chamados_manutencao (equipamento_id,inspecao_id,solicitante_id,tecnico_id,titulo,descricao,tipo,severidade,status,aberto_em) VALUES
((SELECT id FROM equipamentos WHERE codigo_patrimonio='TEN-LAB-BAN-033'),(SELECT i.id FROM inspecoes i JOIN agendamentos a ON a.id=i.agendamento_id WHERE a.token_acesso='SEED-INS-2904' AND i.etapa='PRE_USO'),(SELECT id FROM usuarios WHERE email='prof.seed@tenken.local'),(SELECT id FROM usuarios WHERE email='tecnico.seed@tenken.local'),'Substituir ponta de prova com isolamento rompido','Na verificação prévia da aula, a ponta do canal 2 apresentou cobre exposto junto ao corpo. O conjunto foi etiquetado, guardado no armário de não conformes e a bancada permaneceu bloqueada até substituição.','CORRETIVO','ALTA','EM_ATENDIMENTO','2026-10-29 08:05:00'),
((SELECT id FROM equipamentos WHERE codigo_patrimonio='TEN-LAB-ROB-011'),NULL,(SELECT id FROM usuarios WHERE email='admin.seed@tenken.local'),(SELECT id FROM usuarios WHERE email='tecnico.seed@tenken.local'),'Investigar falha intermitente no encoder do Rover-02','Durante a calibração de deslocamento, o encoder perde pulsos após cerca de dez minutos. Verificar acoplamento, chicote e ruído na alimentação antes de liberar o robô móvel.','CORRETIVO','MEDIA','AGUARDANDO_PECAS','2026-11-04 15:20:00'),
((SELECT id FROM equipamentos WHERE codigo_patrimonio='TEN-LAB-BAN-014'),NULL,(SELECT id FROM usuarios WHERE email='prof.seed@tenken.local'),(SELECT id FROM usuarios WHERE email='tecnico.seed@tenken.local'),'Reaperto preventivo dos bornes da bancada 4','Revisão programada após o fechamento do módulo de comandos elétricos. Conferir torque, limpeza e identificação dos bornes sem retirar a bancada de circulação antes da janela combinada.','PREVENTIVO','BAIXA','ABERTO','2026-11-06 09:00:00');
INSERT INTO historico_manutencao (chamado_id,tecnico_id,descricao,pecas_trocadas,custo,registrado_em) VALUES
((SELECT id FROM chamados_manutencao WHERE titulo='Substituir ponta de prova com isolamento rompido'),(SELECT id FROM usuarios WHERE email='tecnico.seed@tenken.local'),'Inspeção confirmou ruptura do isolamento a 4 cm da ponta. Solicitada substituição do par para manter os canais identificados e calibrados.','Par de pontas de prova CAT III 1000 V — solicitado ao almoxarifado',86.50,'2026-10-29 09:10:00'),
((SELECT id FROM chamados_manutencao WHERE titulo='Investigar falha intermitente no encoder do Rover-02'),(SELECT id FROM usuarios WHERE email='tecnico.seed@tenken.local'),'Conector do chicote limpo e teste repetido; falha persistiu. Medida resistência fora da tolerância, aguardando encoder compatível.','Encoder incremental 1024 PPR — aguardando peça',0.00,'2026-11-05 10:30:00');
INSERT INTO ordens_servico (chamado_id,numero,emitida_por,status,emitida_em) VALUES
((SELECT id FROM chamados_manutencao WHERE titulo='Substituir ponta de prova com isolamento rompido'),'OS-2026-00481',(SELECT id FROM usuarios WHERE email='admin.seed@tenken.local'),'EM_EXECUCAO','2026-10-29 08:20:00'),
((SELECT id FROM chamados_manutencao WHERE titulo='Investigar falha intermitente no encoder do Rover-02'),'OS-2026-00492',(SELECT id FROM usuarios WHERE email='admin.seed@tenken.local'),'EMITIDA','2026-11-05 11:00:00');
INSERT INTO notificacoes (usuario_id,chamado_id,mensagem,lida,criada_em) VALUES
((SELECT id FROM usuarios WHERE email='prof.seed@tenken.local'),(SELECT id FROM chamados_manutencao WHERE titulo='Substituir ponta de prova com isolamento rompido'),'Chamado de severidade alta aberto para a bancada de instrumentação. A atividade foi bloqueada até troca do acessório.',0,'2026-10-29 08:06:00'),
((SELECT id FROM usuarios WHERE email='tecnico.seed@tenken.local'),(SELECT id FROM chamados_manutencao WHERE titulo='Investigar falha intermitente no encoder do Rover-02'),'A ordem OS-2026-00492 foi emitida. O Rover-02 aguarda encoder compatível no almoxarifado.',0,'2026-11-05 11:01:00'),
((SELECT id FROM usuarios WHERE email='admin.seed@tenken.local'),(SELECT id FROM chamados_manutencao WHERE titulo='Substituir ponta de prova com isolamento rompido'),'Acompanhamento: substituição de pontas de prova solicitada ao almoxarifado.',1,'2026-10-30 09:00:00');
INSERT INTO resultados_testes (agendamento_id,usuario_id,titulo,relatorio,enviado_em) VALUES
((SELECT id FROM agendamentos WHERE token_acesso='SEED-AUT-0301'),(SELECT id FROM usuarios WHERE email='aluno1.seed@tenken.local'),'Partida direta com selo elétrico','Montamos o circuito de partida direta do motor trifásico e verificamos o selo pelo contato auxiliar do contator. A parada de emergência interrompeu o comando nos três ensaios. Registramos corrente de 1,8 A em vazio e identificamos que o cabo amarelo apresentava contato instável ao movimentar o conector.', '2026-11-03 11:18:00'),
((SELECT id FROM agendamentos WHERE token_acesso='SEED-INS-2904'),(SELECT id FROM usuarios WHERE email='aluno1.seed@tenken.local'),'Aula de instrumentação — inspeção interrompida','A inspeção inicial encontrou uma ponta de prova com isolamento rompido. Não energizamos a bancada. O professor registrou a condição e encaminhou o acessório para manutenção; retomaremos a prática após a reposição.', '2026-10-29 08:02:00');

COMMIT;

-- Resumo para conferência após execução.
SELECT 'usuarios' entidade,COUNT(*) total FROM usuarios WHERE email LIKE '%.seed@tenken.local'
UNION ALL SELECT 'equipamentos',COUNT(*) FROM equipamentos WHERE codigo_patrimonio LIKE 'TEN-LAB-%'
UNION ALL SELECT 'agendamentos',COUNT(*) FROM agendamentos WHERE token_acesso LIKE 'SEED-%'
UNION ALL SELECT 'inspecoes',COUNT(*) FROM inspecoes WHERE observacoes LIKE '%bancada%' OR observacoes LIKE '%Ponta%'
UNION ALL SELECT 'chamados',COUNT(*) FROM chamados_manutencao WHERE titulo IN ('Substituir ponta de prova com isolamento rompido','Investigar falha intermitente no encoder do Rover-02','Reaperto preventivo dos bornes da bancada 4');
