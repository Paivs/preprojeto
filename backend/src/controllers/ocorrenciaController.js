import * as OcorrenciaService from "../services/ocorrenciaService.js";

export async function listar(req, res, next) {
  try {
    const resultado = await OcorrenciaService.listar(req.query);
    return res.status(200).json({ sucesso: true, dados: resultado.ocorrencias, paginacao: resultado.paginacao });
  } catch (erro) {
    if (erro instanceof TypeError) return res.status(400).json({ sucesso: false, erro: erro.message });
    return next(erro);
  }
}
