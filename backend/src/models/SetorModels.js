import { pool } from '../config/database.js';

export async function listarPorUsuario(idUsuario) {
  const [linhas] = await pool.query(
    `SELECT id_setor, nome_setor, descricao, consumo_geral, custo_energia
       FROM setor
      WHERE id_usuario = ?
      ORDER BY id_setor`,
    [idUsuario]
  );
  return linhas;
}

export async function buscarPorId(idSetor, idUsuario) {
  const [linhas] = await pool.query(
    `SELECT id_setor, nome_setor, descricao, consumo_geral, custo_energia
       FROM setor
      WHERE id_setor = ? AND id_usuario = ?`,
    [idSetor, idUsuario]
  );
  return linhas[0] || null;
}

export async function criar(setor, idUsuario) {
  const [resultado] = await pool.query(
    `INSERT INTO setor (nome_setor, descricao, consumo_geral, custo_energia, id_usuario)
     VALUES (?, ?, ?, ?, ?)`,
    [setor.nome_setor, setor.descricao, setor.consumo_geral, setor.custo_energia, idUsuario]
  );
  return buscarPorId(resultado.insertId, idUsuario);
}

export async function atualizar(idSetor, setor, idUsuario) {
  await pool.query(
    `UPDATE setor
        SET nome_setor = ?, descricao = ?, consumo_geral = ?, custo_energia = ?
      WHERE id_setor = ? AND id_usuario = ?`,
    [setor.nome_setor, setor.descricao, setor.consumo_geral, setor.custo_energia, idSetor, idUsuario]
  );
  return buscarPorId(idSetor, idUsuario);
}

export async function excluir(idSetor, idUsuario) {
  const [resultado] = await pool.query(
    'DELETE FROM setor WHERE id_setor = ? AND id_usuario = ?',
    [idSetor, idUsuario]
  );
  return resultado.affectedRows > 0;
}
