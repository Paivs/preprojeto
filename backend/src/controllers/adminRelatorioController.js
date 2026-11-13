import * as AdminRelatorioService from "../services/adminRelatorioService.js";

export async function gerar(req, res, next) {
  try {
    const relatorio = await AdminRelatorioService.gerar(req.query);
    return res.status(200).json({ sucesso: true, dados: relatorio });
  } catch (erro) {
    return next(erro);
  }
}
