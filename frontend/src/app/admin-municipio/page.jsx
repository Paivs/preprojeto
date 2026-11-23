
"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function AdminMunicipioPage() {
    const [dashboard, setDashboard] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregarDashboard() {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    setErro("Sua sessão não foi encontrada. Entre novamente.");
                    return;
                }

                const resposta = await fetch(
                    `${API}/admin-municipal/relatos/dashboard`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const dados = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(dados.mensagem || "Não foi possível carregar o dashboard.");
                }

                setDashboard(dados);
            } catch (error) {
                setErro(error.message);
            } finally {
                setCarregando(false);
            }
        }

        carregarDashboard();
    }, []);

    const indicadores = dashboard?.indicadores || dashboard || {};
    const recentes = dashboard?.recentes || dashboard?.relatosRecentes || [];

    const total = Number(
        indicadores.totalRelatos ?? indicadores.total ?? 0
    );

    const pendentes = Number(indicadores.pendentes ?? 0);
    const aprovados = Number(indicadores.aprovados ?? 0);
    const rejeitados = Number(indicadores.rejeitados ?? 0);

    function formatarData(data) {
        if (!data) return "—";

        return new Date(data).toLocaleDateString("pt-BR");
    }

    function classeStatus(status) {
        const valor = String(status || "").toLowerCase();

        if (valor === "aprovado") return "is-approved";
        if (valor === "rejeitado") return "is-rejected";

        return "is-pending";
    }

    return (
        <div className="municipal-page">
            <div className="municipal-heading">
                <div>
                    <span className="admin-municipio-etiqueta">
                        PAINEL MUNICIPAL
                    </span>
                    <h1>Visão geral</h1>
                    <p>
                        Acompanhe os relatos enviados pelos cidadãos do seu município.
                    </p>
                </div>
            </div>

            {carregando && (
                <div className="municipal-notice">
                    Carregando informações do município...
                </div>
            )}

            {erro && (
                <div className="municipal-error-message">
                    {erro}
                </div>
            )}

            {!carregando && !erro && (
                <>
                    <section className="admin-municipio-indicadores">
                        <article className="admin-municipio-card">
                            <div className="admin-municipio-icone total">
                                <i className="bi bi-file-earmark-text" />
                            </div>
                            <div>
                                <span>Total de relatos</span>
                                <strong>{total}</strong>
                            </div>
                        </article>

                        <article className="admin-municipio-card">
                            <div className="admin-municipio-icone pendente">
                                <i className="bi bi-clock-history" />
                            </div>
                            <div>
                                <span>Pendentes</span>
                                <strong>{pendentes}</strong>
                            </div>
                        </article>

                        <article className="admin-municipio-card">
                            <div className="admin-municipio-icone aprovado">
                                <i className="bi bi-check-circle" />
                            </div>
                            <div>
                                <span>Aprovados</span>
                                <strong>{aprovados}</strong>
                            </div>
                        </article>

                        <article className="admin-municipio-card">
                            <div className="admin-municipio-icone rejeitado">
                                <i className="bi bi-x-circle" />
                            </div>
                            <div>
                                <span>Rejeitados</span>
                                <strong>{rejeitados}</strong>
                            </div>
                        </article>
                    </section>

                    <section className="municipal-panel">
                        <div className="municipal-panel-heading">
                            <div>
                                <h2>Relatos recentes</h2>
                                <p>Últimos relatos registrados no município.</p>
                            </div>

                            <a href="/admin-municipio/relatos">
                                Ver todos
                            </a>
                        </div>

                        {recentes.length === 0 ? (
                            <div className="municipal-empty">
                                <i className="bi bi-inbox" />
                                <p>Nenhum relato recente encontrado.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="municipal-table">
                                    <thead>
                                        <tr>
                                            <th>Descrição</th>
                                            <th>Categoria</th>
                                            <th>Data do fato</th>
                                            <th>Situação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentes.map((relato) => (
                                            <tr key={relato.id_relato}>
                                                <td>
                                                    {relato.descricao || "Sem descrição"}
                                                </td>
                                                <td>
                                                    {relato.categoria || relato.nome_categoria || "—"}
                                                </td>
                                                <td>
                                                    {formatarData(relato.data_fato)}
                                                </td>
                                                <td>
                                                    <span className={`municipal-status ${classeStatus(relato.situacao)}`}>
                                                        {relato.situacao || "Pendente"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
