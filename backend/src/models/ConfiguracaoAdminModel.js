import { pool } from '../config/database.js';

export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    `SELECT id_usuario, nome_empresa, cnpj, email, telefone, consumo_maximo
       FROM usuario WHERE id_usuario = ? AND nivel_permissao = 'admin'`,
    [id]
  );
  return linhas[0] || null;
}

export async function buscarDuplicado(campo, valor, id) {
  const colunasPermitidas = ['email', 'cnpj'];
  if (!colunasPermitidas.includes(campo)) throw new TypeError('Campo de consulta inválido.');
  const [linhas] = await pool.query(
    `SELECT id_usuario FROM usuario WHERE ${campo} = ? AND id_usuario <> ? LIMIT 1`,
    [valor, id]
  );
  return linhas.length > 0;
}

export async function atualizarPerfil(id, dados) {
  await pool.query(
    `UPDATE usuario
        SET nome_empresa = ?, email = ?, cnpj = ?, telefone = ?, consumo_maximo = ?
      WHERE id_usuario = ? AND nivel_permissao = 'admin'`,
    [dados.nome_empresa, dados.email, dados.cnpj, dados.telefone, dados.consumo_maximo, id]
  );
  return buscarPorId(id);
}

export async function buscarSenha(id) {
  const [linhas] = await pool.query(
    `SELECT senha FROM usuario WHERE id_usuario = ? AND nivel_permissao = 'admin'`,
    [id]
  );
  return linhas[0]?.senha || null;
}

export async function atualizarSenha(id, senhaHash) {
  const [resultado] = await pool.query(
    `UPDATE usuario SET senha = ? WHERE id_usuario = ? AND nivel_permissao = 'admin'`,
    [senhaHash, id]
  );
  return resultado.affectedRows > 0;
}
