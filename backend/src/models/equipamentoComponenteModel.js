import { pool } from "../config/database.js";

export async function listarPorEquipamento(equipamentoId) {
  const [linhas] = await pool.query(
    `SELECT ec.componente_id, ec.quantidade, c.nome, c.categoria
     FROM equipamento_componentes ec
     JOIN componentes c ON c.id = ec.componente_id
     WHERE ec.equipamento_id = ?
     ORDER BY c.nome`,
    [equipamentoId],
  );
  return linhas;
}

export async function vincular(equipamentoId, componenteId, quantidade) {
  await pool.query(
    `INSERT INTO equipamento_componentes (equipamento_id, componente_id, quantidade)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantidade = VALUES(quantidade)`,
    [equipamentoId, componenteId, quantidade],
  );
}

export async function desvincular(equipamentoId, componenteId) {
  const [resultado] = await pool.query(
    "DELETE FROM equipamento_componentes WHERE equipamento_id = ? AND componente_id = ?",
    [equipamentoId, componenteId],
  );
  return resultado.affectedRows > 0;
}