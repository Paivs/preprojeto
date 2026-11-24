import * as UsuarioService from '../service/UsuarioService.js';
import * as EmailService from '../service/EmailService.js';

function responderErro(erro, res, next, statusValidacao = 400) {
  if (erro instanceof TypeError) {
    return res.status(statusValidacao).json({ sucesso: false, erro: erro.message });
  }
  if ([401, 404, 409].includes(erro.status)) {
    return res.status(erro.status).json({ sucesso: false, erro: erro.message });
  }
  return next(erro);
}

export async function listar(req, res, next) {
  try {
    const resultado = await UsuarioService.listar(req.query);
    return res.status(200).json({
      sucesso: true,
      dados: resultado.usuarios,
      paginacao: resultado.paginacao
    });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const usuario = await UsuarioService.buscarPorId(req.params.id);
    return res.status(200).json({ sucesso: true, dados: usuario });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function criar(req, res, next) {
  try {
    const usuario = await UsuarioService.criar(req.body);
    let emailEnviado = false;
    let avisoEmail = 'Cliente cadastrado, mas o e-mail de acesso nao foi enviado.';

    try {
      await EmailService.enviarEmail({
        email: usuario.email,
        nome: usuario.nome_empresa,
        empresa: usuario.nome_empresa,
        assunto: 'Acesso a VoltHouse - {{empresa}}',
        mensagemPersonalizada: 'Seu cadastro foi concluido. Use os dados abaixo para acessar a plataforma.',
        emailLogin: usuario.email,
        senhaLogin: req.body.senha
      });
      emailEnviado = true;
      avisoEmail = null;
    } catch (erroEmail) {
      console.error('[UsuarioController] Cliente criado, mas e-mail falhou:', {
        status: erroEmail.status,
        message: erroEmail.message
      });
    }

    return res.status(201).json({
      sucesso: true,
      mensagem: emailEnviado
        ? 'Cliente cadastrado e e-mail enviado.'
        : 'Cliente cadastrado; o e-mail de acesso nao foi enviado.',
      email_enviado: emailEnviado,
      aviso: avisoEmail,
      dados: usuario
    });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizar(req, res, next) {
  try {
    const usuario = await UsuarioService.atualizar(req.params.id, req.body);
    return res.status(200).json({ sucesso: true, dados: usuario });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function excluir(req, res, next) {
  try {
    await UsuarioService.excluir(req.params.id);
    return res.status(200).json({ sucesso: true, mensagem: 'Usuário excluído com sucesso.' });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

async function executarConfiguracao(req, res, next, operacao, apenasAdmin) {
  try {
    let dados;
    if (operacao === 'buscar') {
      dados = await UsuarioService.buscarConfiguracao(req.usuario.id, apenasAdmin);
    } else if (operacao === 'atualizar') {
      dados = await UsuarioService.atualizarConfiguracao(req.usuario.id, req.body, apenasAdmin);
    } else {
      dados = await UsuarioService.alterarSenhaConfiguracao(req.usuario.id, req.body, apenasAdmin);
    }
    return res.status(200).json({ sucesso: true, dados });
  } catch (erro) {
    return responderErro(erro, res, next, apenasAdmin ? 422 : 400);
  }
}

export function buscarConfiguracaoAdmin(req, res, next) {
  return executarConfiguracao(req, res, next, 'buscar', true);
}

export function atualizarConfiguracaoAdmin(req, res, next) {
  return executarConfiguracao(req, res, next, 'atualizar', true);
}

export function alterarSenhaAdmin(req, res, next) {
  return executarConfiguracao(req, res, next, 'senha', true);
}

export function buscarConfiguracaoUsuario(req, res, next) {
  return executarConfiguracao(req, res, next, 'buscar', false);
}

export function atualizarConfiguracaoUsuario(req, res, next) {
  return executarConfiguracao(req, res, next, 'atualizar', false);
}

export function alterarSenhaUsuario(req, res, next) {
  return executarConfiguracao(req, res, next, 'senha', false);
}
