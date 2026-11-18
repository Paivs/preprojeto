import { pool } from '../config/database.js';
import { criarCondicaoBusca } from '../utils/busca.js';

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

const camposUsuario = `
  u.id_usuario,
  u.nome_empresa,
  u.cnpj,
  u.email,
  u.telefone,
  u.nivel_permissao,
  COALESCE(u.consumo_total, 0) AS consumo_total,
  COALESCE(u.consumo_maximo, 0) AS consumo_maximo,
  COALESCE(resumo.qtd_equipamentos, 0) AS qtd_equipamentos,
  COALESCE(u.consumo_total, 0) AS consumo_total_energia,
  COALESCE(pagamentos.status_cliente, 'Sem pagamentos') AS status_cliente`;

const joinsResumo = `
  LEFT JOIN (${resumoEquipamentosSql}) resumo
    ON resumo.id_usuario = u.id_usuario
  LEFT JOIN (${resumoPagamentosSql}) pagamentos
    ON pagamentos.id_usuario = u.id_usuario`;

function erroDuplicidade() {
  const erro = new Error('Já existe um usuário com esse e-mail ou CNPJ.');
  erro.status = 409;
  return erro;
}

function tratarErroBanco(erro) {
  if (erro.code === 'ER_DUP_ENTRY') throw erroDuplicidade();
  throw erro;
}

export async function listar({ limite, offset, busca, nivel_permissao }) {
  const limiteNum = Number.parseInt(limite, 10);
  const offsetNum = Number.parseInt(offset, 10);
  const filtroBusca = criarCondicaoBusca(busca, ['u.nome_empresa', 'u.email', 'u.cnpj']);
  const filtros = [];
  const valoresFiltro = [...filtroBusca.valores];
  if (filtroBusca.sql) filtros.push(filtroBusca.sql);
  if (nivel_permissao) {
    filtros.push('u.nivel_permissao = ?');
    valoresFiltro.push(nivel_permissao);
  }
  const filtroSql = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

  const [usuarios] = await pool.query(
    `SELECT ${camposUsuario}
       FROM usuario u
       ${joinsResumo}
       ${filtroSql}
      ORDER BY u.id_usuario
      LIMIT ? OFFSET ?`,
    [...valoresFiltro, limiteNum, offsetNum]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM usuario u ${filtroSql}`,
    valoresFiltro
  );

  return { usuarios, total: Number(total) };
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    `SELECT ${camposUsuario}
       FROM usuario u
       ${joinsResumo}
      WHERE u.id_usuario = ?`,
    [id]
  );
  return linhas[0] || null;
}

export async function buscarConfiguracao(id, apenasAdmin = false) {
  const [linhas] = await pool.query(
    `SELECT id_usuario, nome_empresa, cnpj, email, telefone, nivel_permissao,
            COALESCE(consumo_total, 0) AS consumo_total,
            COALESCE(consumo_maximo, 0) AS consumo_maximo
       FROM usuario
      WHERE id_usuario = ? ${apenasAdmin ? "AND nivel_permissao = 'admin'" : ''}`,
    [id]
  );
  return linhas[0] || null;
}

export async function atualizarConfiguracao(id, dados, apenasAdmin = false) {
  const sqlAdmin = `UPDATE usuario
                       SET nome_empresa = ?, email = ?, cnpj = ?, telefone = ?, consumo_maximo = ?
                     WHERE id_usuario = ? AND nivel_permissao = 'admin'`;
  const sqlUsuario = `UPDATE usuario
                         SET nome_empresa = ?, email = ?, cnpj = ?, consumo_maximo = ?
                       WHERE id_usuario = ?`;
  if (apenasAdmin) {
    await pool.query(sqlAdmin, [
      dados.nome_empresa, dados.email, dados.cnpj, dados.telefone, dados.consumo_maximo, id
    ]);
  } else {
    await pool.query(sqlUsuario, [
      dados.nome_empresa, dados.email, dados.cnpj, dados.consumo_maximo, id
    ]);
  }
  return buscarConfiguracao(id, apenasAdmin);
}

export async function buscarSenha(id, apenasAdmin = false) {
  const [linhas] = await pool.query(
    `SELECT senha FROM usuario
      WHERE id_usuario = ? ${apenasAdmin ? "AND nivel_permissao = 'admin'" : ''}`,
    [id]
  );
  return linhas[0]?.senha || null;
}

export async function atualizarSenha(id, senhaHash, apenasAdmin = false) {
  const [resultado] = await pool.query(
    `UPDATE usuario SET senha = ?
      WHERE id_usuario = ? ${apenasAdmin ? "AND nivel_permissao = 'admin'" : ''}`,
    [senhaHash, id]
  );
  return resultado.affectedRows > 0;
}

export async function buscarPorEmail(email) {
  const [linhas] = await pool.query(
    'SELECT id_usuario, email FROM usuario WHERE email = ?',
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

export async function criar(usuario) {
  try {
    const [resultado] = await pool.query(
      `INSERT INTO usuario
         (nome_empresa, cnpj, email, telefone, senha, nivel_permissao, consumo_total, consumo_maximo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario.nome_empresa,
        usuario.cnpj,
        usuario.email,
        usuario.telefone,
        usuario.senhaHash,
        usuario.nivel_permissao,
        usuario.consumo_total,
        usuario.consumo_maximo
      ]
    );
    return buscarPorId(resultado.insertId);
  } catch (erro) {
    tratarErroBanco(erro);
  }
}

export async function atualizar(id, usuario) {
  try {
    const [resultado] = await pool.query(
      `UPDATE usuario
          SET nome_empresa = ?, cnpj = ?, email = ?, telefone = ?,
              senha = COALESCE(?, senha), nivel_permissao = ?,
              consumo_total = ?, consumo_maximo = ?
        WHERE id_usuario = ?`,
      [
        usuario.nome_empresa,
        usuario.cnpj,
        usuario.email,
        usuario.telefone,
        usuario.senhaHash || null,
        usuario.nivel_permissao,
        usuario.consumo_total,
        usuario.consumo_maximo,
        id
      ]
    );
    return resultado.affectedRows > 0;
  } catch (erro) {
    tratarErroBanco(erro);
  }
}

export async function excluir(id) {
  const [resultado] = await pool.query(
    'DELETE FROM usuario WHERE id_usuario = ?',
    [id]
  );
  return resultado.affectedRows > 0;
}
