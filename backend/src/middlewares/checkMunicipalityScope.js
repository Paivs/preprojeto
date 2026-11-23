
export function checkMunicipalityScope(request, response, next) {
    try {
        const usuario = request.usuario;

        // Verifica se o usuário está autenticado.
        if (!usuario) {
            return response.status(401).json({
                mensagem: "Autenticação necessária."
            });
        }

        // Verifica se o usuário é administrador municipal.
        if (usuario.perfil !== "admin_municipal") {
            return response.status(403).json({
                mensagem: "Acesso permitido somente para administradores municipais."
            });
        }

        // Verifica se existe um município vinculado à conta.
        const municipioId = Number(usuario.fk_id_municipio);

        if (!Number.isInteger(municipioId) || municipioId <= 0) {
            return response.status(403).json({
                mensagem: "Nenhum município válido está vinculado a esta conta."
            });
        }

        // Disponibiliza o município para os controllers.
        request.municipioId = municipioId;

        next();

    } catch (error) {
        next(error);
    }
}
