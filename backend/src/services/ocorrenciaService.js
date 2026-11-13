import { validarId } from "../utils/validarId.js";
import * as OcorrenciaModel from "../models/ocorrenciaModel.js";

const TIPOS_VALIDOS = ["DANO", "EXTRAVIO"];


export async function listar({ pagina = 1, limite = 10, tipo, aluno_id, turma_id } = {}) {
  const paginaNum = Number(pagina);
  const limiteNum = Number(limite);
  if (!Number.isInteger(paginaNum) || paginaNum <= 0) throw new TypeError("Página deve ser um número inteiro positivo.");
  if (!Number.isInteger(limiteNum) || limiteNum < 1 || limiteNum > 100) throw new TypeError("Limite deve ser um inteiro entre 1 e 100.");
  if (tipo !== undefined && !TIPOS_VALIDOS.includes(tipo)) throw new TypeError(`Tipo deve ser um de: ${TIPOS_VALIDOS.join(", ")}.`);

  const offset = (paginaNum - 1) * limiteNum;
  const responsavelId = aluno_id !== undefined ? validarId(aluno_id, "ID do aluno") : undefined;
  const turmaId = turma_id !== undefined ? validarId(turma_id, "ID da turma") : undefined;
  const { ocorrencias, total } = await OcorrenciaModel.listar({
    limite: limiteNum, offset, tipo, responsavel_id: responsavelId, turma_id: turmaId,
  });
  return {
    ocorrencias,
    paginacao: { pagina: paginaNum, limite: limiteNum, total, totalPaginas: Math.ceil(total / limiteNum) },
  };
}
