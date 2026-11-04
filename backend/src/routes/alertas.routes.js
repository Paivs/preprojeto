/* ============================================================
   /api/alertas e /api/limites
   ============================================================ */
const { Router } = require('express');
const { query, queryUm } = require('../config/db');
const { permitir, equipeManutencao } = require('../middlewares/auth');
const { requisicaoInvalida, naoEncontrado } = require('../utils/http');
const { tempoDecorrido } = require('../utils/formatos');

const router = Router();

/** Consulta de alertas já no formato da tela. */
async function listarAlertas({ setor, incluirResolvidos = false, id } = {}) {
  const filtros = [];
  const params = [];
  if (!incluirResolvidos) filtros.push("a.estado <> 'resolvido'");
  if (setor) { filtros.push('m.setor = ?'); params.push(setor); }
  if (id) { filtros.push('a.id = ?'); params.push(id); }

  const linhas = await query(`
    SELECT a.*, m.nome AS maquina_nome, m.setor,
           TIMESTAMPDIFF(MINUTE, a.criado_em, NOW()) AS minutos,
           (SELECT o.id FROM ordens_servico o WHERE o.alerta_id = a.id AND o.status <> 'concluida' LIMIT 1) AS os_id
      FROM alertas a
      JOIN maquinas m ON m.codigo = a.maquina
     ${filtros.length ? 'WHERE ' + filtros.join(' AND ') : ''}
     ORDER BY FIELD(a.nivel, 'critico', 'atencao', 'info'), a.criado_em DESC`, params);

  return linhas.map(a => ({
    id: a.id,
    nivel: a.nivel,
    titulo: a.titulo,
    ativo: a.maquina,
    maquina: a.maquina_nome,
    setor: a.setor,
    grandeza: a.grandeza,
    ha: tempoDecorrido(a.minutos),
    min: a.minutos,
    estado: a.estado,
    medido: a.medido_texto,
    limite: a.limite_texto,
    previsao: a.previsao,
    acao: a.acao,
    temOS: Boolean(a.os_id)
  }));
}

/** GET /api/alertas?setor=Estamparia · alertas ativos (não resolvidos). */
router.get('/alertas', async (req, res) => {
  res.json(await listarAlertas({ setor: req.query.setor }));
});

/** PATCH /api/alertas/:id/reconhecer · "alguém já está de olho". */
router.patch('/alertas/:id/reconhecer', equipeManutencao, async (req, res) => {
  const id = Number(req.params.id);
  const alerta = await queryUm('SELECT id FROM alertas WHERE id = ?', [id]);
  if (!alerta) throw naoEncontrado('Alerta não encontrado.');

  await query("UPDATE alertas SET estado = 'reconhecido', reconhecido_em = NOW(), reconhecido_por = ? WHERE id = ? AND estado = 'novo'",
    [req.usuario.id, id]);
  res.json((await listarAlertas({ id, incluirResolvidos: true }))[0]);
});

/** GET /api/limites · { vibracao: { nome, un, atencao, limite }, ... } */
router.get('/limites', equipeManutencao, async (_req, res) => {
  const linhas = await query('SELECT * FROM grandezas ORDER BY FIELD(codigo, "vibracao", "temperatura", "corrente")');
  res.json(Object.fromEntries(linhas.map(g => [g.codigo, {
    nome: g.nome, un: g.unidade, atencao: g.limite_atencao, limite: g.limite_alarme
  }])));
});

/** PUT /api/limites · só o gestor altera. corpo: { vibracao: { atencao, limite }, ... } */
router.put('/limites', permitir('gestor'), async (req, res) => {
  const entradas = Object.entries(req.body || {});
  if (!entradas.length) throw requisicaoInvalida('Envie os limites que deseja alterar.');

  for (const [codigo, { atencao, limite }] of entradas) {
    const a = Number(atencao);
    const l = Number(limite);
    if (!Number.isFinite(a) || !Number.isFinite(l) || a <= 0) throw requisicaoInvalida('Os limites precisam ser números positivos.');
    if (a >= l) throw requisicaoInvalida('O limite de atenção precisa ser menor que o de alarme.');
    await query('UPDATE grandezas SET limite_atencao = ?, limite_alarme = ? WHERE codigo = ?', [a, l, codigo]);
  }

  const linhas = await query('SELECT * FROM grandezas');
  res.json(Object.fromEntries(linhas.map(g => [g.codigo, { nome: g.nome, un: g.unidade, atencao: g.limite_atencao, limite: g.limite_alarme }])));
});

module.exports = { router, listarAlertas };
