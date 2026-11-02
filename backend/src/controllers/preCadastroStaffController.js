import * as PreCadastroStaffService from "../services/preCadastroStaffService.js";

function responderErro(erro, res, next) {
  if (erro instanceof TypeError) {
    return res.status(400).json({ sucesso: false, erro: erro.message });
  }
  if (erro.status === 409) {
    return res.status(409).json({ sucesso: false, erro: erro.message });
  }
  if (erro.message.includes("não encontrado")) {
    return res.status(404).json({ sucesso: false, erro: erro.message });
  }
  return next(erro);
}

export async function listar(req, res, next) {
  try {
    const preCadastros = await PreCadastroStaffService.listar();
    return res.status(200).json({ sucesso: true, dados: preCadastros });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function criar(req, res, next) {
  try {
    const preCadastro = await PreCadastroStaffService.criar(req.body);
    return res.status(201).json({ sucesso: true, dados: preCadastro });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function revogar(req, res, next) {
  try {
    await PreCadastroStaffService.revogar(req.params.id);
    return res.status(204).send();
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function ativar(req, res, next) {
  try {
    const usuario = await PreCadastroStaffService.ativar(req.body);
    return res.status(201).json({ sucesso: true, dados: usuario });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}
