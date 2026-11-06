import { pool } from '../config/database.js';

export async function buscarPorEmail(email) {
  const [linhas] = await pool.query(
    `SELECT id_usuario, nome_empresa, cnpj, email,
            senha AS senha_hash,
            nivel_permissao AS perfil
       FROM usuario
      WHERE email = ?`,
    [email]
  );
  return linhas[0] || null;
}

export async function atualizarSenha(id, senhaHash) {
  await pool.query(
    `UPDATE usuario SET senha = ? WHERE id_usuario = ?`,
    [senhaHash, id]
  );
}

export async function criar({ nome, cnpj, email, senhaHash, perfil = 'cliente' }) {
  const sql = `INSERT INTO usuario (nome_empresa, cnpj, email, senha, nivel_permissao)
               VALUES (?, ?, ?, ?, ?)`;
  const [resultado] = await pool.query(sql, [nome, cnpj, email, senhaHash, perfil]);
  return {
    id: resultado.insertId,
    nome,
    cnpj,
    email,
    perfil
  };
}