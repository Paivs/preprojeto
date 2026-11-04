/* ============================================================
   /api/orcamento · orçamento manutenciário
   ============================================================ */
const { Router } = require('express');
const { pool, query, queryUm } = require('../config/db');
const { requisicaoInvalida } = require('../utils/http');
const { codigoOrcamento, sqlDia } = require('../utils/formatos');
const { statusDaSaude } = require('../services/saude');
const { calcOrcamento, normalizar, montarBase } = require('../services/orcamento');

const router = Router();

/** GET /api/orcamento/base/:id · números iniciais do formulário para a máquina. */
router.get('/base/:id', async (req, res) => {
  res.json(await montarBase(req.params.id));
});

/**
 * GET /api/orcamento/resumo · todas as máquinas lado a lado.
 * risco = custo corretivo x (1 - saúde): quanto pior a saúde, mais perto da quebra.
 */
router.get('/resumo', async (_req, res) => {
  const maquinas = await query('SELECT codigo, nome, setor, saude FROM maquinas ORDER BY codigo');
  const resumo = [];
  for (const m of maquinas) {
    const base = await montarBase(m.codigo);
    const preventivo = calcOrcamento(base).total;
    const corretivo = calcOrcamento(base, true).total;
    resumo.push({
      maquina: m.codigo, nome: m.nome, setor: m.setor, saude: m.saude, status: statusDaSaude(m.saude),
      preventivo, corretivo, risco: corretivo * (1 - m.saude / 100)
    });
  }
  res.json(resumo);
});

/** GET /api/orcamento · orçamentos salvos (mais recentes primeiro). */
router.get('/', async (_req, res) => {
  const linhas = await query(`
    SELECT id, maquina, tipo, total, cuidar_agora, esperar_quebrar, ${sqlDia('criado_em')} AS data
      FROM orcamentos ORDER BY id DESC LIMIT 50`);
  res.json(linhas.map(o => ({
    id: codigoOrcamento(o.id), data: o.data, maquina: o.maquina, tipo: o.tipo,
    total: o.total, cuidarAgora: o.cuidar_agora, esperarQuebrar: o.esperar_quebrar
  })));
});

/**
 * POST /api/orcamento
 * corpo: { maquina, tipo: 'preventiva' | 'corretiva', detalhes: {...números do formulário} }
 * Os totais são recalculados aqui, a partir dos detalhes.
 */
router.post('/', async (req, res) => {
  const { maquina, tipo } = req.body;
  if (!['preventiva', 'corretiva'].includes(tipo)) throw requisicaoInvalida('Escolha o tipo de intervenção.');
  if (!(await queryUm('SELECT 1 FROM maquinas WHERE codigo = ?', [maquina]))) throw requisicaoInvalida('Máquina não encontrada.');
  if (!req.body.detalhes) throw requisicaoInvalida('Envie os números do orçamento.');

  const detalhes = normalizar(req.body.detalhes);
  const agora = Math.round(calcOrcamento(detalhes).total);
  const quebra = Math.round(calcOrcamento(detalhes, true).total);
  const total = tipo === 'corretiva' ? quebra : agora;

  const [r] = await pool.query(`
    INSERT INTO orcamentos (maquina, tipo, total, cuidar_agora, esperar_quebrar, detalhes, usuario_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)`, [maquina, tipo, total, agora, quebra, JSON.stringify(detalhes), req.usuario.id]);

  res.status(201).json({ id: codigoOrcamento(r.insertId), maquina, tipo, total, cuidarAgora: agora, esperarQuebrar: quebra });
});

module.exports = router;
