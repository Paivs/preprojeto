
"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregarDashboard() {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Faça login para acessar o dashboard.");
                }

                const resposta = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/admin-geral/dashboard`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const resultado = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(
                        resultado.mensagem || "Não foi possível carregar os dados."
                    );
                }

                setDados(resultado);

            } catch (error) {
                setErro(error.message);
            } finally {
                setCarregando(false);
            }
        }

        carregarDashboard();
    }, []);

    if (carregando) {
        return (
            <div className="admin-content">
                <p>Carregando indicadores do AlertABC...</p>
            </div>
        );
    }

    if (erro) {
        return (
            <div className="admin-content">
                <h1>Não foi possível carregar o dashboard</h1>
                <p>{erro}</p>
                <button onClick={() => window.location.reload()}>
                    Tentar novamente
                </button>
            </div>
        );
    }

    if (!dados) return null;

    const indicadores = [
        {
            titulo: "Total de relatos",
            valor: dados.indicadores.totalRelatos,
            descricao: "Relatos enviados por cidadãos",
            icone: "▤"
        },
        {
            titulo: "Usuários cadastrados",
            valor: dados.indicadores.totalContas,
            descricao: "Contas registradas",
            icone: "♙"
        },
        {
            titulo: "Relatos pendentes",
            valor: dados.indicadores.pendentes,
            descricao: "Aguardando análise",
            icone: "◷"
        },
        {
            titulo: "Relatos aprovados",
            valor: dados.indicadores.aprovados,
            descricao: "Relatos aprovados",
            icone: "✓"
        }
    ];

    const distribuicao = [
        {
            titulo: "Pendentes",
            valor: dados.distribuicao.pendentes,
            classe: "bar-blue"
        },
        {
            titulo: "Aprovados",
            valor: dados.distribuicao.aprovados,
            classe: "bar-green"
        },
        {
            titulo: "Rejeitados",
            valor: dados.distribuicao.rejeitados,
            classe: "bar-orange"
        }
    ];

    const maiorValor = Math.max(
        ...distribuicao.map((item) => item.valor),
        1
    );

    const formatarNumero = (valor) =>
        Number(valor).toLocaleString("pt-BR");

    return (
        <div className="admin-content">
            <header className="admin-header">
                <div>
                    <span className="admin-eyebrow">ADMINISTRAÇÃO</span>
                    <h1>Visão geral</h1>
                    <p>
                        Acompanhe os dados e as atividades do AlertABC.
                    </p>
                </div>

                <div className="admin-header-right">
                    <span className="admin-date">
                        Painel administrativo geral
                    </span>
                </div>
            </header>

            <section className="admin-welcome">
                <div>
                    <span>PAINEL DE CONTROLE</span>
                    <h2>Bem-vindo ao AlertABC</h2>
                    <p>
                        Gerencie os relatos, acompanhe os usuários e
                        visualize os indicadores da plataforma.
                    </p>
                </div>

                <div className="welcome-decoration">A</div>
            </section>

            <section className="admin-section">
                <div className="section-heading">
                    <div>
                        <h2>Indicadores gerais</h2>
                        <p>Dados atualizados diretamente do banco de dados.</p>
                    </div>

                    <span className="demo-label">Dados reais</span>
                </div>

                <div className="admin-stats-grid">
                    {indicadores.map((item) => (
                        <article className="admin-stat-card" key={item.titulo}>
                            <div className="stat-card-top">
                                <span>{item.titulo}</span>
                                <div className="stat-icon">{item.icone}</div>
                            </div>

                            <strong className="stat-value">
                                {formatarNumero(item.valor)}
                            </strong>

                            <span className="stat-description">
                                {item.descricao}
                            </span>
                        </article>
                    ))}
                </div>
            </section>

            <section className="admin-dashboard-grid">
                <article className="admin-panel">
                    <div className="section-heading">
                        <div>
                            <h2>Distribuição de relatos</h2>
                            <p>Quantidade por situação de análise.</p>
                        </div>
                    </div>

                    <div className="chart-placeholder">
                        {distribuicao.map((item) => (
                            <div className="chart-column" key={item.titulo}>
                                <div
                                    className={`chart-bar ${item.classe}`}
                                    style={{
                                        height: `${(item.valor / maiorValor) * 100}%`,
                                        minHeight: item.valor > 0 ? "8px" : "0"
                                    }}
                                />

                                <span>{item.titulo}</span>
                                <strong>{formatarNumero(item.valor)}</strong>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="admin-panel admin-summary">
                    <div className="section-heading">
                        <div>
                            <h2>Resumo do sistema</h2>
                            <p>Indicadores gerais da plataforma.</p>
                        </div>
                    </div>

                    <div className="summary-item">
                        <span>Relatos pendentes</span>
                        <strong>
                            {formatarNumero(dados.indicadores.pendentes)}
                        </strong>
                    </div>

                    <div className="summary-item">
                        <span>Relatos aprovados</span>
                        <strong>
                            {formatarNumero(dados.indicadores.aprovados)}
                        </strong>
                    </div>

                    <div className="summary-item">
                        <span>Relatos rejeitados</span>
                        <strong>
                            {formatarNumero(dados.indicadores.rejeitados)}
                        </strong>
                    </div>

                    <div className="summary-item">
                        <span>Registros oficiais</span>
                        <strong>
                            {formatarNumero(
                                dados.indicadores.totalRegistrosOficiais
                            )}
                        </strong>
                    </div>
                </article>
            </section>

            <section className="admin-panel admin-recent">
                <div className="section-heading">
                    <div>
                        <h2>Relatos recentes</h2>
                        <p>Últimos relatos enviados à plataforma.</p>
                    </div>

                    <a href="/admin/relatos" className="admin-text-link">
                        Ver todos
                    </a>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Relato</th>
                                <th>Categoria</th>
                                <th>Localização</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {dados.recentes.length === 0 ? (
                                <tr>
                                    <td colSpan="4">
                                        Nenhum relato cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                dados.recentes.map((relato) => (
                                    <tr key={relato.id_relato}>
                                        <td>
                                            {relato.descricao.length > 65
                                                ? `${relato.descricao.slice(0, 65)}...`
                                                : relato.descricao}
                                        </td>

                                        <td>{relato.categoria}</td>
                                        <td>{relato.localizacao}</td>

                                        <td>
                                            <span
                                                className={`status-badge ${
                                                    relato.situacao === "Aprovado"
                                                        ? "status-resolved"
                                                        : relato.situacao === "Rejeitado"
                                                            ? "status-progress"
                                                            : "status-pending"
                                                }`}
                                            >
                                                {relato.situacao}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <footer className="admin-footer">
                AlertABC — Painel administrativo geral
            </footer>
        </div>
    );
}
