import bcrypt from 'bcryptjs';
import * as ConfiguracaoModel from '../models/ConfiguracaoUsuarioModel.js';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function validarId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new TypeError('ID de usuário inválido.');
  return id;
}

function erroNaoEncontrado() {
  const erro = new Error('Usuário não encontrado.');
  erro.status = 404;
  return erro;
}

export async function buscar(idRecebido) {
  const usuario = await ConfiguracaoModel.buscarPorId(validarId(idRecebido));
  if (!usuario) throw erroNaoEncontrado();
  return { ...usuario, consumo_total: Number(usuario.consumo_total || 0), consumo_maximo: Number(usuario.consumo_maximo || 0) };
}

export async function atualizar(idRecebido, entrada = {}) {
  const id = validarId(idRecebido);
  const nome = typeof entrada.nome_empresa === 'string' ? entrada.nome_empresa.trim() : '';
  const email = typeof entrada.email === 'string' ? entrada.email.trim().toLowerCase() : '';
  const cnpj = typeof entrada.cnpj === 'string' ? entrada.cnpj.trim() : '';
  const consumoMaximo = Number(entrada.consumo_maximo);

  if (nome.length < 3 || nome.length > 150) throw new TypeError('O nome deve ter entre 3 e 150 caracteres.');
  if (!REGEX_EMAIL.test(email) || email.length > 100) throw new TypeError('Informe um e-mail válido com até 100 caracteres.');
  if (!cnpj || cnpj.length > 18) throw new TypeError('Informe um CNPJ válido com até 18 caracteres.');
  if (!Number.isFinite(consumoMaximo) || consumoMaximo < 0 || consumoMaximo > 99999999.99) {
    throw new TypeError('O limite de consumo deve estar entre 0 e 99999999,99 kWh.');
  }
  if (await ConfiguracaoModel.buscarDuplicado('email', email, id)) {
    const erro = new Error('Este e-mail já está sendo usado por outra conta.'); erro.status = 409; throw erro;
  }
  if (await ConfiguracaoModel.buscarDuplicado('cnpj', cnpj, id)) {
    const erro = new Error('Este CNPJ já está sendo usado por outra conta.'); erro.status = 409; throw erro;
  }
  const usuario = await ConfiguracaoModel.atualizarPerfil(id, {
    nome_empresa: nome, email, cnpj,
    consumo_maximo: Math.round(consumoMaximo * 100) / 100,
  });
  if (!usuario) throw erroNaoEncontrado();
  return { ...usuario, consumo_total: Number(usuario.consumo_total || 0), consumo_maximo: Number(usuario.consumo_maximo || 0) };
}

export async function alterarSenha(idRecebido, entrada = {}) {
  const id = validarId(idRecebido);
  const { senha_atual: senhaAtual, nova_senha: novaSenha, confirmar_senha: confirmarSenha } = entrada;
  if (typeof senhaAtual !== 'string' || !senhaAtual) throw new TypeError('Informe sua senha atual.');
  if (typeof novaSenha !== 'string' || !REGEX_SENHA_FORTE.test(novaSenha)) {
    throw new TypeError('A senha deve ter ao menos 8 caracteres, com maiúscula, minúscula, número e símbolo.');
  }
  if (novaSenha !== confirmarSenha) throw new TypeError('A confirmação da nova senha não corresponde.');
  const senhaGuardada = await ConfiguracaoModel.buscarSenha(id);
  if (!senhaGuardada) throw erroNaoEncontrado();
  const confere = senhaGuardada.startsWith('$2')
    ? await bcrypt.compare(senhaAtual, senhaGuardada)
    : senhaAtual === senhaGuardada;
  if (!confere) { const erro = new Error('A senha atual está incorreta.'); erro.status = 401; throw erro; }
  await ConfiguracaoModel.atualizarSenha(id, await bcrypt.hash(novaSenha, 10));
  return { mensagem: 'Senha alterada com sucesso.' };
}
