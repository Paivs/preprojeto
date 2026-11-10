-- Unifica os checklists de bancada elétrica e instrumentação.
-- Mantém os modelos antigos inativos para preservar inspeções já registradas.
-- Pode ser reaplicada sem duplicar os modelos ou itens.
USE tenken_db;
START TRANSACTION;

UPDATE checklist_modelos
SET ativo = FALSE
WHERE tipo_equipamento = 'BANCADA';

INSERT INTO checklist_modelos (titulo, tipo_equipamento, etapa, ativo)
SELECT dados.titulo, 'BANCADA', dados.etapa, TRUE
FROM (
    SELECT 'Inspeção de bancada — pré-uso' AS titulo, 'PRE_USO' AS etapa
    UNION ALL SELECT 'Inspeção de bancada — pós-uso', 'POS_USO'
) AS dados
WHERE NOT EXISTS (
    SELECT 1 FROM checklist_modelos cm
    WHERE cm.titulo = dados.titulo
      AND cm.tipo_equipamento = 'BANCADA'
      AND cm.etapa = dados.etapa
);

UPDATE checklist_modelos
SET ativo = TRUE
WHERE tipo_equipamento = 'BANCADA'
  AND titulo IN ('Inspeção de bancada — pré-uso', 'Inspeção de bancada — pós-uso');

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, dados.descricao, dados.critico
FROM (
    SELECT 'Inspeção de bancada — pré-uso' AS titulo, 'BANCADA' AS tipo_equipamento, 'PRE_USO' AS etapa,
           'Botão de emergência interrompe o circuito ao ser acionado' AS descricao, TRUE AS critico
    UNION ALL SELECT 'Inspeção de bancada — pré-uso', 'BANCADA', 'PRE_USO', 'Cabos e pontas de prova sem cobre exposto', TRUE
    UNION ALL SELECT 'Inspeção de bancada — pré-uso', 'BANCADA', 'PRE_USO', 'Bornes, seletores e instrumentos estão identificados e funcionando', FALSE
    UNION ALL SELECT 'Inspeção de bancada — pré-uso', 'BANCADA', 'PRE_USO', 'Proteções e tampas do painel estão instaladas e sem danos visíveis', TRUE
    UNION ALL SELECT 'Inspeção de bancada — pré-uso', 'BANCADA', 'PRE_USO', 'A bancada está estável e não há peças soltas', TRUE
    UNION ALL SELECT 'Inspeção de bancada — pós-uso', 'BANCADA', 'POS_USO', 'Bancada, fontes e instrumentos desligados; área organizada e segura', TRUE
    UNION ALL SELECT 'Inspeção de bancada — pós-uso', 'BANCADA', 'POS_USO', 'Cabos e acessórios devolvidos ao suporte', FALSE
    UNION ALL SELECT 'Inspeção de bancada — pós-uso', 'BANCADA', 'POS_USO', 'Não houve aquecimento, cheiro ou ruído anormal durante o uso', TRUE
    UNION ALL SELECT 'Inspeção de bancada — pós-uso', 'BANCADA', 'POS_USO', 'Cabos, conectores e instrumentos continuam sem danos após a atividade', TRUE
    UNION ALL SELECT 'Inspeção de bancada — pós-uso', 'BANCADA', 'POS_USO', 'Componentes usados foram contabilizados; itens faltantes foram registrados', FALSE
    UNION ALL SELECT 'Inspeção de robô colaborativo — início', 'ROBO', 'PRE_USO', 'Cabos, mangueiras e conexões estão sem desgaste, esmagamento ou vazamento visível.', TRUE
    UNION ALL SELECT 'Inspeção de robô colaborativo — início', 'ROBO', 'PRE_USO', 'Modo de operação e velocidade estão adequados à atividade planejada.', TRUE
    UNION ALL SELECT 'Devolução de robô colaborativo', 'ROBO', 'POS_USO', 'Garra e ferramenta continuam firmes e sem danos após o uso.', TRUE
    UNION ALL SELECT 'Devolução de robô colaborativo', 'ROBO', 'POS_USO', 'Não houve colisão, parada de emergência ou comportamento inesperado durante a atividade.', TRUE
    UNION ALL SELECT 'Devolução de robô colaborativo', 'ROBO', 'POS_USO', 'A célula e a área de trabalho estão sem danos e sem objetos deixados para trás.', TRUE
) AS dados
JOIN checklist_modelos cm
  ON cm.titulo = dados.titulo
 AND cm.tipo_equipamento = dados.tipo_equipamento
 AND cm.etapa = dados.etapa
LEFT JOIN checklist_itens ci
  ON ci.modelo_id = cm.id
 AND ci.descricao = dados.descricao
WHERE ci.id IS NULL;

COMMIT;
