
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import "./usuarios.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const menu = [
    {
        nome: "Inicio",
        caminho: "/usuarios",
        icone: "bi-house"
    },
    {
        nome: "Meus relatos",
        caminho: "/usuarios/relatos",
        icone: "bi-file-earmark-text"
    },
    {
        nome: "Novo relato",
        caminho: "/usuarios/novo-relato",
        icone: "bi-plus-circle"
    },
    {
        nome: "Meu perfil",
        caminho: "/usuarios/perfil",
        icone: "bi-person"
    }
];

export default function UsuariosLayout({ children }) {

    const pathname = usePathname();
    const router = useRouter();

    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarUsuario() {
            const token = localStorage.getItem("token");
            const usuarioSalvo = localStorage.getItem("usuario");

            if (!token) {
                router.replace("/login");
                return;
            }

            if (usuarioSalvo) {
                try {
                    setUsuario(JSON.parse(usuarioSalvo));
                } catch (erro) {
                    console.error("Erro ao carregar usuário salvo:", erro);
                }
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

                if (!resposta.ok) {
                    throw new Error("Não foi possível consultar o perfil.");
                }

                const dados = await resposta.json();

                setUsuario(dados.usuario);

                localStorage.setItem(
                    "usuario",
                    JSON.stringify(dados.usuario)
                );

            } catch (erro) {
                console.error("Erro ao consultar perfil:", erro);
            } finally {
                setCarregando(false);
            }
        }

        carregarUsuario();
    }, [router]);

    function sair() {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        router.replace("/login");
    }

    if (carregando) {
        return (
            <div className="usuarios-loading">
                <div className="spinner-border text-primary"></div>
                <span>Carregando sua área...</span>
            </div>
        );
    }

    return (
        <div className="usuarios-container">

            <aside className="usuarios-sidebar">

                <Link href="/usuarios" className="usuarios-brand">
                    <span className="usuarios-brand-icon">
                        <i className="bi bi-shield-check"></i>
                    </span>

                    <span>
                        Alert<span>ABC</span>
                    </span>
                </Link>

                <div className="usuarios-user">

                    <div className="usuarios-avatar">
                        <i className="bi bi-person"></i>
                    </div>

                    <div className="usuarios-user-info">
                        <strong>
                            {usuario?.nome || "Cidadão"}
                        </strong>

                        <span>Conta de cidadão</span>
                    </div>

                </div>

                <nav className="usuarios-navigation">

                    <span className="usuarios-menu-title">
                        MENU PRINCIPAL
                    </span>

                    {menu.map((item) => {
                        const ativo = pathname === item.caminho;

                        return (
                            <Link
                                key={item.caminho}
                                href={item.caminho}
                                className={`usuarios-menu-item ${
                                    ativo ? "active" : ""
                                }`}
                            >
                                <i className={`bi ${item.icone}`}></i>
                                <span>{item.nome}</span>
                            </Link>
                        );
                    })}

                </nav>

                <div className="usuarios-sidebar-bottom">

                    <button
                        type="button"
                        className="usuarios-logout"
                        onClick={sair}
                    >
                        <i className="bi bi-box-arrow-left"></i>
                        <span>Sair da conta</span>
                    </button>

                </div>

            </aside>

            <div className="usuarios-main">

                <header className="usuarios-topbar">

                    <div>
                        <span className="usuarios-topbar-label">
                            ÁREA DO CIDADÃO
                        </span>

                        <h1>Meu espaço</h1>
                    </div>

                    <div className="usuarios-topbar-user">

                        <div className="usuarios-avatar small">
                            <i className="bi bi-person"></i>
                        </div>

                        <span>
                            {usuario?.nome || "Cidadão"}
                        </span>

                    </div>

                </header>

                <main className="usuarios-content">
                    {children}
                </main>

            </div>

        </div>
    );
}
