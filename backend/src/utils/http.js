/* ============================================================
   ERROS HTTP
   Lance um HttpError dentro de qualquer rota e o middleware de erros
   devolve { mensagem } com o status certo para o front-end.
   ============================================================ */
class HttpError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

const requisicaoInvalida = mensagem => new HttpError(400, mensagem);
const naoAutorizado = mensagem => new HttpError(401, mensagem);
const proibido = mensagem => new HttpError(403, mensagem);
const naoEncontrado = mensagem => new HttpError(404, mensagem);
const conflito = mensagem => new HttpError(409, mensagem);

module.exports = { HttpError, requisicaoInvalida, naoAutorizado, proibido, naoEncontrado, conflito };
