
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

export async function authMiddleware(request, response, next) {
    try {
        const authorization = request.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return response.status(401).json({
                mensagem: "Token de autenticação não informado."
            });
        }

        const token = authorization.split(" ")[1];

        if (!token) {
            return response.status(401).json({
                mensagem: "Token de autenticação inválido."
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET não configurado.");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (
            !Number.isInteger(Number(decoded.id)) ||
            Number(decoded.id) <= 0
        ) {
            return response.status(401).json({
                mensagem: "Token de autenticação inválido."
            });
        }

        const [usuarios] = await pool.execute(
            `SELECT
                id_conta,
                nome,
                email,
                perfil,
                fk_id_municipio
             FROM contas
             WHERE id_conta = ?
             LIMIT 1`,
            [Number(decoded.id)]
        );

        if (usuarios.length === 0) {
            return response.status(401).json({
                mensagem: "Conta não encontrada."
            });
        }

        const usuario = usuarios[0];

        request.usuario = {
            id: usuario.id_conta,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
            fk_id_municipio: usuario.fk_id_municipio
        };

        next();

    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return response.status(401).json({
                mensagem: "Token inválido ou expirado."
            });
        }

        next(error);
    }
}
