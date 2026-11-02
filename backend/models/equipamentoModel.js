import { pool } from "../config/database.js";

export async function listar({ limite, offset }) {
  const [linhas] = await pool.query(
    "SELECT * FROM equipamentos ORDER BY id LIMIT ? OFFSET ?",
    [limite, offset],
  );
  const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM equipamentos");

  return { equipamentos: linhas, total: Number(total) };
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query("SELECT * FROM equipamentos WHERE id = ?", [id]);
  return linhas[0] || null;
}

export async function criar(equipamento) {
  const sql = `
    INSERT INTO equipamentos (codigo_patrimonio, nome, tipo, localizacao, status)
    VALUES (?, ?, ?, ?, ?)
  `;
  const valores = [
    equipamento.codigo_patrimonio,
    equipamento.nome,
    equipamento.tipo,
    equipamento.localizacao,
    equipamento.status,
  ];
  const [resultado] = await pool.query(sql, valores);

  return { id: resultado.insertId, ...equipamento };
}

export async function atualizar(id, equipamento) {
  const sql = `
    UPDATE equipamentos
    SET codigo_patrimonio = ?, nome = ?, tipo = ?, localizacao = ?
    WHERE id = ?
  `;
  const valores = [
    equipamento.codigo_patrimonio,
    equipamento.nome,
    equipamento.tipo,
    equipamento.localizacao,
    id,
  ];
  const [resultado] = await pool.query(sql, valores);

  return resultado.affectedRows > 0;
}

export async function atualizarStatus(id, status) {
  const [resultado] = await pool.query(
    "UPDATE equipamentos SET status = ? WHERE id = ?",
    [status, id],
  );

  return resultado.affectedRows > 0;
}

export async function inativar(id) {
  const [resultado] = await pool.query(
    "UPDATE equipamentos SET status = 'INATIVO' WHERE id = ?",
    [id],
  );

  return resultado.affectedRows > 0;
}