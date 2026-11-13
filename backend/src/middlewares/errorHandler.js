export function errorHandler(error, request, response, next) {
  console.error(error);
  if (error instanceof TypeError) {
    return response.status(400).json({ sucesso: false, mensagem: error.message });
  }
  if (Number.isInteger(error.status)) {
    return response.status(error.status).json({ sucesso: false, mensagem: error.message });
  }
  if (/n[ãa]o encontrad[oa]/i.test(error.message || "")) {
    return response.status(404).json({ sucesso: false, mensagem: error.message });
  }
  return response.status(500).json({ sucesso: false, mensagem: error.message || "Erro interno no servidor" });
}
