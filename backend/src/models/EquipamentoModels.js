import { pool } from '../config/database.js';
import { criarCondicaoBusca } from '../utils/busca.js';

const camposEquipamento = `
  e.id_equipamento,
  e.nome_equipamento,
  e.tipo,
  e.consumo_minimo,
  e.consumo_maximo,
  CASE
    WHEN e.consumo_mensal_atualizado_em >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
     AND e.consumo_mensal_atualizado_em < DATE_FORMAT(DATE_ADD(CURRENT_DATE, INTERVAL 1 MONTH), '%Y-%m-01')
    THEN e.consumo_mensal
    ELSE 0
  END AS consumo_mes,
  e.consumo_mensal_atualizado_em AS consumo_atualizado_em,
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

export async function registrarLeitura(idEquipamento, consumoKwh) {
  await pool.query(
    `UPDATE equipamento
        SET consumo_mensal = CASE
              WHEN consumo_mensal_atualizado_em >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
               AND consumo_mensal_atualizado_em < DATE_FORMAT(DATE_ADD(CURRENT_DATE, INTERVAL 1 MONTH), '%Y-%m-01')
              THEN consumo_mensal + ?
              ELSE ?
            END,
            consumo_mensal_atualizado_em = CURRENT_TIMESTAMP
      WHERE id_equipamento = ?`,
    [consumoKwh, consumoKwh, idEquipamento]
  );
  const [linhas] = await pool.query(
    `SELECT consumo_mensal
       FROM equipamento
      WHERE id_equipamento = ?`,
    [idEquipamento]
  );
  return {
    id_equipamento: idEquipamento,
    consumo_kwh: consumoKwh,
    consumo_mensal: linhas[0]?.consumo_mensal ?? null,
  };
}

export async function listarAlertasConsumo(idUsuario) {
  const [linhas] = await pool.query(
    `SELECT
       e.id_equipamento,
       e.nome_equipamento,
       e.consumo_maximo,
       s.nome_setor,
       e.consumo_mensal AS consumo_mes,
       e.consumo_mensal_atualizado_em AS ultima_leitura,
       DATE_FORMAT(CURRENT_DATE, '%Y-%m') AS mes_referencia
     FROM equipamento e
     INNER JOIN setor s ON s.id_setor = e.id_setor
     WHERE s.id_usuario = ?
       AND e.consumo_maximo IS NOT NULL
       AND e.consumo_mensal_atualizado_em >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
       AND e.consumo_mensal_atualizado_em < DATE_FORMAT(DATE_ADD(CURRENT_DATE, INTERVAL 1 MONTH), '%Y-%m-01')
       AND e.consumo_mensal > e.consumo_maximo
     ORDER BY e.consumo_mensal_atualizado_em DESC`,
    [idUsuario]
  );

  return linhas;
}
