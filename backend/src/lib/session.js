import jwt from 'jsonwebtoken';

const DURACAO_SESSAO = '2h';

function obterSegredo() {
  const segredo = process.env.JWT_SECRET;
  if (!segredo) throw new Error('JWT_SECRET não definido no .env.');
  return segredo;
}

export function criarSessao(usuario) {
  const token = jwt.sign(
    { perfil: usuario.perfil },
    obterSegredo(),
    { subject: String(usuario.id_usuario), expiresIn: DURACAO_SESSAO },
  );
  return { token, tipo: 'Bearer', expiraEm: DURACAO_SESSAO };
}

export function verificarSessao(token) {
  const payload = jwt.verify(token, obterSegredo());
  const id = Number(payload.sub);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Sessão inválida.');
  return { id, perfil: payload.perfil };
}
