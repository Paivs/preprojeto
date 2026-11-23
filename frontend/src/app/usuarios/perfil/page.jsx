
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function PerfilUsuario() {
    const router = useRouter();

    const [usuario, setUsuario] = useState({
        nome: "",
        email: ""
    });

    const [senha, setSenha] = useState({
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: ""
    });

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [alterandoSenha, setAlterandoSenha] = useState(false);

    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("info");

    const [mensagemSenha, setMensagemSenha] = useState("");
    const [tipoMensagemSenha, setTipoMensagemSenha] = useState("info");

    // CARREGAR PERFIL
    useEffect(() => {
        async function carregarPerfil() {
            const token = localStorage.getItem("token");

            if (!token) {
                router.replace("/login");
                return;
            }

            try {
                const resposta = await fetch(`${API}/usuario/perfil`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (resposta.status === 401 || resposta.status === 403) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("usuario");
                    router.replace("/login");
                    return;
                }

                const dados = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(
                        dados.mensagem || "Não foi possível carregar o perfil."
                    );
                }

                setUsuario({
                    nome: dados.usuario.nome || "",
                    email: dados.usuario.email || ""
                });

                localStorage.setItem(
                    "usuario",
                    JSON.stringify(dados.usuario)
                );

            } catch (error) {
                setMensagem(error.message);
                setTipoMensagem("error");
            } finally {
                setCarregando(false);
            }
        }

        carregarPerfil();
    }, [router]);

    // ATUALIZAR DADOS PESSOAIS
    async function handleSubmit(e) {
        e.preventDefault();

        setMensagem("");
        setSalvando(true);

        try {
            const token = localStorage.getItem("token");

            const resposta = await fetch(`${API}/usuario/perfil`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    nome: usuario.nome,
                    email: usuario.email
                })
            });

            const dados = await resposta.json();

            if (resposta.status === 401 || resposta.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                router.replace("/login");
                return;
            }

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || "Não foi possível atualizar o perfil."
                );
            }

            setUsuario({
                nome: dados.usuario.nome,
                email: dados.usuario.email
            });

            localStorage.setItem(
                "usuario",
                JSON.stringify(dados.usuario)
            );

            setMensagem(dados.mensagem);
            setTipoMensagem("success");

        } catch (error) {
            setMensagem(error.message);
            setTipoMensagem("error");
        } finally {
            setSalvando(false);
        }
    }

    // ALTERAR SENHA
    async function handleAlterarSenha(e) {
        e.preventDefault();

        setMensagemSenha("");
        setAlterandoSenha(true);

        try {
            const token = localStorage.getItem("token");

            const resposta = await fetch(`${API}/usuario/senha`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(senha)
            });

            const dados = await resposta.json();

            if (resposta.status === 401 || resposta.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                router.replace("/login");
                return;
            }

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || "Não foi possível alterar a senha."
                );
            }

            setMensagemSenha(dados.mensagem);
            setTipoMensagemSenha("success");

            setSenha({
                senhaAtual: "",
                novaSenha: "",
                confirmarSenha: ""
            });

        } catch (error) {
            setMensagemSenha(error.message);
            setTipoMensagemSenha("error");
        } finally {
            setAlterandoSenha(false);
        }
    }

    if (carregando) {
        return (
            <div className="usuarios-loading">
                <div className="spinner-border text-primary"></div>
                <span>Carregando seu perfil...</span>
            </div>
        );
    }

    return (
        <>
            <div className="user-page-heading">
                <div>
                    <h1>Meu perfil</h1>
                    <p>Consulte e atualize as informações da sua conta.</p>
                </div>
            </div>

            {mensagem && (
                <div className={`user-alert ${
                    tipoMensagem === "success"
                        ? "user-alert-success"
                        : tipoMensagem === "error"
                            ? "user-alert-error"
                            : "user-alert-info"
                }`}>
                    {mensagem}
                </div>
            )}

            {/* DADOS PESSOAIS */}

            <section className="user-panel">

                <div className="user-profile-header">
                    <div className="user-profile-avatar">
                        <i className="bi bi-person"></i>
                    </div>

                    <div>
                        <h2>{usuario.nome || "Usuário"}</h2>
                        <p>{usuario.email || "E-mail não informado"}</p>
                    </div>
                </div>

                <div className="user-panel-header">
                    <h3>Dados pessoais</h3>
                </div>

                <form className="user-form" onSubmit={handleSubmit}>

                    <div className="user-form-grid">

                        <div className="user-form-group">
                            <label htmlFor="nome">Nome completo</label>

                            <input
                                id="nome"
                                type="text"
                                value={usuario.nome}
                                onChange={(e) =>
                                    setUsuario({
                                        ...usuario,
                                        nome: e.target.value
                                    })
                                }
                                minLength={3}
                                required
                            />
                        </div>

                        <div className="user-form-group">
                            <label htmlFor="email">E-mail</label>

                            <input
                                id="email"
                                type="email"
                                value={usuario.email}
                                onChange={(e) =>
                                    setUsuario({
                                        ...usuario,
                                        email: e.target.value
                                    })
                                }
                                required
                            />
                        </div>

                    </div>

                    <div className="user-form-actions">
                        <button
                            type="submit"
                            className="user-btn-primary"
                            disabled={salvando}
                        >
                            <i className="bi bi-check-lg"></i>

                            {salvando
                                ? "Salvando..."
                                : "Salvar alterações"}
                        </button>
                    </div>

                </form>

            </section>

            {/* SEGURANÇA DA CONTA */}

            <section className="user-panel">

                <div className="user-panel-header">
                    <h3>Segurança da conta</h3>
                </div>

                {mensagemSenha && (
                    <div className={`user-alert ${
                        tipoMensagemSenha === "success"
                            ? "user-alert-success"
                            : "user-alert-error"
                    }`}>
                        {mensagemSenha}
                    </div>
                )}

                <form
                    className="user-form"
                    onSubmit={handleAlterarSenha}
                >

                    <div className="user-form-grid">

                        <div className="user-form-group">
                            <label htmlFor="senhaAtual">
                                Senha atual
                            </label>

                            <input
                                id="senhaAtual"
                                type="password"
                                value={senha.senhaAtual}
                                onChange={(e) =>
                                    setSenha({
                                        ...senha,
                                        senhaAtual: e.target.value
                                    })
                                }
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <div className="user-form-group">
                            <label htmlFor="novaSenha">
                                Nova senha
                            </label>

                            <input
                                id="novaSenha"
                                type="password"
                                value={senha.novaSenha}
                                onChange={(e) =>
                                    setSenha({
                                        ...senha,
                                        novaSenha: e.target.value
                                    })
                                }
                                minLength={8}
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <div className="user-form-group">
                            <label htmlFor="confirmarSenha">
                                Confirmar nova senha
                            </label>

                            <input
                                id="confirmarSenha"
                                type="password"
                                value={senha.confirmarSenha}
                                onChange={(e) =>
                                    setSenha({
                                        ...senha,
                                        confirmarSenha: e.target.value
                                    })
                                }
                                minLength={8}
                                autoComplete="new-password"
                                required
                            />
                        </div>

                    </div>

                    <div className="user-form-actions">
                        <button
                            type="submit"
                            className="user-btn-primary"
                            disabled={alterandoSenha}
                        >
                            <i className="bi bi-shield-lock"></i>

                            {alterandoSenha
                                ? "Alterando..."
                                : "Alterar senha"}
                        </button>
                    </div>

                </form>

            </section>
        </>
    );
}
