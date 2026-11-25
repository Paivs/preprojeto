import * as PagamentoModel from '../models/PagamentoModels.js';

const STATUS_PAGAMENTO = ['pago', 'nao_pago', 'atrasado', 'cancelado'];

function validarId(valor, campo) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError(`${campo} deve ser um número inteiro positivo.`);
  }
  return id;
}

function validarValor(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0 || numero > 99999999.99) {
    throw new TypeError('Valor deve ser maior que 0 e não pode passar de 99999999.99.');
  }
  return Math.round(numero * 100) / 100;
}

function validarData(valor, campo, obrigatoria = true, dataHora = false) {
  if (valor === null || valor === undefined || valor === '') {
    if (obrigatoria) throw new TypeError(`Informe ${campo}.`);
    return null;
  }
  if (typeof valor !== 'string') throw new TypeError(`${campo} deve ser texto.`);

  const formato = dataHora
    ? /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
    : /^(\d{4})-(\d{2})-(\d{2})$/;
  const partes = valor.match(formato);
  if (!partes) {
    throw new TypeError(dataHora
      ? `${campo} deve usar o formato YYYY-MM-DD HH:mm:ss.`
      : `${campo} deve usar o formato YYYY-MM-DD.`);
  }

  const ano = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (data.getUTCFullYear() !== ano || data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) {
    throw new TypeError(`${campo} não é uma data válida.`);
  }

  if (dataHora) {
    const hora = Number(partes[4]);
    const minuto = Number(partes[5]);
    const segundo = Number(partes[6] || 0);
    if (hora > 23 || minuto > 59 || segundo > 59) {
      throw new TypeError(`${campo} não é uma data válida.`);
    }
    return valor.replace('T', ' ');
  }
  return valor;
}

function validarDados(dados = {}, criar = false) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
    throw new TypeError('Envie os dados do pagamento em formato JSON.');
  }

  const formaPagamento = typeof dados.forma_pagamento === 'string'
    ? dados.forma_pagamento.trim()
    : '';
  if (!formaPagamento) throw new TypeError('Informe a forma de pagamento.');
  if (formaPagamento.length > 50) {
    throw new TypeError('Forma de pagamento deve ter no máximo 50 caracteres.');
  }

  const status = dados.status ?? (criar ? 'nao_pago' : undefined);
  if (!STATUS_PAGAMENTO.includes(status)) {
    throw new TypeError(`Status deve ser um destes: ${STATUS_PAGAMENTO.join(', ')}.`);
  }

  return {
    valor: validarValor(dados.valor),
    data_vencimento: validarData(dados.data_vencimento, 'a data de vencimento'),
    data_pagamento: validarData(dados.data_pagamento, 'a data de pagamento', false, true),
    status,
    forma_pagamento: formaPagamento,
    id_usuario: validarId(dados.id_usuario, 'ID do usuário')
  };
}

function erroNaoEncontrado(mensagem) {
  const erro = new Error(mensagem);
  erro.status = 404;
  return erro;
}

export function listar() {
  return PagamentoModel.listar();
}

export async function buscarPorId(idRecebido) {
  const id = validarId(idRecebido, 'ID do pagamento');
  const pagamento = await PagamentoModel.buscarPorId(id);
  if (!pagamento) throw erroNaoEncontrado('Pagamento não encontrado.');
  return pagamento;
}

export async function criar(dados) {
  const pagamento = validarDados(dados, true);
  if (!await PagamentoModel.usuarioExiste(pagamento.id_usuario)) {
    throw erroNaoEncontrado('Usuário vinculado ao pagamento não encontrado.');
  }
  return PagamentoModel.criar(pagamento);
}

export async function atualizar(idRecebido, dados) {
  const id = validarId(idRecebido, 'ID do pagamento');
  if (!await PagamentoModel.buscarPorId(id)) {
    throw erroNaoEncontrado('Pagamento não encontrado.');
  }

  const pagamento = validarDados(dados);
  if (!await PagamentoModel.usuarioExiste(pagamento.id_usuario)) {
    throw erroNaoEncontrado('Usuário vinculado ao pagamento não encontrado.');
  }

  const atualizado = await PagamentoModel.atualizar(id, pagamento);
  if (!atualizado) throw erroNaoEncontrado('Pagamento não encontrado.');
  return atualizado;
}

export async function excluir(idRecebido) {
  const id = validarId(idRecebido, 'ID do pagamento');
  if (!await PagamentoModel.excluir(id)) {
    throw erroNaoEncontrado('Pagamento não encontrado.');
  }
}
