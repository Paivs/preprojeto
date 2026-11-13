import * as AdminDashboardService from "../services/AdminDashboardService.js";

export async function gerar(req, res, next) {
  try {
    const dashboard = await AdminDashboardService.gerar();
    return res.status(200).json({ sucesso: true, dados: dashboard });
  } catch (erro) {
    return next(erro);
  }
}
