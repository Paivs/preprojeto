import { pool } from "../config/database.js";

export async function listar({ limite, offset, status, severidade, equipamento_id }) {
  const condicoes = [];
  const valores = [];

  if (status !== undefined) {
    condicoes.push("status = ?");
    valores.push(status);
  }
  if (severidade !== undefined) {
    condicoes.push("severidade = ?");
    valores.push(severidade);
  }
  if (equipamento_id !== undefined) {
    condicoes.push("equipamento_id = ?");
    valores.push(equipamento_id);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";

  const [linhas] = await pool.query(
    `SELECT * FROM chamados_manutencao ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...valores, limite, offset],
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM chamados_manutencao ${where}`,
    valores,
  );

  return { chamados: linhas, total: Number(total) };
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query("SELECT * FROM chamados_manutencao WHERE id = ?", [id]);
  return linhas[0] || null;
}

export async function criar(chamado) {
  const sql = `
    INSERT INTO chamados_manutencao
      (equipamento_id, solicitante_id, titulo, descricao, tipo, severidade, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const valores = [
    chamado.equipamento_id,
    chamado.solicitante_id,
    chamado.titulo,
    chamado.descricao,
    chamado.tipo,
    chamado.severidade,
    chamado.status,
  ];
  const [resultado] = await pool.query(sql, valores);

  return { id: resultado.insertId, ...chamado };
}

export async function atualizarStatus(id, status) {
  const concluidoEm = status === "CONCLUIDO" ? "NOW()" : "NULL";
  const [resultado] = await pool.query(
    `UPDATE chamados_manutencao SET status = ?, concluido_em = ${concluidoEm} WHERE id = ?`,
    [status, id],
  );
  return resultado.affectedRows > 0;
}

export async function atualizarTecnico(id, tecnicoId) {
  const [resultado] = await pool.query(
    "UPDATE chamados_manutencao SET tecnico_id = ? WHERE id = ?",
    [tecnicoId, id],
  );
  return resultado.affectedRows > 0;
}

export async function contarPorStatusESeveridade() {
  const [porStatus] = await pool.query(
    "SELECT status, COUNT(*) AS total FROM chamados_manutencao GROUP BY status",
  );
  const [porSeveridade] = await pool.query(
    "SELECT severidade, COUNT(*) AS total FROM chamados_manutencao WHERE status NOT IN ('CONCLUIDO', 'CANCELADO') GROUP BY severidade",
  );
  return { porStatus, porSeveridade };
}

export async function rankingFalhas() {
  const [linhas] = await pool.query(
    `SELECT c.equipamento_id, e.nome AS equipamento_nome, COUNT(*) AS total
     FROM chamados_manutencao c
     LEFT JOIN equipamentos e ON e.id = c.equipamento_id
     GROUP BY c.equipamento_id, e.nome
     ORDER BY total DESC
     LIMIT 10`,
  );
  return linhas;
}

export async function tempoMedioReparo() {
  const [[{ mttr_horas }]] = await pool.query(
    `SELECT AVG(TIMESTAMPDIFF(HOUR, aberto_em, concluido_em)) AS mttr_horas
     FROM chamados_manutencao
     WHERE status = 'CONCLUIDO' AND concluido_em IS NOT NULL`,
  );
  return mttr_horas === null ? null : Number(mttr_horas);
}

export async function contarEquipamentosCriticos() {
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(DISTINCT equipamento_id) AS total
     FROM chamados_manutencao
     WHERE severidade = 'CRITICA' AND status NOT IN ('CONCLUIDO', 'CANCELADO')`,
  );
  return Number(total);
}

export async function resumoTecnico(tecnicoId) {
  const [porStatus] = await pool.query(
    `SELECT status, COUNT(*) AS total
     FROM chamados_manutencao
     WHERE tecnico_id = ?
     GROUP BY status`,
    [tecnicoId],
  );
  const [porSeveridade] = await pool.query(
    `SELECT severidade, COUNT(*) AS total
     FROM chamados_manutencao
     WHERE tecnico_id = ? AND status NOT IN ('CONCLUIDO', 'CANCELADO')
     GROUP BY severidade`,
    [tecnicoId],
  );
  const [abertosPorDia] = await pool.query(
    `SELECT DATE(aberto_em) AS dia, COUNT(*) AS total
     FROM chamados_manutencao
     WHERE tecnico_id = ? AND aberto_em >= CURDATE() - INTERVAL 29 DAY
     GROUP BY DATE(aberto_em)`,
    [tecnicoId],
  );
  const [concluidosPorDia] = await pool.query(
    `SELECT DATE(concluido_em) AS dia, COUNT(*) AS total
     FROM chamados_manutencao
     WHERE tecnico_id = ? AND status = 'CONCLUIDO'
       AND concluido_em >= CURDATE() - INTERVAL 29 DAY
     GROUP BY DATE(concluido_em)`,
    [tecnicoId],
  );

  return { porStatus, porSeveridade, abertosPorDia, concluidosPorDia };
}
