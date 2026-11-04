/* ============================================================
   /api/medicoes · registro de medições e séries para os gráficos
   ============================================================ */
const { Router } = require('express');
const { query, queryUm, transacao } = require('../config/db');
const { requisicaoInvalida, naoEncontrado } = require('../utils/http');
const { sqlDia, sqlDiaHora, numeroBR } = require('../utils/formatos');
const { situacaoDaLeitura, carregarGrandezas, recalcularSaude } = require('../services/saude');
const { analisarMaquina } = require('../services/preditivo');

const router = Router();

/** GET /api/medicoes?maquina=&limite=8 · últimas medições registradas. */
router.get('/', async (req, res) => {
  const limite = Math.min(100, Math.max(1, Number(req.query.limite) || 8));
  const params = [];
  let filtro = '';
  if (req.query.maquina) { filtro = 'WHERE maquina = ?'; params.push(req.query.maquina); }

  const grandezas = await carregarGrandezas();
  const linhas = await query(`
    SELECT id, ${sqlDiaHora('medido_em')} AS data, maquina, grandeza, valor, observacao AS obs
      FROM medicoes ${filtro}
     ORDER BY medido_em DESC, id DESC
     LIMIT ?`, [...params, limite]);

  res.json(linhas.map(x => {
    const g = grandezas[x.grandeza];
    return { ...x, nome: g.nome, unidade: g.unidade, situacao: situacaoDaLeitura(x.valor, g) };
  }));
});

/**
 * GET /api/medicoes/serie?maquina=PH-03&grandeza=vibracao&dias=14
 * Pontos para o gráfico de tendência. Sem "dias", devolve tudo.
 */
router.get('/serie', async (req, res) => {
  const { maquina, grandeza } = req.query;
  const dias = Number(req.query.dias) || 0;

  const g = (await carregarGrandezas())[grandeza];
  const m = await queryUm('SELECT codigo, nome FROM maquinas WHERE codigo = ?', [maquina]);
  if (!g || !m) throw naoEncontrado('Máquina ou grandeza desconhecida.');

  const pontos = await query(`
    SELECT ${sqlDia('medido_em')} AS x, valor AS y
      FROM medicoes
     WHERE maquina = ? AND grandeza = ? ${dias ? 'AND medido_em >= NOW() - INTERVAL ? DAY' : ''}
     ORDER BY medido_em, id`, dias ? [maquina, grandeza, dias] : [maquina, grandeza]);

  res.json({
    maquina: m.codigo, maquinaNome: m.nome, grandeza, nome: g.nome, unidade: g.unidade,
    limite: g.limite_alarme, atencao: g.limite_atencao, pontos
  });
});

/**
 * POST /api/medicoes
 * corpo: { maquina, grandeza, valor, data (AAAA-MM-DDTHH:MM), obs }
 * Depois de salvar: recalcula a saúde da máquina e, se a leitura passou do
 * limite de atenção ou de alarme, abre (ou agrava) um alerta.
 */
router.post('/', async (req, res) => {
  const { maquina, grandeza, obs = '' } = req.body;
  const valor = Number(req.body.valor);

  const g = (await carregarGrandezas())[grandeza];
  const m = await queryUm('SELECT codigo FROM maquinas WHERE codigo = ?', [maquina]);
  if (!m || !g) throw requisicaoInvalida('Escolha a máquina e a grandeza.');
  if (req.body.valor === '' || req.body.valor == null || !Number.isFinite(valor)) throw requisicaoInvalida('O valor precisa ser um número.');
  if (valor < 0) throw requisicaoInvalida('O valor não pode ser negativo.');

  // "2026-10-22T08:40" -> "2026-10-22 08:40:00". Sem data, usa o horário atual.
  const data = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(req.body.data || '') ? req.body.data.slice(0, 16).replace('T', ' ') + ':00' : null;
  const situacao = situacaoDaLeitura(valor, g);

  const resultado = await transacao(async conexao => {
    const [r] = await conexao.query(
      'INSERT INTO medicoes (maquina, grandeza, valor, medido_em, observacao, usuario_id) VALUES (?, ?, ?, COALESCE(?, NOW()), ?, ?)',
      [m.codigo, grandeza, valor, data, String(obs).slice(0, 255), req.usuario.id]);

    // "Última medição" da máquina passa a ser a mais recente que existir
    await conexao.query(
      'UPDATE maquinas SET ultima_medicao = (SELECT MAX(medido_em) FROM medicoes WHERE maquina = ?) WHERE codigo = ?',
      [m.codigo, m.codigo]);
    const saude = await recalcularSaude(conexao, m.codigo);

    // Alerta automático: um por máquina + grandeza enquanto não for resolvido
    let alertaCriado = false;
    if (situacao !== 'normal') {
      const [[aberto]] = await conexao.query(
        "SELECT id, nivel FROM alertas WHERE maquina = ? AND grandeza = ? AND estado <> 'resolvido' ORDER BY id DESC LIMIT 1",
        [m.codigo, grandeza]);
      const titulo = situacao === 'critico' ? `${g.nome} acima do limite` : `${g.nome} em alta`;
      const limiteTexto = `${numeroBR(situacao === 'critico' ? g.limite_alarme : g.limite_atencao)} ${g.unidade}`;
      const medidoTexto = `${numeroBR(valor)} ${g.unidade}`;

      if (!aberto) {
        await conexao.query(`
          INSERT INTO alertas (nivel, titulo, maquina, grandeza, medido_texto, limite_texto, acao)
          VALUES (?, ?, ?, ?, ?, ?, 'Inspecionar a máquina e confirmar a leitura.')`,
        [situacao, titulo, m.codigo, grandeza, medidoTexto, limiteTexto]);
        alertaCriado = true;
      } else if (aberto.nivel === 'atencao' && situacao === 'critico') {
        // Piorou: o alerta amarelo vira vermelho e volta a ser "novo"
        await conexao.query(
          "UPDATE alertas SET nivel = 'critico', titulo = ?, medido_texto = ?, limite_texto = ?, estado = 'novo', criado_em = NOW() WHERE id = ?",
          [titulo, medidoTexto, limiteTexto, aberto.id]);
        alertaCriado = true;
      } else {
        await conexao.query('UPDATE alertas SET medido_texto = ? WHERE id = ?', [medidoTexto, aberto.id]);
      }
    }
    return { id: r.insertId, saude, alertaCriado };
  });

  // Previsão de falha do alerta (feita fora da transação, já com a leitura gravada)
  if (resultado.alertaCriado) {
    const p = await analisarMaquina(m.codigo);
    await query("UPDATE alertas SET previsao = ? WHERE maquina = ? AND grandeza = ? AND estado <> 'resolvido'",
      [`Até ${p.rulDias} ${p.rulDias === 1 ? 'dia' : 'dias'}`, m.codigo, grandeza]);
  }

  const medicao = await queryUm(`SELECT id, ${sqlDiaHora('medido_em')} AS data, maquina, grandeza, valor, observacao AS obs FROM medicoes WHERE id = ?`, [resultado.id]);
  res.status(201).json({
    medicao: { ...medicao, nome: g.nome, unidade: g.unidade, situacao },
    situacao,
    saude: resultado.saude,
    alertaCriado: resultado.alertaCriado
  });
});

module.exports = router;
