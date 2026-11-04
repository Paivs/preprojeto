/* ============================================================
   SESSÃO DO USUÁRIO NO NAVEGADOR
   "Manter conectado" marcado  -> localStorage (sobrevive ao fechar o navegador)
   Desmarcado                  -> sessionStorage (some ao fechar a aba)
   ============================================================ */
const CHAVE_USUARIO = 'pm_user';
const CHAVE_TOKEN = 'pm_token';

const noNavegador = () => typeof window !== 'undefined';

/** Procura a chave nos dois armazenamentos. */
function ler(chave) {
  if (!noNavegador()) return null;
  return sessionStorage.getItem(chave) ?? localStorage.getItem(chave);
}

export function salvarSessao(usuario, token, manter) {
  encerrarSessao();
  const armazenamento = manter ? localStorage : sessionStorage;
  armazenamento.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
  armazenamento.setItem(CHAVE_TOKEN, token);
}

export function lerUsuario() {
  try {
    return JSON.parse(ler(CHAVE_USUARIO));
  } catch {
    return null;
  }
}

export const lerToken = () => ler(CHAVE_TOKEN);

export function encerrarSessao() {
  if (!noNavegador()) return;
  [localStorage, sessionStorage].forEach(s => {
    s.removeItem(CHAVE_USUARIO);
    s.removeItem(CHAVE_TOKEN);
  });
}

/** Página inicial de cada perfil depois do login. */
export const paginaInicial = perfil => (perfil === 'funcionario' ? '/chamado' : '/dashboard');
