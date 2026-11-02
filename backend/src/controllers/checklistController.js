import * as ChecklistService from "../services/checklistService.js";

function responderErro(erro, res, next) {
  if (erro instanceof TypeError) return res.status(400).json({ sucesso: false, erro: erro.message });
  if (erro.message.includes("não encontrado")) return res.status(404).json({ sucesso: false, erro: erro.message });
  return next(erro);
}

export async function listarModelos(req, res, next) {
  try { return res.status(200).json({ sucesso: true, dados: await ChecklistService.listarModelos() }); }
  catch (erro) { return responderErro(erro, res, next); }
}
export async function criarModelo(req, res, next) {
  try { return res.status(201).json({ sucesso: true, dados: await ChecklistService.criarModelo(req.body) }); }
  catch (erro) { return responderErro(erro, res, next); }
}
export async function atualizarModelo(req, res, next) {
  try { return res.status(200).json({ sucesso: true, dados: await ChecklistService.atualizarModelo(req.params.id, req.body) }); }
  catch (erro) { return responderErro(erro, res, next); }
}
export async function excluirModelo(req, res, next) {
  try { await ChecklistService.excluirModelo(req.params.id); return res.status(204).send(); }
  catch (erro) { return responderErro(erro, res, next); }
}
export async function listarItens(req, res, next) {
  try { return res.status(200).json({ sucesso: true, dados: await ChecklistService.listarItens(req.params.id) }); }
  catch (erro) { return responderErro(erro, res, next); }
}
export async function criarItem(req, res, next) {
  try { return res.status(201).json({ sucesso: true, dados: await ChecklistService.criarItem(req.params.id, req.body) }); }
  catch (erro) { return responderErro(erro, res, next); }
}
export async function atualizarItem(req, res, next) {
  try { return res.status(200).json({ sucesso: true, dados: await ChecklistService.atualizarItem(req.params.id, req.body) }); }
  catch (erro) { return responderErro(erro, res, next); }
}
export async function excluirItem(req, res, next) {
  try { await ChecklistService.excluirItem(req.params.id); return res.status(204).send(); }
  catch (erro) { return responderErro(erro, res, next); }
}
