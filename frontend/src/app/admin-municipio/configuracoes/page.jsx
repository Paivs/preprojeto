
"use client";

import { useEffect, useState } from "react";
import "./configuracoes.css";

const API =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function ConfiguracoesMunicipaisPage() {
    const [carregando, setCarregando] = useState(true);
    const [salvandoDados, setSalvandoDados] = useState(false);
    const [alterandoSenha, setAlterandoSenha] = useState(false);

    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");

    const [dados, setDados] = useState({
        nome: "",
        email: "",
        municipio: "",
        perfil: "",
    });

    const [senha, setSenha] = useState({
        atual: "",
        nova: "",
        confirmar: "",
    });

    useEffect(() => {
        async function carregarConfiguracoes() {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    setErro("Sua sessão expirou. Faça login novamente.");
                    return;
                }

                const resposta = await fetch(
                    `${API}/admin-municipal/configuracoes`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const resultado = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(
                        resultado.mensagem || "Erro ao carregar configurações."
                    );
                }

                const usuario = resultado.usuario;

                setDados({
                    nome: usuario.nome || "",
                    email: usuario.email || "",
                    municipio: usuario.municipio || "Não identificado",
                    perfil: usuario.perfil || "admin_municipal",
                });

                localStorage.setItem("usuario", JSON.stringify({
                    id: usuario.id_conta,
                    nome: usuario.nome,
                    email: usuario.email,
                    perfil: usuario.perfil,
                    fk_id_municipio: usuario.fk_id_municipio,
                    municipio: usuario.municipio,
                }));

            } catch (error) {
                console.error(error);
                setErro(error.message || "Erro ao carregar os dados.");
            } finally {
                setCarregando(false);
            }
        }

        carregarConfiguracoes();
    }, []);

    function atualizarDados(campo, valor) {
        setDados((anterior) => ({
            ...anterior,
            [campo]: valor,
        }));
    }

    function atualizarSenha(campo, valor) {
        setSenha((anterior) => ({
            ...anterior,
            [campo]: valor,
        }));
    }

    async function salvarDados(event) {
        event.preventDefault();

        setMensagem("");
        setErro("");

        if (!dados.nome.trim() || !dados.email.trim()) {
            setErro("Preencha o nome e o e-mail.");
            return;
        }

        try {
            setSalvandoDados(true);

            const token = localStorage.getItem("token");

            const resposta = await fetch(
                `${API}/admin-municipal/configuracoes/dados`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        nome: dados.nome,
                        email: dados.email,
                    }),
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.mensagem || "Não foi possível atualizar os dados."
                );
            }

            const usuario = resultado.usuario;

            setDados((anterior) => ({
                ...anterior,
                nome: usuario.nome,
                email: usuario.email,
                municipio: usuario.municipio || anterior.municipio,
                perfil: usuario.perfil,
            }));

            localStorage.setItem("usuario", JSON.stringify({
                id: usuario.id_conta,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
                fk_id_municipio: usuario.fk_id_municipio,
                municipio: usuario.municipio,
            }));

            setMensagem(resultado.mensagem);

        } catch (error) {
            console.error(error);
            setErro(error.message || "Erro ao atualizar os dados.");
        } finally {
            setSalvandoDados(false);
        }
    }

    async function alterarSenha(event) {
        event.preventDefault();

        setMensagem("");
        setErro("");

        if (!senha.atual || !senha.nova || !senha.confirmar) {
            setErro("Preencha todos os campos de senha.");
            return;
        }

        if (senha.nova.length < 8) {
            setErro("A nova senha deve ter pelo menos 8 caracteres.");
            return;
        }

        if (senha.nova.length > 72) {
            setErro("A nova senha deve ter no máximo 72 caracteres.");
            return;
        }

        if (senha.nova !== senha.confirmar) {
            setErro("A confirmação da senha não corresponde.");
            return;
        }

        try {
            setAlterandoSenha(true);

            const token = localStorage.getItem("token");

            const resposta = await fetch(
                `${API}/admin-municipal/configuracoes/senha`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        senhaAtual: senha.atual,
                        novaSenha: senha.nova,
                    }),
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.mensagem || "Não foi possível alterar a senha."
                );
            }

            setSenha({
                atual: "",
                nova: "",
                confirmar: "",
            });

            setMensagem(resultado.mensagem);

        } catch (error) {
            console.error(error);
            setErro(error.message || "Erro ao alterar a senha.");
        } finally {
            setAlterandoSenha(false);
        }
    }

    if (carregando) {
        return (
            <div className="municipal-settings-loading">
                <i className="bi bi-arrow-repeat"></i>
                Carregando configurações...
            </div>
        );
    }

    return (
        <div className="municipal-settings">

            <header className="municipal-settings-header">
                <div>
                    <span className="municipal-settings-eyebrow">
                        PAINEL MUNICIPAL
                    </span>

                    <h1>Configurações</h1>

                    <p>
                        Gerencie os dados da sua conta e suas informações
                        de segurança.
                    </p>
                </div>

                <div className="municipal-settings-header-icon">
                    <i className="bi bi-gear"></i>
                </div>
            </header>

            {erro && (
                <div className="municipal-settings-alert error">
                    <i className="bi bi-exclamation-circle"></i>
                    <span>{erro}</span>
                </div>
            )}

            {mensagem && (
                <div className="municipal-settings-alert success">
                    <i className="bi bi-check-circle"></i>
                    <span>{mensagem}</span>
                </div>
            )}

            {/* DADOS DA CONTA */}

            <section className="municipal-settings-card">

                <div className="municipal-settings-card-header">
                    <div className="municipal-settings-card-icon">
                        <i className="bi bi-person"></i>
                    </div>

                    <div>
                        <h2>Dados da conta</h2>
                        <p>
                            Consulte e gerencie suas informações pessoais.
                        </p>
                    </div>
                </div>

                <form onSubmit={salvarDados}>
                    <div className="municipal-settings-grid">

                        <div className="municipal-settings-field">
                            <label htmlFor="nome">Nome completo</label>

                            <input
                                id="nome"
                                type="text"
                                value={dados.nome}
                                onChange={(event) =>
                                    atualizarDados("nome", event.target.value)
                                }
                                placeholder="Seu nome completo"
                                maxLength={150}
                            />
                        </div>

                        <div className="municipal-settings-field">
                            <label htmlFor="email">E-mail</label>

                            <input
                                id="email"
                                type="email"
                                value={dados.email}
                                onChange={(event) =>
                                    atualizarDados("email", event.target.value)
                                }
                                placeholder="seu@email.com"
                                maxLength={254}
                            />
                        </div>

                        <div className="municipal-settings-field">
                            <label htmlFor="municipio">
                                Município vinculado
                            </label>

                            <input
                                id="municipio"
                                type="text"
                                value={dados.municipio}
                                disabled
                            />

                            <small>
                                O município não pode ser alterado por esta página.
                            </small>
                        </div>

                        <div className="municipal-settings-field">
                            <label htmlFor="perfil">Perfil de acesso</label>

                            <input
                                id="perfil"
                                type="text"
                                value="Administrador municipal"
                                disabled
                            />
                        </div>

                    </div>

                    <div className="municipal-settings-actions">
                        <button type="submit" disabled={salvandoDados}>
                            <i className="bi bi-check-lg"></i>

                            {salvandoDados
                                ? "Salvando..."
                                : "Salvar alterações"}
                        </button>
                    </div>
                </form>
            </section>

            {/* SEGURANÇA */}

            <section className="municipal-settings-card">

                <div className="municipal-settings-card-header">
                    <div className="municipal-settings-card-icon">
                        <i className="bi bi-shield-lock"></i>
                    </div>

                    <div>
                        <h2>Segurança</h2>
                        <p>
                            Altere sua senha para manter sua conta protegida.
                        </p>
                    </div>
                </div>

                <form onSubmit={alterarSenha}>
                    <div className="municipal-settings-grid">

                        <div className="municipal-settings-field full">
                            <label htmlFor="senha-atual">Senha atual</label>

                            <input
                                id="senha-atual"
                                type="password"
                                value={senha.atual}
                                onChange={(event) =>
                                    atualizarSenha("atual", event.target.value)
                                }
                                placeholder="Digite sua senha atual"
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="municipal-settings-field">
                            <label htmlFor="senha-nova">Nova senha</label>

                            <input
                                id="senha-nova"
                                type="password"
                                value={senha.nova}
                                onChange={(event) =>
                                    atualizarSenha("nova", event.target.value)
                                }
                                placeholder="Mínimo de 8 caracteres"
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="municipal-settings-field">
                            <label htmlFor="senha-confirmar">
                                Confirmar nova senha
                            </label>

                            <input
                                id="senha-confirmar"
                                type="password"
                                value={senha.confirmar}
                                onChange={(event) =>
                                    atualizarSenha("confirmar", event.target.value)
                                }
                                placeholder="Repita a nova senha"
                                autoComplete="new-password"
                            />
                        </div>

                    </div>

                    <div className="municipal-settings-actions">
                        <button type="submit" disabled={alterandoSenha}>
                            <i className="bi bi-lock"></i>

                            {alterandoSenha
                                ? "Atualizando..."
                                : "Atualizar senha"}
                        </button>
                    </div>
                </form>
            </section>

            <div className="municipal-settings-footer">
                <i className="bi bi-info-circle"></i>

                <span>
                    As informações municipais são determinadas pelo vínculo
                    administrativo da sua conta.
                </span>
            </div>

        </div>
    );
}
