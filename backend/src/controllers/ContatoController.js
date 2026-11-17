import * as ContatoService from '../service/ContatoService.js';

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
    const contatos = await ContatoService.listar();
    return res.status(200).json({ sucesso: true, dados: contatos });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function criar(req, res, next) {
  try {
    const contato = await ContatoService.criar(req.body);
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Mensagem de contato recebida com sucesso.',
      dados: contato
    });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizarSituacao(req, res, next) {
  try {
    const contato = await ContatoService.atualizarSituacao(req.params.id, req.body);
    return res.status(200).json({ sucesso: true, dados: contato });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}
