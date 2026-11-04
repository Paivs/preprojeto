/* ============================================================
   CHAMADOS · linha do tempo e mudanças de situação
   Etapas: 0 Registrado -> 1 Triado -> 2 Técnico designado
           -> 3 Em reparo -> 4 Concluído
   ============================================================ */
const { query } = require('../config/db');
const { codigoChamado, codigoOS, sqlDiaHora } = require('../utils/formatos');

const ETAPAS = ['Registrado', 'Triado pelo gestor', 'Técnico designado', 'Em reparo', 'Concluído'];
const SITUACOES = ['Registrado', 'Triado', 'Técnico designado', 'Em reparo', 'Concluído'];

/**
 * Leva o chamado para uma etapa e grava o evento na linha do tempo.
 * Nunca volta etapa: se o chamado já está mais adiante, só registra o evento.
 */
async function avancarChamado(conexao, chamadoId, etapa, detalhe = '') {
  await conexao.query(`
    INSERT INTO chamado_eventos (chamado_id, etapa, quando, detalhe)
    VALUES (?, ?, NOW(), ?)
    ON DUPLICATE KEY UPDATE quando = NOW(), detalhe = ?`, [chamadoId, etapa, detalhe, detalhe]);

  const [[chamado]] = await conexao.query('SELECT situacao FROM chamados WHERE id = ?', [chamadoId]);
  if (chamado && SITUACOES.indexOf(chamado.situacao) < etapa) {
    await conexao.query('UPDATE chamados SET situacao = ? WHERE id = ?', [SITUACOES[etapa], chamadoId]);
  }
}

/** Busca chamados (com eventos, comentários e OS ligada) no formato usado pelo front. */
async function listarChamados({ usuarioId = null, situacao = null, id = null } = {}) {
  const filtros = [];
  const params = [];
  if (usuarioId) { filtros.push('c.usuario_id = ?'); params.push(usuarioId); }
  if (situacao) { filtros.push('c.situacao = ?'); params.push(situacao); }
  if (id) { filtros.push('c.id = ?'); params.push(id); }

  const chamados = await query(`
    SELECT c.*, ${sqlDiaHora('c.criado_em')} AS aberto, m.nome AS maquina_nome, u.nome AS autor,
           (SELECT o.id FROM ordens_servico o WHERE o.chamado_id = c.id ORDER BY o.id DESC LIMIT 1) AS os_id
      FROM chamados c
      JOIN maquinas m ON m.codigo = c.maquina
      JOIN usuarios u ON u.id = c.usuario_id
     ${filtros.length ? 'WHERE ' + filtros.join(' AND ') : ''}
     ORDER BY c.criado_em DESC`, params);
  if (!chamados.length) return [];

  const ids = chamados.map(c => c.id);
  const eventos = await query(`SELECT chamado_id, etapa, ${sqlDiaHora('quando')} AS quando, detalhe
                                 FROM chamado_eventos WHERE chamado_id IN (?)`, [ids]);
  const comentarios = await query(`SELECT k.chamado_id, ${sqlDiaHora('k.criado_em')} AS quando, k.texto, u.nome AS autor
                                     FROM chamado_comentarios k JOIN usuarios u ON u.id = k.usuario_id
                                    WHERE k.chamado_id IN (?) ORDER BY k.criado_em`, [ids]);

  return chamados.map(c => {
    const etapaAtual = SITUACOES.indexOf(c.situacao);
    const doChamado = eventos.filter(e => e.chamado_id === c.id);
    return {
      id: codigoChamado(c.id),
      maquina: c.maquina,
      maquinaNome: c.maquina_nome,
      problema: c.problema,
      urgencia: c.urgencia,
      situacao: c.situacao,
      aberto: c.aberto,
      setor: c.setor,
      descricao: c.descricao,
      foto: c.foto,
      prioridade: c.prioridade,
      equipe: c.equipe,
      autor: c.autor,
      autorId: c.usuario_id,
      ordem: c.os_id ? codigoOS(c.os_id) : null,
      comentarios: comentarios.filter(k => k.chamado_id === c.id).map(({ quando, texto, autor }) => ({ quando, texto, autor })),
      timeline: ETAPAS.map((nome, i) => {
        const evento = doChamado.find(e => e.etapa === i);
        let estado = 'pendente';
        if (i < etapaAtual || (i === etapaAtual && i === ETAPAS.length - 1)) estado = 'feito';
        else if (i === etapaAtual) estado = 'atual';
        return { nome, estado, quando: evento ? evento.quando : '', detalhe: evento ? evento.detalhe : '' };
      })
    };
  });
}

module.exports = { ETAPAS, SITUACOES, avancarChamado, listarChamados };
