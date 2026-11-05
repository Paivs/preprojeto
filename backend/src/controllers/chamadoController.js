import * as ChamadoService from "../services/chamadoService.js";
import * as HistoricoManutencaoService from "../services/historicoManutencaoService.js";
import * as OrdemServicoService from "../services/ordemServicoService.js";

function responderErro(erro, res, next) {
  if (erro instanceof TypeError) return res.status(400).json({ sucesso: false, erro: erro.message });
  if (erro.status === 403) return res.status(403).json({ sucesso: false, erro: erro.message });
  if (erro.status === 409) return res.status(409).json({ sucesso: false, erro: erro.message });
  if (erro.message.includes("não encontrado") || erro.message.includes("não encontrada")) {
    return res.status(404).json({ sucesso: false, erro: erro.message });
  }
  return next(erro);
}

export async function listar(req, res, next) {
  try {
    const resultado = await ChamadoService.listar(req.query, req.usuario);
    return res.status(200).json({ sucesso: true, dados: resultado.chamados, paginacao: resultado.paginacao });
  } catch (erro) { return responderErro(erro, res, next); }
}

export async function buscarPorId(req, res, next) {
  try {
    const chamado = await ChamadoService.buscarPorId(req.params.id);
    return res.status(200).json({ sucesso: true, dados: chamado });
  } catch (erro) { return responderErro(erro, res, next); }
}

export async function criar(req, res, next) {
  try {
    const chamado = await ChamadoService.criar(req.body, req.usuario);
    return res.status(201).json({ sucesso: true, dados: chamado });
  } catch (erro) { return responderErro(erro, res, next); }
}

export async function atualizarStatus(req, res, next) {
  try {
    const chamado = await ChamadoService.atualizarStatus(req.params.id, req.body.status);
    return res.status(200).json({ sucesso: true, dados: chamado });
  } catch (erro) { return responderErro(erro, res, next); }
}

export async function atualizarTecnico(req, res, next) {
  try {
    const chamado = await ChamadoService.atualizarTecnico(req.params.id, req.body.tecnico_id);
    return res.status(200).json({ sucesso: true, dados: chamado });
  } catch (erro) { return responderErro(erro, res, next); }
}

export async function listarHistorico(req, res, next) {
  try {
    const historico = await HistoricoManutencaoService.listar(req.params.id);
    return res.status(200).json({ sucesso: true, dados: historico });
  } catch (erro) { return responderErro(erro, res, next); }
}

export async function criarHistorico(req, res, next) {
  try {
    const historico = await HistoricoManutencaoService.criar(req.params.id, req.body, req.usuario);
    return res.status(201).json({ sucesso: true, dados: historico });
  } catch (erro) { return responderErro(erro, res, next); }
}

export async function emitirOrdemServico(req, res, next) {
  try {
    const ordemServico = await OrdemServicoService.emitir(req.params.id, req.usuario);
    return res.status(201).json({ sucesso: true, dados: ordemServico });
  } catch (erro) { return responderErro(erro, res, next); }
}
