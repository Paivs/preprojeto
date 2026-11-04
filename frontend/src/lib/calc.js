/* ============================================================
   CONTA DO ORÇAMENTO MANUTENCIÁRIO
   Corretiva = a mesma intervenção depois da quebra
   (hora extra, peça urgente e parada mais longa).
   A API refaz esta mesma conta ao salvar (backend/src/services/orcamento.js).
   ============================================================ */
const FATORES_CORRETIVA = { mo: 1.5, pecas: 1.4, parada: 3 };

export function calcOrcamento(e, corretiva = false) {
  const f = corretiva ? (e.fatores || FATORES_CORRETIVA) : { mo: 1, pecas: 1, parada: 1 };

  const mo = e.horas * e.tecnicos * e.valorHora * f.mo;
  const pecas = e.pecas.reduce((soma, p) => soma + p.qtd * p.valor, 0) * f.pecas;
  const terceiros = Number(e.terceiros) || 0;
  const parada = e.horasParada * e.custoParadaHora * f.parada;

  const subtotal = mo + pecas + terceiros + parada;
  const contingencia = subtotal * (Number(e.contingencia) || 0) / 100;

  return { mo, pecas, terceiros, parada, contingencia, total: subtotal + contingencia };
}

/** Converte os campos do formulário (texto) em números. */
export function normalizarOrcamento(e) {
  const n = v => Number(v) || 0;
  return {
    ...e,
    tecnicos: n(e.tecnicos),
    horas: n(e.horas),
    valorHora: n(e.valorHora),
    horasParada: n(e.horasParada),
    custoParadaHora: n(e.custoParadaHora),
    terceiros: n(e.terceiros),
    contingencia: n(e.contingencia),
    pecas: e.pecas.map(p => ({ ...p, qtd: n(p.qtd), valor: n(p.valor) }))
  };
}
