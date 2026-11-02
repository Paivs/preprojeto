import * as ChecklistItemModel from "../models/checklistItemModel.js";
import * as ChecklistModeloModel from "../models/checklistModeloModel.js";

const TIPOS_EQUIPAMENTO_VALIDOS = ["BANCADA", "ROBO"];
const ETAPAS_VALIDAS = ["PRE_USO", "POS_USO"];

function validarId(idRecebido, nomeCampo = "ID") {
  const id = Number(idRecebido);
  if (!Number.isInteger(id) || id <= 0) throw new TypeError(`${nomeCampo} deve ser um número inteiro positivo.`);
  return id;
}

function validarModelo({ titulo, tipo_equipamento, etapa }) {
  if (typeof titulo !== "string" || titulo.trim() === "") throw new TypeError("Título é obrigatório.");
  if (!TIPOS_EQUIPAMENTO_VALIDOS.includes(tipo_equipamento)) {
    throw new TypeError(`Tipo de equipamento deve ser um de: ${TIPOS_EQUIPAMENTO_VALIDOS.join(", ")}.`);
  }
  if (!ETAPAS_VALIDAS.includes(etapa)) throw new TypeError(`Etapa deve ser uma de: ${ETAPAS_VALIDAS.join(", ")}.`);
}

export async function listarModelos() { return await ChecklistModeloModel.listar(); }

export async function criarModelo(dados) {
  validarModelo(dados);
  return await ChecklistModeloModel.criar({
    titulo: dados.titulo.trim(), tipo_equipamento: dados.tipo_equipamento, etapa: dados.etapa,
  });
}

export async function atualizarModelo(idRecebido, dados) {
  const id = validarId(idRecebido);
  validarModelo(dados);
  const ativo = dados.ativo === undefined ? true : Boolean(dados.ativo);
  const atualizou = await ChecklistModeloModel.atualizar(id, {
    titulo: dados.titulo.trim(), tipo_equipamento: dados.tipo_equipamento, etapa: dados.etapa, ativo,
  });
  if (!atualizou) throw new Error(`Modelo de checklist ${id} não encontrado.`);
  return await ChecklistModeloModel.buscarPorId(id);
}

export async function excluirModelo(idRecebido) {
  const id = validarId(idRecebido);
  if (!await ChecklistModeloModel.excluir(id)) throw new Error(`Modelo de checklist ${id} não encontrado.`);
}

export async function listarItens(modeloIdRecebido) {
  const modeloId = validarId(modeloIdRecebido, "ID do modelo");
  if (!await ChecklistModeloModel.buscarPorId(modeloId)) throw new Error(`Modelo de checklist ${modeloId} não encontrado.`);
  return await ChecklistItemModel.listarPorModelo(modeloId);
}

export async function criarItem(modeloIdRecebido, dados) {
  const modeloId = validarId(modeloIdRecebido, "ID do modelo");
  if (!await ChecklistModeloModel.buscarPorId(modeloId)) throw new Error(`Modelo de checklist ${modeloId} não encontrado.`);
  if (typeof dados.descricao !== "string" || dados.descricao.trim() === "") throw new TypeError("Descrição é obrigatória.");
  return await ChecklistItemModel.criar({ modelo_id: modeloId, descricao: dados.descricao.trim(), critico: Boolean(dados.critico) });
}

export async function atualizarItem(idRecebido, dados) {
  const id = validarId(idRecebido);
  if (typeof dados.descricao !== "string" || dados.descricao.trim() === "") throw new TypeError("Descrição é obrigatória.");
  const atualizou = await ChecklistItemModel.atualizar(id, { descricao: dados.descricao.trim(), critico: Boolean(dados.critico) });
  if (!atualizou) throw new Error(`Item de checklist ${id} não encontrado.`);
  return await ChecklistItemModel.buscarPorId(id);
}

export async function excluirItem(idRecebido) {
  const id = validarId(idRecebido);
  if (!await ChecklistItemModel.excluir(id)) throw new Error(`Item de checklist ${id} não encontrado.`);
}
