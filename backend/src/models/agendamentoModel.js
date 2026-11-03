import { pool } from "../config/database.js";

export async function rankingUso({ limite = 10 } = {}) {
  const [linhas] = await pool.query(
    `SELECT a.equipamento_id, e.nome AS equipamento_nome, COUNT(*) AS total_agendamentos
     FROM agendamentos a
     LEFT JOIN equipamentos e ON e.id = a.equipamento_id
     WHERE a.status != 'CANCELADO'
     GROUP BY a.equipamento_id, e.nome
     ORDER BY total_agendamentos DESC
     LIMIT ?`,
    [limite],
  );
  return linhas;
}

export async function horasReservadasPorEquipamento(inicio, fim) {
  const [linhas] = await pool.query(
    `SELECT a.equipamento_id, e.nome AS equipamento_nome,
            SUM(TIMESTAMPDIFF(MINUTE, a.inicio, a.fim)) / 60 AS horas_reservadas
     FROM agendamentos a
     LEFT JOIN equipamentos e ON e.id = a.equipamento_id
     WHERE a.status != 'CANCELADO' AND a.inicio >= ? AND a.fim <= ?
     GROUP BY a.equipamento_id, e.nome`,
    [inicio, fim],
  );
  return linhas;
}
