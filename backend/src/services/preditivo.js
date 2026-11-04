/* ============================================================
   ANÁLISE PREDITIVA (simplificada)
   - Fatores de risco: quanto cada grandeza já "gastou" do seu limite
   - Vida útil restante (RUL): projeta a tendência da grandeza mais
     crítica até ela chegar no ponto de falha (1,6 x limite de alarme)
   - Confiança: cresce com a quantidade de leituras disponíveis
   ============================================================ */
const { query, queryUm } = require('../config/db');
const { statusDaSaude, ultimasLeituras } = require('./saude');
const { naoEncontrado } = require('../utils/http');

const FATOR_FALHA = 1.6;   // consideramos falha quando a leitura chega a 160% do limite de alarme
const RUL_MAXIMO = 90;     // dias

/** Inclinação (valor por dia) por mínimos quadrados. */
function inclinacaoPorDia(pontos) {
  if (pontos.length < 2) return 0;
  const n = pontos.length;
  const mx = pontos.reduce((s, p) => s + p.dia, 0) / n;
  const my = pontos.reduce((s, p) => s + p.valor, 0) / n;
  const cima = pontos.reduce((s, p) => s + (p.dia - mx) * (p.valor - my), 0);
  const baixo = pontos.reduce((s, p) => s + (p.dia - mx) ** 2, 0);
  return baixo ? cima / baixo : 0;
}

/** Estimativa simples quando não há tendência de piora: usa só a saúde. */
const rulPelaSaude = saude => Math.max(2, Math.round((saude / 100) ** 2 * RUL_MAXIMO));

async function analisarMaquina(codigo) {
  const maquina = await queryUm('SELECT codigo, nome, saude FROM maquinas WHERE codigo = ?', [codigo]);
  if (!maquina) throw naoEncontrado('Máquina não encontrada.');

  const leituras = await ultimasLeituras(null, codigo);

  // Fatores de risco em %, proporcionais à razão valor/limite de cada grandeza
  const somaRazoes = leituras.reduce((s, l) => s + l.razao, 0) || 1;
  const causas = leituras
    .map(l => ({ nome: l.nome, grandeza: l.grandeza, pct: Math.round(l.razao / somaRazoes * 100) }))
    .sort((a, b) => b.pct - a.pct);

  // Grandeza dominante = a que está mais perto do limite
  const dominante = [...leituras].sort((a, b) => b.razao - a.razao)[0];
  let rulDias = rulPelaSaude(maquina.saude);
  let pontos = [];

  if (dominante) {
    // Leituras dos últimos 30 dias, com o tempo medido em dias
    pontos = await query(`
      SELECT valor, TIMESTAMPDIFF(MINUTE, NOW(), medido_em) / 1440 AS dia
        FROM medicoes
       WHERE maquina = ? AND grandeza = ? AND medido_em >= NOW() - INTERVAL 30 DAY
       ORDER BY medido_em`, [codigo, dominante.grandeza]);

    const inclinacao = inclinacaoPorDia(pontos);
    const pontoDeFalha = dominante.limite_alarme * FATOR_FALHA;
    if (inclinacao > 0 && dominante.valor < pontoDeFalha) {
      rulDias = Math.min(rulDias, Math.round((pontoDeFalha - dominante.valor) / inclinacao));
    } else if (dominante.valor >= pontoDeFalha) {
      rulDias = 1;
    }
  }

  return {
    id: maquina.codigo,
    nome: maquina.nome,
    saude: maquina.saude,
    status: statusDaSaude(maquina.saude),
    rulDias: Math.max(1, Math.min(RUL_MAXIMO, rulDias)),
    confianca: Math.min(95, 50 + pontos.length * 4),
    grandezaDominante: dominante ? dominante.grandeza : null,
    causas
  };
}

module.exports = { analisarMaquina };
