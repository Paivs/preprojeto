import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { pool } from "../config/database.js";

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
