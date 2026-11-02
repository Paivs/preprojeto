import { pool } from "../config/database.js";

export async function buscarPorChamado(chamadoId) {
  const [linhas] = await pool.query(
    "SELECT * FROM ordens_servico WHERE chamado_id = ?",
    [chamadoId],
  );
  return linhas[0] || null;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query("SELECT * FROM ordens_servico WHERE id = ?", [id]);
  return linhas[0] || null;
}

export async function contarNoAno(ano) {
  const [[{ total }]] = await pool.query(
    "SELECT COUNT(*) AS total FROM ordens_servico WHERE YEAR(emitida_em) = ?",
    [ano],
  );
  return Number(total);
}

export async function criar({ chamado_id, numero, emitida_por }) {
  const [resultado] = await pool.query(
    "INSERT INTO ordens_servico (chamado_id, numero, emitida_por) VALUES (?, ?, ?)",
    [chamado_id, numero, emitida_por],
  );
  return { id: resultado.insertId, chamado_id, numero, emitida_por, status: "EMITIDA" };
}

export async function atualizarStatus(id, status) {
  const finalizadaEm = status === "FINALIZADA" ? "NOW()" : "NULL";
  const [resultado] = await pool.query(
    `UPDATE ordens_servico SET status = ?, finalizada_em = ${finalizadaEm} WHERE id = ?`,
    [status, id],
  );
  return resultado.affectedRows > 0;
}
