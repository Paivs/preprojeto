/* ============================================================
   /api/ordens · ordens de serviço (quadro kanban)
   ============================================================ */
const { Router } = require('express');
const { query, queryUm, transacao } = require('../config/db');
const { requisicaoInvalida, naoEncontrado } = require('../utils/http');
const { idDoCodigo } = require('../utils/formatos');
const { SELECT_OS, formatarOS, buscarOS, criarOS, aplicarStatus } = require('../services/ordens');

const router = Router();
const STATUS = ['aberta', 'andamento', 'peca', 'concluida'];
const PRIORIDADES = ['alta', 'media', 'baixa'];

/**
 * GET /api/ordens?equipe=&prioridade=&periodo=30
 * "periodo" vale para as CONCLUÍDAS (concluídas nos últimos N dias).
 * OS que ainda não foram concluídas aparecem sempre.
 */
router.get('/', async (req, res) => {
  const filtros = [];
  const params = [];
  if (req.query.equipe) { filtros.push('o.equipe = ?'); params.push(req.query.equipe); }
  if (req.query.prioridade) { filtros.push('o.prioridade = ?'); params.push(req.query.prioridade); }
  const periodo = Number(req.query.periodo) || 0;
  if (periodo) {
    filtros.push("(o.status <> 'concluida' OR o.concluida_em >= NOW() - INTERVAL ? DAY)");
    params.push(periodo);
  }

  const linhas = await query(`${SELECT_OS} ${filtros.length ? 'WHERE ' + filtros.join(' AND ') : ''}
    ORDER BY FIELD(o.prioridade, 'alta', 'media', 'baixa'), o.prazo, o.id DESC`, params);
  res.json(linhas.map(formatarOS));
});

/** GET /api/ordens/:id  (aceita "OS-0241" ou "241") */
router.get('/:id', async (req, res) => {
  const os = await buscarOS(idDoCodigo(req.params.id));
  if (!os) throw naoEncontrado('OS não encontrada.');
  res.json(os);
});

/**
 * POST /api/ordens
 * corpo: { titulo, ativo, equipe?, prioridade?, prazo? (AAAA-MM-DD), descricao?, alertaId?, origem? }
 */
router.post('/', async (req, res) => {
  const id = await transacao(conexao => criarOS(conexao, req.body, req.usuario.id));
  res.status(201).json(await buscarOS(id));
});

/**
 * PATCH /api/ordens/:id
 * Só estes campos podem ser alterados: status, equipe, prioridade, prazo, titulo, descricao.
 */
router.patch('/:id', async (req, res) => {
  const id = idDoCodigo(req.params.id);
  const atual = await queryUm('SELECT * FROM ordens_servico WHERE id = ?', [id]);
  if (!atual) throw naoEncontrado('OS não encontrada.');

  const { status, equipe, prioridade, prazo, titulo, descricao } = req.body;
  const campos = {};
  if (status !== undefined) {
    if (!STATUS.includes(status)) throw requisicaoInvalida('Status inválido.');
    campos.status = status;
  }
  if (prioridade !== undefined) {
    if (!PRIORIDADES.includes(prioridade)) throw requisicaoInvalida('Prioridade inválida.');
    campos.prioridade = prioridade;
  }
  if (prazo !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(prazo)) throw requisicaoInvalida('Prazo inválido (use AAAA-MM-DD).');
    campos.prazo = prazo;
  }
  if (equipe !== undefined) campos.equipe = equipe;
  if (titulo !== undefined) {
    if (!String(titulo).trim()) throw requisicaoInvalida('O título não pode ficar vazio.');
    campos.titulo = String(titulo).trim();
  }
  if (descricao !== undefined) campos.descricao = String(descricao);
  if (!Object.keys(campos).length) throw requisicaoInvalida('Nada para atualizar.');

  await transacao(async conexao => {
    await conexao.query('UPDATE ordens_servico SET ? WHERE id = ?', [campos, id]);
    if (campos.status && campos.status !== atual.status) await aplicarStatus(conexao, atual, campos.status);
  });

  res.json(await buscarOS(id));
});

module.exports = router;
