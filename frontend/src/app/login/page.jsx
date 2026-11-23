
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import "@/app/login/login.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Login() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);

    function obterDashboard(perfil) {
        const dashboards = {
            admin_geral: "/admin",
            admin_municipal: "/admin-municipio",
            cidadao: "/usuarios"
        };

        return dashboards[perfil] || "/";
    }

    async function realizarLogin(e) {
        e.preventDefault();

        setMensagem("");
        setCarregando(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!apiUrl) {
                throw new Error("URL da API não configurada.");
            }

            const baseURL = apiUrl.replace(/\/+$/, "");

            const enderecoAPI = baseURL.endsWith("/api")
                ? `${baseURL}/auth/login`
                : `${baseURL}/api/auth/login`;

            console.log("Enviando login para:", enderecoAPI);

            const resposta = await fetch(enderecoAPI, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.trim(),
                    senha
                })
            });

            const tipoConteudo =
                resposta.headers.get("content-type");

            if (!tipoConteudo?.includes("application/json")) {
                const texto = await resposta.text();

                console.error("Resposta da API:", texto);

                throw new Error(
                    `A API não retornou JSON. Status: ${resposta.status}`
                );
            }

            const dados = await resposta.json();

            if (!resposta.ok) {
                setMensagem(
                    dados.mensagem || "E-mail ou senha inválidos."
                );
                return;
            }

            if (!dados.token || !dados.usuario) {
                setMensagem("Resposta inválida do servidor.");
                return;
            }

            localStorage.setItem("token", dados.token);

            localStorage.setItem(
                "usuario",
                JSON.stringify(dados.usuario)
            );

            router.replace(
                obterDashboard(dados.usuario.perfil)
            );

        } catch (erro) {
            console.error("Erro ao realizar login:", erro);

            setMensagem(
                erro.message ||
                "Não foi possível conectar ao servidor."
            );

        } finally {
            setCarregando(false);
        }
    }

    return (
        <section className="page-login">

            <div className="lado-esquerdo">

                <div className="img-lado-esquerdo">
                    <img
                        className="img-logo"
                        src="/imagens/logo.png"
                        alt="Logo AlertABC"
                    />
                </div>

                <div className="text-lado-esquerdo">
                    <h1>
                        Mais informação
                        <span className="quebra-linha">
                            para uma cidade
                        </span>
                        <span className="quebra-linha">
                            mais segura.
                        </span>
                    </h1>

                    <p>
                        Acompanhe, registre e consulte relatos de
                        <span className="quebra-linha">
                            ocorrências por região. Juntos por uma
                        </span>
                        <span> comunidade mais informada.</span>
                    </p>
                </div>

                <div className="icon-lado-esquerdo">

                    <div className="icon">
                        <i className="bi bi-geo-alt"></i>
                        <h3>Mapa interativo</h3>
                        <p>
                            Visualize relatos por
                            <span className="quebra-linha">
                                localização.
                            </span>
                        </p>
                    </div>

                    <div className="icon">
                        <i className="bi bi-file-earmark-plus"></i>
                        <h3>Registro de relatos</h3>
                        <p>
                            Compartilhe informações
                            <span className="quebra-linha">
                                com a comunidade.
                            </span>
                        </p>
                    </div>

                    <div className="icon">
                        <i className="bi bi-shield-check"></i>
                        <h3>Transparência</h3>
                        <p>
                            Consulte informações
                            <span className="quebra-linha">
                                de forma acessível.
                            </span>
                        </p>
                    </div>

                </div>

            </div>

            <div className="lado-direito">

                <div className="container-info-lado-direito">

                    <div className="text-lado-direito">
                        <h2>Acesse sua conta</h2>
                        <p>Entre com seus dados para continuar.</p>
                    </div>

                    <div className="forms-login">

                        <form onSubmit={realizarLogin}>

                            <div className="inputs">
                                <p>E-mail</p>

                                <input
                                    className="input-person"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="input-person2">
                                <p>Senha</p>

                                <input
                                    className="input-div"
                                    type="password"
                                    placeholder="Digite sua senha"
                                    value={senha}
                                    onChange={(e) =>
                                        setSenha(e.target.value)
                                    }
                                    required
                                />

                                <a href="/esqueci-senha">
                                    Esqueceu sua senha?
                                </a>
                            </div>

                            <div className="botao-acao-container">

                                <div className="botao-acao">
                                    <button
                                        type="submit"
                                        disabled={carregando}
                                    >
                                        {carregando
                                            ? "Entrando..."
                                            : "Entrar"}

                                        <i className="bi bi-arrow-right"></i>
                                    </button>
                                </div>

                                <div className="botao-acao2">
                                    <a href="/cadastro">
                                        <i className="bi bi-person-add"></i>
                                        Criar uma conta
                                    </a>
                                </div>

                            </div>

                            {mensagem && (
                                <p className="mensagem-login">
                                    {mensagem}
                                </p>
                            )}

                        </form>

                        <div className="aviso">
                            <p>
                                <i className="bi bi-shield-check"></i>
                                Seus dados estão protegidos e são usados
                                apenas
                                <span className="quebra-linha">
                                    para melhorar sua experiência na
                                    plataforma.
                                </span>
                            </p>
                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}
