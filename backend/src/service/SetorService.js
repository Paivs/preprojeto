import * as SetorModel from '../models/SetorModels.js';
import * as EquipamentoModel from '../models/EquipamentoModels.js';
import { adicionarConsumoSimuladoLista } from './SimulacaoConsumoService.js';
import { validarTermoBusca } from '../utils/busca.js';

function validarId(valor, campo) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError(`${campo} deve ser um numero inteiro positivo.`);
  }
  return id;
}

function validarTarifa(valor, campo, padrao = 0) {
  if (valor === undefined || valor === null || valor === '') return padrao;
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0 || numero > 99999999.99) {
    throw new TypeError(`${campo} deve ser um numero entre 0 e 99999999.99.`);
  }
  return Number(numero.toFixed(12));
}

function validarDados(dados = {}, tarifaPadrao = 0) {
  const nome = typeof dados.nome_setor === 'string' ? dados.nome_setor.trim() : '';
  if (!nome) throw new TypeError('Informe o nome do setor.');
  if (nome.length > 100) throw new TypeError('O nome do setor deve ter no maximo 100 caracteres.');

  let descricao = dados.descricao ?? null;
  if (descricao !== null && typeof descricao !== 'string') {
    throw new TypeError('A descricao deve ser um texto.');
  }
  if (typeof descricao === 'string') descricao = descricao.trim() || null;

  return {
    nome_setor: nome,
    descricao,
    tarifa_energia: validarTarifa(dados.tarifa_energia, 'Tarifa de energia', tarifaPadrao)
  };
}

function anexarConsumo(setores, equipamentos) {
  const consumoPorSetor = new Map();
  for (const equipamento of adicionarConsumoSimuladoLista(equipamentos)) {
    if (equipamento.consumo_atual === null) continue;
    const idSetor = Number(equipamento.id_setor);
    consumoPorSetor.set(
      idSetor,
      (consumoPorSetor.get(idSetor) || 0) + Number(equipamento.consumo_atual)
    );
  }

  return setores.map((setor) => {
    const consumo = Math.round((consumoPorSetor.get(Number(setor.id_setor)) || 0) * 100) / 100;
    const tarifa = Number(setor.tarifa_energia) || 0;
    return {
      ...setor,
      consumo_geral: consumo,
      custo: Math.round((consumo * tarifa + Number.EPSILON) * 100) / 100
    };
  });
}

async function anexarConsumoSetor(setor, idUsuario) {
  const equipamentos = await EquipamentoModel.listarPorSetor(setor.id_setor, idUsuario);
  return anexarConsumo([setor], equipamentos)[0];
}

export async function listar(idUsuarioRecebido, buscaRecebida) {
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuario');
  const busca = validarTermoBusca(buscaRecebida);
  const [setores, equipamentos] = await Promise.all([
    SetorModel.listarPorUsuario(idUsuario, busca),
    EquipamentoModel.listarPorUsuario(idUsuario)
  ]);
  return anexarConsumo(setores, equipamentos);
}

export async function buscarPorId(idSetorRecebido, idUsuarioRecebido) {
  const idSetor = validarId(idSetorRecebido, 'ID do setor');
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuario');
  const setor = await SetorModel.buscarPorId(idSetor, idUsuario);
  if (!setor) {
    const erro = new Error('Setor nao encontrado.');
    erro.status = 404;
    throw erro;
  }
  return anexarConsumoSetor(setor, idUsuario);
}

export async function criar(dados, idUsuarioRecebido) {
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuario');
  const setor = await SetorModel.criar(validarDados(dados), idUsuario);
  return anexarConsumoSetor(setor, idUsuario);
}

export async function atualizar(idSetorRecebido, dados, idUsuarioRecebido) {
  const idSetor = validarId(idSetorRecebido, 'ID do setor');
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuario');
  const existente = await SetorModel.buscarPorId(idSetor, idUsuario);
  if (!existente) {
    const erro = new Error('Setor nao encontrado.');
    erro.status = 404;
    throw erro;
  }
  const setor = await SetorModel.atualizar(
    idSetor,
    validarDados(dados, Number(existente.tarifa_energia) || 0),
    idUsuario
  );
  return anexarConsumoSetor(setor, idUsuario);
}

export async function excluir(idSetorRecebido, idUsuarioRecebido) {
  const idSetor = validarId(idSetorRecebido, 'ID do setor');
  const idUsuario = validarId(idUsuarioRecebido, 'ID do usuario');
  const removeu = await SetorModel.excluir(idSetor, idUsuario);
  if (!removeu) {
    const erro = new Error('Setor nao encontrado.');
    erro.status = 404;
    throw erro;
  }
}
