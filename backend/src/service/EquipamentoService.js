import * as EquipamentoModel from '../models/EquipamentoModels.js';

function validarId(valor, campo) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError(`${campo} deve ser um número inteiro positivo.`);
  }
  return id;
}

function validarConsumo(valor, campo, padrao = null) {
  if (valor === undefined || valor === null || valor === '') return padrao;
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0 || numero > 99999999.99) {
    throw new TypeError(`${campo} deve ser um número entre 0 e 99999999.99.`);
  }
  return Math.round(numero * 100) / 100;
}

function validarTextoOpcional(valor, campo, limite) {
  if (valor === undefined || valor === null || valor === '') return null;
  if (typeof valor !== 'string') throw new TypeError(`${campo} deve ser um texto.`);
  const texto = valor.trim();
  if (texto.length > limite) {
    throw new TypeError(`${campo} deve ter no máximo ${limite} caracteres.`);
  }
  return texto || null;
}

function validarDados(dados = {}) {
  const nome = typeof dados.nome_equipamento === 'string' ? dados.nome_equipamento.trim() : '';
  if (!nome) throw new TypeError('Informe o nome do equipamento.');
  if (nome.length > 100) {
    throw new TypeError('O nome do equipamento deve ter no máximo 100 caracteres.');
  }

  const consumoMinimo = validarConsumo(dados.consumo_minimo, 'Consumo mínimo', 0);
  const consumoMaximo = validarConsumo(dados.consumo_maximo, 'Consumo máximo');
  if (consumoMaximo !== null && consumoMaximo < consumoMinimo) {
    throw new TypeError('Consumo máximo não pode ser menor que o consumo mínimo.');
  }

  return {
    nome_equipamento: nome,
    tipo: validarTextoOpcional(dados.tipo, 'Tipo', 50),
    consumo_minimo: consumoMinimo,
    consumo_maximo: consumoMaximo,
    status: validarTextoOpcional(dados.status, 'Status', 50),
    id_setor: validarId(dados.id_setor, 'ID do setor')
  };
}

function erroNaoEncontrado(mensagem) {
  const erro = new Error(mensagem);
  erro.status = 404;
  return erro;
}

export async function listar(idUsuarioRecebido) {
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuário');
  return EquipamentoModel.listarPorUsuario(idUsuario);
}

export async function listarPorSetor(idSetorRecebido, idUsuarioRecebido) {
  const idSetor = validarId(idSetorRecebido, 'ID do setor');
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuário');
  const setorValido = await EquipamentoModel.setorPertenceAoUsuario(idSetor, idUsuario);
  if (!setorValido) throw erroNaoEncontrado('Setor não encontrado para este usuário.');
  return EquipamentoModel.listarPorSetor(idSetor, idUsuario);
}

export async function buscarPorId(idEquipamentoRecebido, idUsuarioRecebido) {
  const idEquipamento = validarId(idEquipamentoRecebido, 'ID do equipamento');
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuário');
  const equipamento = await EquipamentoModel.buscarPorId(idEquipamento, idUsuario);
  if (!equipamento) throw erroNaoEncontrado('Equipamento não encontrado.');
  return equipamento;
}

export async function criar(dados, idUsuarioRecebido) {
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuário');
  const equipamento = validarDados(dados);
  const setorValido = await EquipamentoModel.setorPertenceAoUsuario(equipamento.id_setor, idUsuario);
  if (!setorValido) throw erroNaoEncontrado('Setor não encontrado para este usuário.');
  const criado = await EquipamentoModel.criar(equipamento, idUsuario);
  if (!criado) throw erroNaoEncontrado('Setor não encontrado para este usuário.');
  return criado;
}

export async function atualizar(idEquipamentoRecebido, dados, idUsuarioRecebido) {
  const idEquipamento = validarId(idEquipamentoRecebido, 'ID do equipamento');
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuário');
  const atual = await EquipamentoModel.buscarPorId(idEquipamento, idUsuario);
  if (!atual) throw erroNaoEncontrado('Equipamento não encontrado.');

  const equipamento = validarDados(dados);
  const setorValido = await EquipamentoModel.setorPertenceAoUsuario(equipamento.id_setor, idUsuario);
  if (!setorValido) throw erroNaoEncontrado('Setor não encontrado para este usuário.');
  const atualizado = await EquipamentoModel.atualizar(idEquipamento, equipamento, idUsuario);
  if (!atualizado) throw erroNaoEncontrado('Equipamento não encontrado.');
  return atualizado;
}

export async function excluir(idEquipamentoRecebido, idUsuarioRecebido) {
  const idEquipamento = validarId(idEquipamentoRecebido, 'ID do equipamento');
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuário');
  const removeu = await EquipamentoModel.excluir(idEquipamento, idUsuario);
  if (!removeu) throw erroNaoEncontrado('Equipamento não encontrado.');
}
