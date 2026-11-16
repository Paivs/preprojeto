import * as SetorService from '../service/SetorService.js';

function responderErro(erro, res, next) {
  if (erro instanceof TypeError) {
    return res.status(400).json({ sucesso: false, erro: erro.message });
  }
  if (erro.status === 404) {
    return res.status(404).json({ sucesso: false, erro: erro.message });
  }
  return next(erro);
}

export async function listar(req, res, next) {
  try {
    const setores = await SetorService.listar(req.usuario.id, req.query.busca);
    return res.status(200).json({ sucesso: true, dados: setores });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const setor = await SetorService.buscarPorId(req.params.id, req.usuario.id);
    return res.status(200).json({ sucesso: true, dados: setor });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function criar(req, res, next) {
  try {
    const setor = await SetorService.criar(req.body, req.usuario.id);
    return res.status(201).json({ sucesso: true, dados: setor });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizar(req, res, next) {
  try {
    const setor = await SetorService.atualizar(req.params.id, req.body, req.usuario.id);
    return res.status(200).json({ sucesso: true, dados: setor });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function excluir(req, res, next) {
  try {
    await SetorService.excluir(req.params.id, req.usuario.id);
    return res.status(200).json({ sucesso: true, mensagem: 'Setor excluído com sucesso.' });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}
