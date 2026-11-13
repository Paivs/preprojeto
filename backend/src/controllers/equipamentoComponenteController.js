import * as EquipamentoComponenteService from "../services/equipamentoComponenteService.js";

export async function listar(req, res, next) {
  try {
    const componentes = await EquipamentoComponenteService.listar(req.params.id);
    return res.status(200).json({ sucesso: true, dados: componentes });
  } catch (erro) {
    return next(erro);
  }
}

export async function vincular(req, res, next) {
  try {
    const componentes = await EquipamentoComponenteService.vincular(req.params.id, req.body);
    return res.status(201).json({ sucesso: true, dados: componentes });
  } catch (erro) {
    return next(erro);
  }
}

export async function desvincular(req, res, next) {
  try {
    await EquipamentoComponenteService.desvincular(req.params.id, req.params.componenteId);
    return res.status(204).send();
  } catch (erro) {
    return next(erro);
  }
}