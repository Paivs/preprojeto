
import bcrypt from "bcrypt";
import { pool } from "../config/database.js";

// =========================================
// CONSULTAR CONFIGURAÇÕES DA CONTA
// =========================================

export async function obterConfiguracoesMunicipais(request, response, next) {
    try {
        const [contas] = await pool.execute(
            `SELECT
                c.id_conta,
                c.nome,
                c.email,
                c.perfil,
                c.fk_id_municipio,
                m.nome AS municipio
             FROM contas c
             LEFT JOIN municipios m
                ON m.id_municipio = c.fk_id_municipio
             WHERE c.id_conta = ?
             LIMIT 1`,
            [request.usuario.id]
        );

        if (contas.length === 0) {
            return response.status(404).json({
                mensagem: "Conta não encontrada."
            });
        }

        return response.status(200).json({
            usuario: contas[0]
        });
    } catch (error) {
        next(error);
    }
}

// =========================================
// ATUALIZAR NOME E E-MAIL
// =========================================

export async function atualizarDadosMunicipais(request, response, next) {
    try {
        const nome = typeof request.body.nome === "string"
            ? request.body.nome.trim()
            : "";

        const email = typeof request.body.email === "string"
            ? request.body.email.trim().toLowerCase()
            : "";

        if (!nome || !email) {
            return response.status(400).json({
                mensagem: "Informe o nome e o e-mail."
            });
        }

        if (nome.length > 150) {
            return response.status(400).json({
                mensagem: "O nome deve ter no máximo 150 caracteres."
            });
        }

        if (email.length > 254) {
            return response.status(400).json({
                mensagem: "O e-mail deve ter no máximo 254 caracteres."
            });
        }

        const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoEmail.test(email)) {
            return response.status(400).json({
                mensagem: "Informe um endereço de e-mail válido."
            });
        }

        const [contasComEmail] = await pool.execute(
            `SELECT id_conta
             FROM contas
             WHERE email = ?
               AND id_conta <> ?
             LIMIT 1`,
            [email, request.usuario.id]
        );

        if (contasComEmail.length > 0) {
            return response.status(409).json({
                mensagem: "Este e-mail já está sendo utilizado por outra conta."
            });
        }

        await pool.execute(
            `UPDATE contas
             SET nome = ?, email = ?
             WHERE id_conta = ?`,
            [nome, email, request.usuario.id]
        );

        const [contasAtualizadas] = await pool.execute(
            `SELECT
                c.id_conta,
                c.nome,
                c.email,
                c.perfil,
                c.fk_id_municipio,
                m.nome AS municipio
             FROM contas c
             LEFT JOIN municipios m
                ON m.id_municipio = c.fk_id_municipio
             WHERE c.id_conta = ?
             LIMIT 1`,
            [request.usuario.id]
        );

        return response.status(200).json({
            mensagem: "Dados da conta atualizados com sucesso.",
            usuario: contasAtualizadas[0]
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

// =========================================
// ALTERAR SENHA
// =========================================

export async function alterarSenhaMunicipal(request, response, next) {
    try {
        const senhaAtual = request.body.senhaAtual;
        const novaSenha = request.body.novaSenha;

        if (
            typeof senhaAtual !== "string" ||
            typeof novaSenha !== "string" ||
            !senhaAtual ||
            !novaSenha
        ) {
            return response.status(400).json({
                mensagem: "Informe a senha atual e a nova senha."
            });
        }

        if (novaSenha.length < 8 || novaSenha.length > 72) {
            return response.status(400).json({
                mensagem: "A nova senha deve ter entre 8 e 72 caracteres."
            });
        }

        if (senhaAtual === novaSenha) {
            return response.status(400).json({
                mensagem: "A nova senha deve ser diferente da senha atual."
            });
        }

        const [contas] = await pool.execute(
            `SELECT senha_hash
             FROM contas
             WHERE id_conta = ?
             LIMIT 1`,
            [request.usuario.id]
        );

        if (contas.length === 0) {
            return response.status(404).json({
                mensagem: "Conta não encontrada."
            });
        }

        const senhaValida = await bcrypt.compare(
            senhaAtual,
            contas[0].senha_hash
        );

        if (!senhaValida) {
            return response.status(401).json({
                mensagem: "A senha atual está incorreta."
            });
        }

        const novoHash = await bcrypt.hash(novaSenha, 10);

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
