INSERT INTO usuario 
(nome_empresa, cnpj, email, senha, nivel_permissao, consumo_total, consumo_maximo)
VALUES
('Tech Solutions', '12.345.678/0001-90', 'contato@techsolutions.com', '123456', 'admin', 8500.00, 10000.00),
('Indústria Alfa', '23.456.789/0001-01', 'contato@alfa.com', '123456', 'cliente', 12000.00, 15000.00),
('Metalúrgica Beta', '34.567.890/0001-12', 'contato@beta.com', '123456', 'cliente', 6500.00, 8000.00),
('Comercial Gama', '45.678.901/0001-23', 'contato@gama.com', '123456', 'cliente', 4200.00, 6000.00),
('Logística Delta', '56.789.012/0001-34', 'contato@delta.com', '123456', 'cliente', 9800.00, 12000.00);

INSERT INTO setor
(nome_setor, descricao, consumo_geral, custo, id_usuario)
VALUES
('Produção', 'Setor responsável pela fabricação de produtos.', 3500.00, 2800.00, 1),
('Administrativo', 'Área administrativa e financeira.', 1500.00, 1200.00, 1),
('Armazenamento', 'Setor responsável pelo armazenamento de materiais.', 2000.00, 1600.00, 2),
('Manutenção', 'Área responsável pela manutenção industrial.', 2500.00, 2000.00, 3),
('Expedição', 'Setor responsável pela logística e distribuição.', 1800.00, 1440.00, 5);

INSERT INTO equipamento
(nome_equipamento, tipo, consumo_atual, consumo_minimo, consumo_maximo, status, id_setor)
VALUES
('Esteira Industrial', 'Mecânico', 1200.00, 500.00, 1500.00, 'Ativo', 1),
('Ar-condicionado', 'Climatização', 800.00, 300.00, 1000.00, 'Ativo', 2),
('Câmara Fria', 'Refrigeração', 1800.00, 1000.00, 2000.00, 'Ativo', 3),
('Compressor de Ar', 'Pneumático', 2200.00, 1000.00, 2000.00, 'Alerta', 4),
('Empilhadeira Elétrica', 'Transporte', 900.00, 400.00, 1200.00, 'Ativo', 5);

INSERT INTO pagamento
(valor, data_vencimento, data_pagamento, status, forma_pagamento, id_usuario)
VALUES
(2800.00, '2026-11-10', '2026-11-08 10:30:00', 'pago', 'PIX', 1),
(3500.00, '2026-11-15', NULL, 'nao_pago', 'Boleto', 2),
(1900.00, '2026-11-05', NULL, 'atrasado', 'Cartão de crédito', 3),
(1200.00, '2026-11-20', NULL, 'nao_pago', 'PIX', 4),
(3200.00, '2026-11-01', '2026-11-01 14:00:00', 'pago', 'Boleto', 5);