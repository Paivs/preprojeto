import * as dbModule from '../config/database.js';
import { criarCondicaoBusca } from '../utils/busca.js';


// Suporta tanto o pool exportado diretamente quanto a fábrica criarPool()
const pool = typeof dbModule.criarPool === 'function' ? dbModule.criarPool() : dbModule.pool;

const resumoEquipamentosSql = `
  SELECT s.id_usuario, COUNT(DISTINCT e.id_equipamento) AS qtd_equipamentos
    FROM setor s
    LEFT JOIN equipamento e ON e.id_setor = s.id_setor
   GROUP BY s.id_usuario`;

const resumoPagamentosSql = `
  SELECT p.id_usuario,
         CASE
           WHEN SUM(CASE WHEN p.status = 'atrasado' THEN 1 ELSE 0 END) > 0 THEN 'atrasado'
           WHEN SUM(CASE WHEN p.status = 'nao_pago' THEN 1 ELSE 0 END) > 0 THEN 'nao_pago'
           WHEN SUM(CASE WHEN p.status = 'pago' THEN 1 ELSE 0 END) > 0 THEN 'pago'
           ELSE 'cancelado'
         END AS status_cliente
    FROM pagamento p
   GROUP BY p.id_usuario`;


// 1. Listagem administrativa com resumo de equipamentos e consumo por empresa
export async function listar({ limite, offset, busca }) {
  const limiteNum = Number.parseInt(limite, 10);
  const offsetNum = Number.parseInt(offset, 10);


  // Monta o filtro de busca (opcional). Escapa os curingas do LIKE (% e _)
  // para que o usuário busque esses caracteres literalmente.
  const filtroBusca = criarCondicaoBusca(busca, ['u.nome_empresa', 'u.email', 'u.cnpj']);
  const filtroSql = filtroBusca.sql ? `WHERE ${filtroBusca.sql}` : '';


  const [linhas] = await pool.query(
    `SELECT u.id_usuario, u.nome_empresa, u.email,
            COALESCE(resumo.qtd_equipamentos, 0) AS qtd_equipamentos,
            COALESCE(u.consumo_total, 0) AS consumo_total_energia,
            COALESCE(pagamentos.status_cliente, 'Sem pagamentos') AS status_cliente
       FROM usuario u
       LEFT JOIN (
         ${resumoEquipamentosSql}
       ) resumo ON resumo.id_usuario = u.id_usuario
       LEFT JOIN (
         ${resumoPagamentosSql}
       ) pagamentos ON pagamentos.id_usuario = u.id_usuario
       ${filtroSql}
      ORDER BY u.id_usuario
      LIMIT ? OFFSET ?`,
    [...filtroBusca.valores, limiteNum, offsetNum]
  );


  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM usuario u ${filtroSql}`,
    filtroBusca.valores
  );


  return {
    usuarios: linhas,
    total: Number(total)
  };
}


// 2. Busca por ID
export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    `SELECT u.id_usuario, u.nome_empresa, u.email,
            COALESCE(resumo.qtd_equipamentos, 0) AS qtd_equipamentos,
            COALESCE(u.consumo_total, 0) AS consumo_total_energia,
            COALESCE(pagamentos.status_cliente, 'Sem pagamentos') AS status_cliente
       FROM usuario u
       LEFT JOIN (
         ${resumoEquipamentosSql}
       ) resumo ON resumo.id_usuario = u.id_usuario
       LEFT JOIN (
         ${resumoPagamentosSql}
       ) pagamentos ON pagamentos.id_usuario = u.id_usuario
      WHERE u.id_usuario = ?`,
    [id]
  );
  if (linhas.length === 0) return null;
  return linhas[0];
}


// 3. Busca por email (para impedir duplicados)
export async function buscarPorEmail(email) {
  const [linhas] = await pool.query(
    'SELECT id_usuario, nome_empresa, email FROM usuario WHERE email = ?',
    [email]
  );
  if (linhas.length === 0) return null;
  return linhas[0];
}


// 4. Inserção
export async function criar(usuario) {
  const sql = 'INSERT INTO usuario (nome, email) VALUES (?, ?)';
  const valores = [usuario.nome, usuario.email];
  const [resultado] = await pool.query(sql, valores);
  return { ...usuario, id: resultado.insertId };
}


// 5. Atualização completa (PUT)
export async function atualizar(id, usuario) {
  const sql = 'UPDATE usuario SET nome_empresa = ?, email = ? WHERE id_usuario = ?';
  const valores = [usuario.nome, usuario.email, id];
  const [resultado] = await pool.query(sql, valores);
  return resultado.affectedRows > 0;
}


// 6. Remoção (DELETE)
export async function excluir(id) {
  const [resultado] = await pool.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);
  return resultado.affectedRows > 0;
}
