import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as UsuarioModel from '../models/AuthModels.js';

const DURACAO_SESSAO = '2h';

function obterSegredo() {
  const segredo = process.env.JWT_SECRET;
  if (!segredo) throw new Error('JWT_SECRET não definido no .env.');
  return segredo;
}

function criarSessao(usuario) {
  const token = jwt.sign(
    { perfil: usuario.perfil },
    obterSegredo(),
    { subject: String(usuario.id_usuario), expiresIn: DURACAO_SESSAO },
  );
  return { token, tipo: 'Bearer', expiraEm: DURACAO_SESSAO };
}

export function verificarSessao(token) {
  const payload = jwt.verify(token, obterSegredo());
  const id = Number(payload.sub);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Sessão inválida.');
  return { id, perfil: payload.perfil };
}

// Aceita senha com hash bcrypt ou senha antiga em texto puro, sem alterá-la no login.
async function conferirSenha(usuario, senhaDigitada) {
  const guardada = usuario.senha_hash || "";

  if (guardada.startsWith("$2")) {
    return bcrypt.compare(senhaDigitada, guardada);
  }

  return guardada !== "" && senhaDigitada === guardada;
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registrar({
  nome,
  nome_empresa,
  cnpj,
  email,
  telefone,
  senha,
} = {}) {
  const nomeLimpo =
    typeof (nome_empresa ?? nome) === "string"
      ? (nome_empresa ?? nome).trim()
      : "";
  const emailLimpo =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const cnpjLimpo = typeof cnpj === "string" ? cnpj.trim() : "";
  const telefoneLimpo = telefone == null ? null : validarTelefone(telefone);

  if (nomeLimpo.length < 3) {
    throw new TypeError("Nome deve ter no mínimo 3 caracteres.");
  }
  if (!REGEX_EMAIL.test(emailLimpo)) {
    throw new TypeError("Informe um e-mail válido.");
  }
  if (!cnpjLimpo || cnpjLimpo.length > 18) {
    throw new TypeError("Informe um CNPJ válido com até 18 caracteres.");
  }
  if (
    typeof senha !== "string" ||
    senha.length < 8 ||
    !/[a-z]/.test(senha) ||
    !/[A-Z]/.test(senha) ||
    !/\d/.test(senha) ||
    !/[^A-Za-z0-9]/.test(senha)
  ) {
    throw new TypeError(
      "A senha deve ter no mínimo 8 caracteres, contendo maiúscula, minúscula, número e símbolo."
    );
  }

  const usuarioExistente = await UsuarioModel.buscarPorEmail(emailLimpo);
  if (usuarioExistente) {
    const erro = new Error("E-mail já cadastrado.");
    erro.status = 409;
    throw erro;
  }

  const cnpjExistente = await UsuarioModel.buscarPorCnpj(cnpjLimpo);
  if (cnpjExistente) {
    const erro = new Error("CNPJ já cadastrado.");
    erro.status = 409;
    throw erro;
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  return await UsuarioModel.criar({
    nome: nomeLimpo,
    cnpj: cnpjLimpo,
    email: emailLimpo,
    telefone: telefoneLimpo,
    senhaHash,
    // Registro público nunca pode conceder privilégios administrativos.
    perfil: "cliente",
  });
}

function validarTelefone(telefone) {
  if (typeof telefone !== "string") {
    throw new TypeError("Telefone deve ser um texto.");
  }
  const telefoneLimpo = telefone.trim();
  if (telefoneLimpo.length > 20) {
    throw new TypeError("Telefone deve ter até 20 caracteres.");
  }
  return telefoneLimpo || null;
}

export async function login({ email, senha } = {}) {
  const emailLimpo =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const usuario = REGEX_EMAIL.test(emailLimpo)
    ? await UsuarioModel.buscarPorEmail(emailLimpo)
    : null;
  const senhaValida = usuario
    ? await conferirSenha(usuario, senha || "")
    : false;

  if (!usuario || !senhaValida) {
    const erro = new Error("Credenciais inválidas.");
    erro.status = 401;
    throw erro;
  }

  const pagamentoPendente =
    usuario.perfil === "cliente"
      ? await UsuarioModel.buscarPagamentoPendente(usuario.id_usuario)
      : null;

  return {
    ...criarSessao(usuario),
    usuario: {
      id: usuario.id_usuario,
      nome: usuario.nome_empresa,
      perfil: usuario.perfil,
    },
    pagamentoPendente,
  };
}
