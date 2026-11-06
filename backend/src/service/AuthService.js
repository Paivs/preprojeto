import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as UsuarioModel from '../models/AuthModels.js';

function obterSegredo() {
  const segredo = process.env.JWT_SECRET;
  if (!segredo) {
    throw new Error('JWT_SECRET não definido no .env.');
  }
  return segredo;
}

// Aceita hash bcrypt e também senha antiga em texto puro (converte para hash no 1º login).
async function conferirSenha(usuario, senhaDigitada) {
  const guardada = usuario.senha_hash || '';

  if (guardada.startsWith('$2')) {
    return bcrypt.compare(senhaDigitada, guardada);
  }

  if (guardada !== '' && senhaDigitada === guardada) {
    await UsuarioModel.atualizarSenha(usuario.id_usuario, await bcrypt.hash(senhaDigitada, 10));
    return true;
  }

  return false;
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const jwtSecret = process.env.JWT_SECRET || 'chave-padrao-desenvolvimento';

export async function registrar({ nome, email, senha } = {}) {
  const nomeLimpo = typeof nome === 'string' ? nome.trim() : '';
  const emailLimpo = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (nomeLimpo.length < 3) {
    throw new TypeError('Nome deve ter no mínimo 3 caracteres.');
  }
  if (!REGEX_EMAIL.test(emailLimpo)) {
    throw new TypeError('Informe um e-mail válido.');
  }
  if (
    typeof senha !== 'string' ||
    senha.length < 8 ||
    !/[a-z]/.test(senha) ||
    !/[A-Z]/.test(senha) ||
    !/\d/.test(senha) ||
    !/[^A-Za-z0-9]/.test(senha)
  ) {
    throw new TypeError('A senha deve ter no mínimo 8 caracteres, contendo maiúscula, minúscula, número e símbolo.');
  }

  const usuarioExistente = await UsuarioModel.buscarPorEmail(emailLimpo);
  if (usuarioExistente) {
    const erro = new Error('E-mail já cadastrado.');
    erro.status = 409;
    throw erro;
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  return await UsuarioModel.criar({
    nome: nomeLimpo,
    email: emailLimpo,
    senhaHash,
    perfil: 'usuario'
  });
}

export async function login({ email, senha } = {}) {
  const emailLimpo = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const usuario = REGEX_EMAIL.test(emailLimpo) ? await UsuarioModel.buscarPorEmail(emailLimpo) : null;
  const senhaValida = usuario ? await conferirSenha(usuario, senha || '') : false;

  if (!usuario || !senhaValida) {
    const erro = new Error('Credenciais inválidas.');
    erro.status = 401;
    throw erro;
  }

  const token = jwt.sign(
    { perfil: usuario.perfil },
    jwtSecret,
    { subject: String(usuario.id_usuario), expiresIn: '2h' }
  );

  return {
    token,
    tipo: 'Bearer',
    expiraEm: '2h',
    usuario: { id: usuario.id_usuario, nome: usuario.nome_empresa, perfil: usuario.perfil }
  };
}