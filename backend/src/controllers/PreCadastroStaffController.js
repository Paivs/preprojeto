import * as PreCadastroStaffService from "../services/PreCadastroStaffService.js";

export async function listar(req, res, next) {
  try {
    const preCadastros = await PreCadastroStaffService.listar();
    return res.status(200).json({ sucesso: true, dados: preCadastros });
  } catch (erro) {
    return next(erro);
  }
}

export async function criar(req, res, next) {
  try {
    const preCadastro = await PreCadastroStaffService.criar(req.body);
    return res.status(201).json({ sucesso: true, dados: preCadastro });
  } catch (erro) {
    return next(erro);
  }
}

export async function revogar(req, res, next) {
  try {
    await PreCadastroStaffService.revogar(req.params.id);
    return res.status(204).send();
  } catch (erro) {
    return next(erro);
  }
}

export async function ativar(req, res, next) {
  try {
    const usuario = await PreCadastroStaffService.ativar(req.body);
    return res.status(201).json({ sucesso: true, dados: usuario });
  } catch (erro) {
    return next(erro);
  }
}
