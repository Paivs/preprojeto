import * as FinanceiroModel from '../models/FinanceiroModels.js';

export async function obterResumo(req, res, next) {
  try {
    const resumo = await FinanceiroModel.obterResumo();
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res.status(200).json({ sucesso: true, dados: resumo });
  } catch (erro) {
    return next(erro);
  }
}
