
export function checkRole(...perfisPermitidos) {
    return (request, response, next) => {
        if (!request.usuario) {
            return response.status(401).json({
                mensagem: "Autenticação necessária."
            });
        }

        if (!perfisPermitidos.includes(request.usuario.perfil)) {
            return response.status(403).json({
                mensagem: "Você não tem permissão para acessar este recurso."
            });
        }

        next();
    };
}
