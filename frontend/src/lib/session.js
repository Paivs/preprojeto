import { API_BASE_URL } from '@/lib/api';

export function obterTokenSessao() {
  return sessionStorage.getItem('token');
}

export function obterUsuarioSessao() {
  try {
    return JSON.parse(sessionStorage.getItem('usuario') || 'null');
  } catch {
    return null;
  }
}

export function salvarSessao({ token, usuario }) {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('usuario', JSON.stringify(usuario));
}

export function limparSessao() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('usuario');
}

export function rotaInicialDoUsuario(perfil) {
  if (perfil === 'admin') return '/adminPages/clientes';
  if (perfil === 'cliente') return '/userPages/dashboard';
  return '/login';
}

export async function validarSessao(token = obterTokenSessao()) {
  if (!token) throw new Error('Sessão ausente.');
  const resposta = await fetch(`${API_BASE_URL}/auth/sessao`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const resultado = await resposta.json().catch(() => ({}));
  if (!resposta.ok || !resultado.dados?.usuario) {
    const erro = new Error(resultado.erro || 'Sessão inválida ou expirada.');
    erro.status = resposta.status;
    throw erro;
  }
  return resultado.dados.usuario;
}

export async function requisicaoAutenticada(url, opcoes = {}) {
  const token = obterTokenSessao();
  if (!token) {
    limparSessao();
    window.location.assign('/login');
    throw new Error('Sua sessão expirou. Entre novamente.');
  }

  const resposta = await fetch(url, {
    ...opcoes,
    headers: {
      ...opcoes.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (resposta.status === 401) {
    limparSessao();
    window.location.assign('/login');
  }
  return resposta;
}
