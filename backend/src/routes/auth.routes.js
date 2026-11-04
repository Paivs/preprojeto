/* ============================================================
   /api/auth · login e recuperação de senha (rotas públicas)
   ============================================================ */
const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { query, queryUm } = require('../config/db');
const { gerarToken, autenticar } = require('../middlewares/auth');
const { requisicaoInvalida, naoAutorizado, proibido } = require('../utils/http');

const router = Router();
const NOMES_PERFIL = { gestor: 'Gestor', tecnico: 'Técnico', funcionario: 'Funcionário' };

/**
 * POST /api/auth/login
 * corpo: { usuario (e-mail ou matrícula), senha, perfil, manter }
 */
router.post('/login', async (req, res) => {
  const login = String(req.body.usuario || '').trim().toLowerCase();
  const { senha, perfil, manter } = req.body;
  if (!login || !senha) throw requisicaoInvalida('Preencha e-mail (ou matrícula) e senha.');
  if (!NOMES_PERFIL[perfil]) throw requisicaoInvalida('Escolha o perfil de acesso.');

  const usuario = await queryUm(
    'SELECT * FROM usuarios WHERE ativo = 1 AND (LOWER(email) = ? OR LOWER(matricula) = ?)', [login, login]);

  // Mesma mensagem para usuário inexistente e senha errada (não revela quem existe)
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
    throw naoAutorizado('E-mail ou senha incorretos.');
  }

  const perfis = (await query('SELECT perfil FROM usuario_perfis WHERE usuario_id = ?', [usuario.id])).map(p => p.perfil);
  if (!perfis.includes(perfil)) {
    throw proibido(`Este usuário não tem acesso ao perfil ${NOMES_PERFIL[perfil]}.`);
  }

  // Funcionário sem setor cadastrado (ex.: o admin) cai no primeiro setor
  let setor = usuario.setor;
  if (perfil === 'funcionario' && !setor) {
    setor = (await queryUm('SELECT nome FROM setores ORDER BY nome LIMIT 1'))?.nome || null;
  }

  const dadosDoToken = { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil, setor: perfil === 'funcionario' ? setor : null };
  res.json({ token: gerarToken(dadosDoToken, Boolean(manter)), usuario: dadosDoToken });
});

/**
 * POST /api/auth/recuperar
 * Registra o pedido de nova senha para o administrador.
 * Sempre responde ok, para não revelar se o e-mail existe.
 */
router.post('/recuperar', async (req, res) => {
  const login = String(req.body.usuario || '').trim().toLowerCase();
  if (!login) throw requisicaoInvalida('Informe seu e-mail ou matrícula.');

  const usuario = await queryUm('SELECT id FROM usuarios WHERE LOWER(email) = ? OR LOWER(matricula) = ?', [login, login]);
  await query('INSERT INTO pedidos_senha (usuario_informado, usuario_id) VALUES (?, ?)', [login, usuario ? usuario.id : null]);
  res.json({ ok: true });
});

/** GET /api/auth/eu · devolve quem está logado (útil para validar o token). */
router.get('/eu', autenticar, (req, res) => res.json(req.usuario));

module.exports = router;
