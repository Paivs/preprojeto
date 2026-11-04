/* ============================================================
   ORDENS DE SERVIÇO · consulta, criação e efeitos da mudança de status
   ============================================================ */
const { queryUm } = require('../config/db');
const { codigoOS, codigoChamado, sqlDia, sqlIso } = require('../utils/formatos');
const { requisicaoInvalida, conflito } = require('../utils/http');
const { avancarChamado } = require('./chamados');

// SELECT padrão: já devolve prazo formatado e se a OS está vencida.
const SELECT_OS = `
  SELECT o.*, m.nome AS maquina_nome,
         ${sqlDia('o.prazo')} AS prazo_br,
         ${sqlIso('o.prazo')} AS prazo_iso,
         (o.status <> 'concluida' AND o.prazo < CURDATE()) AS vencida
    FROM ordens_servico o
    JOIN maquinas m ON m.codigo = o.maquina`;

/** Linha do banco -> objeto usado pelo front-end. */
function formatarOS(o) {
  return {
    id: codigoOS(o.id),
    titulo: o.titulo,
    ativo: o.maquina,
    maquinaNome: o.maquina_nome,
    equipe: o.equipe,
    prioridade: o.prioridade,
    status: o.status,
    prazo: o.prazo_br,
    prazoISO: o.prazo_iso,
    descricao: o.descricao || '',
    origem: o.origem,
    alertaId: o.alerta_id,
    chamado: o.chamado_id ? codigoChamado(o.chamado_id) : null,
    vencida: Boolean(o.vencida)
  };
}

async function buscarOS(id) {
  const o = await queryUm(SELECT_OS + ' WHERE o.id = ?', [id]);
  return o ? formatarOS(o) : null;
}

/**
 * Cria uma OS. Usada pela tela de ordens, pelos alertas, pela planta,
 * pelo orçamento e pela triagem de chamados.
 * Se a equipe ou o prazo não vierem, usa a equipe padrão do setor e prazo de 7 dias.
 */
async function criarOS(conexao, dados, usuarioId) {
  const titulo = String(dados.titulo || '').trim();
  const maquina = String(dados.ativo || dados.maquina || '').trim().toUpperCase();
  if (!titulo || !maquina) throw requisicaoInvalida('Informe o título e a máquina.');

  const [[m]] = await conexao.query(
    'SELECT m.codigo, s.equipe_padrao FROM maquinas m JOIN setores s ON s.nome = m.setor WHERE m.codigo = ?', [maquina]);
  if (!m) throw requisicaoInvalida('Máquina não encontrada.');

  const prioridade = ['alta', 'media', 'baixa'].includes(dados.prioridade) ? dados.prioridade : 'media';
  const prazo = /^\d{4}-\d{2}-\d{2}$/.test(dados.prazo || '') ? dados.prazo : null;

  // Não deixa criar duas OS abertas para o mesmo alerta
  if (dados.alertaId) {
    const [[existente]] = await conexao.query(
      "SELECT id FROM ordens_servico WHERE alerta_id = ? AND status <> 'concluida'", [dados.alertaId]);
    if (existente) throw conflito(`Este alerta já tem a ${codigoOS(existente.id)} em aberto.`);
  }

  const [r] = await conexao.query(`
    INSERT INTO ordens_servico (titulo, maquina, equipe, prioridade, status, prazo, descricao, origem, alerta_id, chamado_id, criado_por)
    VALUES (?, ?, ?, ?, 'aberta', COALESCE(?, CURDATE() + INTERVAL 7 DAY), ?, ?, ?, ?, ?)`,
  [titulo, maquina, dados.equipe || m.equipe_padrao, prioridade, prazo, dados.descricao || '',
    dados.origem || 'manual', dados.alertaId || null, dados.chamadoId || null, usuarioId]);

  // Quem gera uma OS a partir de um alerta está "de olho" nele
  if (dados.alertaId) {
    await conexao.query(
      "UPDATE alertas SET estado = 'reconhecido', reconhecido_em = NOW(), reconhecido_por = ? WHERE id = ? AND estado = 'novo'",
      [usuarioId, dados.alertaId]);
  }
  return r.insertId;
}

/**
 * Efeitos colaterais quando a OS muda de status:
 *  - andamento: marca o início e leva o chamado ligado para "Em reparo"
 *  - concluida: marca a conclusão, resolve o alerta e conclui o chamado
 *  - reabrir uma OS concluída apaga a data de conclusão
 */
async function aplicarStatus(conexao, os, novoStatus) {
  if (novoStatus === 'andamento') {
    await conexao.query('UPDATE ordens_servico SET iniciada_em = COALESCE(iniciada_em, NOW()), concluida_em = NULL WHERE id = ?', [os.id]);
    if (os.chamado_id) await avancarChamado(conexao, os.chamado_id, 3, codigoOS(os.id));
  } else if (novoStatus === 'concluida') {
    await conexao.query('UPDATE ordens_servico SET concluida_em = NOW() WHERE id = ?', [os.id]);
    if (os.alerta_id) await conexao.query("UPDATE alertas SET estado = 'resolvido' WHERE id = ?", [os.alerta_id]);
    if (os.chamado_id) await avancarChamado(conexao, os.chamado_id, 4, 'Reparo finalizado');
  } else {
    await conexao.query('UPDATE ordens_servico SET concluida_em = NULL WHERE id = ?', [os.id]);
  }
}

module.exports = { SELECT_OS, formatarOS, buscarOS, criarOS, aplicarStatus };
