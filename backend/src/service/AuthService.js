import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as UsuarioModel from '../models/AuthModels.js';

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
  const senhaValida = usuario ? await bcrypt.compare(senha || '', usuario.senha_hash) : false;

  if (!usuario || !senhaValida) {
    const erro = new Error('Credenciais inválidas.');
    erro.status = 401;
    throw erro;
  }

  const token = jwt.sign(
    { perfil: usuario.perfil },
    jwtSecret,
    { subject: String(usuario.id), expiresIn: '2h' }
  );

  return {
    token,
    tipo: 'Bearer',
    expiraEm: '2h',
    usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil }
  };
}