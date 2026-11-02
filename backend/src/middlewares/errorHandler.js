export function errorHandler(error, request, response, next) {
  console.error(error);
  const status = Number.isInteger(error.status) ? error.status : 500;
  response.status(status).json({
    sucesso: false,
    mensagem: error.message || "Erro interno no servidor",
  });
}
