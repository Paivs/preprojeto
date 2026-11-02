import * as UsuarioModel from "../models/usuarioModel.js";

const { PERFIS_VALIDOS } = UsuarioModel;

function validarId(idRecebido) {
  const id = Number(idRecebido);
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError("ID deve ser um número inteiro positivo.");
  }
  return id;
}

export async function listar({ pagina = 1, limite = 10, perfil, ativo } = {}) {
  const paginaNum = Number(pagina);
  const limiteNum = Number(limite);

  if (!Number.isInteger(paginaNum) || paginaNum <= 0) {
    throw new TypeError("Página deve ser um número inteiro positivo.");
  }
  if (!Number.isInteger(limiteNum) || limiteNum < 1 || limiteNum > 100) {
    throw new TypeError("Limite deve ser um inteiro entre 1 e 100.");
  }
  if (perfil !== undefined && !PERFIS_VALIDOS.includes(perfil)) {
    throw new TypeError(`Perfil deve ser um de: ${PERFIS_VALIDOS.join(", ")}.`);
  }

  const offset = (paginaNum - 1) * limiteNum;
  const ativoFiltro = ativo === undefined ? undefined : ativo === "true";
  const { usuarios, total } = await UsuarioModel.listar({
    limite: limiteNum,
    offset,
    perfil,
    ativo: ativoFiltro,
  });

  return {
    usuarios,
    paginacao: {
      pagina: paginaNum,
      limite: limiteNum,
      total,
      totalPaginas: Math.ceil(total / limiteNum),
    },
  };
}

export async function atualizarPerfil(idRecebido, perfil) {
  const id = validarId(idRecebido);
  if (!PERFIS_VALIDOS.includes(perfil)) {
    throw new TypeError(`Perfil deve ser um de: ${PERFIS_VALIDOS.join(", ")}.`);
  }
  const atualizou = await UsuarioModel.atualizarPerfil(id, perfil);
  if (!atualizou) {
    throw new Error(`Usuário ${id} não encontrado.`);
  }
  return await UsuarioModel.buscarPorId(id);
}

export async function atualizarAtivo(idRecebido, ativo) {
  const id = validarId(idRecebido);
  if (typeof ativo !== "boolean") {
    throw new TypeError("Ativo deve ser um valor booleano.");
  }
  const atualizou = await UsuarioModel.atualizarAtivo(id, ativo);
  if (!atualizou) {
    throw new Error(`Usuário ${id} não encontrado.`);
  }
  return await UsuarioModel.buscarPorId(id);
}
