import { pool } from "../config/database.js";

export async function listar() {
  const [linhas] = await pool.query("SELECT * FROM checklist_modelos ORDER BY id DESC");
  return linhas;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query("SELECT * FROM checklist_modelos WHERE id = ?", [id]);
  return linhas[0] || null;
}

export async function criar({ titulo, tipo_equipamento, etapa }) {
  const [resultado] = await pool.query(
    "INSERT INTO checklist_modelos (titulo, tipo_equipamento, etapa) VALUES (?, ?, ?)",
    [titulo, tipo_equipamento, etapa],
  );
  return { id: resultado.insertId, titulo, tipo_equipamento, etapa, ativo: true };
}

export async function atualizar(id, { titulo, tipo_equipamento, etapa, ativo }) {
  const [resultado] = await pool.query(
    "UPDATE checklist_modelos SET titulo = ?, tipo_equipamento = ?, etapa = ?, ativo = ? WHERE id = ?",
    [titulo, tipo_equipamento, etapa, ativo, id],
  );
  return resultado.affectedRows > 0;
}

export async function excluir(id) {
  const [resultado] = await pool.query("DELETE FROM checklist_modelos WHERE id = ?", [id]);
  return resultado.affectedRows > 0;
}
