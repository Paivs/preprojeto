import * as AuthService from "../service/AuthService.js";
import * as PagamentoModel from "../models/PagamentoModels.js";

function responderErro(erro, res, next) {
  if (erro instanceof TypeError) {
    return res.status(422).json({ sucesso: false, erro: erro.message });
  }
  if (erro.status === 409) {
    return res.status(409).json({ sucesso: false, erro: erro.message });
  }
  if (erro.status === 401) {
    return res.status(401).json({ sucesso: false, erro: erro.message });
  }
  if (erro.status === 403) {
    return res.status(403).json({ sucesso: false, erro: erro.message });
  }
  return next(erro);
}

export async function registrar(req, res, next) {
  try {
    const usuario = await AuthService.registrar(req.body);
    return res.status(201).json({ sucesso: true, dados: usuario });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function login(req, res, next) {
  try {
    const sessao = await AuthService.login(req.body);
    return res.status(200).json({ sucesso: true, dados: sessao });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export function sessaoAtual(req, res) {
  return res
    .status(200)
    .json({ sucesso: true, dados: { usuario: req.usuario } });
}

export async function confirmarPagamento(req, res, next) {
  const idPagamento = Number(req.params.id);
  const formas = { cartao: "Cartão de crédito", pix: "PIX", boleto: "Boleto" };
  const formaPagamento = formas[req.body?.forma_pagamento];

  if (!Number.isInteger(idPagamento) || idPagamento <= 0 || !formaPagamento) {
    return res
      .status(422)
      .json({ sucesso: false, erro: "Dados de pagamento inválidos." });
  }
  if (req.usuario.perfil !== "cliente") {
    return res
      .status(403)
      .json({
        sucesso: false,
        erro: "Apenas clientes podem confirmar este pagamento.",
      });
  }

  try {
    const atualizado = await PagamentoModel.confirmarPagamentoDoUsuario(
      idPagamento,
      req.usuario.id,
      formaPagamento,
    );
    if (!atualizado) {
      return res
        .status(404)
        .json({ sucesso: false, erro: "Cobrança pendente não encontrada." });
    }
    return res
      .status(200)
      .json({ sucesso: true, mensagem: "Pagamento registrado." });
  } catch (erro) {
    return next(erro);
  }
}
