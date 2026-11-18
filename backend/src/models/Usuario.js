const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERFIS_PERMITIDOS = new Set(['admin', 'cliente']);

export default class Usuario {
  constructor({
    id_usuario,
    nome_empresa,
    cnpj,
    email,
    telefone = null,
    nivel_permissao = 'cliente',
    consumo_total = 0,
    consumo_maximo = 0
  }) {
    if (id_usuario !== undefined && (!Number.isInteger(id_usuario) || id_usuario <= 0)) {
      throw new TypeError('id_usuario deve ser um inteiro positivo.');
    }
    if (typeof nome_empresa !== 'string' || !nome_empresa.trim()) {
      throw new TypeError('Informe o nome da empresa.');
    }
    if (nome_empresa.trim().length > 150) {
      throw new TypeError('O nome da empresa deve ter no máximo 150 caracteres.');
    }
    if (typeof cnpj !== 'string' || !cnpj.trim()) {
      throw new TypeError('Informe o CNPJ.');
    }
    if (cnpj.trim().length > 18) {
      throw new TypeError('O CNPJ deve ter no máximo 18 caracteres.');
    }
    if (typeof email !== 'string' || !REGEX_EMAIL.test(email.trim())) {
      throw new TypeError('Informe um e-mail válido.');
    }
    if (email.trim().length > 100) {
      throw new TypeError('O e-mail deve ter no máximo 100 caracteres.');
    }
    if (!PERFIS_PERMITIDOS.has(nivel_permissao)) {
      throw new TypeError('nivel_permissao deve ser "admin" ou "cliente".');
    }
    if (telefone !== null && (typeof telefone !== 'string' || telefone.trim().length > 20)) {
      throw new TypeError('Telefone deve ter no maximo 20 caracteres.');
    }

    Object.assign(this, {
      ...(id_usuario === undefined ? {} : { id_usuario }),
      nome_empresa: nome_empresa.trim(),
      cnpj: cnpj.trim(),
      email: email.trim().toLowerCase(),
      telefone: typeof telefone === 'string' ? telefone.trim() || null : null,
      nivel_permissao,
      consumo_total: validarConsumo(consumo_total, 'consumo_total'),
      consumo_maximo: validarConsumo(consumo_maximo, 'consumo_maximo')
    });
  }
}

function validarConsumo(valor, campo) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0 || numero > 99999999.99) {
    throw new TypeError(`${campo} deve ser um número entre 0 e 99999999.99.`);
  }
  return Math.round(numero * 100) / 100;
}
