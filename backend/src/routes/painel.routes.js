/* ============================================================
   Rotas de visão geral:
   /api/dashboard, /api/planta, /api/busca e /api/equipes
   ============================================================ */
const { Router } = require('express');
const { query, queryUm } = require('../config/db');
const { equipeManutencao } = require('../middlewares/auth');
const { codigoOS, sqlDia } = require('../utils/formatos');
const { statusDaSaude, ultimasLeituras } = require('../services/saude');
const { analisarMaquina } = require('../services/preditivo');
const { SELECT_OS, formatarOS } = require('../services/ordens');
const { listarAlertas } = require('./alertas.routes');

const router = Router();

/* ---------------------------------------------------------------
   GET /api/dashboard
   --------------------------------------------------------------- */
router.get('/dashboard', equipeManutencao, async (_req, res) => {
  // Contagem de OS por status. "Concluídas" = concluídas nos últimos 30 dias.
  const os = await queryUm(`
    SELECT SUM(status = 'aberta') AS abertas,
           SUM(status = 'andamento') AS andamento,
           SUM(status = 'peca') AS peca,
           SUM(status = 'concluida' AND concluida_em >= NOW() - INTERVAL 30 DAY) AS concluidas,
           SUM(status <> 'concluida' AND prazo < CURDATE()) AS vencidas
      FROM ordens_servico`);
  Object.keys(os).forEach(k => { os[k] = Number(os[k]) || 0; });
  const emAberto = os.abertas + os.andamento + os.peca;

  const proximas = await query(SELECT_OS + " WHERE o.status <> 'concluida' ORDER BY o.prazo, o.id LIMIT 5");

  // Histórico semanal dos indicadores (as 8 semanas mais recentes)
  const semanas = (await query(`
    SELECT ${sqlDia('semana_inicio')} AS semana, disponibilidade, mtbf, mttr, os_abertas
      FROM indicadores_semanais ORDER BY semana_inicio DESC LIMIT 8`)).reverse();
  const historico = campo => semanas.map(s => ({ x: 'Sem ' + s.semana, y: s[campo] }));
  const ultima = semanas[semanas.length - 1] || { disponibilidade: 0, mtbf: 0, mttr: 0 };
  const historicoOS = historico('os_abertas');
  if (historicoOS.length) historicoOS[historicoOS.length - 1].y = emAberto; // semana atual = valor ao vivo

  const kpis = [
    { k: 'disp', rotulo: 'Disponibilidade', valor: ultima.disponibilidade, unidade: '%', casas: 1, sub: 'Meta: 95%', meta: 95, escalaMin: 92, historico: historico('disponibilidade'),
      explica: 'Percentual do tempo em que as máquinas ficaram prontas para produzir. Despenca quando uma parada que ninguém previu acontece.' },
    { k: 'mtbf', rotulo: 'MTBF', valor: ultima.mtbf, unidade: ' h', casas: 0, sub: 'Tempo médio entre falhas', escalaMin: 340, historico: historico('mtbf'),
      explica: 'Quanto tempo, em média, uma máquina roda entre uma falha e a próxima. Quanto maior, melhor.' },
    { k: 'mttr', rotulo: 'MTTR', valor: ultima.mttr, unidade: ' h', casas: 1, sub: 'Tempo médio de reparo', escalaMin: 3, historico: historico('mttr'),
      explica: 'Quanto tempo a equipe leva, em média, para devolver a máquina à produção. Quanto menor, melhor.' },
    { k: 'os', rotulo: 'OS abertas', valor: emAberto, unidade: '', casas: 0, sub: `${os.vencidas} com prazo vencido`, escalaMin: 0, historico: historicoOS,
      explica: 'Ordens de serviço ainda não concluídas (abertas, em andamento e aguardando peça). As vencidas passaram do prazo combinado.' }
  ];

  // Saúde de todas as máquinas (da pior para a melhor)
  const saude = (await query('SELECT codigo AS id, nome, setor, saude FROM maquinas ORDER BY saude, codigo'))
    .map(m => ({ ...m, status: statusDaSaude(m.saude) }));

  // Gráfico em destaque: a grandeza mais perto do limite na máquina mais doente
  let destaque = null;
  if (saude.length) {
    const pior = saude[0];
    const leituras = await ultimasLeituras(null, pior.id);
    const dominante = [...leituras].sort((a, b) => b.razao - a.razao)[0];
    if (dominante) {
      const pontos = await query(`SELECT ${sqlDia('medido_em')} AS x, valor AS y FROM medicoes
                                   WHERE maquina = ? AND grandeza = ? ORDER BY medido_em, id`, [pior.id, dominante.grandeza]);
      destaque = { maquina: pior.id, maquinaNome: pior.nome, grandeza: dominante.grandeza, nome: dominante.nome,
        unidade: dominante.unidade, limite: dominante.limite_alarme, pontos };
    }
  }

  const todosAlertas = await listarAlertas();
  res.json({
    kpis,
    destaque,
    alertas: todosAlertas.filter(a => a.estado === 'novo').sort((a, b) => a.min - b.min).slice(0, 4),
    todosAlertas,
    saude,
    osPorStatus: { ...os, proximas: proximas.map(formatarOS) },
    maquinas: saude.map(m => ({ id: m.id, nome: m.nome })).sort((a, b) => a.id.localeCompare(b.id))
  });
});

/* ---------------------------------------------------------------
   PLANTA AO VIVO
   --------------------------------------------------------------- */

/** GET /api/planta/resumo · quantas máquinas em cada status (pulso da lateral). */
router.get('/planta/resumo', equipeManutencao, async (_req, res) => {
  const contagem = { criticos: 0, atencao: 0, normais: 0 };
  const chave = { critico: 'criticos', atencao: 'atencao', normal: 'normais' };
  (await query('SELECT saude FROM maquinas')).forEach(m => { contagem[chave[statusDaSaude(m.saude)]]++; });
  res.json(contagem);
});

/**
 * GET /api/planta?horas=-6
 * Mapa de calor agrupado por setor. "horas" negativo = replay:
 * a saúde no passado é estimada pela tendência de cada máquina
 * (pontos de saúde perdidos por hora).
 */
router.get('/planta', equipeManutencao, async (req, res) => {
  const horas = Math.max(-24, Math.min(0, Number(req.query.horas) || 0));
  const maquinas = await query('SELECT codigo, nome, setor, saude, tendencia FROM maquinas ORDER BY setor, codigo');

  const zonas = {};
  for (const m of maquinas) {
    const saude = Math.max(5, Math.min(100, Math.round(m.saude - m.tendencia * horas)));
    (zonas[m.setor] = zonas[m.setor] || []).push({ id: m.codigo, nome: m.nome, saude, status: statusDaSaude(saude) });
  }
  res.json({ horas, zonas: Object.entries(zonas).map(([nome, lista]) => ({ nome, maquinas: lista })) });
});

/** GET /api/planta/:id/preditivo · vida útil restante e fatores de risco. */
router.get('/planta/:id/preditivo', equipeManutencao, async (req, res) => {
  res.json(await analisarMaquina(req.params.id));
});

/* ---------------------------------------------------------------
   GET /api/busca?q=PH · busca da barra superior
   --------------------------------------------------------------- */
router.get('/busca', equipeManutencao, async (req, res) => {
  const termo = String(req.query.q || '').trim();
  if (termo.length < 2) return res.json([]);
  const like = `%${termo}%`;

  const maquinas = await query('SELECT codigo, nome, setor FROM maquinas WHERE codigo LIKE ? OR nome LIKE ? ORDER BY codigo LIMIT 4', [like, like]);
  const ordens = await query(`SELECT id, titulo, maquina FROM ordens_servico
                               WHERE titulo LIKE ? OR maquina LIKE ? OR CONCAT('OS-', LPAD(id, 4, '0')) LIKE ?
                               ORDER BY status = 'concluida', id DESC LIMIT 4`, [like, like, like]);
  const alertas = await query("SELECT id, titulo, maquina FROM alertas WHERE estado <> 'resolvido' AND (titulo LIKE ? OR maquina LIKE ?) LIMIT 3", [like, like]);

  res.json([
    ...maquinas.map(m => ({ tipo: 'Máquina', titulo: `${m.codigo} · ${m.nome}`, sub: m.setor, href: '/maquinas?id=' + m.codigo })),
    ...ordens.map(o => ({ tipo: 'Ordem de serviço', titulo: `${codigoOS(o.id)} · ${o.titulo}`, sub: o.maquina, href: '/ordens?os=' + codigoOS(o.id) })),
    ...alertas.map(a => ({ tipo: 'Alerta', titulo: a.titulo, sub: a.maquina, href: '/alertas?id=' + a.id }))
  ].slice(0, 8));
});

/* ---------------------------------------------------------------
   GET /api/equipes · lista usada nos filtros e formulários
   --------------------------------------------------------------- */
router.get('/equipes', async (_req, res) => {
  res.json((await query('SELECT nome FROM equipes ORDER BY nome')).map(e => e.nome));
});

module.exports = router;
