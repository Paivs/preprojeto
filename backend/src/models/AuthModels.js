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

export async function buscarPorCnpj(cnpj) {
  const [linhas] = await pool.query(
    'SELECT id_usuario, cnpj FROM usuario WHERE cnpj = ?',
    [cnpj]
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
  try {
    const sql = `INSERT INTO usuario (nome_empresa, cnpj, email, senha, nivel_permissao)
                 VALUES (?, ?, ?, ?, ?)`;
    const [resultado] = await pool.query(sql, [nome, cnpj, email, senhaHash, perfil]);
    return {
      id_usuario: resultado.insertId,
      nome_empresa: nome,
      cnpj,
      email,
      perfil,
      nivel_permissao: perfil
    };
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      const duplicidade = new Error('Já existe um usuário com esse e-mail ou CNPJ.');
      duplicidade.status = 409;
      throw duplicidade;
    }
    throw erro;
  }
}
