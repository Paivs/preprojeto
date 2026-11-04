/* ============================================================
   TRATAMENTO DE ERROS
   Todo erro vira uma resposta JSON { mensagem } — é esse campo
   que o front-end mostra no aviso (toast).
   ============================================================ */
const multer = require('multer');
const { HttpError } = require('../utils/http');

/** Rota que não existe. */
function rotaNaoEncontrada(req, res) {
  res.status(404).json({ mensagem: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

/** Middleware final de erros (o Express 5 já repassa erros de funções async). */
// eslint-disable-next-line no-unused-vars
function tratarErros(erro, _req, res, _next) {
  // Erros previstos, lançados pelas rotas
  if (erro instanceof HttpError) {
    return res.status(erro.status).json({ mensagem: erro.message });
  }
  // Upload de arquivo
  if (erro instanceof multer.MulterError) {
    const mensagem = erro.code === 'LIMIT_FILE_SIZE' ? 'A foto pode ter no máximo 5 MB.' : 'Não consegui receber o arquivo.';
    return res.status(400).json({ mensagem });
  }
  // JSON mal formatado no corpo
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'O corpo da requisição não é um JSON válido.' });
  }
  // Erros do MySQL mais comuns
  if (erro.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ mensagem: 'Esse registro já existe.' });
  }
  if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ mensagem: 'Algum dado informado não existe no cadastro (máquina, equipe ou setor).' });
  }
  if (erro.code === 'ECONNREFUSED' || erro.code === 'ER_ACCESS_DENIED_ERROR' || erro.code === 'ER_BAD_DB_ERROR') {
    console.error('[banco]', erro.message);
    return res.status(503).json({ mensagem: 'A API não conseguiu falar com o banco de dados.' });
  }

  console.error(erro);
  res.status(500).json({ mensagem: 'Erro interno no servidor.' });
}

module.exports = { rotaNaoEncontrada, tratarErros };
