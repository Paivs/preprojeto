
"use client";

import Link from "next/link";

import "./home.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Home() {

    return (
        <main className="home-alertabc">

            {/* CONTEÚDO PRINCIPAL */}
            <section className="home-hero">

                <div className="home-hero-container">

                    <div className="home-hero-content">

                        <div className="home-tag">
                            <span className="home-tag-dot"></span>
                            INFORMAÇÃO E CONSCIENTIZAÇÃO
                        </div>

                        <h1>
                            Uma cidade mais
                            <span> informada começa</span>
                            com você.
                        </h1>

                        <p className="home-hero-description">
                            O AlertABC aproxima cidadãos por meio do
                            compartilhamento de informações sobre possíveis
                            ocorrências. Mais informação, transparência e
                            colaboração para a comunidade.
                        </p>

                        <div className="home-hero-actions">

                            <Link href="/cadastro" className="home-button-primary">
                                Começar agora
                                <i className="bi bi-arrow-right"></i>
                            </Link>

                            <Link href="/sobre" className="home-button-secondary">
                                Conheça a plataforma
                            </Link>

                        </div>

                        <div className="home-hero-note">
                            <i className="bi bi-shield-check"></i>
                            Informação e colaboração para uma comunidade mais consciente.
                        </div>

                    </div>

                    {/* PAINEL VISUAL */}
                    <div className="home-hero-visual">

                        <div className="home-visual-background"></div>

                        <div className="home-visual-card">

                            <div className="home-visual-header">

                                <div>
                                    <span className="home-visual-label">ALERTABC</span>
                                    <h3>Informação em destaque</h3>
                                </div>

                                <div className="home-visual-icon">
                                    <i className="bi bi-broadcast"></i>
                                </div>

                            </div>

                            <div className="home-visual-map">

                                <div className="home-map-grid"></div>

                                <div className="home-map-road home-road-one"></div>
                                <div className="home-map-road home-road-two"></div>
                                <div className="home-map-road home-road-three"></div>

                                <div className="home-map-pin pin-one">
                                    <i className="bi bi-geo-alt-fill"></i>
                                </div>

                                <div className="home-map-pin pin-two">
                                    <i className="bi bi-geo-alt-fill"></i>
                                </div>

                                <div className="home-map-pin pin-three">
                                    <i className="bi bi-geo-alt-fill"></i>
                                </div>

                                <div className="home-map-center">
                                    <i className="bi bi-shield-check"></i>
                                </div>

                                <span className="home-map-caption">
                                    Visualização ilustrativa
                                </span>

                            </div>

                            <div className="home-visual-footer">

                                <div className="home-visual-footer-icon">
                                    <i className="bi bi-info-circle"></i>
                                </div>

                                <div>
                                    <strong>Informação compartilhada</strong>
                                    <p>Uma comunidade mais conectada.</p>
                                </div>

                            </div>

                        </div>

                        <div className="home-floating-card">
                            <i className="bi bi-people"></i>
                            <div>
                                <strong>Colaboração</strong>
                                <span>Juntos pela comunidade</span>
                            </div>
                        </div>

                    </div>

                </div>

            </section>

            {/* BENEFÍCIOS */}
            <section className="home-features">

                <div className="home-section-heading">

                    <span>COMO FUNCIONA</span>

                    <h2>
                        Informação que aproxima
                        <span> pessoas e comunidade.</span>
                    </h2>

                    <p>
                        Uma plataforma pensada para facilitar o acesso
                        à informação e incentivar a participação dos cidadãos.
                    </p>

                </div>

                <div className="home-features-grid">

                    <article className="home-feature-card">

                        <div className="home-feature-icon blue">
                            <i className="bi bi-file-earmark-plus"></i>
                        </div>

                        {/* <span className="home-feature-number">01</span> */}

                        <h3>Registre relatos</h3>

                        <p>
                            Compartilhe informações sobre possíveis ocorrências
                            de maneira simples e organizada.
                        </p>

                    </article>

                    <article className="home-feature-card">

                        <div className="home-feature-icon purple">
                            <i className="bi bi-geo-alt"></i>
                        </div>

                        {/* <span className="home-feature-number">02</span> */}

                        <h3>Consulte informações</h3>

                        <p>
                            Tenha acesso aos relatos disponibilizados na
                            plataforma e suas respectivas localizações.
                        </p>

                    </article>

                    <article className="home-feature-card">

                        <div className="home-feature-icon green">
                            <i className="bi bi-people"></i>
                        </div>

                        {/* <span className="home-feature-number">03</span> */}

                        <h3>Colabore com a comunidade</h3>

                        <p>
                            Contribua para uma comunidade mais informada
                            por meio do compartilhamento responsável.
                        </p>

                    </article>

                </div>

            </section>

            {/* CHAMADA FINAL */}
            <section className="home-cta">

                <div className="home-cta-content">

                    <div className="home-cta-icon">
                        <i className="bi bi-shield-check"></i>
                    </div>

                    <h2>
                        Faça parte de uma comunidade
                        <span> mais informada.</span>
                    </h2>

                    <p>
                        Crie sua conta e conheça as possibilidades
                        oferecidas pelo AlertABC.
                    </p>

                    <Link href="/cadastro" className="home-cta-button">
                        Criar minha conta
                        <i className="bi bi-arrow-right"></i>
                    </Link>

                </div>

            </section>

        </main>
    );
}
