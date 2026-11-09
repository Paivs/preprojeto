import * as AgendamentoModel from "../models/agendamentoModel.js";
import * as EquipamentoModel from "../models/equipamentoModel.js";
import * as TurmaModel from "../models/turmaModel.js";

function idValido(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new TypeError("ID inválido.");
  return n;
}
export async function listarPorProfessor(id) {
  return AgendamentoModel.listarPorProfessor(id);
}
export async function criar(dados, usuario) {
  const turmaId = idValido(dados?.turmaId),
    equipamentoId = idValido(dados?.equipamentoId);
  const atividade =
    typeof dados.atividade === "string" ? dados.atividade.trim() : "";
  const { data, inicio, fim } = dados;
  if (!atividade || !data || !inicio || !fim || fim <= inicio)
    throw new TypeError("Informe atividade, data e horário válido.");
  const turma = await TurmaModel.buscarPorId(turmaId);
  if (!turma || Number(turma.professor_id) !== Number(usuario.id))
    throw new TypeError("A turma não está vinculada a este professor.");
  const equipamento = await EquipamentoModel.buscarPorId(equipamentoId);
  if (!equipamento || ["EM_MANUTENCAO", "INATIVO"].includes(equipamento.status))
    throw new TypeError("Equipamento indisponível para reserva.");
  const ini = `${data} ${inicio}:00`,
    fimData = `${data} ${fim}:00`;
  if (await AgendamentoModel.verificarConflito(equipamentoId, ini, fimData))
    throw new TypeError("Equipamento já reservado nesse horário.");
  const token =
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
      .toUpperCase()
      .slice(-20);
  const agendamentoId = await AgendamentoModel.criar({
    responsavel_id: Number(usuario.id),
    equipamento_id: equipamentoId,
    turma_id: turmaId,
    atividade,
    inicio: ini,
    fim: fimData,
    token_acesso: token,
  });
  return AgendamentoModel.buscarDetalhado(agendamentoId);
}
export async function cancelar(idRecebido, professorId) {
  const id = idValido(idRecebido),
    a = await AgendamentoModel.buscarPorId(id);
  if (!a) throw new Error(`Agendamento ${id} nao encontrado.`);
  if (Number(a.responsavel_id) !== Number(professorId)) {
    const e = new Error("Reserva de outro professor.");
    e.status = 403;
    throw e;
  }
  if (a.status !== "CONFIRMADO")
    throw new TypeError("Somente reservas confirmadas podem ser canceladas.");
  await AgendamentoModel.atualizarStatus(id, "CANCELADO");
}
