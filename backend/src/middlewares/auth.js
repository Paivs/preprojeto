/* ============================================================
   AUTENTICAÇÃO (JWT)
   - autenticar: exige o cabeçalho "Authorization: Bearer <token>"
   - permitir:   libera a rota só para alguns perfis
   ============================================================ */
const jwt = require('jsonwebtoken');
const { naoAutorizado, proibido } = require('../utils/http');

const SEGREDO = process.env.JWT_SECRET || 'troque-este-segredo-no-env';

/** Gera o token devolvido no login. "manter conectado" = 30 dias; senão 8 horas. */
function gerarToken(usuario, manter) {
  return jwt.sign(usuario, SEGREDO, { expiresIn: manter ? '30d' : '8h' });
}

/** Lê e valida o token. Se for válido, req.usuario = { id, nome, email, perfil, setor }. */
function autenticar(req, _res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    throw naoAutorizado('Faça login para continuar.');
  }
  try {
    req.usuario = jwt.verify(token, SEGREDO);
    next();
  } catch {
    throw naoAutorizado('Sua sessão expirou. Entre de novo.');
  }
}

/** Ex.: router.put('/limites', permitir('gestor'), ...) */
function permitir(...perfis) {
  return (req, _res, next) => {
    if (!perfis.includes(req.usuario.perfil)) {
      throw proibido('Seu perfil não tem acesso a esta ação.');
    }
    next();
  };
}

// Atalho para as rotas da equipe de manutenção (gestor e técnico).
const equipeManutencao = permitir('gestor', 'tecnico');

module.exports = { gerarToken, autenticar, permitir, equipeManutencao };
