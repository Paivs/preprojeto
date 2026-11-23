"use client";

import { useCallback, useEffect, useState } from "react";
import "./configuracoes.css";

function obterEnderecoAPI() {
    const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api")
        .replace(/\/+$/, "");

    return base.endsWith("/api") ? base : `${base}/api`;
}

export default function ConfiguracoesAdmin() {
    const [usuario, setUsuario] = useState({
        nome: "",
        email: "",
        perfil: "admin_geral"
    });

    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const [carregando, setCarregando] = useState(true);
    const [salvandoDados, setSalvandoDados] = useState(false);
    const [salvandoSenha, setSalvandoSenha] = useState(false);

    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");

    const mostrarMensagem = useCallback((texto, tipo = "erro") => {
        setMensagem(texto);
        setTipoMensagem(tipo);
    }, []);

    const carregarUsuario = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                mostrarMensagem("Sua sessão não foi encontrada. Entre novamente.");
                return;
            }

            const resposta = await fetch(
                `${obterEnderecoAPI()}/admin-geral/configuracoes`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.mensagem || "Não foi possível carregar a conta.");
            }

            setUsuario(dados.usuario);

        } catch (error) {
            mostrarMensagem(error.message);
        } finally {
            setCarregando(false);
        }
    }, [mostrarMensagem]);

    useEffect(() => {
        carregarUsuario();
    }, [carregarUsuario]);

    async function salvarDados(event) {
        event.preventDefault();
        setMensagem("");

        if (!usuario.nome.trim() || !usuario.email.trim()) {
            mostrarMensagem("Preencha o nome e o e-mail.");
            return;
        }

        try {
            setSalvandoDados(true);

            const token = localStorage.getItem("token");

            const resposta = await fetch(
                `${obterEnderecoAPI()}/admin-geral/configuracoes/dados`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nome: usuario.nome,
                        email: usuario.email
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.mensagem || "Erro ao atualizar os dados.");
            }

            setUsuario(dados.usuario);

            // Atualiza os dados locais utilizados pela interface, se disponíveis.
            const usuarioLocal = localStorage.getItem("usuario");

            if (usuarioLocal) {
                const usuarioAtualizado = JSON.parse(usuarioLocal);

                localStorage.setItem(
                    "usuario",
                    JSON.stringify({
                        ...usuarioAtualizado,
                        nome: dados.usuario.nome,
                        email: dados.usuario.email
                    })
                );
            }

            mostrarMensagem(dados.mensagem, "sucesso");

        } catch (error) {
            mostrarMensagem(error.message);
        } finally {
            setSalvandoDados(false);
        }
    }

    async function salvarSenha(event) {
        event.preventDefault();
        setMensagem("");

        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            mostrarMensagem("Preencha todos os campos de senha.");
            return;
        }

        if (novaSenha.length < 8) {
            mostrarMensagem("A nova senha deve ter pelo menos 8 caracteres.");
            return;
        }

        if (novaSenha !== confirmarSenha) {
            mostrarMensagem("A confirmação da nova senha não corresponde.");
            return;
        }

        try {
            setSalvandoSenha(true);

            const token = localStorage.getItem("token");

            const resposta = await fetch(
                `${obterEnderecoAPI()}/admin-geral/configuracoes/senha`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        senhaAtual,
                        novaSenha
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.mensagem || "Erro ao alterar a senha.");
            }

            setSenhaAtual("");
            setNovaSenha("");
            setConfirmarSenha("");

            mostrarMensagem(dados.mensagem, "sucesso");

        } catch (error) {
            mostrarMensagem(error.message);
        } finally {
            setSalvandoSenha(false);
        }
    }

    if (carregando) {
        return (
            <div className="config-content">
                <p className="config-loading">Carregando configurações...</p>
            </div>
        );
    }

    return (
        <div className="config-content">

            <header className="config-header">
                <div>
                    <h1>Configurações da conta</h1>
                    <p>
                        Gerencie seus dados pessoais e as informações de segurança
                        da sua conta.
                    </p>
                </div>
            </header>

            {mensagem && (
                <div
                    className={`config-message ${tipoMensagem}`}
                    role="alert"
                >
                    <i className={
                        tipoMensagem === "sucesso"
                            ? "bi bi-check-circle"
                            : "bi bi-exclamation-circle"
                    } />
                    {mensagem}
                </div>
            )}

            <section className="config-card">
                <div className="config-card-header">
                    <div className="config-icon">
                        <i className="bi bi-person-circle" />
                    </div>

                    <div>
                        <h2>Dados pessoais</h2>
                        <p>Atualize as informações da sua conta.</p>
                    </div>
                </div>

                <form onSubmit={salvarDados}>
                    <div className="config-form-grid">

                        <div className="config-field">
                            <label htmlFor="nome">Nome completo</label>
                            <input
                                id="nome"
                                type="text"
                                value={usuario.nome}
                                onChange={(event) =>
                                    setUsuario({
                                        ...usuario,
                                        nome: event.target.value
                                    })
                                }
                                placeholder="Seu nome completo"
                                required
                            />
                        </div>

                        <div className="config-field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                id="email"
                                type="email"
                                value={usuario.email}
                                onChange={(event) =>
                                    setUsuario({
                                        ...usuario,
                                        email: event.target.value
                                    })
                                }
                                placeholder="seu@email.com"
                                required
                            />
                        </div>

                        <div className="config-field">
                            <label htmlFor="perfil">Tipo de conta</label>
                            <input
                                id="perfil"
                                type="text"
                                value="Administrador Geral"
                                disabled
                            />
                            <small>O perfil da conta não pode ser alterado aqui.</small>
                        </div>

                    </div>

                    <div className="config-actions">
                        <button
                            type="submit"
                            disabled={salvandoDados}
                        >
                            {salvandoDados ? "Salvando..." : "Salvar alterações"}
                        </button>
                    </div>
                </form>
            </section>

            <section className="config-card">
                <div className="config-card-header">
                    <div className="config-icon">
                        <i className="bi bi-shield-lock" />
                    </div>

                    <div>
                        <h2>Segurança da conta</h2>
                        <p>Altere sua senha de acesso.</p>
                    </div>
                </div>

                <form onSubmit={salvarSenha}>
                    <div className="config-form-grid">

                        <div className="config-field config-field-full">
                            <label htmlFor="senhaAtual">Senha atual</label>
                            <input
                                id="senhaAtual"
                                type="password"
                                value={senhaAtual}
                                onChange={(event) => setSenhaAtual(event.target.value)}
                                placeholder="Digite sua senha atual"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <div className="config-field">
                            <label htmlFor="novaSenha">Nova senha</label>
                            <input
                                id="novaSenha"
                                type="password"
                                value={novaSenha}
                                onChange={(event) => setNovaSenha(event.target.value)}
                                placeholder="Mínimo de 8 caracteres"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />
                        </div>

                        <div className="config-field">
                            <label htmlFor="confirmarSenha">
                                Confirmar nova senha
                            </label>
                            <input
                                id="confirmarSenha"
                                type="password"
                                value={confirmarSenha}
                                onChange={(event) =>
                                    setConfirmarSenha(event.target.value)
                                }
                                placeholder="Digite novamente a nova senha"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                    </div>

                    <div className="config-password-info">
                        <i className="bi bi-info-circle" />
                        A nova senha deve possuir pelo menos 8 caracteres.
                    </div>

                    <div className="config-actions">
                        <button
                            type="submit"
                            disabled={salvandoSenha}
                        >
                            {salvandoSenha ? "Alterando..." : "Alterar senha"}
                        </button>
                    </div>
                </form>
            </section>

        </div>
    );
}