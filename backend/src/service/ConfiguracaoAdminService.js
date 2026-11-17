import bcrypt from 'bcryptjs';
import * as ConfiguracaoModel from '../models/ConfiguracaoAdminModel.js';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarId(id) {
  const convertido = Number(id);
  if (!Number.isInteger(convertido) || convertido <= 0) throw new TypeError('ID de administrador inválido.');
  return convertido;
}

export async function buscar(idRecebido) {
  const id = validarId(idRecebido);
  const configuracao = await ConfiguracaoModel.buscarPorId(id);
  if (!configuracao) {
    const erro = new Error('Administrador não encontrado.');
    erro.status = 404;
    throw erro;
  }
  return {
    ...configuracao,
    consumo_maximo: Number(configuracao.consumo_maximo || 0),
  };
}

export async function atualizar(idRecebido, entrada = {}) {
  const id = validarId(idRecebido);
  const nomeEmpresa = typeof entrada.nome_empresa === 'string' ? entrada.nome_empresa.trim() : '';
  const email = typeof entrada.email === 'string' ? entrada.email.trim().toLowerCase() : '';
  const cnpj = typeof entrada.cnpj === 'string' ? entrada.cnpj.trim() : '';
  const telefone = typeof entrada.telefone === 'string' ? entrada.telefone.trim() : '';
  const consumoMaximo = Number(entrada.consumo_maximo);

  if (nomeEmpresa.length < 3 || nomeEmpresa.length > 150) throw new TypeError('O nome deve ter entre 3 e 150 caracteres.');
  if (!REGEX_EMAIL.test(email) || email.length > 100) throw new TypeError('Informe um e-mail válido com até 100 caracteres.');
  if (!cnpj || cnpj.length > 18) throw new TypeError('Informe um CNPJ válido com até 18 caracteres.');
  if (telefone.length > 20) throw new TypeError('O telefone deve ter até 20 caracteres.');
  if (!Number.isFinite(consumoMaximo) || consumoMaximo < 0 || consumoMaximo > 99999999.99) {
    throw new TypeError('O limite de consumo deve estar entre 0 e 99999999,99 kWh.');
  }

  if (await ConfiguracaoModel.buscarDuplicado('email', email, id)) {
    const erro = new Error('Este e-mail já está sendo usado por outra conta.');
    erro.status = 409;
    throw erro;
  }
  if (await ConfiguracaoModel.buscarDuplicado('cnpj', cnpj, id)) {
    const erro = new Error('Este CNPJ já está sendo usado por outra conta.');
    erro.status = 409;
    throw erro;
  }

  const atualizado = await ConfiguracaoModel.atualizarPerfil(id, {
    nome_empresa: nomeEmpresa,
    email,
    cnpj,
    telefone: telefone || null,
    consumo_maximo: Math.round(consumoMaximo * 100) / 100,
  });
  if (!atualizado) {
    const erro = new Error('Administrador não encontrado.');
    erro.status = 404;
    throw erro;
  }
  return { ...atualizado, consumo_maximo: Number(atualizado.consumo_maximo || 0) };
}

export async function alterarSenha(idRecebido, entrada = {}) {
  const id = validarId(idRecebido);
  const { senha_atual: senhaAtual, nova_senha: novaSenha, confirmar_senha: confirmarSenha } = entrada;
  if (typeof senhaAtual !== 'string' || !senhaAtual) throw new TypeError('Informe sua senha atual.');
  if (typeof novaSenha !== 'string' || !novaSenha) throw new TypeError('Informe a nova senha.');
  if (typeof confirmarSenha !== 'string' || !confirmarSenha) throw new TypeError('Confirme a nova senha.');
  if (novaSenha !== confirmarSenha) throw new TypeError('A confirmação da nova senha não corresponde.');

  const senhaGuardada = await ConfiguracaoModel.buscarSenha(id);
  if (!senhaGuardada) {
    const erro = new Error('Administrador não encontrado.');
    erro.status = 404;
    throw erro;
  }
  const senhaConfere = senhaGuardada.startsWith('$2')
    ? await bcrypt.compare(senhaAtual, senhaGuardada)
    : senhaAtual === senhaGuardada;
  if (!senhaConfere) {
    const erro = new Error('A senha atual está incorreta.');
    erro.status = 401;
    throw erro;
  }

  await ConfiguracaoModel.atualizarSenha(id, await bcrypt.hash(novaSenha, 10));
  return { mensagem: 'Senha alterada com sucesso.' };
}
