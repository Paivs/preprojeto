
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function MeusRelatosPage() {
    const [relatos, setRelatos] = useState([]);
    const [filtro, setFiltro] = useState("Todos");
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        async function carregarRelatos() {
            const token = localStorage.getItem("token");

            if (!token) {
                window.location.href = "/login";
                return;
            }

            try {
                const resposta = await fetch(`${API}/usuario/relatos`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const dados = await resposta.json();

                if (resposta.status === 401 || resposta.status === 403) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("usuario");
                    window.location.href = "/login";
                    return;
                }

                if (!resposta.ok) {
                    throw new Error(
                        dados.mensagem || "Não foi possível carregar os relatos."
                    );
                }

                setRelatos(dados.relatos || []);
            } catch (erro) {
                setMensagem(
                    erro.message || "Erro ao consultar os relatos."
                );
            } finally {
                setCarregando(false);
            }
        }

        carregarRelatos();
    }, []);

    function formatarData(data) {
        if (!data) return "—";

        const dataConvertida = new Date(
            String(data).replace(" ", "T")
        );

        if (Number.isNaN(dataConvertida.getTime())) {
            return "—";
        }

        return dataConvertida.toLocaleDateString("pt-BR");
    }

    function classeStatus(status) {
        switch (status) {
            case "Aprovado":
                return "status-aprovado";
            case "Rejeitado":
                return "status-rejeitado";
            default:
                return "status-pendente";
        }
    }

    const relatosFiltrados =
        filtro === "Todos"
            ? relatos
            : relatos.filter((relato) => relato.situacao === filtro);

    return (
        <div className="user-page">
            <div className="user-page-heading">
                <div>
                    <span>ACOMPANHAMENTO</span>
                    <h1>Meus relatos</h1>
                    <p>
                        Consulte os relatos de possíveis ocorrências
                        que você registrou na plataforma.
                    </p>
                </div>

                <Link
                    href="/usuarios/novo-relato"
                    className="user-btn-primary"
                >
                    <i className="bi bi-plus-lg"></i>
                    Novo relato
                </Link>
            </div>

            <section className="user-panel">
                <div className="user-panel-header">
                    <div>
                        <h2>Histórico de relatos</h2>
                        <p>
                            Consulte a situação dos seus registros.
                        </p>
                    </div>

                    <select
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className="user-filter"
                        aria-label="Filtrar relatos por status"
                    >
                        <option value="Todos">Todos os status</option>
                        <option value="Pendente">Pendentes</option>
                        <option value="Aprovado">Aprovados</option>
                        <option value="Rejeitado">Rejeitados</option>
                    </select>
                </div>

                {carregando ? (
                    <div className="user-empty-state">
                        Carregando seus relatos...
                    </div>
                ) : mensagem ? (
                    <div className="user-alert user-alert-error" role="alert">
                        <i className="bi bi-exclamation-circle"></i>
                        <p>{mensagem}</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Categoria</th>
                                    <th>Localidade</th>
                                    <th>Data do envio</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {relatosFiltrados.length > 0 ? (
                                    relatosFiltrados.map((relato) => (
                                        <tr key={relato.id_relato}>
                                            <td>
                                                #{String(relato.id_relato).padStart(3, "0")}
                                            </td>
                                            <td>{relato.categoria}</td>
                                            <td>
                                                {relato.referencia_local || "Não informado"}
                                            </td>
                                            <td>{formatarData(relato.enviado_em)}</td>
                                            <td>
                                                <span
                                                    className={`user-status ${classeStatus(relato.situacao)}`}
                                                >
                                                    {relato.situacao}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">
                                            {relatos.length === 0
                                                ? "Você ainda não possui relatos cadastrados."
                                                : "Nenhum relato encontrado para esse filtro."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <div className="user-alert">
                <i className="bi bi-shield-check"></i>
                <div>
                    <strong>Transparência e responsabilidade</strong>
                    <p>
                        O status indica a situação do registro dentro
                        da plataforma. Ele não representa uma conclusão
                        sobre a ocorrência relatada.
                    </p>
                </div>
            </div>
        </div>
    );
}
