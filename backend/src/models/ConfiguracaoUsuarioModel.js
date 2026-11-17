
import { pool } from "../config/database.js";

export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    `SELECT
       id_usuario,
       nome_empresa,
       cnpj,
       email,
       nivel_permissao AS perfil,
       COALESCE(consumo_total, 0) AS consumo_total,
       COALESCE(consumo_maximo, 0) AS consumo_maximo
     FROM usuario
     WHERE id_usuario = ?`,
    [id]
  );

  return linhas[0] || null;
}

export async function buscarDuplicado(campo, valor, id) {
  if (!["email", "cnpj"].includes(campo)) {
    throw new TypeError("Campo de busca inválido.");
  }

  const [linhas] = await pool.query(
    `SELECT id_usuario
       FROM usuario
      WHERE ${campo} = ?
        AND id_usuario <> ?
      LIMIT 1`,
    [valor, id]
  );

  return linhas[0] || null;
}

export async function atualizarPerfil(id, dados) {
  await pool.query(
    `UPDATE usuario
        SET nome_empresa = ?,
            email = ?,
            cnpj = ?,
            consumo_maximo = ?
      WHERE id_usuario = ?`,
    [
      dados.nome_empresa,
      dados.email,
      dados.cnpj,
      dados.consumo_maximo,
      id,
    ]
  );

  return buscarPorId(id);
}

export async function buscarSenha(id) {
  const [linhas] = await pool.query(
    "SELECT senha FROM usuario WHERE id_usuario = ?",
    [id]
  );

  return linhas[0]?.senha || null;
}

export async function atualizarSenha(id, senhaHash) {
  const [resultado] = await pool.query(
    "UPDATE usuario SET senha = ? WHERE id_usuario = ?",
    [senhaHash, id]
  );

  return resultado.affectedRows > 0;
}
