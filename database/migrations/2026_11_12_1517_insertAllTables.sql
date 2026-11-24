use db_voltHouse;

INSERT INTO usuario 
(nome_empresa, cnpj, email, senha, nivel_permissao, consumo_total, consumo_maximo)
VALUES
('Volt House', '12.345.678/0001-90', 'admin@volthouse.com', '123456', 'admin', 8500.00, 10000.00),
('Comércio de Alimentos Silva S.A.', '98.765.432/0001-10', 'financeiro@alimentos-silva.com.br', '123456', 'cliente', 12000.00, 15000.00),
('Logística & Transportes Rápido', '45.678.912/0001-34', 'atendimento@lograpido.com.br', '123456', 'cliente', 6500.00, 8000.00),
('Comercial Gama', '45.678.901/0001-23', 'contato@gama.com', '123456', 'cliente', 4200.00, 6000.00),
('Boutique Moda & Estilo', '33.111.222/0001-55', 'admin@modaeestilo.com', '123456', 'cliente', 9800.00, 12000.00),
('Indústria Metalúrgica Oliveira', '11.222.333/0001-44', 'contato@metalurgicaoliveira.com.br', '123456', 'cliente', 7800.00, 10000.00),
('Supermercado Bom Preço', '22.333.444/0001-55', 'admin@bompreco.com.br', '123456', 'cliente', 13500.00, 16000.00),
('Construtora Horizonte', '33.444.555/0001-66', 'contato@horizonte.com.br', '123456', 'cliente', 9200.00, 12000.00),
('Hospital São Lucas', '44.555.666/0001-77', 'administracao@saolucas.com.br', '123456', 'cliente', 14500.00, 18000.00),
('Tecnologia Digital Plus', '55.666.777/0001-88', 'suporte@digitalplus.com.br', '123456', 'cliente', 5600.00, 8000.00),
('Indústria Têxtil Carvalho', '66.777.888/0001-99', 'contato@textilcarvalho.com.br', '123456', 'cliente', 11000.00, 14000.00),
('Padaria Pão Dourado', '77.888.999/0001-00', 'administracao@paodourado.com.br', '123456', 'cliente', 4800.00, 6500.00),
('Auto Peças Nacional', '88.999.000/0001-11', 'vendas@autopecasnacional.com.br', '123456', 'cliente', 6900.00, 9000.00),
('Farmácia Vida Saudável', '99.000.111/0001-22', 'contato@vidas saudavel.com.br', '123456', 'cliente', 3900.00, 5500.00),
('Distribuidora Central', '10.111.222/0001-33', 'financeiro@distribuidoracentral.com.br', '123456', 'cliente', 8700.00, 11000.00);

SELECT * FROM usuario;


INSERT INTO setor
(nome_setor, descricao, consumo_geral, custo, id_usuario)
VALUES
('Produção', 'Setor responsável pela fabricação de produtos.', 3500.00, 2800.00, 1),
('Administrativo', 'Área administrativa e financeira.', 1500.00, 1200.00, 1),
('Armazenamento', 'Setor responsável pelo armazenamento de materiais.', 2000.00, 1600.00, 2),
('Manutenção', 'Área responsável pela manutenção industrial.', 2500.00, 2000.00, 3),
('Expedição', 'Setor responsável pela logística e distribuição.', 1800.00, 1440.00, 5),
('Fundição', 'Área responsável pelos processos de fundição de metais.', 3200.00, 2560.00, 6),
('Refrigeração', 'Setor responsável pelos sistemas de refrigeração.', 2800.00, 2240.00, 7),
('Engenharia', 'Área de projetos e desenvolvimento de construções.', 2100.00, 1680.00, 8),
('Centro Cirúrgico', 'Área destinada aos procedimentos hospitalares.', 4500.00, 3600.00, 9),
('Servidores', 'Setor responsável pela infraestrutura tecnológica.', 1800.00, 1440.00, 10),
('Confecção', 'Área responsável pela produção de peças de vestuário.', 3900.00, 3120.00, 11),
('Forno e Produção', 'Área de fabricação e preparação de alimentos.', 2500.00, 2000.00, 12),
('Oficina', 'Área de manutenção e reparação automotiva.', 1900.00, 1520.00, 13),
('Atendimento', 'Área de atendimento e armazenamento de medicamentos.', 1300.00, 1040.00, 14),
('Estoque', 'Área de armazenamento e distribuição de mercadorias.', 2700.00, 2160.00, 15);


SELECT * FROM setor;

INSERT INTO equipamento
(nome_equipamento, tipo, consumo_minimo, consumo_maximo, status, id_setor)
VALUES
('Esteira Industrial', 'Mecânico', 500.00, 1500.00, 'Ativo', 1),
('Ar-condicionado', 'Climatização', 300.00, 1000.00, 'Ativo', 2),
('Câmara Fria', 'Refrigeração', 1000.00, 2000.00, 'Ativo', 3),
('Compressor de Ar', 'Pneumático', 1000.00, 2000.00, 'Alerta', 4),
('Empilhadeira Elétrica', 'Transporte', 400.00, 1200.00, 'Ativo', 5),
('Forno Industrial', 'Aquecimento', 800.00, 1800.00, 'Ativo', 6),
('Sistema de Refrigeração', 'Climatização', 500.00, 1500.00, 'Ativo', 7),
('Elevador de Carga', 'Transporte', 400.00, 1200.00, 'Ativo', 8),
('Gerador Hospitalar', 'Energia', 1000.00, 2500.00, 'Ativo', 9),
('Servidor Principal', 'Tecnologia', 300.00, 900.00, 'Alerta', 10),
('Máquina de Costura Industrial', 'Produção', 200.00, 700.00, 'Ativo', 11),
('Forno Elétrico', 'Aquecimento', 600.00, 1400.00, 'Ativo', 12),
('Elevador Automotivo', 'Mecânico', 350.00, 850.00, 'Inativo', 13),
('Câmara Refrigerada', 'Refrigeração', 400.00, 1100.00, 'Ativo', 14),
('Esteira Transportadora', 'Transporte', 500.00, 1300.00, 'Alerta', 15);

SELECT * FROM equipamento;


INSERT INTO pagamento
(valor, data_vencimento, data_pagamento, status, forma_pagamento, id_usuario)
VALUES
(2800.00, '2026-11-10', '2026-11-08 10:30:00', 'pago', 'PIX', 1),
(3500.00, '2026-11-15', NULL, 'nao_pago', 'Boleto', 2),
(1900.00, '2026-11-05', NULL, 'atrasado', 'Cartão de crédito', 3),
(1200.00, '2026-11-20', NULL, 'nao_pago', 'PIX', 4),
(3200.00, '2026-11-01', '2026-11-01 14:00:00', 'pago', 'Boleto', 5),
(2600.00, '2026-11-12', '2026-11-10 09:15:00', 'pago', 'PIX', 6),
(4100.00, '2026-11-18', NULL, 'nao_pago', 'Boleto', 7),
(3200.00, '2026-11-08', NULL, 'atrasado', 'Cartão de crédito', 8),
(5300.00, '2026-11-22', NULL, 'nao_pago', 'PIX', 9),
(1800.00, '2026-11-05', '2026-11-04 16:30:00', 'pago', 'Boleto', 10),
(3900.00, '2026-11-25', NULL, 'nao_pago', 'PIX', 11),
(1500.00, '2026-11-03', NULL, 'atrasado', 'Boleto', 12),
(2800.00, '2026-11-15', '2026-11-14 11:00:00', 'pago', 'Cartão de crédito', 13),
(2100.00, '2026-11-28', NULL, 'nao_pago', 'PIX', 14),
(3400.00, '2026-11-01', NULL, 'atrasado', 'Boleto', 15);

SELECT * FROM pagamento;