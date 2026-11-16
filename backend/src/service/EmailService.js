import nodemailer from 'nodemailer';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export async function enviarEmail(dados = {}) {
  if (Object.keys(dados).some((campo) => /senha|password/i.test(campo))) {
    throw new TypeError('Não envie senha por e-mail. Envie um link seguro para criação de senha.');
  }

  const email = validarTexto(dados.email, 'o e-mail do destinatário', { obrigatorio: true, maximo: 254 });
  if (!REGEX_EMAIL.test(email)) throw new TypeError('Informe um e-mail de destinatário válido.');

  const nome = validarTexto(dados.nome, 'o nome do destinatário', { maximo: 120 });
  const empresa = validarTexto(dados.empresa, 'o nome da empresa', { maximo: 150 });
  const assunto = validarTexto(dados.assunto, 'o assunto', { obrigatorio: true, maximo: 150 });
  const mensagem = validarTexto(dados.mensagem, 'a mensagem', { obrigatorio: true });

  if (/[\r\n]/.test(assunto)) throw new TypeError('O assunto não pode conter quebras de linha.');
  if (/[\r\n]/.test(nome)) throw new TypeError('O nome do destinatário não pode conter quebras de linha.');
  if (!nome && !empresa) {
    throw new TypeError('Informe o nome do destinatário ou o nome da empresa.');
  }

  const configuracao = obterConfiguracaoSmtp();
  const transportador = nodemailer.createTransport({
    host: configuracao.host,
    port: configuracao.port,
    secure: configuracao.secure,
    auth: configuracao.auth
  });

  const assuntoFinal = preencherCampos(assunto, nome, empresa);
  const mensagemFinal = preencherCampos(mensagem, nome, empresa);

  try {
    const resultado = await transportador.sendMail({
      from: configuracao.from,
      to: nome ? { name: nome, address: email } : email,
      subject: assuntoFinal,
      text: mensagemFinal
    });
    return { destinatario: email, messageId: resultado.messageId };
  } catch {
    const erro = new Error('Não foi possível enviar o e-mail. Verifique a configuração SMTP.');
    erro.status = 502;
    throw erro;
  }
}
