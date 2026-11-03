const TOKEN_KEY = "tenken_token";
const USUARIO_KEY = "tenken_usuario";

export function saveSession(token, usuario) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export function getToken() {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUsuario() {
  if (typeof window === "undefined") return null;

  try {
    const usuario = window.localStorage.getItem(USUARIO_KEY);
    return usuario ? JSON.parse(usuario) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USUARIO_KEY);
}
