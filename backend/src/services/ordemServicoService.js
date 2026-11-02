import * as ChamadoModel from "../models/chamadoModel.js";
import * as OrdemServicoModel from "../models/ordemServicoModel.js";

const STATUS_VALIDOS = ["EMITIDA", "EM_EXECUCAO", "FINALIZADA", "CANCELADA"];

function validarId(idRecebido, nomeCampo = "ID") {
  const id = Number(idRecebido);
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError(`${nomeCampo} deve ser um número inteiro positivo.`);
  }
  return id;
}

async function gerarNumero() {
  const ano = new Date().getFullYear();
  const totalNoAno = await OrdemServicoModel.contarNoAno(ano);
  const sequencial = String(totalNoAno + 1).padStart(4, "0");
  return `OS-${ano}-${sequencial}`;
}

export async function emitir(chamadoIdRecebido, usuarioLogado) {
  const chamadoId = validarId(chamadoIdRecebido, "ID do chamado");

  const chamado = await ChamadoModel.buscarPorId(chamadoId);
  if (!chamado) {
    throw new Error(`Chamado ${chamadoId} não encontrado.`);
  }

  const existente = await OrdemServicoModel.buscarPorChamado(chamadoId);
  if (existente) {
    const erroConflito = new Error(`O chamado ${chamadoId} já possui uma ordem de serviço.`);
    erroConflito.status = 409;
    throw erroConflito;
  }

  const numero = await gerarNumero();
  return await OrdemServicoModel.criar({
    chamado_id: chamadoId,
    numero,
    emitida_por: Number(usuarioLogado.id),
  });
}

export async function buscarPorId(idRecebido) {
  const id = validarId(idRecebido);
  const ordemServico = await OrdemServicoModel.buscarPorId(id);
  if (!ordemServico) {
    throw new Error(`Ordem de serviço ${id} não encontrada.`);
  }
  return ordemServico;
}

export async function atualizarStatus(idRecebido, status) {
  const id = validarId(idRecebido);
  if (!STATUS_VALIDOS.includes(status)) {
    throw new TypeError(`Status deve ser um de: ${STATUS_VALIDOS.join(", ")}.`);
  }
  const atualizou = await OrdemServicoModel.atualizarStatus(id, status);
  if (!atualizou) {
    throw new Error(`Ordem de serviço ${id} não encontrada.`);
  }
  return await OrdemServicoModel.buscarPorId(id);
}
