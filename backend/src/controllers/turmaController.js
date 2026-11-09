import * as TurmaService from "../services/turmaService.js";

export async function listar(req, res, next) {
  try {
    const turmas = await TurmaService.listarPorProfessor(Number(req.usuario.id));
    return res.status(200).json({ sucesso: true, dados: turmas });
  } catch (erro) { return next(erro); }
}
