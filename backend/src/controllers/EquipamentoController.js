import * as EquipamentoService from '../service/EquipamentoService.js';

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
    const equipamentos = await EquipamentoService.listar(req.usuario.id);
    return res.status(200).json({ sucesso: true, dados: equipamentos });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function listarPorSetor(req, res, next) {
  try {
    const equipamentos = await EquipamentoService.listarPorSetor(req.params.id, req.usuario.id);
    return res.status(200).json({ sucesso: true, dados: equipamentos });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const equipamento = await EquipamentoService.buscarPorId(req.params.id, req.usuario.id);
    return res.status(200).json({ sucesso: true, dados: equipamento });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function criar(req, res, next) {
  try {
    const equipamento = await EquipamentoService.criar(req.body, req.usuario.id);
    return res.status(201).json({ sucesso: true, dados: equipamento });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizar(req, res, next) {
  try {
    const equipamento = await EquipamentoService.atualizar(req.params.id, req.body, req.usuario.id);
    return res.status(200).json({ sucesso: true, dados: equipamento });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function excluir(req, res, next) {
  try {
    await EquipamentoService.excluir(req.params.id, req.usuario.id);
    return res.status(204).send();
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}
