import * as ChamadoModel from "../models/chamadoModel.js";
import * as HistoricoManutencaoModel from "../models/historicoManutencaoModel.js";

function validarId(idRecebido, nomeCampo = "ID") {
  const id = Number(idRecebido);
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError(`${nomeCampo} deve ser um número inteiro positivo.`);
  }
  return id;
}

export async function listar(chamadoIdRecebido) {
  const chamadoId = validarId(chamadoIdRecebido, "ID do chamado");
  const chamado = await ChamadoModel.buscarPorId(chamadoId);
  if (!chamado) {
    throw new Error(`Chamado ${chamadoId} não encontrado.`);
  }
  return await HistoricoManutencaoModel.listarPorChamado(chamadoId);
}

export async function criar(chamadoIdRecebido, dados, usuarioLogado) {
  const chamadoId = validarId(chamadoIdRecebido, "ID do chamado");
  const chamado = await ChamadoModel.buscarPorId(chamadoId);
  if (!chamado) {
    throw new Error(`Chamado ${chamadoId} não encontrado.`);
  }

  if (typeof dados.descricao !== "string" || dados.descricao.trim() === "") {
    throw new TypeError("Descrição é obrigatória.");
  }

  const custo = dados.custo === undefined ? 0 : Number(dados.custo);
  if (!Number.isFinite(custo) || custo < 0) {
    throw new TypeError("Custo deve ser um número maior ou igual a zero.");
  }

  return await HistoricoManutencaoModel.criar({
    chamado_id: chamadoId,
    tecnico_id: Number(usuarioLogado.id),
    descricao: dados.descricao.trim(),
    pecas_trocadas: typeof dados.pecas_trocadas === "string" ? dados.pecas_trocadas.trim() : null,
    custo,
  });
}
