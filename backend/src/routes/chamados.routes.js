/* ============================================================
   /api/chamados · chamados do chão de fábrica
   Funcionário: abre, acompanha e comenta os PRÓPRIOS chamados.
   Gestor: vê todos, faz a triagem e gera a OS.
   ============================================================ */
const { Router } = require('express');
const fs = require('fs');
const { query, queryUm, transacao } = require('../config/db');
const { permitir } = require('../middlewares/auth');
const { uploadFoto } = require('../middlewares/upload');
const { requisicaoInvalida, naoEncontrado, proibido, conflito } = require('../utils/http');
const { idDoCodigo, codigoOS } = require('../utils/formatos');
const { listarChamados, avancarChamado } = require('../services/chamados');
const { criarOS } = require('../services/ordens');

const router = Router();
const URGENCIAS = ['Baixa', 'Média', 'Alta', 'Máquina parada'];
const SITUACOES = ['Registrado', 'Triado', 'Técnico designado', 'Em reparo', 'Concluído'];
// Prioridade sugerida a partir da urgência informada pelo funcionário
const PRIORIDADE_DA_URGENCIA = { 'Baixa': 'baixa', 'Média': 'media', 'Alta': 'alta', 'Máquina parada': 'alta' };
const NOME_PRIORIDADE = { alta: 'alta', media: 'média', baixa: 'baixa' };

/** Busca um chamado e confere se o usuário pode mexer nele. */
async function chamadoPermitido(req) {
  const id = idDoCodigo(req.params.id);
  const chamado = await queryUm('SELECT * FROM chamados WHERE id = ?', [id]);
  if (!chamado) throw naoEncontrado('Chamado não encontrado.');
  if (req.usuario.perfil === 'funcionario' && chamado.usuario_id !== req.usuario.id) {
    throw proibido('Você só pode ver os seus próprios chamados.');
  }
  return chamado;
}
const umChamado = async id => (await listarChamados({ id }))[0];

/** GET /api/chamados?situacao= · funcionário recebe só os dele. */
router.get('/', async (req, res) => {
  const situacao = SITUACOES.includes(req.query.situacao) ? req.query.situacao : null;
  const usuarioId = req.usuario.perfil === 'funcionario' ? req.usuario.id : null;
  res.json(await listarChamados({ usuarioId, situacao }));
});

/**
 * POST /api/chamados
 * JSON: { maquina, problema, urgencia, descricao }
 * ou multipart/form-data: campo "dados" (JSON acima) + campo "foto" (imagem)
 */
router.post('/', uploadFoto.single('foto'), async (req, res) => {
  // Com foto, os dados chegam como texto JSON no campo "dados"
  let dados = req.body;
  if (typeof req.body.dados === 'string') {
    try { dados = JSON.parse(req.body.dados); } catch { throw requisicaoInvalida('Dados do chamado inválidos.'); }
  }

  const descricao = String(dados.descricao || '').trim();
  const maquina = await queryUm('SELECT codigo, setor FROM maquinas WHERE codigo = ?', [dados.maquina]);
  if (!maquina || descricao.length < 5) {
    if (req.file) fs.unlink(req.file.path, () => {}); // descarta a foto de um chamado inválido
    throw requisicaoInvalida('Escolha a máquina e descreva o que está acontecendo.');
  }

  const urgencia = URGENCIAS.includes(dados.urgencia) ? dados.urgencia : 'Média';
  const foto = req.file ? '/uploads/' + req.file.filename : null;

  const id = await transacao(async conexao => {
    const [r] = await conexao.query(`
      INSERT INTO chamados (maquina, problema, urgencia, setor, descricao, foto, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [maquina.codigo, String(dados.problema || 'Outro').slice(0, 40), urgencia,
      req.usuario.setor || maquina.setor, descricao, foto, req.usuario.id]);
    await conexao.query('INSERT INTO chamado_eventos (chamado_id, etapa, detalhe) VALUES (?, 0, ?)',
      [r.insertId, 'por ' + req.usuario.nome]);
    return r.insertId;
  });

  res.status(201).json(await umChamado(id));
});

/** POST /api/chamados/:id/comentarios · corpo: { texto } */
router.post('/:id/comentarios', async (req, res) => {
  const chamado = await chamadoPermitido(req);
  const texto = String(req.body.texto || '').trim();
  if (!texto) throw requisicaoInvalida('Escreva o comentário antes de enviar.');

  await query('INSERT INTO chamado_comentarios (chamado_id, usuario_id, texto) VALUES (?, ?, ?)',
    [chamado.id, req.usuario.id, texto.slice(0, 1000)]);
  res.status(201).json(await umChamado(chamado.id));
});

/** PATCH /api/chamados/:id/triagem · gestor define prioridade e equipe. */
router.patch('/:id/triagem', permitir('gestor'), async (req, res) => {
  const chamado = await chamadoPermitido(req);
  const { prioridade, equipe } = req.body;
  if (!NOME_PRIORIDADE[prioridade]) throw requisicaoInvalida('Escolha a prioridade.');
  if (!equipe || !(await queryUm('SELECT 1 FROM equipes WHERE nome = ?', [equipe]))) throw requisicaoInvalida('Escolha a equipe.');

  await transacao(async conexao => {
    await conexao.query('UPDATE chamados SET prioridade = ?, equipe = ? WHERE id = ?', [prioridade, equipe, chamado.id]);
    await avancarChamado(conexao, chamado.id, 1, `prioridade ${NOME_PRIORIDADE[prioridade]} · ${equipe}`);
  });
  res.json(await umChamado(chamado.id));
});

/**
 * POST /api/chamados/:id/ordem · gestor gera a OS do chamado.
 * Se o chamado ainda não foi triado, a triagem é feita com a sugestão da urgência.
 */
router.post('/:id/ordem', permitir('gestor'), async (req, res) => {
  const chamado = await chamadoPermitido(req);
  const jaTem = await queryUm("SELECT id FROM ordens_servico WHERE chamado_id = ? AND status <> 'concluida'", [chamado.id]);
  if (jaTem) throw conflito(`Este chamado já tem a ${codigoOS(jaTem.id)} em aberto.`);
  if (chamado.situacao === 'Concluído') throw requisicaoInvalida('Este chamado já foi concluído.');

  const prioridade = NOME_PRIORIDADE[req.body.prioridade] ? req.body.prioridade
    : chamado.prioridade || PRIORIDADE_DA_URGENCIA[chamado.urgencia];
  const equipe = req.body.equipe || chamado.equipe || undefined; // undefined -> equipe padrão do setor

  await transacao(async conexao => {
    const osId = await criarOS(conexao, {
      titulo: `${chamado.problema} · ${chamado.maquina}`,
      ativo: chamado.maquina,
      prioridade,
      equipe,
      prazo: req.body.prazo,
      descricao: chamado.descricao,
      origem: 'chamado',
      chamadoId: chamado.id
    }, req.usuario.id);

    const [[os]] = await conexao.query('SELECT equipe FROM ordens_servico WHERE id = ?', [osId]);
    await conexao.query('UPDATE chamados SET prioridade = ?, equipe = ? WHERE id = ?', [prioridade, os.equipe, chamado.id]);
    if (chamado.situacao === 'Registrado') {
      await avancarChamado(conexao, chamado.id, 1, `prioridade ${NOME_PRIORIDADE[prioridade]} · ${os.equipe}`);
    }
    await avancarChamado(conexao, chamado.id, 2, `Equipe ${os.equipe} · ${codigoOS(osId)}`);
  });

  res.status(201).json(await umChamado(chamado.id));
});

module.exports = router;
