import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'chave-padrao-desenvolvimento';

export function autenticar(req, res, next) {
  const headerAuth = req.headers.authorization;
  const [tipo, token] = typeof headerAuth === 'string' ? headerAuth.split(' ') : [];

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ sucesso: false, erro: 'Token de autenticação ausente.' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.usuario = {
      id: Number(payload.sub),
      perfil: payload.perfil
    };
    return next();
  } catch {
    return res.status(401).json({ sucesso: false, erro: 'Token inválido ou expirado.' });
  }
}

export function autorizarPerfis(...perfisPermitidos) {
  return function autorizar(req, res, next) {
    if (!req.usuario) {
      return res.status(401).json({ sucesso: false, erro: 'Autenticação necessária.' });
    }
    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({ sucesso: false, erro: 'Você não tem permissão para acessar este recurso.' });
    }
    return next();
  };
}

export const autorizarAdmin = autorizarPerfis('admin');