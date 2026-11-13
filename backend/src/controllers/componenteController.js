import * as ComponenteService from "../services/componenteService.js";

export async function listar(req, res, next) {
  try {
    const resultado = await ComponenteService.listar(req.query);
    return res.status(200).json({
      sucesso: true,
      dados: resultado.componentes,
      paginacao: resultado.paginacao,
    });
  } catch (erro) {
    return next(erro);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const componente = await ComponenteService.buscarPorId(req.params.id);
    return res.status(200).json({ sucesso: true, dados: componente });
  } catch (erro) {
    return next(erro);
  }
}

export async function criar(req, res, next) {
  try {
    const componente = await ComponenteService.criar(req.body);
    return res.status(201).json({ sucesso: true, dados: componente });
  } catch (erro) {
    return next(erro);
  }
}

export async function atualizar(req, res, next) {
  try {
    const componente = await ComponenteService.atualizar(req.params.id, req.body);
    return res.status(200).json({ sucesso: true, dados: componente });
  } catch (erro) {
    return next(erro);
  }
}

export async function excluir(req, res, next) {
  try {
    await ComponenteService.excluir(req.params.id);
    return res.status(204).send();
  } catch (erro) {
    return next(erro);
  }
}
