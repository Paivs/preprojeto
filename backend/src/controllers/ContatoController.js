import * as ContatoService from '../service/ContatoService.js';

export async function criar(req, res, next) {
  try {
    const contato = await ContatoService.criar(req.body);
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Mensagem de contato recebida com sucesso.',
      dados: contato
    });
  } catch (erro) {
    if (erro instanceof TypeError) {
      return res.status(400).json({ sucesso: false, erro: erro.message });
    }
    return next(erro);
  }
}
