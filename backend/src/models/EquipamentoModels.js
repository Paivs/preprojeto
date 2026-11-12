import { pool } from '../config/database.js';
import { criarCondicaoBusca } from '../utils/busca.js';

const camposEquipamento = `
  e.id_equipamento,
  e.nome_equipamento,
  e.tipo,
  e.consumo_minimo,
  e.consumo_maximo,
  e.status,
  e.id_setor,
  s.nome_setor`;

export async function listarPorUsuario(idUsuario, busca = '') {
  const filtroBusca = criarCondicaoBusca(busca, [
    'e.nome_equipamento', 'e.tipo', 'e.status', 's.nome_setor'
  ]);
  const [linhas] = await pool.query(
    `SELECT ${camposEquipamento}
       FROM equipamento e
       INNER JOIN setor s ON s.id_setor = e.id_setor
      WHERE s.id_usuario = ? ${filtroBusca.sql ? `AND ${filtroBusca.sql}` : ''}
      ORDER BY e.id_equipamento`,
    [idUsuario, ...filtroBusca.valores]
  );
  return linhas;
}

export async function listarPorSetor(idSetor, idUsuario, busca = '') {
  const filtroBusca = criarCondicaoBusca(busca, [
    'e.nome_equipamento', 'e.tipo', 'e.status'
  ]);
  const [linhas] = await pool.query(
    `SELECT ${camposEquipamento}
       FROM equipamento e
       INNER JOIN setor s ON s.id_setor = e.id_setor
      WHERE s.id_setor = ? AND s.id_usuario = ? ${filtroBusca.sql ? `AND ${filtroBusca.sql}` : ''}
      ORDER BY e.id_equipamento`,
    [idSetor, idUsuario, ...filtroBusca.valores]
  );
  return linhas;
}

export async function buscarPorId(idEquipamento, idUsuario) {
  const [linhas] = await pool.query(
    `SELECT ${camposEquipamento}
       FROM equipamento e
       INNER JOIN setor s ON s.id_setor = e.id_setor
      WHERE e.id_equipamento = ? AND s.id_usuario = ?`,
    [idEquipamento, idUsuario]
  );
  return linhas[0] || null;
}

export async function setorPertenceAoUsuario(idSetor, idUsuario) {
  const [linhas] = await pool.query(
    'SELECT id_setor FROM setor WHERE id_setor = ? AND id_usuario = ?',
    [idSetor, idUsuario]
  );
  return linhas.length > 0;
}

export async function criar(equipamento, idUsuario) {
  const [resultado] = await pool.query(
    `INSERT INTO equipamento
       (nome_equipamento, tipo, consumo_minimo, consumo_maximo, status, id_setor)
     SELECT ?, ?, ?, ?, ?, s.id_setor
       FROM setor s
      WHERE s.id_setor = ? AND s.id_usuario = ?`,
    [
      equipamento.nome_equipamento,
      equipamento.tipo,
      equipamento.consumo_minimo,
      equipamento.consumo_maximo,
      equipamento.status,
      equipamento.id_setor,
      idUsuario
    ]
  );
  if (resultado.affectedRows === 0) return null;
  return buscarPorId(resultado.insertId, idUsuario);
}

export async function atualizar(idEquipamento, equipamento, idUsuario) {
  await pool.query(
    `UPDATE equipamento e
       INNER JOIN setor dono ON dono.id_setor = e.id_setor
       INNER JOIN setor destino ON destino.id_setor = ? AND destino.id_usuario = ?
        SET e.nome_equipamento = ?,
            e.tipo = ?,
            e.consumo_minimo = ?,
            e.consumo_maximo = ?,
            e.status = ?,
            e.id_setor = destino.id_setor
      WHERE e.id_equipamento = ? AND dono.id_usuario = ?`,
    [
      equipamento.id_setor,
      idUsuario,
      equipamento.nome_equipamento,
      equipamento.tipo,
      equipamento.consumo_minimo,
      equipamento.consumo_maximo,
      equipamento.status,
      idEquipamento,
      idUsuario
    ]
  );
  return buscarPorId(idEquipamento, idUsuario);
}

export async function excluir(idEquipamento, idUsuario) {
  const [resultado] = await pool.query(
    `DELETE e FROM equipamento e
       INNER JOIN setor s ON s.id_setor = e.id_setor
      WHERE e.id_equipamento = ? AND s.id_usuario = ?`,
    [idEquipamento, idUsuario]
  );
  return resultado.affectedRows > 0;
}
