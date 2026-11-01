export function errorHandler(error, request, response, next) {
  console.error(error);

  const status = Number.isInteger(error.status) ? error.status : 500;
  const message = error.message || "Erro interno no servidor";
  const body = {
    timestamp: new Date().toISOString(),
    status,
    error: error.name || "Error",
    message,
    path: request.originalUrl,
  };

  if (Array.isArray(error.errors)) {
    body.errors = error.errors.map(({ field, message: fieldMessage }) => ({
      field,
      message: fieldMessage,
    }));
  }

  response.status(status).json(body);
}
