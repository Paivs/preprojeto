import * as dbModule from '../config/database.js';


// Suporta tanto o pool exportado diretamente quanto a fábrica criarPool()
const pool = typeof dbModule.criarPool === 'function' ? dbModule.criarPool() : dbModule.pool;


// 1. Listagem com paginação parametrizada e busca por nome/email
export async function listar({ limite, offset, busca }) {
  const limiteNum = Number.parseInt(limite, 10);
  const offsetNum = Number.parseInt(offset, 10);


  // Monta o filtro de busca (opcional). Escapa os curingas do LIKE (% e _)
  // para que o usuário busque esses caracteres literalmente.
  let filtroSql = '';
  const filtroValores = [];
  if (busca) {
    const termo = `%${busca.replace(/[%_\\]/g, '\\$&')}%`;
    filtroSql = 'WHERE nome LIKE ? OR email LIKE ?';
    filtroValores.push(termo, termo);
  }


  const [linhas] = await pool.query(
    `SELECT id, nome, email, created_at FROM usuarios ${filtroSql} ORDER BY id LIMIT ? OFFSET ?`,
    [...filtroValores, limiteNum, offsetNum]
  );


  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM usuarios ${filtroSql}`,
    filtroValores
  );


  return {
    usuarios: linhas,
    total: Number(total)
  };
}


// 2. Busca por ID
export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    'SELECT id, nome, email, created_at FROM usuarios WHERE id = ?',
    [id]
  );
  if (linhas.length === 0) return null;
  return linhas[0];
}


// 3. Busca por email (para impedir duplicados)
export async function buscarPorEmail(email) {
  const [linhas] = await pool.query(
    'SELECT id, nome, email, created_at FROM usuarios WHERE email = ?',
    [email]
  );
  if (linhas.length === 0) return null;
  return linhas[0];
}


// 4. Inserção
export async function criar(usuario) {
  const sql = 'INSERT INTO usuarios (nome, email) VALUES (?, ?)';
  const valores = [usuario.nome, usuario.email];
  const [resultado] = await pool.query(sql, valores);
  return { ...usuario, id: resultado.insertId };
}


// 5. Atualização completa (PUT)
export async function atualizar(id, usuario) {
  const sql = 'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?';
  const valores = [usuario.nome, usuario.email, id];
  const [resultado] = await pool.query(sql, valores);
  return resultado.affectedRows > 0;
}


// 6. Remoção (DELETE)
export async function excluir(id) {
  const [resultado] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}
