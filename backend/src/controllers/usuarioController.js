import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { pool } from "../config/database.js";
import * as UsuarioService from "../services/usuarioService.js";

export async function login(request, response, next) {
  const { matricula, senha } = request.body ?? {};

  if (typeof matricula !== "string" || !matricula.trim() || typeof senha !== "string" || !senha) {
    return response.status(400).json({
      message: "Matrícula e senha são obrigatórias",
    });
  }

  try {
    const [usuarios] = await pool.execute(
      `SELECT id, nome, perfil, matricula, senha_hash, ativo
       FROM usuarios
       WHERE matricula = ?
       LIMIT 1`,
      [matricula.trim()],
    );

    const usuario = usuarios[0];
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
      return response.status(401).json({ message: "Matrícula ou senha inválidas" });
    }

    if (!usuario.ativo) {
      return response.status(403).json({ message: "Usuário inativo" });
    }

    const token = jwt.sign(
      { perfil: usuario.perfil, matricula: usuario.matricula },
      process.env.JWT_SECRET,
      {
        subject: String(usuario.id),
        expiresIn: process.env.JWT_EXPIRES_IN || "8h",
      },
    );

    return response.status(200).json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        perfil: usuario.perfil,
        matricula: usuario.matricula,
      },
    });
  } catch (error) {
    return next(error);
  }
}

function responderErro(erro, res, next) {
  if (erro instanceof TypeError) {
    return res.status(400).json({ sucesso: false, erro: erro.message });
  }
  if (erro.message.includes("não encontrado")) {
    return res.status(404).json({ sucesso: false, erro: erro.message });
  }
  return next(erro);
}

export async function listar(req, res, next) {
  try {
    const resultado = await UsuarioService.listar(req.query);
    return res.status(200).json({
      sucesso: true,
      dados: resultado.usuarios,
      paginacao: resultado.paginacao,
    });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizarPerfil(req, res, next) {
  try {
    const usuario = await UsuarioService.atualizarPerfil(req.params.id, req.body.perfil);
    return res.status(200).json({ sucesso: true, dados: usuario });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizarAtivo(req, res, next) {
  try {
    const usuario = await UsuarioService.atualizarAtivo(req.params.id, req.body.ativo);
    return res.status(200).json({ sucesso: true, dados: usuario });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}
