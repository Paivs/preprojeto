import { pool } from "../config/database.js";

export async function rankingUso({ limite = 10 } = {}) {
  const [linhas] = await pool.query(
    `SELECT equipamento_id, COUNT(*) AS total_agendamentos
     FROM agendamentos
     WHERE status != 'CANCELADO'
     GROUP BY equipamento_id
     ORDER BY total_agendamentos DESC
     LIMIT ?`,
    [limite],
  );
  return linhas;
}

export async function horasReservadasPorEquipamento(inicio, fim) {
  const [linhas] = await pool.query(
    `SELECT equipamento_id, SUM(TIMESTAMPDIFF(MINUTE, inicio, fim)) / 60 AS horas_reservadas
     FROM agendamentos
     WHERE status != 'CANCELADO' AND inicio >= ? AND fim <= ?
     GROUP BY equipamento_id`,
    [inicio, fim],
  );
  return linhas;
}
