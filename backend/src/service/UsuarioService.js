import bcrypt from 'bcryptjs';
import Usuario from '../models/Usuario.js';
import * as UsuarioModel from '../models/UsuarioModels.js';
import { validarTermoBusca } from '../utils/busca.js';

const REGEX_SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function validarId(idRecebido) {
  const id = Number(idRecebido);
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError('ID deve ser um número inteiro positivo.');
  }
  return id;
}

function validarSenha(senha, obrigatoria) {
  if (senha === undefined || senha === null || senha === '') {
    if (obrigatoria) {
      throw new TypeError('Informe uma senha com no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.');
    }
    return null;
  }
  if (typeof senha !== 'string' || !REGEX_SENHA_FORTE.test(senha)) {
    throw new TypeError('A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.');
  }
  return senha;
}

function dadosNormalizados(dados, atual = {}) {
  const senha = validarSenha(dados.senha, !atual.id_usuario);
  const usuario = new Usuario({
    id_usuario: atual.id_usuario,
    nome_empresa: dados.nome_empresa ?? dados.nome ?? atual.nome_empresa,
    cnpj: dados.cnpj ?? atual.cnpj,
    email: dados.email ?? atual.email,
    nivel_permissao: dados.nivel_permissao ?? dados.perfil ?? atual.nivel_permissao ?? 'cliente',
    consumo_total: dados.consumo_total ?? atual.consumo_total ?? 0,
    consumo_maximo: dados.consumo_maximo ?? atual.consumo_maximo ?? 0
  });
  return { usuario, senha };
}

function erroNaoEncontrado(id) {
  const erro = new Error(`Usuário ${id} não encontrado.`);
  erro.status = 404;
  return erro;
}

async function validarUnicidade(usuario, idIgnorado) {
  const [porEmail, porCnpj] = await Promise.all([
    UsuarioModel.buscarPorEmail(usuario.email),
    UsuarioModel.buscarPorCnpj(usuario.cnpj)
  ]);

  if (porEmail && Number(porEmail.id_usuario) !== idIgnorado) {
    const erro = new Error('E-mail já cadastrado.');
    erro.status = 409;
    throw erro;
  }
  if (porCnpj && Number(porCnpj.id_usuario) !== idIgnorado) {
    const erro = new Error('CNPJ já cadastrado.');
    erro.status = 409;
    throw erro;
  }
}

export async function listar({ pagina = 1, limite = 10, busca } = {}) {
  const paginaNum = Number(pagina);
  const limiteNum = Number(limite);
  if (!Number.isInteger(paginaNum) || paginaNum <= 0) {
    throw new TypeError('Página deve ser um número inteiro positivo.');
  }
  if (!Number.isInteger(limiteNum) || limiteNum < 1 || limiteNum > 100) {
    throw new TypeError('Limite deve ser um inteiro entre 1 e 100.');
  }

  const termoBusca = validarTermoBusca(busca);
  const offset = (paginaNum - 1) * limiteNum;
  const { usuarios, total } = await UsuarioModel.listar({
    limite: limiteNum,
    offset,
    busca: termoBusca || null
  });

  return {
    usuarios,
    paginacao: {
      pagina: paginaNum,
      limite: limiteNum,
      total,
      totalPaginas: Math.ceil(total / limiteNum)
    }
  };
}

export async function buscarPorId(idRecebido) {
  const id = validarId(idRecebido);
  const usuario = await UsuarioModel.buscarPorId(id);
  if (!usuario) throw erroNaoEncontrado(id);
  return usuario;
}

export async function criar(dados = {}) {
  const { usuario, senha } = dadosNormalizados(dados);
  await validarUnicidade(usuario);
  const senhaHash = await bcrypt.hash(senha, 10);
  return UsuarioModel.criar({ ...usuario, senhaHash });
}

export async function atualizar(idRecebido, dados = {}) {
  const id = validarId(idRecebido);
  const atual = await UsuarioModel.buscarPorId(id);
  if (!atual) throw erroNaoEncontrado(id);

  const { usuario, senha } = dadosNormalizados(dados, { ...atual, id_usuario: id });
  await validarUnicidade(usuario, id);
  const senhaHash = senha ? await bcrypt.hash(senha, 10) : null;
  await UsuarioModel.atualizar(id, { ...usuario, senhaHash });
  return UsuarioModel.buscarPorId(id);
}

export async function excluir(idRecebido) {
  const id = validarId(idRecebido);
  const removeu = await UsuarioModel.excluir(id);
  if (!removeu) throw erroNaoEncontrado(id);
}
