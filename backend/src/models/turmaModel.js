import { pool } from "../config/database.js";

export async function listarPorProfessor(professorId) {
  const [linhas] = await pool.query(
    `SELECT t.id, t.nome, COUNT(ta.aluno_id) AS alunos
     FROM turmas_projetos t LEFT JOIN turma_alunos ta ON ta.turma_id = t.id
     WHERE t.professor_id = ? GROUP BY t.id, t.nome ORDER BY t.nome`,
    [professorId],
  );
  return linhas;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query("SELECT id, nome, professor_id FROM turmas_projetos WHERE id = ?", [id]);
  return linhas[0] || null;
}
