import Usuario from '../models/Usuario.js';
import * as UsuarioModel from '../models/UsuarioModels.js';


function validarId(idRecebido) {
  const id = Number(idRecebido);
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError('ID deve ser um número inteiro positivo.');
  }
  return id;
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


  // Termo da barra de pesquisa; vazio ou só espaços = sem filtro
  const termoBusca = typeof busca === 'string' ? busca.trim() : '';


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
  if (!usuario) {
    throw new Error(`Usuário ${id} não encontrado.`);
  }
  return usuario;
}


export async function criar(dados) {
  const usuarioDominio = new Usuario({ id: 1, ...dados });


  const jaExiste = await UsuarioModel.buscarPorEmail(usuarioDominio.email);
  if (jaExiste) {
    const erro = new Error('E-mail já cadastrado.');
    erro.status = 409;
    throw erro;
  }


  return await UsuarioModel.criar(usuarioDominio);
}


export async function atualizar(idRecebido, dados) {
  const id = validarId(idRecebido);
  const usuarioDominio = new Usuario({ id, ...dados });


  const jaExiste = await UsuarioModel.buscarPorEmail(usuarioDominio.email);
  if (jaExiste && jaExiste.id !== id) {
    const erro = new Error('E-mail já cadastrado.');
    erro.status = 409;
    throw erro;
  }


  const atualizou = await UsuarioModel.atualizar(id, usuarioDominio);
  if (!atualizou) {
    throw new Error(`Usuário ${id} não encontrado.`);
  }
  return await UsuarioModel.buscarPorId(id);
}


export async function excluir(idRecebido) {
  const id = validarId(idRecebido);
  const removeu = await UsuarioModel.excluir(id);
  if (!removeu) {
    throw new Error(`Usuário ${id} não encontrado.`);
  }
}
