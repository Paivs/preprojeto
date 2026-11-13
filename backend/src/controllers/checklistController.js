import * as ChecklistService from "../services/checklistService.js";

export async function listarModelos(req, res, next) {
  try { return res.status(200).json({ sucesso: true, dados: await ChecklistService.listarModelos() }); }
  catch (erro) { return next(erro); }
}
export async function criarModelo(req, res, next) {
  try { return res.status(201).json({ sucesso: true, dados: await ChecklistService.criarModelo(req.body) }); }
  catch (erro) { return next(erro); }
}
export async function atualizarModelo(req, res, next) {
  try { return res.status(200).json({ sucesso: true, dados: await ChecklistService.atualizarModelo(req.params.id, req.body) }); }
  catch (erro) { return next(erro); }
}
export async function excluirModelo(req, res, next) {
  try { await ChecklistService.excluirModelo(req.params.id); return res.status(204).send(); }
  catch (erro) { return next(erro); }
}
export async function listarItens(req, res, next) {
  try { return res.status(200).json({ sucesso: true, dados: await ChecklistService.listarItens(req.params.id) }); }
  catch (erro) { return next(erro); }
}
export async function criarItem(req, res, next) {
  try { return res.status(201).json({ sucesso: true, dados: await ChecklistService.criarItem(req.params.id, req.body) }); }
  catch (erro) { return next(erro); }
}
export async function atualizarItem(req, res, next) {
  try { return res.status(200).json({ sucesso: true, dados: await ChecklistService.atualizarItem(req.params.id, req.body) }); }
  catch (erro) { return next(erro); }
}
export async function excluirItem(req, res, next) {
  try { await ChecklistService.excluirItem(req.params.id); return res.status(204).send(); }
  catch (erro) { return next(erro); }
}
