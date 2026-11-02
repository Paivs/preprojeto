import * as ComponenteService from "../services/componenteService.js";

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
    const resultado = await ComponenteService.listar(req.query);
    return res.status(200).json({
      sucesso: true,
      dados: resultado.componentes,
      paginacao: resultado.paginacao,
    });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const componente = await ComponenteService.buscarPorId(req.params.id);
    return res.status(200).json({ sucesso: true, dados: componente });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function criar(req, res, next) {
  try {
    const componente = await ComponenteService.criar(req.body);
    return res.status(201).json({ sucesso: true, dados: componente });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizar(req, res, next) {
  try {
    const componente = await ComponenteService.atualizar(req.params.id, req.body);
    return res.status(200).json({ sucesso: true, dados: componente });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function excluir(req, res, next) {
  try {
    await ComponenteService.excluir(req.params.id);
    return res.status(204).send();
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}