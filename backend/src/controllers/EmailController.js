import * as EmailService from '../service/EmailService.js';

export async function enviar(req, res, next) {
  try {
    const resultado = await EmailService.enviarEmail(req.body);
    return res.status(200).json({
      sucesso: true,
      mensagem: 'E-mail enviado com sucesso.',
      dados: resultado
    });
  } catch (erro) {
    if (erro instanceof TypeError) {
      return res.status(400).json({ sucesso: false, erro: erro.message });
    }
    if (erro.status === 503 || erro.status === 502) {
      return res.status(erro.status).json({ sucesso: false, erro: erro.message });
    }
    return next(erro);
  }
}
