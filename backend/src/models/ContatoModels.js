import { pool } from '../config/database.js';

export async function listar() {
  const [linhas] = await pool.query(
    `SELECT id_contato, nome, email, cnpj, telefone, mensagem, situacao
       FROM contato
      ORDER BY id_contato DESC`
  );
  return linhas;
}

export async function criar(contato) {
  const [resultado] = await pool.query(
    `INSERT INTO contato (nome, email, cnpj, telefone, mensagem)
     VALUES (?, ?, ?, ?, ?)`,
    [
      contato.nome,
      contato.email,
      contato.cnpj,
      contato.telefone,
      contato.mensagem
    ]
  );

  return { id_contato: resultado.insertId };
}

export async function atualizarSituacao(idContato, situacao) {
  const [resultado] = await pool.query(
    'UPDATE contato SET situacao = ? WHERE id_contato = ?',
    [situacao, idContato]
  );
  if (resultado.affectedRows > 0) return true;

  const [linhas] = await pool.query(
    'SELECT id_contato FROM contato WHERE id_contato = ?',
    [idContato]
  );
  return linhas.length > 0;
}
