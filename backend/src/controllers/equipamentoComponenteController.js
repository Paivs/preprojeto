import * as EquipamentoComponenteService from "../services/equipamentoComponenteService.js";

function responderErro(erro, res, next) {
  if (erro instanceof TypeError) {
    return res.status(400).json({ sucesso: false, erro: erro.message });
  }
  if (erro.message.includes("não encontrado")) {
    return res.status(404).json({ sucesso: false, erro: erro.message });
  }
  return next(erro);
}

export async function listar(req, res, next) {
  try {
    const componentes = await EquipamentoComponenteService.listar(req.params.id);
    return res.status(200).json({ sucesso: true, dados: componentes });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function vincular(req, res, next) {
  try {
    const componentes = await EquipamentoComponenteService.vincular(req.params.id, req.body);
    return res.status(201).json({ sucesso: true, dados: componentes });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function desvincular(req, res, next) {
  try {
    await EquipamentoComponenteService.desvincular(req.params.id, req.params.componenteId);
    return res.status(204).send();
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}