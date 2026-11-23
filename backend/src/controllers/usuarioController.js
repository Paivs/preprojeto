
import bcrypt from "bcrypt";
import { pool } from "../config/database.js";

// CONSULTAR PERFIL DO CIDADÃO
export async function obterMeuPerfil(request, response, next) {
    try {
        const [usuarios] = await pool.execute(
            `SELECT
                id_conta,
                nome,
                email,
                perfil
             FROM contas
             WHERE id_conta = ?
             LIMIT 1`,
            [request.usuario.id]
        );

        if (usuarios.length === 0) {
            return response.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        return response.status(200).json({
            usuario: usuarios[0]
        });

    } catch (error) {
        next(error);
    }
}

// ATUALIZAR PERFIL DO CIDADÃO
export async function atualizarMeuPerfil(request, response, next) {
    try {
        const { nome, email } = request.body;

        if (!nome || !email) {
            return response.status(400).json({
                mensagem: "Informe o nome e o e-mail."
            });
        }

        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim().toLowerCase();

        if (nomeLimpo.length < 3) {
            return response.status(400).json({
                mensagem: "O nome deve possuir pelo menos 3 caracteres."
            });
        }

        const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoEmail.test(emailLimpo)) {
            return response.status(400).json({
                mensagem: "Informe um e-mail válido."
            });
        }

        const [emailExistente] = await pool.execute(
            `SELECT id_conta
             FROM contas
             WHERE email = ?
               AND id_conta <> ?
             LIMIT 1`,
            [emailLimpo, request.usuario.id]
        );

        if (emailExistente.length > 0) {
            return response.status(409).json({
                mensagem: "Este e-mail já está sendo utilizado."
            });
        }

        await pool.execute(
            `UPDATE contas
             SET nome = ?, email = ?
             WHERE id_conta = ?`,
            [nomeLimpo, emailLimpo, request.usuario.id]
        );

        return response.status(200).json({
            mensagem: "Perfil atualizado com sucesso.",
            usuario: {
                id_conta: request.usuario.id,
                nome: nomeLimpo,
                email: emailLimpo,
                perfil: request.usuario.perfil
            }
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return response.status(409).json({
                mensagem: "Este e-mail já está sendo utilizado."
            });
        }

        next(error);
    }
}

// ALTERAR SENHA DO CIDADÃO
export async function alterarMinhaSenha(request, response, next) {
    try {
        const {
            senhaAtual,
            novaSenha,
            confirmarSenha
        } = request.body;

        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            return response.status(400).json({
                mensagem: "Preencha todos os campos de senha."
            });
        }

        if (novaSenha.length < 8) {
            return response.status(400).json({
                mensagem: "A nova senha deve possuir pelo menos 8 caracteres."
            });
        }

        if (novaSenha !== confirmarSenha) {
            return response.status(400).json({
                mensagem: "A confirmação da nova senha não corresponde."
            });
        }

        const [usuarios] = await pool.execute(
            `SELECT senha_hash
             FROM contas
             WHERE id_conta = ?
             LIMIT 1`,
            [request.usuario.id]
        );

        if (usuarios.length === 0) {
            return response.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        const senhaValida = await bcrypt.compare(
            senhaAtual,
            usuarios[0].senha_hash
        );

        if (!senhaValida) {
            return response.status(401).json({
                mensagem: "A senha atual está incorreta."
            });
        }

        const novoHash = await bcrypt.hash(novaSenha, 12);

        await pool.execute(
            `UPDATE contas
             SET senha_hash = ?
             WHERE id_conta = ?`,
            [novoHash, request.usuario.id]
        );

        return response.status(200).json({
            mensagem: "Senha alterada com sucesso."
        });

    } catch (error) {
        next(error);
    }
}

export async function listarMeusRelatos(request, response, next) {
    try {
        const idConta = request.usuario.id;

        const [relatos] = await pool.query(
            `SELECT
                r.id_relato,
                r.descricao,
                r.data_fato,
                r.enviado_em,
                r.referencia_local,
                r.situacao,
                c.nome AS categoria
            FROM relatos r
            INNER JOIN categorias c
                ON c.id_categoria = r.fk_id_categoria
            WHERE r.fk_id_conta_autor = ?
            ORDER BY r.enviado_em DESC`,
            [idConta]
        );

        return response.status(200).json({
            mensagem: "Relatos consultados com sucesso.",
            relatos
        });
    } catch (erro) {
        next(erro);
    }
}