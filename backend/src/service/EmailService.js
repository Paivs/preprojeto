import nodemailer from 'nodemailer';
import { fileURLToPath } from 'node:url';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CAMINHO_LOGO = fileURLToPath(new URL('../assets/image.png', import.meta.url));
const CID_LOGO = 'volthouse-logo';

const TEXTO_PADRAO_HTML = `
  <p style="margin:0 0 16px;font-size:24px;line-height:1.3;font-weight:700;color:#171923">Olá {{nome}},</p>
  <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#4b5563">A VoltHouse ajuda sua empresa a acompanhar o consumo de energia por setor e equipamento.</p>
  <p style="margin:0;font-size:15px;line-height:1.7;color:#4b5563">Com essas informações, você pode entender melhor seus gastos, identificar oportunidades de economia e tomar decisões mais eficientes.</p>
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
  const secaoImagem = `<img src="cid:${CID_LOGO}" width="512" alt="VoltHouse — Controle seu consumo de energia" style="display:block;width:100%;max-width:512px;height:auto;margin:0 auto;border:0">`;
  const secaoPersonalizadaHtml = mensagemPersonalizada
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;background:#f6f4ff;border:1px solid #e8e2ff;border-radius:10px"><tr><td style="padding:20px 22px"><h2 style="margin:0 0 10px;font-size:16px;color:#5825c7">Mensagem para você</h2><p style="margin:0;font-size:14px;line-height:1.7;color:#374151">${escaparHtml(mensagemPersonalizada).replace(/\r?\n/g, '<br>')}</p></td></tr></table>`
    : '';
  const secaoLoginHtml = emailLogin
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px"><tr><td style="padding:20px 22px"><h2 style="margin:0 0 16px;font-size:17px;color:#171923">Este \u00e9 o seu login</h2><p style="margin:0 0 10px;font-size:14px;color:#4b5563"><strong style="color:#171923">E-mail</strong><br>${camposHtml.emailLogin}</p><p style="margin:0;font-size:14px;color:#4b5563"><strong style="color:#171923">Senha</strong><br>${camposHtml.senhaLogin}</p></td></tr></table>`
    : '';
  const textoPadrao = substituirCampos(TEXTO_PADRAO_HTML.replace(/<[^>]*>/g, '').trim(), camposTextoNormalizados);
  const texto = [
    textoPadrao,
    mensagemPersonalizada,
    emailLogin ? `Este \u00e9 o seu login:\nE-mail: ${emailLogin}\nSenha: ${senhaLogin}` : ''
  ].filter(Boolean).join('\n\n');
  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="margin:0;padding:0;background:#f1f3f8;font-family:Arial,Helvetica,sans-serif;color:#171923">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f3f8;padding:32px 12px">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden">
            <tr>
              <td style="padding:24px 32px 12px">${secaoImagem}</td>
            </tr>
            <tr>
              <td style="padding:24px 40px 36px">
                ${substituirCampos(TEXTO_PADRAO_HTML, camposHtmlNormalizados)}
                ${secaoPersonalizadaHtml}
                ${secaoLoginHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#fafafa;border-top:1px solid #eeeeF2;text-align:center;font-size:12px;line-height:1.6;color:#6b7280">
                VoltHouse · Controle seu consumo de energia<br>
                Este e-mail foi enviado para ${escaparHtml(email)}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  try {
    const resultado = await transportador.sendMail({
      from: configuracao.from,
      to: nome ? { name: nome, address: email } : email,
      subject: assuntoFinal,
      text: texto,
      html,
      attachments: [{
        filename: 'image.png',
        path: CAMINHO_LOGO,
        cid: CID_LOGO
      }]
    });
    return { destinatario: email, messageId: resultado.messageId };
  } catch (erroOriginal) {
    console.error('[EmailService] Falha no envio SMTP:', {
      code: erroOriginal.code,
      command: erroOriginal.command,
      responseCode: erroOriginal.responseCode,
      message: erroOriginal.message
    });
    const erro = new Error('N\u00e3o foi poss\u00edvel enviar o e-mail. Verifique a configura\u00e7\u00e3o SMTP.');
    erro.status = 502;
    throw erro;
  }
}
