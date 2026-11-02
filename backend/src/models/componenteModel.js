import { pool } from "../config/database.js";

export async function listar({ limite, offset }) {
  const [linhas] = await pool.query(
    "SELECT * FROM componentes ORDER BY id LIMIT ? OFFSET ?",
    [limite, offset],
  );
  const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM componentes");

  return { componentes: linhas, total: Number(total) };
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query("SELECT * FROM componentes WHERE id = ?", [id]);
  return linhas[0] || null;
}

export async function criar(componente) {
  const sql = "INSERT INTO componentes (nome, categoria, quantidade_total) VALUES (?, ?, ?)";
  const valores = [componente.nome, componente.categoria, componente.quantidade_total];
  const [resultado] = await pool.query(sql, valores);

  return { ...componente, id: resultado.insertId };
}

export async function atualizar(id, componente) {
  const sql = "UPDATE componentes SET nome = ?, categoria = ?, quantidade_total = ? WHERE id = ?";
  const valores = [componente.nome, componente.categoria, componente.quantidade_total, id];
  const [resultado] = await pool.query(sql, valores);

  return resultado.affectedRows > 0;
}

export async function excluir(id) {
  const [resultado] = await pool.query("DELETE FROM componentes WHERE id = ?", [id]);
  return resultado.affectedRows > 0;
}
