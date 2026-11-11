import { pool } from "../config/database.js";

export async function buscarPorChamado(chamadoId) {
  const [linhas] = await pool.query(
    "SELECT * FROM ordens_servico WHERE chamado_id = ?",
    [chamadoId],
  );
  return linhas[0] || null;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query("SELECT * FROM ordens_servico WHERE id = ?", [id]);
  return linhas[0] || null;
}

export async function listarPorTecnico(tecnicoId, { status, severidade } = {}) {
  const condicoes = ["c.tecnico_id = ?"];
  const valores = [tecnicoId];

  if (status) {
    condicoes.push("c.status = ?");
    valores.push(status);
  }
  if (severidade) {
    condicoes.push("c.severidade = ?");
    valores.push(severidade);
  }

  const [linhas] = await pool.query(
    `SELECT os.*, c.titulo, c.descricao, c.equipamento_id, c.solicitante_id,
            c.tipo, c.severidade, c.status AS chamado_status, c.aberto_em,
            c.concluido_em, e.nome AS equipamento_nome
     FROM ordens_servico os
     INNER JOIN chamados_manutencao c ON c.id = os.chamado_id
     LEFT JOIN equipamentos e ON e.id = c.equipamento_id
     WHERE ${condicoes.join(" AND ")}
     ORDER BY os.emitida_em DESC, os.id DESC`,
    valores,
  );
  return linhas;
}

export async function contarNoAno(ano) {
  const [[{ total }]] = await pool.query(
    "SELECT COUNT(*) AS total FROM ordens_servico WHERE YEAR(emitida_em) = ?",
    [ano],
  );
  return Number(total);
}

export async function criar({ chamado_id, numero, emitida_por }) {
  const [resultado] = await pool.query(
    "INSERT INTO ordens_servico (chamado_id, numero, emitida_por) VALUES (?, ?, ?)",
    [chamado_id, numero, emitida_por],
  );
  return { id: resultado.insertId, chamado_id, numero, emitida_por, status: "EMITIDA" };
}

export async function atualizarStatus(id, status) {
  const finalizadaEm = status === "FINALIZADA" ? "NOW()" : "NULL";
  const [resultado] = await pool.query(
    `UPDATE ordens_servico SET status = ?, finalizada_em = ${finalizadaEm} WHERE id = ?`,
    [status, id],
  );
  return resultado.affectedRows > 0;
}
