import * as EquipamentoService from "../services/equipamentoService.js";

function responderErro(erro, res, next) {
  if (erro instanceof TypeError || erro.status) {
    return res.status(erro.status || 400).json({ sucesso: false, mensagem: erro.message });
  }
  if (erro.message.includes("encontrado")) {
    return res.status(404).json({ sucesso: false, mensagem: erro.message });
  }
  return next(erro);
}

export async function listar(req, res, next) {
  try {
    const resultado = await EquipamentoService.listar(req.query);
    return res.status(200).json({
      sucesso: true,
      dados: resultado.equipamentos,
      paginacao: resultado.paginacao,
    });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const equipamento = await EquipamentoService.buscarPorId(req.params.id);
    return res.status(200).json({ sucesso: true, dados: equipamento });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function criar(req, res, next) {
  try {
    const equipamento = await EquipamentoService.criar(req.body);
    return res.status(201).json({ sucesso: true, dados: equipamento });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizar(req, res, next) {
  try {
    const equipamento = await EquipamentoService.atualizar(req.params.id, req.body);
    return res.status(200).json({ sucesso: true, dados: equipamento });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizarStatus(req, res, next) {
  try {
    const equipamento = await EquipamentoService.atualizarStatus(req.params.id, req.body.status);
    return res.status(200).json({ sucesso: true, dados: equipamento });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function excluir(req, res, next) {
  try {
    await EquipamentoService.inativar(req.params.id);
    return res.status(204).send();
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}
