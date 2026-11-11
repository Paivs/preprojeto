import * as ChamadoModel from "../models/chamadoModel.js";
import * as OrdemServicoModel from "../models/ordemServicoModel.js";
import * as UsuarioModel from "../models/usuarioModel.js";

const STATUS_VALIDOS = ["EMITIDA", "EM_EXECUCAO", "FINALIZADA", "CANCELADA"];
const STATUS_CHAMADO_VALIDOS = ["ABERTO", "EM_ATENDIMENTO", "AGUARDANDO_PECAS", "CONCLUIDO", "CANCELADO"];
const SEVERIDADES_VALIDAS = ["BAIXA", "MEDIA", "ALTA", "CRITICA"];

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

export async function emitir(chamadoIdRecebido, dados, usuarioLogado) {
  const chamadoId = validarId(chamadoIdRecebido, "ID do chamado");

  const chamado = await ChamadoModel.buscarPorId(chamadoId);
  if (!chamado) {
    throw new Error(`Chamado ${chamadoId} não encontrado.`);
  }

  const tecnicoId = Number(dados?.tecnico_id ?? chamado.tecnico_id);
  if (!Number.isInteger(tecnicoId) || tecnicoId <= 0) {
    const erro = new Error("Selecione um técnico para receber a ordem de serviço.");
    erro.status = 422;
    throw erro;
  }
  const tecnico = await UsuarioModel.buscarPorId(tecnicoId);
  if (!tecnico || tecnico.perfil !== "TECNICO" || !tecnico.ativo) {
    throw new TypeError("O usuário selecionado precisa ser um técnico ativo.");
  }

  const existente = await OrdemServicoModel.buscarPorChamado(chamadoId);
  if (existente) {
    const erroConflito = new Error(`O chamado ${chamadoId} já possui uma ordem de serviço.`);
    erroConflito.status = 409;
    throw erroConflito;
  }

  if (Number(chamado.tecnico_id) !== tecnicoId) {
    await ChamadoModel.atualizarTecnico(chamadoId, tecnicoId);
  }

  const numero = await gerarNumero();
  return await OrdemServicoModel.criar({
    chamado_id: chamadoId,
    numero,
    emitida_por: Number(usuarioLogado.id),
  });
}

export async function listarParaTecnico(usuarioLogado, filtros = {}) {
  if (usuarioLogado?.perfil !== "TECNICO") {
    const erro = new Error("Apenas técnicos podem listar suas ordens de serviço.");
    erro.status = 403;
    throw erro;
  }
  const tecnicoId = validarId(usuarioLogado.id, "ID do técnico");
  const status = filtros.status;
  if (status !== undefined && !STATUS_CHAMADO_VALIDOS.includes(status)) {
    throw new TypeError(`Status deve ser um de: ${STATUS_CHAMADO_VALIDOS.join(", ")}.`);
  }
  const severidade = filtros.severidade;
  if (severidade !== undefined && !SEVERIDADES_VALIDAS.includes(severidade)) {
    throw new TypeError(`Severidade deve ser uma de: ${SEVERIDADES_VALIDAS.join(", ")}.`);
  }
  return await OrdemServicoModel.listarPorTecnico(tecnicoId, { status, severidade });
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
