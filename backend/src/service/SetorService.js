import * as SetorModel from '../models/SetorModels.js';

function validarId(valor, campo) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError(`${campo} deve ser um nÃºmero inteiro positivo.`);
  }
  return id;
}

function validarValor(valor, campo, padrao = 0) {
  if (valor === undefined || valor === null || valor === '') return padrao;
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0 || numero > 99999999.99) {
    throw new TypeError(`${campo} deve ser um número entre 0 e 99999999.99.`);
  }
  return Math.round(numero * 100) / 100;
}

function validarDados(dados = {}) {
  const nome = typeof dados.nome_setor === 'string' ? dados.nome_setor.trim() : '';
  if (!nome) throw new TypeError('Informe o nome do setor.');
  if (nome.length > 100) throw new TypeError('O nome do setor deve ter no maximo 100 caracteres.');

  let descricao = dados.descricao ?? null;
  if (descricao !== null && typeof descricao !== 'string') {
    throw new TypeError('A descrição deve ser um texto.');
  }
  if (typeof descricao === 'string') descricao = descricao.trim() || null;

  return {
    nome_setor: nome,
    descricao,
    consumo_geral: validarValor(dados.consumo_geral, 'Consumo geral'),
    custo: validarValor(dados.custo, 'Custo de energia')
  };
}

export async function listar(idUsuarioRecebido) {
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuário');
  return SetorModel.listarPorUsuario(idUsuario);
}

export async function buscarPorId(idSetorRecebido, idUsuarioRecebido) {
  const idSetor = validarId(idSetorRecebido, 'ID do setor');
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuário');
  const setor = await SetorModel.buscarPorId(idSetor, idUsuario);
  if (!setor) {
    const erro = new Error('Setor não encontrado.');
    erro.status = 404;
    throw erro;
  }
  return setor;
}

export async function criar(dados, idUsuarioRecebido) {
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuário');
  return SetorModel.criar(validarDados(dados), idUsuario);
}

export async function atualizar(idSetorRecebido, dados, idUsuarioRecebido) {
  const idSetor = validarId(idSetorRecebido, 'ID do setor');
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuário');
  const existente = await SetorModel.buscarPorId(idSetor, idUsuario);
  if (!existente) {
    const erro = new Error('Setor não encontrado.');
    erro.status = 404;
    throw erro;
  }
  return SetorModel.atualizar(idSetor, validarDados(dados), idUsuario);
}

export async function excluir(idSetorRecebido, idUsuarioRecebido) {
  const idSetor = validarId(idSetorRecebido, 'ID do setor');
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuário');
  const removeu = await SetorModel.excluir(idSetor, idUsuario);
  if (!removeu) {
    const erro = new Error('Setor não encontrado.');
    erro.status = 404;
    throw erro;
  }
}
