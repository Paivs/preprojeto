import * as ComponenteModel from "../models/componenteModel.js";
import * as EquipamentoComponenteModel from "../models/equipamentoComponenteModel.js";
import * as EquipamentoModel from "../models/equipamentoModel.js";

function validarId(idRecebido, nomeCampo) {
  const id = Number(idRecebido);
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError(`${nomeCampo} deve ser um número inteiro positivo.`);
  }
  return id;
}

export async function listar(equipamentoIdRecebido) {
  const equipamentoId = validarId(equipamentoIdRecebido, "ID do equipamento");

  const equipamento = await EquipamentoModel.buscarPorId(equipamentoId);
  if (!equipamento) {
    throw new Error(`Equipamento ${equipamentoId} não encontrado.`);
  }

  return await EquipamentoComponenteModel.listarPorEquipamento(equipamentoId);
}

export async function vincular(equipamentoIdRecebido, dados) {
  const equipamentoId = validarId(equipamentoIdRecebido, "ID do equipamento");
  const componenteId = validarId(dados.componente_id, "ID do componente");
  const quantidade = Number(dados.quantidade);

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw new TypeError("Quantidade deve ser um número inteiro maior que zero.");
  }

  const equipamento = await EquipamentoModel.buscarPorId(equipamentoId);
  if (!equipamento) {
    throw new Error(`Equipamento ${equipamentoId} não encontrado.`);
  }

  const componente = await ComponenteModel.buscarPorId(componenteId);
  if (!componente) {
    throw new Error(`Componente ${componenteId} não encontrado.`);
  }

  await EquipamentoComponenteModel.vincular(equipamentoId, componenteId, quantidade);
  return await EquipamentoComponenteModel.listarPorEquipamento(equipamentoId);
}

export async function desvincular(equipamentoIdRecebido, componenteIdRecebido) {
  const equipamentoId = validarId(equipamentoIdRecebido, "ID do equipamento");
  const componenteId = validarId(componenteIdRecebido, "ID do componente");

  const desvinculou = await EquipamentoComponenteModel.desvincular(equipamentoId, componenteId);
  if (!desvinculou) {
    throw new Error(
      `Vínculo entre equipamento ${equipamentoId} e componente ${componenteId} não encontrado.`,
    );
  }
}