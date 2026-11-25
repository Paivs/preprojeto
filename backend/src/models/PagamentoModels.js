import { pool } from "../config/database.js";

const camposPagamento = `
  p.id_pagamento,
  p.valor,
  p.data_vencimento,
  p.data_pagamento,
  p.status,
  p.forma_pagamento,
  p.id_usuario,
  u.nome_empresa`;

export async function listar() {
  const [linhas] = await pool.query(
    `SELECT ${camposPagamento}
       FROM pagamento p
       INNER JOIN usuario u ON u.id_usuario = p.id_usuario
      ORDER BY p.data_vencimento DESC, p.id_pagamento DESC`,
  );
  return linhas;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    `SELECT ${camposPagamento}
       FROM pagamento p
       INNER JOIN usuario u ON u.id_usuario = p.id_usuario
      WHERE p.id_pagamento = ?`,
    [id],
  );
  return linhas[0] || null;
}

export async function confirmarPagamentoDoUsuario(
  idPagamento,
  idUsuario,
  formaPagamento,
) {
  const [resultado] = await pool.query(
    `UPDATE pagamento
        SET status = 'pago', data_pagamento = CURRENT_TIMESTAMP,
            forma_pagamento = ?
      WHERE id_pagamento = ? AND id_usuario = ?
        AND status IN ('nao_pago', 'atrasado')`,
    [formaPagamento, idPagamento, idUsuario],
  );
  return resultado.affectedRows > 0;
}

export async function usuarioExiste(idUsuario) {
  const [linhas] = await pool.query(
    "SELECT id_usuario FROM usuario WHERE id_usuario = ?",
    [idUsuario],
  );
  return linhas.length > 0;
}

export async function criar(pagamento) {
  const [resultado] = await pool.query(
    `INSERT INTO pagamento
       (valor, data_vencimento, data_pagamento, status, forma_pagamento, id_usuario)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      pagamento.valor,
      pagamento.data_vencimento,
      pagamento.data_pagamento,
      pagamento.status,
      pagamento.forma_pagamento,
      pagamento.id_usuario,
    ],
  );
  return buscarPorId(resultado.insertId);
}

export async function atualizar(id, pagamento) {
  await pool.query(
    `UPDATE pagamento
        SET valor = ?, data_vencimento = ?, data_pagamento = ?,
            status = ?, forma_pagamento = ?, id_usuario = ?
      WHERE id_pagamento = ?`,
    [
      pagamento.valor,
      pagamento.data_vencimento,
      pagamento.data_pagamento,
      pagamento.status,
      pagamento.forma_pagamento,
      pagamento.id_usuario,
      id,
    ],
  );
  return buscarPorId(id);
}

export async function excluir(id) {
  const [resultado] = await pool.query(
    "DELETE FROM pagamento WHERE id_pagamento = ?",
    [id],
  );
  return resultado.affectedRows > 0;
}
