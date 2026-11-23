
"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function BoletinsMunicipaisPage() {
    const [boletins, setBoletins] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregarBoletins() {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Sessão não encontrada. Entre novamente.");
                }

                const resposta = await fetch(
                    `${API}/admin-municipal/boletins`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (resposta.status === 404) {
                    setErro("A consulta de boletins ainda não está disponível no backend.");
                    return;
                }

                const dados = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(dados.mensagem || "Não foi possível carregar os dados.");
                }

                setBoletins(
                    Array.isArray(dados)
                        ? dados
                        : dados.boletins || dados.dados || []
                );
            } catch (error) {
                setErro(error.message);
            } finally {
                setCarregando(false);
            }
        }

        carregarBoletins();
    }, []);

    return (
        <div className="municipal-page">
            <div className="municipal-heading">
                <div>
                    <span className="admin-municipio-etiqueta">
                        CONSULTA
                    </span>
                    <h1>Boletins</h1>
                    <p>
                        Área de consulta de informações disponibilizadas ao município.
                    </p>
                </div>
            </div>

            <section className="municipal-panel">
                <div className="municipal-panel-heading">
                    <div>
                        <h2>Boletins disponíveis</h2>
                        <p>Consulta de registros vinculados ao município.</p>
                    </div>
                </div>

                <div className="municipal-notice">
                    <i className="bi bi-info-circle" />
                    O AlertABC está focado nos relatos não oficiais enviados por usuários.
                    Esta área não representa consulta ou emissão de boletins de ocorrência oficiais.
                </div>

                {carregando ? (
                    <div className="municipal-empty">
                        Consultando informações...
                    </div>
                ) : erro ? (
                    <div className="municipal-empty">
                        <i className="bi bi-database-exclamation" />
                        <p>{erro}</p>
                    </div>
                ) : boletins.length === 0 ? (
                    <div className="municipal-empty">
                        <i className="bi bi-inbox" />
                        <p>Nenhum registro disponível para consulta.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="municipal-table">
                            <thead>
                                <tr>
                                    <th>Identificação</th>
                                    <th>Descrição</th>
                                    <th>Data</th>
                                    <th>Situação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {boletins.map((item) => (
                                    <tr key={item.id || item.id_boletim}>
                                        <td>{item.identificacao || item.id || "—"}</td>
                                        <td>{item.descricao || "—"}</td>
                                        <td>
                                            {item.data
                                                ? new Date(item.data).toLocaleDateString("pt-BR")
                                                : "—"}
                                        </td>
                                        <td>{item.situacao || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
