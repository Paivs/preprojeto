import * as ConfiguracaoService from "../service/ConfiguracaoUsuarioService.js";

function responderErro(erro, res, next) {
  if (erro instanceof TypeError)
    return res.status(400).json({ sucesso: false, erro: erro.message });
  if ([401, 404, 409].includes(erro.status))
    return res.status(erro.status).json({ sucesso: false, erro: erro.message });
  return next(erro);
}

export async function buscar(req, res, next) {
  try {
    return res
      .status(200)
      .json({
        sucesso: true,
        dados: await ConfiguracaoService.buscar(req.usuario.id),
      });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizar(req, res, next) {
  try {
    return res
      .status(200)
      .json({
        sucesso: true,
        dados: await ConfiguracaoService.atualizar(req.usuario.id, req.body),
      });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function alterarSenha(req, res, next) {
  try {
    return res
      .status(200)
      .json({
        sucesso: true,
        dados: await ConfiguracaoService.alterarSenha(req.usuario.id, req.body),
      });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}
