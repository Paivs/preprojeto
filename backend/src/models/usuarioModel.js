import { pool } from "../config/database.js";

const PERFIS_VALIDOS = ["ALUNO", "PROFESSOR", "TECNICO", "ADMIN"];

export async function listar({ limite, offset, perfil, ativo }) {
  const condicoes = [];
  const valores = [];

  if (perfil !== undefined) {
    condicoes.push("perfil = ?");
    valores.push(perfil);
  }
  if (ativo !== undefined) {
    condicoes.push("ativo = ?");
    valores.push(ativo);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";

  const [linhas] = await pool.query(
    `SELECT id, nome, email, perfil, matricula, ativo, criado_em
     FROM usuarios ${where}
     ORDER BY id LIMIT ? OFFSET ?`,
    [...valores, limite, offset],
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM usuarios ${where}`,
    valores,
  );

  return { usuarios: linhas, total: Number(total) };
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    "SELECT id, nome, email, perfil, matricula, ativo, criado_em FROM usuarios WHERE id = ?",
    [id],
  );
  return linhas[0] || null;
}

export async function buscarPorMatricula(matricula) {
  const [linhas] = await pool.query(
    "SELECT id, nome, email, perfil, matricula, senha_hash, ativo FROM usuarios WHERE matricula = ?",
    [matricula],
  );
  return linhas[0] || null;
}

export async function atualizarPerfil(id, perfil) {
  const [resultado] = await pool.query("UPDATE usuarios SET perfil = ? WHERE id = ?", [perfil, id]);
  return resultado.affectedRows > 0;
}

export async function atualizarAtivo(id, ativo) {
  const [resultado] = await pool.query("UPDATE usuarios SET ativo = ? WHERE id = ?", [ativo, id]);
  return resultado.affectedRows > 0;
}

export { PERFIS_VALIDOS };
