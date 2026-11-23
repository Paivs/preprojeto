"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");


const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api")
    .replace(/\/+$/, "");

const ESTILOS_MAPA = {
    claro: "https://tiles.openfreemap.org/styles/bright",
    escuro: "https://tiles.openfreemap.org/styles/dark",
    liberty: "https://tiles.openfreemap.org/styles/liberty",
    positron: "https://tiles.openfreemap.org/styles/positron"
};

function formatarData(data) {
    if (!data) return "—";
    const valor = String(data).slice(0, 10);
    const [ano, mes, dia] = valor.split("-");
    if (!ano || !mes || !dia) return "—";
    return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(data) {
    if (!data) return "Não informada";
    const valor = new Date(data);
    if (Number.isNaN(valor.getTime())) return "Não informada";
    return valor.toLocaleString("pt-BR");
}

function formatarHora(hora) {
    return hora ? String(hora).slice(0, 5) : "—";
}

function classeStatus(status) {
    if (status === "Aprovado") return "is-approved";
    if (status === "Rejeitado") return "is-rejected";
    return "is-pending";
}

function corMarcador(status) {
    if (status === "Aprovado") return "#198754";
    if (status === "Rejeitado") return "#DC3545";
    return "#E6A23C";
}

function obterObservacaoDecisao(detalhes) {
    if (!detalhes) return "";

    try {
        const dados = typeof detalhes === "string"
            ? JSON.parse(detalhes)
            : detalhes;
        return dados.observacao || "";
    } catch {
        return String(detalhes);
    }
}

function correspondeFiltros(relato, filtros) {
    const texto = [
        relato.id_relato,
        relato.descricao,
        relato.categoria,
        relato.referencia_local,
        relato.municipio
    ].filter(Boolean).join(" ").toLowerCase();

    const termo = filtros.busca.trim().toLowerCase();
    const dataFato = relato.data_fato
        ? String(relato.data_fato).slice(0, 10)
        : "";

    return (
        (!termo || texto.includes(termo)) &&
        (filtros.situacao === "Todos" || relato.situacao === filtros.situacao) &&
        (filtros.categoria === "Todas" || relato.categoria === filtros.categoria) &&
        (!filtros.dataInicio || (dataFato && dataFato >= filtros.dataInicio)) &&
        (!filtros.dataFim || (dataFato && dataFato <= filtros.dataFim))
    );
}

export default function RelatosMunicipaisPage() {
    const [relatos, setRelatos] = useState([]);
    const [relatosMapa, setRelatosMapa] = useState([]);
    const [indicadores, setIndicadores] = useState({
        total: 0,
        pendentes: 0,
        aprovados: 0,
        rejeitados: 0,
        mediaTempoRespostaMinutos: null
    });

    const [busca, setBusca] = useState("");
    const [situacao, setSituacao] = useState("Todos");
    const [categoria, setCategoria] = useState("Todas");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [pagina, setPagina] = useState(1);

    const [relatoSelecionado, setRelatoSelecionado] = useState(null);
    const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [processando, setProcessando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    const [estiloMapa, setEstiloMapa] = useState("positron");
    const [mapaPronto, setMapaPronto] = useState(false);
    const [erroMapa, setErroMapa] = useState("");
    const mapaContainerRef = useRef(null);
    const mapaRef = useRef(null);
    const marcadoresRef = useRef([]);

    const obterToken = useCallback(() => {
        return localStorage.getItem("token");
    }, []);

    const carregarRelatos = useCallback(async () => {
        try {
            setCarregando(true);
            setErro("");

            const token = obterToken();
            if (!token) throw new Error("Sessão expirada. Entre novamente.");

            const headers = { Authorization: `Bearer ${token}` };
            const [respostaLista, respostaMapa, respostaDashboard] = await Promise.all([
                fetch(`${API}/admin-municipal/relatos?page=1&limit=100`, { headers }),
                fetch(`${API}/admin-municipal/relatos/mapa`, { headers }),
                fetch(`${API}/admin-municipal/relatos/dashboard`, { headers })
            ]);

            const [dadosLista, dadosMapa, dadosDashboard] = await Promise.all([
                respostaLista.json(),
                respostaMapa.json(),
                respostaDashboard.json()
            ]);

            if (!respostaLista.ok) {
                throw new Error(dadosLista.mensagem || "Erro ao consultar os relatos.");
            }
            if (!respostaMapa.ok) {
                throw new Error(dadosMapa.mensagem || "Erro ao carregar o mapa municipal.");
            }
            if (!respostaDashboard.ok) {
                throw new Error(dadosDashboard.mensagem || "Erro ao carregar os indicadores.");
            }

            setRelatos(dadosLista.relatos || []);
            setRelatosMapa(dadosMapa.relatos || []);
            setIndicadores(dadosDashboard);
        } catch (error) {
            setErro(error.message || "Não foi possível carregar os dados.");
        } finally {
            setCarregando(false);
        }
    }, [obterToken]);

    useEffect(() => {
        carregarRelatos();
    }, [carregarRelatos]);

    const categorias = useMemo(() => {
        return [...new Set(relatos.map((relato) => relato.categoria).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, "pt-BR"));
    }, [relatos]);

    const filtros = useMemo(() => ({
        busca,
        situacao,
        categoria,
        dataInicio,
        dataFim
    }), [busca, situacao, categoria, dataInicio, dataFim]);

    const relatosFiltrados = useMemo(() => {
        return relatos.filter((relato) => correspondeFiltros(relato, filtros));
    }, [relatos, filtros]);

    const relatosMapaFiltrados = useMemo(() => {
        return relatosMapa.filter((relato) => correspondeFiltros(relato, filtros));
    }, [relatosMapa, filtros]);

    const ITENS_POR_PAGINA = 8;
    const totalPaginas = Math.max(1, Math.ceil(relatosFiltrados.length / ITENS_POR_PAGINA));
    const relatosPaginados = relatosFiltrados.slice(
        (pagina - 1) * ITENS_POR_PAGINA,
        pagina * ITENS_POR_PAGINA
    );

    useEffect(() => {
        setPagina(1);
    }, [busca, situacao, categoria, dataInicio, dataFim]);

    useEffect(() => {
        if (pagina > totalPaginas) setPagina(totalPaginas);
    }, [pagina, totalPaginas]);

    const abrirDetalhes = useCallback(async (id) => {
        try {
            setCarregandoDetalhes(true);
            setErro("");

            const resposta = await fetch(`${API}/admin-municipal/relatos/${id}`, {
                headers: { Authorization: `Bearer ${obterToken()}` }
            });
            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.mensagem || "Não foi possível consultar o relato.");
            }

            setRelatoSelecionado({
                ...dados.relato,
                decisao: dados.decisao || null,
                anexos: dados.anexos || []
            });
        } catch (error) {
            setErro(error.message);
        } finally {
            setCarregandoDetalhes(false);
        }
    }, [obterToken]);

    async function atualizarSituacao(id, acao) {
        const aprovando = acao === "aprovar";
        let motivo = "";

        if (aprovando) {
            if (!window.confirm("Deseja realmente aprovar este relato?")) return;
        } else {
            motivo = window.prompt("Informe o motivo da rejeição (mínimo de 3 caracteres):");
            if (motivo === null) return;
            if (motivo.trim().length < 3) {
                setErro("O motivo da rejeição precisa ter pelo menos 3 caracteres.");
                return;
            }
        }

        try {
            setProcessando(true);
            setErro("");
            setMensagem("");

            const resposta = await fetch(`${API}/admin-municipal/relatos/${id}/${acao}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${obterToken()}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(aprovando ? {} : { motivo_rejeicao: motivo.trim() })
            });
            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.mensagem || "Não foi possível atualizar o relato.");
            }

            setMensagem(aprovando
                ? "Relato aprovado e decisão registrada."
                : "Relato rejeitado e motivo registrado.");
            setRelatoSelecionado(null);
            await carregarRelatos();
        } catch (error) {
            setErro(error.message);
        } finally {
            setProcessando(false);
        }
    }

    function limparFiltros() {
        setBusca("");
        setSituacao("Todos");
        setCategoria("Todas");
        setDataInicio("");
        setDataFim("");
        setPagina(1);
    }

    function alterarEstiloMapa(event) {
        const novoEstilo = event.target.value;
        if (!ESTILOS_MAPA[novoEstilo]) return;
        setEstiloMapa(novoEstilo);
        if (mapaRef.current) mapaRef.current.setStyle(ESTILOS_MAPA[novoEstilo]);
    }

    // Inicializa o mapa interativo no padrão utilizado pelo Admin Geral.
    useEffect(() => {
        if (!mapaContainerRef.current || mapaRef.current) return;

        const mapa = new maplibregl.Map({
            container: mapaContainerRef.current,
            style: ESTILOS_MAPA.positron,
            center: [-46.5383, -23.6639],
            zoom: 11,
            attributionControl: true
        });

        mapaRef.current = mapa;
        mapa.addControl(new maplibregl.NavigationControl(), "top-right");

        mapa.on("load", () => {
            setMapaPronto(true);
            setErroMapa("");
        });

        mapa.on("error", (event) => {
            console.error("Erro do mapa municipal:", event.error || event);
        });

        return () => {
            marcadoresRef.current.forEach((marcador) => marcador.remove());
            marcadoresRef.current = [];
            mapa.remove();
            mapaRef.current = null;
        };
    }, []);

    // Os relatos recebidos por esta página já vêm limitados ao município no backend.
    useEffect(() => {
        const mapa = mapaRef.current;
        if (!mapa || !mapaPronto) return;

        marcadoresRef.current.forEach((marcador) => marcador.remove());
        marcadoresRef.current = [];

        const bounds = new maplibregl.LngLatBounds();
        let quantidadeValida = 0;

        relatosMapaFiltrados.forEach((relato) => {
            const latitude = Number(relato.latitude);
            const longitude = Number(relato.longitude);

            if (
                !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
                latitude < -90 || latitude > 90 ||
                longitude < -180 || longitude > 180
            ) return;

            const elemento = document.createElement("div");
            elemento.className = "municipal-map-marker";
            elemento.style.backgroundColor = corMarcador(relato.situacao);
            elemento.title = `Relato #${relato.id_relato}`;

            const popupConteudo = document.createElement("div");
            popupConteudo.className = "municipal-map-popup";

            const titulo = document.createElement("strong");
            titulo.textContent = `Relato #${relato.id_relato}`;

            const categoriaPopup = document.createElement("p");
            categoriaPopup.textContent = relato.categoria || "Sem categoria";

            const localPopup = document.createElement("p");
            localPopup.textContent = relato.referencia_local || relato.municipio || "Local não informado";

            const statusPopup = document.createElement("span");
            statusPopup.textContent = relato.situacao || "Pendente";
            statusPopup.className = `municipal-status ${classeStatus(relato.situacao)}`;

            const botao = document.createElement("button");
            botao.type = "button";
            botao.textContent = "Ver detalhes";
            botao.addEventListener("click", () => abrirDetalhes(relato.id_relato));

            popupConteudo.append(titulo, categoriaPopup, localPopup, statusPopup, botao);

            const popup = new maplibregl.Popup({ offset: 18, maxWidth: "270px" })
                .setDOMContent(popupConteudo);

            const marcador = new maplibregl.Marker({ element: elemento, anchor: "bottom" })
                .setLngLat([longitude, latitude])
                .setPopup(popup)
                .addTo(mapa);

            marcadoresRef.current.push(marcador);
            bounds.extend([longitude, latitude]);
            quantidadeValida += 1;
        });

        if (quantidadeValida > 0) {
            mapa.fitBounds(bounds, {
                padding: 60,
                maxZoom: 14,
                duration: 600
            });
        }
    }, [relatosMapaFiltrados, mapaPronto, abrirDetalhes]);

    return (
        <div className="municipal-page">
            <div className="municipal-heading">
                <div>
                    <span className="admin-municipio-etiqueta">MODERAÇÃO MUNICIPAL</span>
                    <h1>Gerenciamento de relatos</h1>
                    <p>Consulte, analise e avalie os relatos enviados pelos cidadãos do seu município.</p>
                </div>

                <button
                    type="button"
                    className="municipal-refresh"
                    onClick={carregarRelatos}
                    disabled={carregando || processando}
                >
                    <i className="bi bi-arrow-clockwise" /> Atualizar
                </button>
            </div>

            {erro && (
                <div className="municipal-error-message" role="alert">
                    <i className="bi bi-exclamation-circle" /> {erro}
                </div>
            )}

            {mensagem && (
                <div className="municipal-notice" role="status">
                    <i className="bi bi-check-circle" /> {mensagem}
                </div>
            )}

            <section className="admin-municipio-indicadores">
                <article className="admin-municipio-card">
                    <div className="admin-municipio-icone total"><i className="bi bi-file-earmark-text" /></div>
                    <div><span>Total de relatos</span><strong>{indicadores.total}</strong></div>
                </article>
                <article className="admin-municipio-card">
                    <div className="admin-municipio-icone pendente"><i className="bi bi-clock-history" /></div>
                    <div><span>Pendentes</span><strong>{indicadores.pendentes}</strong></div>
                </article>
                <article className="admin-municipio-card">
                    <div className="admin-municipio-icone aprovado"><i className="bi bi-check-circle" /></div>
                    <div><span>Aprovados</span><strong>{indicadores.aprovados}</strong></div>
                </article>
                <article className="admin-municipio-card">
                    <div className="admin-municipio-icone rejeitado"><i className="bi bi-x-circle" /></div>
                    <div><span>Rejeitados</span><strong>{indicadores.rejeitados}</strong></div>
                </article>
            </section>

            <section className="municipal-map-panel">
                <div className="municipal-map-heading">
                    <div>
                        <h2>Mapa de ocorrências do município</h2>
                        <p>Visualização dos relatos com coordenadas cadastrados no seu município.</p>
                    </div>
                    <span className="municipal-map-count">{relatosMapaFiltrados.length} localização(ões)</span>
                </div>

                <div className="municipal-map-legend">
                    <span><i className="legend-pending" /> Pendentes</span>
                    <span><i className="legend-approved" /> Aprovados</span>
                    <span><i className="legend-rejected" /> Rejeitados</span>
                </div>

                <div className="municipal-map-style">
                    <label htmlFor="municipal-map-style">Estilo do mapa</label>
                    <select id="municipal-map-style" value={estiloMapa} onChange={alterarEstiloMapa} disabled={!mapaPronto}>
                        <option value="claro">Claro</option>
                        <option value="escuro">Escuro</option>
                        <option value="liberty">Liberty</option>
                        <option value="positron">Positron</option>
                    </select>
                </div>

                <div className="municipal-map-container">
                    <div ref={mapaContainerRef} className="municipal-map-canvas" />
                    {!mapaPronto && !erroMapa && (
                        <div className="municipal-map-message"><span className="municipal-map-spinner" />Carregando mapa...</div>
                    )}
                    {erroMapa && <div className="municipal-map-message municipal-map-error">{erroMapa}</div>}
                    {mapaPronto && relatosMapaFiltrados.length === 0 && (
                        <div className="municipal-map-empty">Nenhum relato com localização foi encontrado para os filtros selecionados.</div>
                    )}
                </div>
                <p className="municipal-map-note">O mapa recebe somente relatos vinculados ao município da conta administradora. Os marcadores mostram a situação de cada relato.</p>
            </section>

            <section className="municipal-panel">
                <div className="municipal-panel-heading">
                    <div>
                        <h2>Relatos cadastrados</h2>
                        <p>{relatosFiltrados.length} resultado(s) encontrado(s).</p>
                    </div>
                </div>

                <div className="municipal-filters municipal-filters-expanded">
                    <div className="municipal-search">
                        <i className="bi bi-search" />
                        <input
                            type="search"
                            placeholder="Pesquisar descrição, local ou ID..."
                            value={busca}
                            onChange={(event) => setBusca(event.target.value)}
                        />
                    </div>

                    <select value={situacao} onChange={(event) => setSituacao(event.target.value)} aria-label="Filtrar por situação">
                        <option value="Todos">Todas as situações</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Rejeitado">Rejeitado</option>
                    </select>

                    <select value={categoria} onChange={(event) => setCategoria(event.target.value)} aria-label="Filtrar por categoria">
                        <option value="Todas">Todas as categorias</option>
                        {categorias.map((nome) => <option key={nome} value={nome}>{nome}</option>)}
                    </select>

                    <label className="municipal-date-filter">
                        <span>De</span>
                        <input type="date" value={dataInicio} onChange={(event) => setDataInicio(event.target.value)} />
                    </label>

                    <label className="municipal-date-filter">
                        <span>Até</span>
                        <input type="date" value={dataFim} onChange={(event) => setDataFim(event.target.value)} />
                    </label>

                    <button type="button" className="municipal-clear-button" onClick={limparFiltros}>Limpar filtros</button>
                </div>

                {carregando ? (
                    <div className="municipal-empty"><i className="bi bi-arrow-repeat" /><p>Carregando relatos do banco de dados...</p></div>
                ) : relatosPaginados.length === 0 ? (
                    <div className="municipal-empty"><i className="bi bi-inbox" /><p>Nenhum relato encontrado.</p></div>
                ) : (
                    <div className="table-responsive">
                        <table className="municipal-table">
                            <thead>
                                <tr><th>ID</th><th>Descrição</th><th>Categoria</th><th>Localização</th><th>Data</th><th>Situação</th><th>Ações</th></tr>
                            </thead>
                            <tbody>
                                {relatosPaginados.map((relato) => (
                                    <tr key={relato.id_relato}>
                                        <td>#{relato.id_relato}</td>
                                        <td className="municipal-description">
                                            {relato.descricao
                                                ? relato.descricao.length > 65 ? `${relato.descricao.substring(0, 65)}...` : relato.descricao
                                                : "Sem descrição"}
                                        </td>
                                        <td>{relato.categoria || "—"}</td>
                                        <td>{relato.referencia_local || "—"}</td>
                                        <td>{formatarData(relato.data_fato)}</td>
                                        <td><span className={`municipal-status ${classeStatus(relato.situacao)}`}>{relato.situacao || "Pendente"}</span></td>
                                        <td>
                                            <div className="municipal-actions">
                                                <button type="button" title="Visualizar detalhes" onClick={() => abrirDetalhes(relato.id_relato)}>
                                                    <i className="bi bi-eye" />
                                                </button>
                                                {relato.situacao === "Pendente" && <>
                                                    <button type="button" title="Aprovar" disabled={processando} onClick={() => atualizarSituacao(relato.id_relato, "aprovar")}>
                                                        <i className="bi bi-check-lg" />
                                                    </button>
                                                    <button type="button" title="Rejeitar" disabled={processando} onClick={() => atualizarSituacao(relato.id_relato, "rejeitar")}>
                                                        <i className="bi bi-x-lg" />
                                                    </button>
                                                </>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!carregando && relatosFiltrados.length > 0 && (
                    <div className="municipal-pagination">
                        <span>Página {pagina} de {totalPaginas} · {relatosFiltrados.length} relato(s)</span>
                        <div>
                            <button type="button" disabled={pagina === 1} onClick={() => setPagina((atual) => atual - 1)}>
                                <i className="bi bi-chevron-left" /> Anterior
                            </button>
                            <button type="button" disabled={pagina === totalPaginas} onClick={() => setPagina((atual) => atual + 1)}>
                                Próxima <i className="bi bi-chevron-right" />
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {relatoSelecionado && (
                <div className="municipal-modal-overlay" onClick={() => setRelatoSelecionado(null)}>
                    <section className="municipal-modal municipal-modal-wide" onClick={(event) => event.stopPropagation()}>
                        <div className="municipal-modal-heading">
                            <div>
                                <span className="admin-municipio-etiqueta">DETALHES DO RELATO</span>
                                <h2>Relato #{relatoSelecionado.id_relato}</h2>
                                <span className={`municipal-status ${classeStatus(relatoSelecionado.situacao)}`}>{relatoSelecionado.situacao}</span>
                            </div>
                            <button type="button" onClick={() => setRelatoSelecionado(null)} aria-label="Fechar">
                                <i className="bi bi-x-lg" />
                            </button>
                        </div>

                        <div className="municipal-modal-content">
                            <div className="municipal-modal-full">
                                <span>Descrição</span>
                                <p>{relatoSelecionado.descricao || "—"}</p>
                            </div>
                            <div><span>Categoria</span><p>{relatoSelecionado.categoria || "—"}</p></div>
                            <div><span>Município</span><p>{relatoSelecionado.municipio || "—"}</p></div>
                            <div><span>Data do fato</span><p>{formatarData(relatoSelecionado.data_fato)}</p></div>
                            <div><span>Horário do fato</span><p>{formatarHora(relatoSelecionado.hora_fato)}</p></div>
                            <div><span>Local de referência</span><p>{relatoSelecionado.referencia_local || "Não informado"}</p></div>
                            <div><span>Enviado em</span><p>{formatarDataHora(relatoSelecionado.enviado_em)}</p></div>
                            <div><span>Autor</span><p>{relatoSelecionado.nome_cidadao || "Não informado"}</p></div>
                            <div><span>E-mail do autor</span><p>{relatoSelecionado.email_cidadao || "Não informado"}</p></div>
                            <div><span>Latitude</span><p>{relatoSelecionado.latitude ?? "Não informada"}</p></div>
                            <div><span>Longitude</span><p>{relatoSelecionado.longitude ?? "Não informada"}</p></div>
                        </div>

                        <section className="municipal-decision-panel">
                            <div className="municipal-decision-heading">
                                <i className="bi bi-clipboard-check" />
                                <div><strong>Registro da análise</strong><span>Decisão administrativa vinculada a este relato</span></div>
                            </div>

                            {relatoSelecionado.decisao ? (
                                <div className="municipal-decision-content">
                                    <div><span>Resultado</span><p>{relatoSelecionado.decisao.resultado}</p></div>
                                    <div><span>Administrador responsável</span><p>{relatoSelecionado.decisao.administrador || "—"}</p></div>
                                    <div><span>Data da decisão</span><p>{formatarDataHora(relatoSelecionado.decisao.realizada_em)}</p></div>
                                    {relatoSelecionado.decisao.motivo_rejeicao && (
                                        <div className="municipal-decision-full">
                                            <span>Motivo da rejeição</span>
                                            <p>{relatoSelecionado.decisao.motivo_rejeicao}</p>
                                        </div>
                                    )}
                                    {obterObservacaoDecisao(relatoSelecionado.decisao.detalhes) && (
                                        <div className="municipal-decision-full">
                                            <span>Observação administrativa</span>
                                            <p>{obterObservacaoDecisao(relatoSelecionado.decisao.detalhes)}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="municipal-decision-empty">Ainda não existe uma decisão administrativa registrada para este relato.</p>
                            )}
                        </section>

                        {relatoSelecionado.situacao === "Pendente" && (
                            <div className="municipal-modal-actions">
                                <button type="button" disabled={processando} onClick={() => atualizarSituacao(relatoSelecionado.id_relato, "aprovar")}>
                                    <i className="bi bi-check-lg" /> Aprovar relato
                                </button>
                                <button type="button" disabled={processando} onClick={() => atualizarSituacao(relatoSelecionado.id_relato, "rejeitar")}>
                                    <i className="bi bi-x-lg" /> Rejeitar relato
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            )}

            {carregandoDetalhes && <div className="municipal-notice">Carregando detalhes do relato...</div>}
        </div>
    );
}
