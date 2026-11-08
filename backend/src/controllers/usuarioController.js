import * as UsuarioService from "../services/usuarioService.js";

function responderErro(erro, res, next) {
  if (erro instanceof TypeError) {
    return res.status(400).json({ sucesso: false, erro: erro.message });
  }
  if (erro.status) {
    return res.status(erro.status).json({ sucesso: false, erro: erro.message });
  }
  if (erro.message?.includes("nao encontrado")) {
    return res.status(404).json({ sucesso: false, erro: erro.message });
  }
  return next(erro);
}

export async function login(req, res, next) {
  try {
    const sessao = await UsuarioService.login(req.body);
    return res.status(200).json(sessao);
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function me(req, res, next) {
  try {
    const usuario = await UsuarioService.buscarSessao(req.usuario.id);
    return res.status(200).json({ usuario });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function listar(req, res, next) {
  try {
    const resultado = await UsuarioService.listar(req.query);
    return res.status(200).json({ sucesso: true, dados: resultado.usuarios, paginacao: resultado.paginacao });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizarPerfil(req, res, next) {
  try {
    const usuario = await UsuarioService.atualizarPerfil(req.params.id, req.body.perfil);
    return res.status(200).json({ sucesso: true, dados: usuario });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizarAtivo(req, res, next) {
  try {
    const usuario = await UsuarioService.atualizarAtivo(req.params.id, req.body.ativo);
    return res.status(200).json({ sucesso: true, dados: usuario });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}
