import * as PagamentoService from '../service/PagamentoService.js';

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
    const pagamentos = await PagamentoService.listar();
    return res.status(200).json({ sucesso: true, dados: pagamentos });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const pagamento = await PagamentoService.buscarPorId(req.params.id);
    return res.status(200).json({ sucesso: true, dados: pagamento });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function criar(req, res, next) {
  try {
    const pagamento = await PagamentoService.criar(req.body);
    return res.status(201).json({ sucesso: true, dados: pagamento });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizar(req, res, next) {
  try {
    const pagamento = await PagamentoService.atualizar(req.params.id, req.body);
    return res.status(200).json({ sucesso: true, dados: pagamento });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function excluir(req, res, next) {
  try {
    await PagamentoService.excluir(req.params.id);
    return res.status(200).json({ sucesso: true, mensagem: 'Pagamento excluído com sucesso.' });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}
