import * as AgendamentoModel from "../models/agendamentoModel.js";
import * as ChamadoModel from "../models/chamadoModel.js";
import * as EquipamentoModel from "../models/equipamentoModel.js";

const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;

function validarData(valor, nomeCampo) {
  if (typeof valor !== "string" || !REGEX_DATA.test(valor)) throw new TypeError(`${nomeCampo} deve estar no formato AAAA-MM-DD.`);
  return valor;
}

export async function gerar({ periodo_inicio, periodo_fim } = {}) {
  const inicio = periodo_inicio ? validarData(periodo_inicio, "periodo_inicio") : "1970-01-01";
  const fim = periodo_fim ? validarData(periodo_fim, "periodo_fim") : new Date().toISOString().slice(0, 10);
  if (inicio > fim) throw new TypeError("periodo_inicio não pode ser depois de periodo_fim.");

  const horasPeriodo = (new Date(fim) - new Date(inicio)) / (1000 * 60 * 60) + 24;
  const [rankingUso, horasPorEquipamento, rankingFalhas, mttrHoras, equipamentosPorStatus] = await Promise.all([
    AgendamentoModel.rankingUso({ limite: 10 }),
    AgendamentoModel.horasReservadasPorEquipamento(inicio, fim),
    ChamadoModel.rankingFalhas(),
    ChamadoModel.tempoMedioReparo(),
    EquipamentoModel.contarPorStatus(),
  ]);
  const taxaOcupacao = horasPorEquipamento.map((linha) => ({
    equipamento_id: linha.equipamento_id,
    equipamento_nome: linha.equipamento_nome,
    horas_reservadas: Number(linha.horas_reservadas),
    taxa_ocupacao_percentual: Number(((linha.horas_reservadas / horasPeriodo) * 100).toFixed(2)),
  }));
  return {
    periodo: { inicio, fim }, ranking_uso: rankingUso, taxa_ocupacao: taxaOcupacao,
    ranking_falhas: rankingFalhas, mttr_horas: mttrHoras, equipamentos_por_status: equipamentosPorStatus,
  };
}
