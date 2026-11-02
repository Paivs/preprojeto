import Componente from "../models/Componente.js";
import * as ComponenteModel from "../models/componenteModel.js";

function validarId(idRecebido) {
  const id = Number(idRecebido);
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError("ID deve ser um número inteiro positivo.");
  }
  return id;
}

export async function listar({ pagina = 1, limite = 10 } = {}) {
  const paginaNum = Number(pagina);
  const limiteNum = Number(limite);

  if (!Number.isInteger(paginaNum) || paginaNum <= 0) {
    throw new TypeError("Página deve ser um número inteiro positivo.");
  }
  if (!Number.isInteger(limiteNum) || limiteNum < 1 || limiteNum > 100) {
    throw new TypeError("Limite deve ser um inteiro entre 1 e 100.");
  }

  const offset = (paginaNum - 1) * limiteNum;
  const { componentes, total } = await ComponenteModel.listar({ limite: limiteNum, offset });

  return {
    componentes,
    paginacao: {
      pagina: paginaNum,
      limite: limiteNum,
      total,
      totalPaginas: Math.ceil(total / limiteNum),
    },
  };
}

export async function buscarPorId(idRecebido) {
  const id = validarId(idRecebido);
  const componente = await ComponenteModel.buscarPorId(id);
  if (!componente) {
    throw new Error(`Componente ${id} não encontrado.`);
  }
  return componente;
}

export async function criar(dados) {
  const componenteDominio = new Componente({ id: 1, ...dados });
  return await ComponenteModel.criar(componenteDominio);
}

export async function atualizar(idRecebido, dados) {
  const id = validarId(idRecebido);
  const componenteDominio = new Componente({ id, ...dados });
  const atualizou = await ComponenteModel.atualizar(id, componenteDominio);
  if (!atualizou) {
    throw new Error(`Componente ${id} não encontrado.`);
  }
  return await ComponenteModel.buscarPorId(id);
}

export async function excluir(idRecebido) {
  const id = validarId(idRecebido);

  try {
    const removeu = await ComponenteModel.excluir(id);
    if (!removeu) {
      throw new Error(`Componente ${id} não encontrado.`);
    }
  } catch (erro) {
    if (erro.code === "ER_ROW_IS_REFERENCED_2" || erro.code === "ER_ROW_IS_REFERENCED") {
      const erroConflito = new Error(
        "Componente está vinculado a um ou mais equipamentos e não pode ser removido.",
      );
      erroConflito.status = 409;
      throw erroConflito;
    }
    throw erro;
  }
}