import * as ContatoModel from '../models/ContatoModels.js';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITUACOES_ATUALIZAVEIS = new Set(['ignorado', 'respondido']);

function validarId(idRecebido) {
  const id = Number(idRecebido);
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError('ID do contato deve ser um número inteiro positivo.');
  }
  return id;
}

function validarTexto(valor, campo, { obrigatorio = false, maximo } = {}) {
  if (valor === undefined || valor === null || valor === '') {
    if (obrigatorio) throw new TypeError(`Informe ${campo}.`);
    return null;
  }
  if (typeof valor !== 'string') {
    throw new TypeError(`${campo} deve ser um texto.`);
  }

  const texto = valor.trim();
  if (obrigatorio && !texto) throw new TypeError(`Informe ${campo}.`);
  if (maximo && texto.length > maximo) {
    throw new TypeError(`${campo} deve ter no máximo ${maximo} caracteres.`);
  }
  return texto || null;
}

export async function criar(dados = {}) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
    throw new TypeError('O corpo da requisição deve ser um objeto JSON.');
  }

  const contato = {
    nome: validarTexto(dados.nome ?? dados.empresa, 'o nome ou empresa', {
      obrigatorio: true,
      maximo: 150
    }),
    email: validarTexto(dados.email, 'o e-mail', {
      obrigatorio: true,
      maximo: 100
    }),
    cnpj: validarTexto(dados.cnpj, 'o CNPJ', { maximo: 18 }),
    telefone: validarTexto(dados.telefone, 'o telefone', { maximo: 20 }),
    mensagem: validarTexto(dados.mensagem, 'a mensagem', {
      obrigatorio: true,
      maximo: 5000
    })
  };

  if (!REGEX_EMAIL.test(contato.email)) {
    throw new TypeError('Informe um e-mail válido.');
  }

  return ContatoModel.criar(contato);
}

export async function listar() {
  return ContatoModel.listar();
}

export async function atualizarSituacao(idRecebido, dados = {}) {
  const id = validarId(idRecebido);
  if (!SITUACOES_ATUALIZAVEIS.has(dados.situacao)) {
    throw new TypeError('Situação deve ser "ignorado" ou "respondido".');
  }

  const atualizado = await ContatoModel.atualizarSituacao(id, dados.situacao);
  if (!atualizado) {
    const erro = new Error(`Contato ${id} não encontrado.`);
    erro.status = 404;
    throw erro;
  }

  return { id_contato: id, situacao: dados.situacao };
}
