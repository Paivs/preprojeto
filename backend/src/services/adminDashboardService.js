import * as ChamadoModel from "../models/chamadoModel.js";
import * as EquipamentoModel from "../models/equipamentoModel.js";
import * as OcorrenciaModel from "../models/ocorrenciaModel.js";

export async function gerar() {
  const [totalEquipamentos, equipamentosPorStatus, equipamentosCriticos, chamados, ocorrenciasRecentes] = await Promise.all([
    EquipamentoModel.contarTotal(),
    EquipamentoModel.contarPorStatus(),
    ChamadoModel.contarEquipamentosCriticos(),
    ChamadoModel.contarPorStatusESeveridade(),
    OcorrenciaModel.contarRecente(),
  ]);
  return {
    equipamentos: { total: totalEquipamentos, por_status: equipamentosPorStatus, criticos: equipamentosCriticos },
    chamados: { por_status: chamados.porStatus, por_severidade_em_aberto: chamados.porSeveridade },
    ocorrencias: { ultimos_30_dias: ocorrenciasRecentes },
  };
}
