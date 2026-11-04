/* ============================================================
   CONEXÃO COM O MYSQL
   Usa um "pool" de conexões: o mysql2 reaproveita conexões abertas
   em vez de abrir uma nova a cada requisição.
   ============================================================ */
const mysql = require('mysql2/promise');

// Fuso horário da sessão do banco. Precisa ser o mesmo usado no seed.sql,
// senão as datas relativas ("Hoje 08:40", "há 12 min") ficam deslocadas.
const FUSO = process.env.DB_TIMEZONE || '-03:00';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'predictmaint',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,      // devolve DATETIME como texto, sem conversão de fuso pelo Node
  decimalNumbers: true    // devolve DECIMAL como número (e não como string)
});

// Toda conexão nova do pool recebe o fuso horário correto.
pool.on('connection', conexao => {
  conexao.query('SET time_zone = ?', [FUSO]);
});

/**
 * Executa uma consulta e devolve só as linhas.
 * Ex.: const maquinas = await query('SELECT * FROM maquinas WHERE setor = ?', ['Usinagem']);
 */
async function query(sql, params = []) {
  const [linhas] = await pool.query(sql, params);
  return linhas;
}

/** Devolve a primeira linha da consulta (ou null). */
async function queryUm(sql, params = []) {
  const linhas = await query(sql, params);
  return linhas[0] || null;
}

/**
 * Roda várias operações dentro de uma transação.
 * Se qualquer uma falhar, tudo é desfeito (rollback).
 * A função recebe a conexão e deve usar conexao.query(...).
 */
async function transacao(fn) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const resultado = await fn(conexao);
    await conexao.commit();
    return resultado;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

module.exports = { pool, query, queryUm, transacao };
