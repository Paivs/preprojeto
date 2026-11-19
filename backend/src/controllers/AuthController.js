import * as AuthService from '../service/AuthService.js';

function responderErro(erro, res, next) {
  if (erro instanceof TypeError) {
    return res.status(422).json({ sucesso: false, erro: erro.message });
  }
  if (erro.status === 409) {
    return res.status(409).json({ sucesso: false, erro: erro.message });
  }
  if (erro.status === 401) {
    return res.status(401).json({ sucesso: false, erro: erro.message });
  }
  return next(erro);
}

export async function registrar(req, res, next) {
  try {
    const usuario = await AuthService.registrar(req.body);
    return res.status(201).json({ sucesso: true, dados: usuario });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function login(req, res, next) {
  try {
    const sessao = await AuthService.login(req.body);
    return res.status(200).json({ sucesso: true, dados: sessao });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}