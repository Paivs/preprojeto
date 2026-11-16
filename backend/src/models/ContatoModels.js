import { pool } from '../config/database.js';

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
