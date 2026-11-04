/* ============================================================
   /api/maquinas · cadastro e consulta de máquinas
   ============================================================ */
const { Router } = require('express');
const { query, queryUm, transacao } = require('../config/db');
const { equipeManutencao } = require('../middlewares/auth');
const { requisicaoInvalida, naoEncontrado, conflito } = require('../utils/http');
const { sqlDia, sqlDiaHora, sqlDataRelativa } = require('../utils/formatos');
const { statusDaSaude, situacaoDaLeitura, carregarGrandezas } = require('../services/saude');
const { SELECT_OS, formatarOS } = require('../services/ordens');

const router = Router();

// Colunas devolvidas para a tela (nomes iguais aos usados no front-end)
const COLUNAS = `
  codigo AS id, nome, setor, saude, tendencia AS tend,
  custo_parada_hora AS custoParada,
  ${sqlDataRelativa('ultima_medicao')} AS ultima,
  COALESCE(${sqlDia('proxima_manutencao')}, '—') AS prox`;

/**
 * GET /api/maquinas?setor=&status=&ordem=saude|codigo|setor
 * Liberada também para o funcionário (ele escolhe a máquina no chamado).
 */
router.get('/', async (req, res) => {
  const { setor, status, ordem = 'saude' } = req.query;
  const ordens = { saude: 'saude, codigo', codigo: 'codigo', setor: 'setor, codigo' };

  const params = [];
  let sql = `SELECT ${COLUNAS} FROM maquinas`;
  if (setor) { sql += ' WHERE setor = ?'; params.push(setor); }
  sql += ' ORDER BY ' + (ordens[ordem] || ordens.saude);

  let lista = (await query(sql, params)).map(m => ({ ...m, status: statusDaSaude(m.saude) }));
  if (status) lista = lista.filter(m => m.status === status); // status é calculado a partir da saúde
  res.json(lista);
});

/** GET /api/maquinas/:id · detalhe com últimas medições e OS em aberto. */
router.get('/:id', equipeManutencao, async (req, res) => {
  const m = await queryUm(`SELECT ${COLUNAS} FROM maquinas WHERE codigo = ?`, [req.params.id]);
  if (!m) throw naoEncontrado('Máquina não encontrada.');

  const grandezas = await carregarGrandezas();
  const medicoes = await query(`
    SELECT id, ${sqlDiaHora('medido_em')} AS data, grandeza, valor, observacao AS obs
      FROM medicoes WHERE maquina = ? ORDER BY medido_em DESC, id DESC LIMIT 5`, [m.id]);
  const ordens = await query(SELECT_OS + " WHERE o.maquina = ? AND o.status <> 'concluida' ORDER BY o.prazo", [m.id]);

  res.json({
    ...m,
    status: statusDaSaude(m.saude),
    medicoes: medicoes.map(x => {
      const g = grandezas[x.grandeza];
      return { ...x, nome: g.nome, unidade: g.unidade, situacao: situacaoDaLeitura(x.valor, g) };
    }),
    ordens: ordens.map(formatarOS)
  });
});

/**
 * POST /api/maquinas
 * corpo: { id, nome, setor, prox (AAAA-MM-DD), custoParada }
 * Se o setor for novo, ele é criado com a base de custos padrão.
 */
router.post('/', equipeManutencao, async (req, res) => {
  const codigo = String(req.body.id || '').trim().toUpperCase();
  const nome = String(req.body.nome || '').trim();
  const setor = String(req.body.setor || '').trim();
  const prox = /^\d{4}-\d{2}-\d{2}$/.test(req.body.prox || '') ? req.body.prox : null;
  const custoParada = Math.max(0, Number(req.body.custoParada) || 0);

  if (!codigo || !nome || !setor) throw requisicaoInvalida('Informe código, nome e setor.');
  if (!/^[A-Z0-9-]{2,20}$/.test(codigo)) throw requisicaoInvalida('O código deve ter só letras, números e hífen (ex.: PH-06).');
  if (await queryUm('SELECT 1 FROM maquinas WHERE codigo = ?', [codigo])) {
    throw conflito(`Já existe uma máquina com o código ${codigo}.`);
  }

  await transacao(async conexao => {
    await conexao.query("INSERT IGNORE INTO setores (nome, equipe_padrao) VALUES (?, 'Mecânica')", [setor]);
    await conexao.query(
      'INSERT INTO maquinas (codigo, nome, setor, saude, proxima_manutencao, custo_parada_hora) VALUES (?, ?, ?, 100, ?, ?)',
      [codigo, nome, setor, prox, custoParada]);
  });

  const nova = await queryUm(`SELECT ${COLUNAS} FROM maquinas WHERE codigo = ?`, [codigo]);
  res.status(201).json({ ...nova, status: statusDaSaude(nova.saude) });
});

module.exports = router;
