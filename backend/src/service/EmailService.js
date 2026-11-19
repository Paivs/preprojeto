import nodemailer from 'nodemailer';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// TODO: personalize o texto padrão e informe a URL pública da imagem.
const IMAGEM_PADRAO_URL = '';
const TEXTO_PADRAO_HTML = `
  <p>Olá {{nome}},</p>
  <p>{{empresa}}</p>
  <p>Confira abaixo as informações enviadas para você.</p>
`;

function validarTexto(valor, campo, { obrigatorio = false, maximo = 5000 } = {}) {
  if (valor === undefined || valor === null || valor === '') {
    if (obrigatorio) throw new TypeError(`Informe ${campo}.`);
    return '';
  }
  if (typeof valor !== 'string') throw new TypeError(`${campo} deve ser um texto.`);

  const texto = valor.trim();
  if (obrigatorio && !texto) throw new TypeError(`Informe ${campo}.`);
  if (texto.length > maximo) {
    throw new TypeError(`${campo} deve ter no máximo ${maximo} caracteres.`);
  }
  return texto;
}

function obterConfiguracaoSmtp() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM?.trim() || user;
  const port = Number(process.env.SMTP_PORT || 587);
  const secureConfigurado = process.env.SMTP_SECURE?.trim().toLowerCase();

  if (!host || !user || !pass || !from || !Number.isInteger(port) || port <= 0) {
    const erro = new Error('Configuração SMTP incompleta no back-end.');
    erro.status = 503;
    throw erro;
  }
  if (secureConfigurado && !['true', 'false'].includes(secureConfigurado)) {
    const erro = new Error('SMTP_SECURE deve ser true ou false.');
    erro.status = 503;
    throw erro;
  }

  return {
    host,
    port,
    secure: secureConfigurado ? secureConfigurado === 'true' : port === 465,
    auth: { user, pass },
    from
  };
}

function preencherCampos(texto, nome, empresa) {
  return texto
    .replace(/\{\{\s*nome\s*\}\}/gi, () => nome)
    .replace(/\{\{\s*empresa\s*\}\}/gi, () => empresa);
}

function escaparHtml(valor) {
  return valor.replace(/[&<>"']/g, (caractere) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[caractere]);
}

export async function enviarEmail(dados = {}) {
  const email = validarTexto(dados.email, 'o e-mail do destinat\u00e1rio', { obrigatorio: true, maximo: 254 });
  if (!REGEX_EMAIL.test(email)) throw new TypeError('Informe um e-mail de destinat\u00e1rio v\u00e1lido.');

  const nome = validarTexto(dados.nome, 'o nome do destinat\u00e1rio', { maximo: 120 });
  const empresa = validarTexto(dados.empresa, 'o nome da empresa', { maximo: 150 });
  const assunto = validarTexto(dados.assunto, 'o assunto', { obrigatorio: true, maximo: 150 });
  const mensagemPersonalizada = validarTexto(
    dados.mensagemPersonalizada ?? dados.mensagem,
    'a mensagem personalizada'
  );
  const emailLogin = validarTexto(dados.emailLogin, 'o e-mail de acesso', { maximo: 254 });
  const senhaLogin = validarTexto(dados.senhaLogin, 'a senha de acesso', { maximo: 500 });

  if (/[\r\n]/.test(assunto)) throw new TypeError('O assunto n\u00e3o pode conter quebras de linha.');
  if (/[\r\n]/.test(nome)) throw new TypeError('O nome do destinat\u00e1rio n\u00e3o pode conter quebras de linha.');
  if (!nome && !empresa) {
    throw new TypeError('Informe o nome do destinat\u00e1rio ou o nome da empresa.');
  }
  if (Boolean(emailLogin) !== Boolean(senhaLogin)) {
    throw new TypeError('Informe o e-mail e a senha de acesso juntos.');
  }
  if (emailLogin && !REGEX_EMAIL.test(emailLogin)) {
    throw new TypeError('Informe um e-mail de acesso v\u00e1lido.');
  }

  const configuracao = obterConfiguracaoSmtp();
  const transportador = nodemailer.createTransport({
    host: configuracao.host,
    port: configuracao.port,
    secure: configuracao.secure,
    auth: configuracao.auth
  });

  const campos = { nome, empresa, emailLogin, senhaLogin };
  const camposHtml = Object.fromEntries(
    Object.entries(campos).map(([chave, valor]) => [chave, escaparHtml(valor)])
  );
  const normalizarCampos = (valores) => Object.fromEntries(
    Object.entries(valores).map(([chave, valor]) => [chave.toLowerCase(), valor])
  );
  const substituirCampos = (texto, valores) => texto.replace(
    /\{\{\s*(nome|empresa|emailLogin|senhaLogin)\s*\}\}/gi,
    (_match, chave) => valores[chave.toLowerCase()] || ''
  );
  const assuntoFinal = preencherCampos(assunto, nome, empresa);
  const camposTextoNormalizados = normalizarCampos(campos);
  const camposHtmlNormalizados = normalizarCampos(camposHtml);
  const secaoImagem = IMAGEM_PADRAO_URL
    ? `<img src="${IMAGEM_PADRAO_URL}" alt="" style="max-width:100%;height:auto">`
    : '';
  const secaoPersonalizadaHtml = mensagemPersonalizada
    ? `<h2>Mensagem personalizada</h2><p>${escaparHtml(mensagemPersonalizada).replace(/\r?\n/g, '<br>')}</p>`
    : '';
  const secaoLoginHtml = emailLogin
    ? `<h2>Este \u00e9 o seu login</h2><p>E-mail: ${camposHtml.emailLogin}<br>Senha: ${camposHtml.senhaLogin}</p>`
    : '';
  const textoPadrao = substituirCampos(TEXTO_PADRAO_HTML.replace(/<[^>]*>/g, '').trim(), camposTextoNormalizados);
  const texto = [
    textoPadrao,
    mensagemPersonalizada,
    emailLogin ? `Este \u00e9 o seu login:\nE-mail: ${emailLogin}\nSenha: ${senhaLogin}` : ''
  ].filter(Boolean).join('\n\n');
  const html = `<!doctype html><html><body>${secaoImagem}${substituirCampos(TEXTO_PADRAO_HTML, camposHtmlNormalizados)}${secaoPersonalizadaHtml}${secaoLoginHtml}</body></html>`;

  try {
    const resultado = await transportador.sendMail({
      from: configuracao.from,
      to: nome ? { name: nome, address: email } : email,
      subject: assuntoFinal,
      text,
      html
    });
    return { destinatario: email, messageId: resultado.messageId };
  } catch {
    const erro = new Error('N\u00e3o foi poss\u00edvel enviar o e-mail. Verifique a configura\u00e7\u00e3o SMTP.');
    erro.status = 502;
    throw erro;
  }
}