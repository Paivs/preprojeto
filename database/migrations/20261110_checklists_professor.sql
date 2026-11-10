-- Sincroniza modelos e itens de checklist nos bancos que já existem.
-- A migração pode ser reaplicada sem duplicar modelos ou itens.
USE tenken_db;
START TRANSACTION;

INSERT INTO checklist_modelos (titulo, tipo_equipamento, etapa, ativo)
SELECT dados.titulo, dados.tipo_equipamento, dados.etapa, TRUE
FROM (
    SELECT 'Inspeção de bancada elétrica — início' AS titulo, 'BANCADA' AS tipo_equipamento, 'PRE_USO' AS etapa
    UNION ALL SELECT 'Devolução de bancada elétrica', 'BANCADA', 'POS_USO'
    UNION ALL SELECT 'Inspeção de robô colaborativo — início', 'ROBO', 'PRE_USO'
    UNION ALL SELECT 'Devolução de robô colaborativo', 'ROBO', 'POS_USO'
    UNION ALL SELECT 'Inspeção de bancada de instrumentação', 'BANCADA', 'PRE_USO'
    UNION ALL SELECT 'Devolução de bancada de instrumentação', 'BANCADA', 'POS_USO'
) AS dados
WHERE NOT EXISTS (
    SELECT 1 FROM checklist_modelos cm
    WHERE cm.titulo = dados.titulo
      AND cm.tipo_equipamento = dados.tipo_equipamento
      AND cm.etapa = dados.etapa
);

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, dados.descricao, dados.critico
FROM (
    SELECT 'Inspeção de bancada elétrica — início' AS titulo, 'BANCADA' AS tipo_equipamento, 'PRE_USO' AS etapa,
           'Botão de emergência interrompe o circuito ao ser acionado' AS descricao, TRUE AS critico
    UNION ALL SELECT 'Inspeção de bancada elétrica — início', 'BANCADA', 'PRE_USO', 'Cabos e pontas de prova sem cobre exposto', TRUE
    UNION ALL SELECT 'Inspeção de bancada elétrica — início', 'BANCADA', 'PRE_USO', 'Identificação dos bornes está legível', FALSE
    UNION ALL SELECT 'Devolução de bancada elétrica', 'BANCADA', 'POS_USO', 'Bancada desligada e área organizada', TRUE
    UNION ALL SELECT 'Devolução de bancada elétrica', 'BANCADA', 'POS_USO', 'Cabos e acessórios devolvidos ao suporte', FALSE
    UNION ALL SELECT 'Inspeção de robô colaborativo — início', 'ROBO', 'PRE_USO', 'Cercamento e parada de emergência funcionando', TRUE
    UNION ALL SELECT 'Inspeção de robô colaborativo — início', 'ROBO', 'PRE_USO', 'Garra e ferramenta firmemente fixadas', TRUE
    UNION ALL SELECT 'Inspeção de robô colaborativo — início', 'ROBO', 'PRE_USO', 'Área de trabalho livre de objetos soltos', FALSE
    UNION ALL SELECT 'Devolução de robô colaborativo', 'ROBO', 'POS_USO', 'Robô estacionado e alimentação isolada', TRUE
    UNION ALL SELECT 'Devolução de robô colaborativo', 'ROBO', 'POS_USO', 'Ferramentas e gabaritos guardados', FALSE
    UNION ALL SELECT 'Inspeção de bancada de instrumentação', 'BANCADA', 'PRE_USO', 'Pontas do osciloscópio sem danos', TRUE
    UNION ALL SELECT 'Inspeção de bancada de instrumentação', 'BANCADA', 'PRE_USO', 'Multímetro e cabos conferidos', FALSE
) AS dados
JOIN checklist_modelos cm
  ON cm.titulo = dados.titulo
 AND cm.tipo_equipamento = dados.tipo_equipamento
 AND cm.etapa = dados.etapa
LEFT JOIN checklist_itens ci ON ci.modelo_id = cm.id AND ci.descricao = dados.descricao
WHERE ci.id IS NULL;

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'Proteções e tampas do painel estão instaladas e sem danos visíveis.', TRUE
FROM checklist_modelos cm
WHERE cm.titulo = 'Inspeção de bancada elétrica — início' AND cm.tipo_equipamento = 'BANCADA' AND cm.etapa = 'PRE_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'Proteções e tampas do painel estão instaladas e sem danos visíveis.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'A bancada está estável e não há peças soltas.', TRUE
FROM checklist_modelos cm
WHERE cm.titulo = 'Inspeção de bancada elétrica — início' AND cm.tipo_equipamento = 'BANCADA' AND cm.etapa = 'PRE_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'A bancada está estável e não há peças soltas.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'Não houve aquecimento, cheiro ou ruído anormal durante o uso.', TRUE
FROM checklist_modelos cm
WHERE cm.titulo = 'Devolução de bancada elétrica' AND cm.tipo_equipamento = 'BANCADA' AND cm.etapa = 'POS_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'Não houve aquecimento, cheiro ou ruído anormal durante o uso.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'Cabos, conectores e instrumentos continuam sem danos após a atividade.', TRUE
FROM checklist_modelos cm
WHERE cm.titulo = 'Devolução de bancada elétrica' AND cm.tipo_equipamento = 'BANCADA' AND cm.etapa = 'POS_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'Cabos, conectores e instrumentos continuam sem danos após a atividade.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'Componentes usados foram contabilizados; itens faltantes foram registrados.', FALSE
FROM checklist_modelos cm
WHERE cm.titulo = 'Devolução de bancada elétrica' AND cm.tipo_equipamento = 'BANCADA' AND cm.etapa = 'POS_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'Componentes usados foram contabilizados; itens faltantes foram registrados.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'Cabos, mangueiras e conexões estão sem desgaste, esmagamento ou vazamento visível.', TRUE
FROM checklist_modelos cm
WHERE cm.titulo = 'Inspeção de robô colaborativo — início' AND cm.tipo_equipamento = 'ROBO' AND cm.etapa = 'PRE_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'Cabos, mangueiras e conexões estão sem desgaste, esmagamento ou vazamento visível.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'Modo de operação e velocidade estão adequados à atividade planejada.', TRUE
FROM checklist_modelos cm
WHERE cm.titulo = 'Inspeção de robô colaborativo — início' AND cm.tipo_equipamento = 'ROBO' AND cm.etapa = 'PRE_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'Modo de operação e velocidade estão adequados à atividade planejada.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'Garra e ferramenta continuam firmes e sem danos após o uso.', TRUE
FROM checklist_modelos cm
WHERE cm.titulo = 'Devolução de robô colaborativo' AND cm.tipo_equipamento = 'ROBO' AND cm.etapa = 'POS_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'Garra e ferramenta continuam firmes e sem danos após o uso.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'Não houve colisão, parada de emergência ou comportamento inesperado durante a atividade.', TRUE
FROM checklist_modelos cm
WHERE cm.titulo = 'Devolução de robô colaborativo' AND cm.tipo_equipamento = 'ROBO' AND cm.etapa = 'POS_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'Não houve colisão, parada de emergência ou comportamento inesperado durante a atividade.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'A célula e a área de trabalho estão sem danos e sem objetos deixados para trás.', TRUE
FROM checklist_modelos cm
WHERE cm.titulo = 'Devolução de robô colaborativo' AND cm.tipo_equipamento = 'ROBO' AND cm.etapa = 'POS_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'A célula e a área de trabalho estão sem danos e sem objetos deixados para trás.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'Proteções do painel e botão de emergência estão instalados e funcionando.', TRUE
FROM checklist_modelos cm
WHERE cm.titulo = 'Inspeção de bancada de instrumentação' AND cm.tipo_equipamento = 'BANCADA' AND cm.etapa = 'PRE_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'Proteções do painel e botão de emergência estão instalados e funcionando.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'Cabos de alimentação e conexões de aterramento estão firmes e sem danos visíveis.', TRUE
FROM checklist_modelos cm
WHERE cm.titulo = 'Inspeção de bancada de instrumentação' AND cm.tipo_equipamento = 'BANCADA' AND cm.etapa = 'PRE_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'Cabos de alimentação e conexões de aterramento estão firmes e sem danos visíveis.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'Instrumentos, seletores e bornes estão identificados e ajustados para a atividade.', FALSE
FROM checklist_modelos cm
WHERE cm.titulo = 'Inspeção de bancada de instrumentação' AND cm.tipo_equipamento = 'BANCADA' AND cm.etapa = 'PRE_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'Instrumentos, seletores e bornes estão identificados e ajustados para a atividade.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'Fontes e instrumentos estão desligados antes da remoção dos cabos.', TRUE
FROM checklist_modelos cm
WHERE cm.titulo = 'Devolução de bancada de instrumentação' AND cm.tipo_equipamento = 'BANCADA' AND cm.etapa = 'POS_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'Fontes e instrumentos estão desligados antes da remoção dos cabos.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'Pontas de prova, cabos e conectores estão sem danos após a atividade.', TRUE
FROM checklist_modelos cm
WHERE cm.titulo = 'Devolução de bancada de instrumentação' AND cm.tipo_equipamento = 'BANCADA' AND cm.etapa = 'POS_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'Pontas de prova, cabos e conectores estão sem danos após a atividade.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'Não houve aquecimento, cheiro ou ruído anormal durante o uso.', TRUE
FROM checklist_modelos cm
WHERE cm.titulo = 'Devolução de bancada de instrumentação' AND cm.tipo_equipamento = 'BANCADA' AND cm.etapa = 'POS_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'Não houve aquecimento, cheiro ou ruído anormal durante o uso.'
  );

INSERT INTO checklist_itens (modelo_id, descricao, critico)
SELECT cm.id, 'Instrumentos e acessórios utilizados foram conferidos e guardados.', FALSE
FROM checklist_modelos cm
WHERE cm.titulo = 'Devolução de bancada de instrumentação' AND cm.tipo_equipamento = 'BANCADA' AND cm.etapa = 'POS_USO'
  AND NOT EXISTS (
      SELECT 1 FROM checklist_itens ci
      WHERE ci.modelo_id = cm.id AND ci.descricao = 'Instrumentos e acessórios utilizados foram conferidos e guardados.'
  );

COMMIT;
