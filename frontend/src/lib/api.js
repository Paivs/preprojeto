/* ============================================================
   CAMADA DE API
   Nenhuma tela chama fetch() direto: todas passam por api.*
   O endereço vem de NEXT_PUBLIC_API_URL (arquivo .env.local).
   ============================================================ */
import { encerrarSessao, lerToken } from './sessao';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

/** Endereço completo de um arquivo servido pela API (ex.: foto de chamado). */
export const urlArquivo = caminho => (caminho ? API_URL.replace(/\/api$/, '') + caminho : null);

/**
 * Faz a requisição, coloca o token e trata os erros.
 * Em caso de erro, lança um Error com a mensagem que a API mandou.
 */
async function requisicao(metodo, caminho, corpo) {
  const headers = {};
  const token = lerToken();
  if (token) headers.Authorization = 'Bearer ' + token;

  let body;
  if (corpo instanceof FormData) {
    body = corpo; // o navegador define o Content-Type (multipart) sozinho
  } else if (corpo !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(corpo);
  }

  let resposta;
  try {
    resposta = await fetch(API_URL + caminho, { method: metodo, headers, body });
  } catch {
    throw new Error(`Não consegui falar com a API em ${API_URL}. Ela está no ar?`);
  }

  // Token vencido ou inválido: limpa a sessão e volta para o login
  if (resposta.status === 401 && !caminho.startsWith('/auth')) {
    encerrarSessao();
    window.location.href = '/';
    return new Promise(() => {}); // a página vai recarregar; não resolve nunca
  }

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) throw new Error(dados?.mensagem || `A API respondeu ${resposta.status}.`);
  return dados;
}

/** Monta "?a=1&b=2" ignorando valores vazios. */
function queryString(params) {
  const validos = Object.entries(params || {}).filter(([, v]) => v !== '' && v != null);
  const texto = new URLSearchParams(validos).toString();
  return texto ? '?' + texto : '';
}

const get = (caminho, params) => requisicao('GET', caminho + queryString(params));
const post = (caminho, corpo) => requisicao('POST', caminho, corpo);
const put = (caminho, corpo) => requisicao('PUT', caminho, corpo);
const patch = (caminho, corpo) => requisicao('PATCH', caminho, corpo);

export const api = {
  // Autenticação
  login: dados => post('/auth/login', dados),
  recuperarSenha: dados => post('/auth/recuperar', dados),

  // Visão geral
  busca: termo => get('/busca', { q: termo }),
  dashboard: () => get('/dashboard'),
  equipes: () => get('/equipes'),

  // Planta ao vivo
  resumoPlanta: () => get('/planta/resumo'),
  planta: params => get('/planta', params),
  ativoPreditivo: id => get(`/planta/${id}/preditivo`),

  // Máquinas
  maquinas: params => get('/maquinas', params),
  maquina: id => get('/maquinas/' + id),
  criarMaquina: dados => post('/maquinas', dados),

  // Medições
  medicoes: params => get('/medicoes', params),
  serie: (maquina, grandeza, dias) => get('/medicoes/serie', { maquina, grandeza, dias }),
  criarMedicao: dados => post('/medicoes', dados),

  // Alertas e limites
  alertas: params => get('/alertas', params),
  reconhecerAlerta: id => patch(`/alertas/${id}/reconhecer`),
  limites: () => get('/limites'),
  salvarLimites: dados => put('/limites', dados),

  // Ordens de serviço
  ordens: params => get('/ordens', params),
  criarOS: dados => post('/ordens', dados),
  atualizarOS: (id, dados) => patch('/ordens/' + id, dados),

  // Orçamento
  orcamentoBase: id => get('/orcamento/base/' + id),
  orcamentoResumo: () => get('/orcamento/resumo'),
  orcamentos: () => get('/orcamento'),
  salvarOrcamento: dados => post('/orcamento', dados),

  // Chamados
  chamados: params => get('/chamados', params),
  criarChamado: dados => post('/chamados', dados),
  comentarChamado: (id, texto) => post(`/chamados/${id}/comentarios`, { texto }),
  triarChamado: (id, dados) => patch(`/chamados/${id}/triagem`, dados),
  gerarOSDoChamado: (id, dados = {}) => post(`/chamados/${id}/ordem`, dados)
};
