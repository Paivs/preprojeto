import { API_URL, CHAVE_TOKEN, CHAVE_USUARIO } from "./constantes";

async function requisitar(caminho, token) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(corpo.message || corpo.mensagem || corpo.erro || `Erro ${resposta.status}`);
  return corpo;
}

export async function chamarApi(caminho, token, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
    cache: "no-store",
  });
  if (resposta.status === 204) return null;
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(corpo.message || corpo.mensagem || corpo.erro || `Erro ${resposta.status}`);
  return corpo.dados ?? corpo;
}

export function carregarSessao() {
  const token = localStorage.getItem(CHAVE_TOKEN);
  const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO);
  return { token, usuario: usuarioSalvo ? JSON.parse(usuarioSalvo) : null };
}

export function salvarSessao(token, usuario) {
  localStorage.setItem(CHAVE_TOKEN, token);
  localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
}

export function limparSessao() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_USUARIO);
}

export async function verificarSaude() {
  try {
    await requisitar("/health");
    return "online";
  } catch {
    return "offline";
  }
}

export async function entrarComoAdmin(matricula, senha) {
  const resposta = await fetch(`${API_URL}/usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matricula, senha }),
  });
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(corpo.message || `Erro ${resposta.status}`);
  if (corpo.usuario?.perfil !== "ADMIN") throw new Error("Esta página exige uma conta ADMIN.");
  return corpo;
}

export async function buscarDashboard(token) {
  const resultado = await requisitar("/admin/dashboard", token);
  return resultado.dados ?? resultado;
}
