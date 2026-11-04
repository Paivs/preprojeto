-- =====================================================================
--  PredictMaint · Mantech Solutions
--  ESTRUTURA DO BANCO DE DADOS (MySQL 8+ / MariaDB 10.6+)
--
--  Ordem de execução:
--    1) schema.sql  -> cria o banco e as tabelas (este arquivo)
--    2) seed.sql    -> insere os dados de demonstração
--
--  Todas as datas do seed são relativas a NOW(), então a demonstração
--  continua "atual" no dia em que você rodar o script.
-- =====================================================================

DROP DATABASE IF EXISTS predictmaint;
CREATE DATABASE predictmaint CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE predictmaint;

-- ---------------------------------------------------------------------
-- USUÁRIOS E PERFIS
-- Um usuário pode ter mais de um perfil (ex.: o admin é gestor e técnico).
-- No login, ele escolhe com qual perfil quer entrar.
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(120) NOT NULL,
  email       VARCHAR(160) NOT NULL UNIQUE,
  matricula   VARCHAR(30)  NOT NULL UNIQUE,
  senha_hash  VARCHAR(100) NOT NULL,              -- hash bcrypt, nunca a senha pura
  setor       VARCHAR(60)  NULL,                  -- setor do funcionário (chão de fábrica)
  ativo       TINYINT(1)   NOT NULL DEFAULT 1,
  criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuario_perfis (
  usuario_id  INT NOT NULL,
  perfil      ENUM('gestor', 'tecnico', 'funcionario') NOT NULL,
  PRIMARY KEY (usuario_id, perfil),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Pedidos de "Esqueci a senha" (o administrador atende manualmente)
CREATE TABLE pedidos_senha (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  usuario_informado   VARCHAR(160) NOT NULL,      -- o que a pessoa digitou
  usuario_id          INT NULL,                   -- preenchido se o usuário existir
  atendido            TINYINT(1) NOT NULL DEFAULT 0,
  criado_em           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- EQUIPES E SETORES
-- ---------------------------------------------------------------------
CREATE TABLE equipes (
  nome  VARCHAR(60) PRIMARY KEY
);

-- Cada setor guarda a "base de custos" usada no orçamento manutenciário.
CREATE TABLE setores (
  nome            VARCHAR(60) PRIMARY KEY,
  equipe_padrao   VARCHAR(60)  NOT NULL,          -- equipe sugerida para novas OS
  tecnicos        INT          NOT NULL DEFAULT 2,
  horas           DECIMAL(6,1) NOT NULL DEFAULT 4,    -- horas de trabalho de uma intervenção
  horas_parada    DECIMAL(6,1) NOT NULL DEFAULT 3,    -- horas de máquina parada
  valor_hora      DECIMAL(10,2) NOT NULL DEFAULT 85,  -- valor da hora do técnico (R$)
  FOREIGN KEY (equipe_padrao) REFERENCES equipes(nome)
);

-- Peças padrão de uma intervenção, por setor (base do orçamento)
CREATE TABLE pecas_padrao (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  setor   VARCHAR(60)  NOT NULL,
  nome    VARCHAR(120) NOT NULL,
  qtd     DECIMAL(10,2) NOT NULL,
  valor   DECIMAL(10,2) NOT NULL,                 -- valor unitário (R$)
  FOREIGN KEY (setor) REFERENCES setores(nome) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ---------------------------------------------------------------------
-- MÁQUINAS (ATIVOS)
-- ---------------------------------------------------------------------
CREATE TABLE maquinas (
  codigo               VARCHAR(20)  PRIMARY KEY,  -- ex.: PH-03
  nome                 VARCHAR(120) NOT NULL,
  setor                VARCHAR(60)  NOT NULL,
  saude                TINYINT UNSIGNED NOT NULL DEFAULT 100,   -- índice de saúde 0..100
  tendencia            DECIMAL(5,2) NOT NULL DEFAULT 0,         -- pontos de saúde perdidos por hora (usado no replay da planta)
  proxima_manutencao   DATE NULL,
  custo_parada_hora    DECIMAL(10,2) NOT NULL DEFAULT 0,        -- R$ perdidos por hora parada
  ultima_medicao       DATETIME NULL,
  criado_em            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_saude CHECK (saude BETWEEN 0 AND 100),
  FOREIGN KEY (setor) REFERENCES setores(nome) ON UPDATE CASCADE
);

-- ---------------------------------------------------------------------
-- GRANDEZAS E LIMITES DE ALARME
-- Acima de limite_atencao -> amarelo. Acima de limite_alarme -> vermelho.
-- ---------------------------------------------------------------------
CREATE TABLE grandezas (
  codigo           VARCHAR(20) PRIMARY KEY,       -- vibracao | temperatura | corrente
  nome             VARCHAR(60) NOT NULL,
  unidade          VARCHAR(10) NOT NULL,
  limite_atencao   DECIMAL(8,2) NOT NULL,
  limite_alarme    DECIMAL(8,2) NOT NULL,
  CONSTRAINT chk_limites CHECK (limite_atencao < limite_alarme)
);

-- ---------------------------------------------------------------------
-- MEDIÇÕES
-- ---------------------------------------------------------------------
CREATE TABLE medicoes (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  maquina      VARCHAR(20)  NOT NULL,
  grandeza     VARCHAR(20)  NOT NULL,
  valor        DECIMAL(8,2) NOT NULL,
  medido_em    DATETIME     NOT NULL,
  observacao   VARCHAR(255) NOT NULL DEFAULT '',
  usuario_id   INT NULL,                          -- quem registrou (NULL = carga inicial/sensor)
  FOREIGN KEY (maquina)    REFERENCES maquinas(codigo) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (grandeza)   REFERENCES grandezas(codigo),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_medicoes_serie (maquina, grandeza, medido_em)
);

-- ---------------------------------------------------------------------
-- ALERTAS
-- estado: novo -> reconhecido -> resolvido (quando a OS ligada é concluída)
-- ---------------------------------------------------------------------
CREATE TABLE alertas (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  nivel            ENUM('critico', 'atencao', 'info') NOT NULL,
  titulo           VARCHAR(120) NOT NULL,
  maquina          VARCHAR(20)  NOT NULL,
  grandeza         VARCHAR(20)  NULL,             -- NULL quando o alerta não vem de uma grandeza medida
  medido_texto     VARCHAR(60)  NOT NULL DEFAULT '—',
  limite_texto     VARCHAR(60)  NOT NULL DEFAULT '—',
  previsao         VARCHAR(60)  NOT NULL DEFAULT 'A calcular',
  acao             VARCHAR(255) NOT NULL DEFAULT '',
  estado           ENUM('novo', 'reconhecido', 'resolvido') NOT NULL DEFAULT 'novo',
  criado_em        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reconhecido_em   DATETIME NULL,
  reconhecido_por  INT NULL,
  FOREIGN KEY (maquina)         REFERENCES maquinas(codigo) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (grandeza)        REFERENCES grandezas(codigo),
  FOREIGN KEY (reconhecido_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- CHAMADOS (abertos pelo funcionário no chão de fábrica)
-- O código exibido é 'CH-' + id  (ex.: CH-1042)
-- ---------------------------------------------------------------------
CREATE TABLE chamados (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  maquina      VARCHAR(20)  NOT NULL,
  problema     VARCHAR(40)  NOT NULL,
  urgencia     ENUM('Baixa', 'Média', 'Alta', 'Máquina parada') NOT NULL DEFAULT 'Média',
  situacao     ENUM('Registrado', 'Triado', 'Técnico designado', 'Em reparo', 'Concluído') NOT NULL DEFAULT 'Registrado',
  setor        VARCHAR(60)  NOT NULL,
  descricao    TEXT         NOT NULL,
  foto         VARCHAR(255) NULL,                 -- caminho do arquivo em /uploads
  prioridade   ENUM('alta', 'media', 'baixa') NULL,   -- definida na triagem
  equipe       VARCHAR(60)  NULL,                     -- definida na triagem
  usuario_id   INT NOT NULL,                      -- quem abriu
  criado_em    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (maquina)    REFERENCES maquinas(codigo) ON UPDATE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (equipe)     REFERENCES equipes(nome)
);

-- Linha do tempo do chamado. etapa: 0 Registrado, 1 Triado, 2 Técnico designado, 3 Em reparo, 4 Concluído
CREATE TABLE chamado_eventos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  chamado_id   INT NOT NULL,
  etapa        TINYINT NOT NULL,
  quando       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  detalhe      VARCHAR(120) NOT NULL DEFAULT '',
  FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
  UNIQUE KEY uq_chamado_etapa (chamado_id, etapa)
);

CREATE TABLE chamado_comentarios (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  chamado_id   INT NOT NULL,
  usuario_id   INT NOT NULL,
  texto        VARCHAR(1000) NOT NULL,
  criado_em    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ---------------------------------------------------------------------
-- ORDENS DE SERVIÇO
-- O código exibido é 'OS-' + id com 4 dígitos (ex.: OS-0241)
-- ---------------------------------------------------------------------
CREATE TABLE ordens_servico (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  titulo         VARCHAR(160) NOT NULL,
  maquina        VARCHAR(20)  NOT NULL,
  equipe         VARCHAR(60)  NOT NULL,
  prioridade     ENUM('alta', 'media', 'baixa') NOT NULL DEFAULT 'media',
  status         ENUM('aberta', 'andamento', 'peca', 'concluida') NOT NULL DEFAULT 'aberta',
  prazo          DATE NOT NULL,
  descricao      TEXT NULL,
  origem         VARCHAR(20) NOT NULL DEFAULT 'manual',  -- manual | alerta | planta | chamado | orcamento
  alerta_id      INT NULL,
  chamado_id     INT NULL,
  criado_por     INT NULL,
  criado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  iniciada_em    DATETIME NULL,
  concluida_em   DATETIME NULL,
  FOREIGN KEY (maquina)    REFERENCES maquinas(codigo) ON UPDATE CASCADE,
  FOREIGN KEY (equipe)     REFERENCES equipes(nome),
  FOREIGN KEY (alerta_id)  REFERENCES alertas(id) ON DELETE SET NULL,
  FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE SET NULL,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_os_status (status)
);

-- ---------------------------------------------------------------------
-- ORÇAMENTOS SALVOS
-- O código exibido é 'ORC-' + id com 3 dígitos (ex.: ORC-001)
-- ---------------------------------------------------------------------
CREATE TABLE orcamentos (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  maquina           VARCHAR(20) NOT NULL,
  tipo              ENUM('preventiva', 'corretiva') NOT NULL,
  total             DECIMAL(12,2) NOT NULL,
  cuidar_agora      DECIMAL(12,2) NOT NULL,
  esperar_quebrar   DECIMAL(12,2) NOT NULL,
  detalhes          JSON NULL,                    -- todos os números usados na conta
  usuario_id        INT NULL,
  criado_em         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (maquina)    REFERENCES maquinas(codigo) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- INDICADORES SEMANAIS (histórico dos KPIs do dashboard)
-- Em produção seria alimentado por uma rotina semanal; aqui vem do seed.
-- ---------------------------------------------------------------------
CREATE TABLE indicadores_semanais (
  semana_inicio     DATE PRIMARY KEY,
  disponibilidade   DECIMAL(5,2) NOT NULL,        -- %
  mtbf              DECIMAL(8,1) NOT NULL,        -- horas
  mttr              DECIMAL(8,1) NOT NULL,        -- horas
  os_abertas        INT NOT NULL
);
