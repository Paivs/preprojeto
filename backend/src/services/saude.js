/* ============================================================
   SAÚDE DAS MÁQUINAS E LIMITES DAS GRANDEZAS
   ============================================================ */
const { pool, query } = require('../config/db');

/** Índice de saúde -> status da máquina. */
function statusDaSaude(saude) {
  if (saude < 50) return 'critico';
  if (saude < 75) return 'atencao';
  return 'normal';
}

/**
 * Converte "quanto do limite de alarme a leitura já usou" em saúde (0..100).
 *   até 50% do limite   -> 100 (folga total)
 *   50% a 100%          -> cai de 100 até 50
 *   acima do limite     -> cai 30 pontos a cada 100% a mais (mínimo 5)
 */
function saudeDaRazao(razao) {
  if (razao <= 0.5) return 100;
  if (razao <= 1) return Math.round(100 - 100 * (razao - 0.5));
  return Math.max(5, Math.round(50 - 30 * (razao - 1)));
}

/** Situação de uma leitura comparada aos limites da grandeza. */
function situacaoDaLeitura(valor, grandeza) {
  if (valor > grandeza.limite_alarme) return 'critico';
  if (valor >= grandeza.limite_atencao) return 'atencao';
  return 'normal';
}

/** Lê as grandezas do banco como objeto: { vibracao: {...}, temperatura: {...} }. */
async function carregarGrandezas() {
  const linhas = await query('SELECT * FROM grandezas ORDER BY FIELD(codigo, "vibracao", "temperatura", "corrente")');
  return Object.fromEntries(linhas.map(g => [g.codigo, g]));
}

/**
 * Última leitura de cada grandeza da máquina, com a razão valor/limite.
 * Usado no recálculo de saúde e na análise preditiva.
 */
async function ultimasLeituras(executor, maquina) {
  // executor pode ser o pool ou uma conexão de transação (ambos têm .query)
  const [linhas] = await (executor || pool).query(`
    SELECT u.grandeza, u.valor, g.nome, g.unidade, g.limite_atencao, g.limite_alarme,
           u.valor / g.limite_alarme AS razao
      FROM (SELECT m.*, ROW_NUMBER() OVER (PARTITION BY m.grandeza ORDER BY m.medido_em DESC, m.id DESC) AS posicao
              FROM medicoes m
             WHERE m.maquina = ?) u
      JOIN grandezas g ON g.codigo = u.grandeza
     WHERE u.posicao = 1`, [maquina]);
  return linhas;
}

/**
 * Recalcula a saúde da máquina: é a PIOR saúde entre as últimas leituras
 * de cada grandeza. Chamado sempre que uma medição nova é registrada.
 */
async function recalcularSaude(conexao, maquina) {
  const leituras = await ultimasLeituras(conexao, maquina);
  if (!leituras.length) return null;
  const saude = Math.min(...leituras.map(l => saudeDaRazao(l.razao)));
  await conexao.query('UPDATE maquinas SET saude = ? WHERE codigo = ?', [saude, maquina]);
  return saude;
}

module.exports = { statusDaSaude, saudeDaRazao, situacaoDaLeitura, carregarGrandezas, ultimasLeituras, recalcularSaude };
