/* ============================================================
   ORÇAMENTO MANUTENCIÁRIO
   A MESMA conta existe no front-end (frontend/src/lib/calc.js) para a
   tela responder na hora; aqui ela é refeita para salvar no banco sem
   confiar no total enviado pelo navegador.
   ============================================================ */
const { query, queryUm } = require('../config/db');
const { naoEncontrado } = require('../utils/http');

// Manutenção corretiva = a mesma intervenção depois da quebra:
// hora extra (x1,5), peça urgente (x1,4) e parada mais longa (x3).
const FATORES_CORRETIVA = { mo: 1.5, pecas: 1.4, parada: 3 };
const CONTINGENCIA_PADRAO = 10; // %

/** Calcula cada parcela e o total do orçamento. */
function calcOrcamento(e, corretiva = false) {
  const f = corretiva ? (e.fatores || FATORES_CORRETIVA) : { mo: 1, pecas: 1, parada: 1 };
  const mo = e.horas * e.tecnicos * e.valorHora * f.mo;
  const pecas = e.pecas.reduce((soma, p) => soma + p.qtd * p.valor, 0) * f.pecas;
  const terceiros = Number(e.terceiros) || 0;
  const parada = e.horasParada * e.custoParadaHora * f.parada;
  const subtotal = mo + pecas + terceiros + parada;
  const contingencia = subtotal * (Number(e.contingencia) || 0) / 100;
  return { mo, pecas, terceiros, parada, contingencia, total: subtotal + contingencia };
}

/** Garante que todos os campos sejam números (o formulário manda texto). */
function normalizar(e) {
  const n = v => Number(v) || 0;
  return {
    ...e,
    tecnicos: n(e.tecnicos), horas: n(e.horas), valorHora: n(e.valorHora),
    horasParada: n(e.horasParada), custoParadaHora: n(e.custoParadaHora),
    terceiros: n(e.terceiros), contingencia: n(e.contingencia),
    pecas: (e.pecas || []).map(p => ({ nome: String(p.nome || ''), qtd: n(p.qtd), valor: n(p.valor) }))
  };
}

/** Base de custos de uma máquina, montada a partir do setor dela. */
async function montarBase(codigo) {
  const m = await queryUm(`
    SELECT m.codigo, m.nome, m.setor, m.custo_parada_hora,
           s.tecnicos, s.horas, s.horas_parada, s.valor_hora
      FROM maquinas m
      JOIN setores s ON s.nome = m.setor
     WHERE m.codigo = ?`, [codigo]);
  if (!m) throw naoEncontrado('Máquina não encontrada.');

  const pecas = await query('SELECT nome, qtd, valor FROM pecas_padrao WHERE setor = ? ORDER BY id', [m.setor]);

  return {
    maquina: m.codigo,
    nome: m.nome,
    setor: m.setor,
    custoParadaHora: m.custo_parada_hora,
    valorHora: m.valor_hora,
    tecnicos: m.tecnicos,
    horas: m.horas,
    horasParada: m.horas_parada,
    pecas: pecas.length ? pecas : [{ nome: 'Peça de reposição', qtd: 1, valor: 500 }],
    terceiros: 0,
    contingencia: CONTINGENCIA_PADRAO,
    fatores: FATORES_CORRETIVA
  };
}

module.exports = { calcOrcamento, normalizar, montarBase, FATORES_CORRETIVA };
