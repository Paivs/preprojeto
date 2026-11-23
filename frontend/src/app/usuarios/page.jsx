
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function UsuariosPage() {
    const [nome, setNome] = useState("Cidadão");

    useEffect(() => {
        try {
            const usuarioSalvo = localStorage.getItem("usuario");

            if (usuarioSalvo) {
                const usuario = JSON.parse(usuarioSalvo);
                setNome(usuario.nome || "Cidadão");
            }
        } catch (erro) {
            console.error("Erro ao carregar nome do usuário:", erro);
        }
    }, []);

    return (
        <div className="usuarios-home">

            {/* APRESENTAÇÃO */}

            <section className="usuarios-welcome">

                <div className="usuarios-welcome-content">

                    <span className="usuarios-eyebrow">
                        BEM-VINDO AO ALERTABC
                    </span>

                    <h2>
                        Olá, {nome.split(" ")[0]}!
                    </h2>

                    <p>
                        Sua participação faz a diferença.
                        Registre possíveis ocorrências, acompanhe
                        seus relatos e contribua para uma comunidade
                        mais informada.
                    </p>

                    <Link
                        href="/usuarios/novo-relato"
                        className="usuarios-primary-button"
                    >
                        <i className="bi bi-plus-lg"></i>
                        Registrar novo relato
                    </Link>

                </div>

                <div className="usuarios-welcome-icon">
                    <i className="bi bi-shield-check"></i>
                </div>

            </section>

            {/* ACESSO RÁPIDO */}

            <section className="usuarios-section">

                <div className="usuarios-section-heading">

                    <div>
                        <span>ACESSO RÁPIDO</span>
                        <h3>O que deseja fazer?</h3>
                    </div>

                </div>

                <div className="usuarios-shortcuts">

                    {/* MEUS RELATOS */}

                    <Link
                        href="/usuarios/relatos"
                        className="usuarios-shortcut-card"
                    >

                        <div className="usuarios-shortcut-icon blue">
                            <i className="bi bi-file-earmark-text"></i>
                        </div>

                        <h4>Meus relatos</h4>

                        <p>
                            Consulte os relatos que você enviou
                            e acompanhe suas atualizações.
                        </p>

                        <span>
                            Acessar relatos
                            <i className="bi bi-arrow-right"></i>
                        </span>

                    </Link>

                    {/* NOVO RELATO */}

                    <Link
                        href="/usuarios/novo-relato"
                        className="usuarios-shortcut-card"
                    >

                        <div className="usuarios-shortcut-icon green">
                            <i className="bi bi-plus-circle"></i>
                        </div>

                        <h4>Novo relato</h4>

                        <p>
                            Compartilhe informações sobre uma
                            possível ocorrência.
                        </p>

                        <span>
                            Fazer um relato
                            <i className="bi bi-arrow-right"></i>
                        </span>

                    </Link>

                    {/* PERFIL */}

                    <Link
                        href="/usuarios/perfil"
                        className="usuarios-shortcut-card"
                    >

                        <div className="usuarios-shortcut-icon gray">
                            <i className="bi bi-person"></i>
                        </div>

                        <h4>Meu perfil</h4>

                        <p>
                            Consulte e atualize seus dados
                            cadastrais.
                        </p>

                        <span>
                            Ver meu perfil
                            <i className="bi bi-arrow-right"></i>
                        </span>

                    </Link>

                </div>

            </section>

            {/* INFORMAÇÕES */}

            <section className="usuarios-information">

                <div className="usuarios-information-icon">
                    <i className="bi bi-info-circle"></i>
                </div>

                <div>
                    <h4>Sobre seus relatos</h4>

                    <p>
                        Os relatos enviados passam por análise.
                        Você poderá acompanhar o andamento e a
                        situação de cada registro na seção
                        "Meus relatos".
                    </p>
                </div>

            </section>

        </div>
    );
}
