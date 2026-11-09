import * as TurmaModel from "../models/turmaModel.js";

export async function listarPorProfessor(professorId) {
  const turmas = await TurmaModel.listarPorProfessor(professorId);
  return turmas.map((turma) => ({ ...turma, alunos: Number(turma.alunos) }));
}
