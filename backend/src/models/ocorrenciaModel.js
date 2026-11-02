import { pool } from "../config/database.js";

export async function listar({ limite, offset, tipo, responsavel_id, turma_id }) {
  const condicoes = [];
  const valores = [];

  if (tipo !== undefined) { condicoes.push("o.tipo = ?"); valores.push(tipo); }
  if (responsavel_id !== undefined) { condicoes.push("a.responsavel_id = ?"); valores.push(responsavel_id); }
  if (turma_id !== undefined) { condicoes.push("a.turma_id = ?"); valores.push(turma_id); }

  const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";
  const sqlBase = `
    FROM ocorrencias_patrimoniais o
    JOIN agendamentos a ON a.id = o.agendamento_id
    ${where}
  `;
  const [linhas] = await pool.query(
    `SELECT o.*, a.responsavel_id, a.turma_id ${sqlBase} ORDER BY o.id DESC LIMIT ? OFFSET ?`,
    [...valores, limite, offset],
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${sqlBase}`, valores);
  return { ocorrencias: linhas, total: Number(total) };
}

export async function contarRecente() {
  const [[{ total }]] = await pool.query(
    "SELECT COUNT(*) AS total FROM ocorrencias_patrimoniais WHERE criada_em >= DATE_SUB(NOW(), INTERVAL 30 DAY)",
  );
  return Number(total);
}
