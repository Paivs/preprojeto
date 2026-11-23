
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

// LOGIN
export async function realizarLogin(request, response, next) {
    try {
        const { email, senha } = request.body;

        if (!email || !senha) {
            return response.status(400).json({
                mensagem: "Informe o e-mail e a senha."
            });
        }

        const [contas] = await pool.execute(
            `SELECT id_conta, nome, email, senha_hash, perfil, fk_id_municipio
             FROM contas
             WHERE email = ?
             LIMIT 1`,
            [email.trim().toLowerCase()]
        );

        if (contas.length === 0) {
            return response.status(401).json({
                mensagem: "E-mail ou senha inválidos."
            });
        }

        const usuario = contas[0];

        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha_hash
        );

        if (!senhaValida) {
            return response.status(401).json({
                mensagem: "E-mail ou senha inválidos."
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET não configurado.");
        }

        const token = jwt.sign(
            {
                id: usuario.id_conta,
                perfil: usuario.perfil
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );

        return response.status(200).json({
            mensagem: "Login realizado com sucesso!",
            token,
            usuario: {
                id: usuario.id_conta,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
                fk_id_municipio: usuario.fk_id_municipio
            }
        });

    } catch (error) {
        next(error);
    }
}

// LISTAR MUNICÍPIOS PARA O CADASTRO
export async function listarMunicipios(request, response, next) {
    try {
        const [municipios] = await pool.execute(
            `SELECT id_municipio, nome
             FROM municipios
             ORDER BY nome ASC`
        );

        return response.status(200).json({
            municipios
        });

    } catch (error) {
        next(error);
    }
}

// CADASTRAR CIDADÃO
export async function registrarUsuario(request, response, next) {
    let connection;

    try {
        const {
            nome,
            email,
            senha,
            confirmarSenha,
            id_municipio
        } = request.body;

        // Validar campos obrigatórios
        if (
            !nome?.trim() ||
            !email?.trim() ||
            !senha ||
            !confirmarSenha ||
            !id_municipio
        ) {
            return response.status(400).json({
                mensagem: "Preencha todos os campos."
            });
        }

        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim().toLowerCase();
        const municipioId = Number(id_municipio);

        if (nomeLimpo.length < 3) {
            return response.status(400).json({
                mensagem: "Informe seu nome completo."
            });
        }

        const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoEmail.test(emailLimpo)) {
            return response.status(400).json({
                mensagem: "Informe um e-mail válido."
            });
        }

        if (senha.length < 8) {
            return response.status(400).json({
                mensagem: "A senha deve ter pelo menos 8 caracteres."
            });
        }

        if (senha !== confirmarSenha) {
            return response.status(400).json({
                mensagem: "As senhas não coincidem."
            });
        }

        if (!Number.isInteger(municipioId) || municipioId <= 0) {
            return response.status(400).json({
                mensagem: "Selecione um município válido."
            });
        }

        // Verificar se o e-mail já está cadastrado
        const [contasExistentes] = await pool.execute(
            `SELECT id_conta
             FROM contas
             WHERE email = ?
             LIMIT 1`,
            [emailLimpo]
        );

        if (contasExistentes.length > 0) {
            return response.status(409).json({
                mensagem: "Este e-mail já está cadastrado."
            });
        }

        // Gerar hash da senha
        const senhaHash = await bcrypt.hash(senha, 12);

        // Iniciar transação
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Verificar município
        const [municipios] = await connection.execute(
            `SELECT id_municipio
             FROM municipios
             WHERE id_municipio = ?
             LIMIT 1`,
            [municipioId]
        );

        if (municipios.length === 0) {
            await connection.rollback();

            return response.status(400).json({
                mensagem: "O município selecionado não existe."
            });
        }

        // Criar conta do cidadão
        const [resultadoConta] = await connection.execute(
            `INSERT INTO contas
                (nome, email, senha_hash, perfil, fk_id_municipio)
             VALUES (?, ?, ?, 'cidadao', NULL)`,
            [
                nomeLimpo,
                emailLimpo,
                senhaHash
            ]
        );

        const idConta = resultadoConta.insertId;

        // Associar cidadão ao município
        await connection.execute(
            `INSERT INTO contas_municipios
                (fk_id_conta, fk_id_municipio)
             VALUES (?, ?)`,
            [
                idConta,
                municipioId
            ]
        );

        // Confirmar as duas operações
        await connection.commit();

        return response.status(201).json({
            mensagem: "Conta criada com sucesso!",
            usuario: {
                id: idConta,
                nome: nomeLimpo,
                email: emailLimpo,
                perfil: "cidadao",
                id_municipio: municipioId
            }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        if (error.code === "ER_DUP_ENTRY") {
            return response.status(409).json({
                mensagem: "Este e-mail já está cadastrado."
            });
        }

        next(error);

    } finally {
        if (connection) {
            connection.release();
        }
    }
}
