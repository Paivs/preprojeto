import { apiFetch } from "@/lib/api";

export async function chamarApi(caminho, _token, opcoes = {}) {
  return apiFetch(`/api${caminho}`, opcoes);
}

export async function verificarSaude() {
  try {
    await apiFetch("/api/health");
    return "online";
  } catch {
    return "offline";
  }
}

export async function buscarDashboard() {
  const resposta = await chamarApi("/admin/dashboard");
  return resposta?.dados ?? resposta;
}
