import { API_URL } from "./constantes";

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

export async function verificarSaude() {
  try {
    await requisitar("/health");
    return "online";
  } catch {
    return "offline";
  }
}

export async function buscarDashboard(token) {
  const resultado = await requisitar("/admin/dashboard", token);
  return resultado.dados ?? resultado;
}
