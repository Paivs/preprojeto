
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "./relatos.css";

maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function obterEnderecoAPI() {
    if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL não foi configurada.");
    }

    const base = API_URL.replace(/\/+$/, "");

    return base.endsWith("/api") ? base : `${base}/api`;
}

const situacoes = {
    Pendente: "Pendente",
    Aprovado: "Aprovado",
    Rejeitado: "Rejeitado"
};

const estilosMapa = {
    claro: {
        nome: "Claro",
        url: "https://tiles.openfreemap.org/styles/bright"
    },
    escuro: {
        nome: "Escuro",
        url: "https://tiles.openfreemap.org/styles/dark"
    },
    liberty: {
        nome: "Liberty",
        url: "https://tiles.openfreemap.org/styles/liberty"
    },
    positron: {
        nome: "Positron",
        url: "https://tiles.openfreemap.org/styles/positron"
    }
};

function formatarData(data) {
    if (!data) return "Não informada";

    const valor = String(data).slice(0, 10);
    const [ano, mes, dia] = valor.split("-");

    return `${dia}/${mes}/${ano}`;
}

function formatarHora(hora) {
    if (!hora) return "Não informada";
    return String(hora).slice(0, 5);
}

function obterClasseSituacao(situacao) {
    if (situacao === "Aprovado") return "relato-aprovado";
    if (situacao === "Rejeitado") return "relato-rejeitado";
    return "relato-pendente";
}

function obterCorMarcador(situacao) {
    if (situacao === "Aprovado") return "#198754";
    if (situacao === "Rejeitado") return "#dc3545";
    return "#e6a23c";
}

export default function RelatosAdmin() {
    const [relatos, setRelatos] = useState([]);
    const [relatosMapa, setRelatosMapa] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [indicadores, setIndicadores] = useState({
        total: 0,
        pendentes: 0,
        aprovados: 0,
        rejeitados: 0
    });

    const [paginacao, setPaginacao] = useState({
        pagina: 1,
        limite: 10,
        total: 0,
        totalPaginas: 0
    });

    const [pagina, setPagina] = useState(1);
    const [busca, setBusca] = useState("");
    const [buscaAplicada, setBuscaAplicada] = useState("");
    const [situacao, setSituacao] = useState("");
    const [categoria, setCategoria] = useState("");

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [relatoSelecionado, setRelatoSelecionado] = useState(null);

    const mapaContainerRef = useRef(null);
    const mapaRef = useRef(null);
    const marcadoresRef = useRef([]);

    const [mapaPronto, setMapaPronto] = useState(false);
    const [erroMapa, setErroMapa] = useState("");
    const [estiloMapa, setEstiloMapa] = useState("positron");

    const carregarRelatos = useCallback(async () => {
        try {
            setCarregando(true);
            setErro("");

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Faça login para acessar esta página.");
            }

            const parametros = new URLSearchParams({
                pagina: String(pagina),
                limite: "10"
            });

            if (buscaAplicada) {
                parametros.set("busca", buscaAplicada);
            }

            if (situacao) {
                parametros.set("situacao", situacao);
            }

            if (categoria) {
                parametros.set("categoria", categoria);
            }

            const headers = {
                Authorization: `Bearer ${token}`
            };

            const base = obterEnderecoAPI();

            const [respostaLista, respostaMapa] = await Promise.all([
                fetch(
                    `${base}/admin-geral/relatos?${parametros}`,
                    { headers }
                ),
                fetch(
                    `${base}/admin-geral/relatos/mapa?${new URLSearchParams({
                        ...(buscaAplicada ? { busca: buscaAplicada } : {}),
                        ...(situacao ? { situacao } : {}),
                        ...(categoria ? { categoria } : {})
                    })}`,
                    { headers }
                )
            ]);

            const dadosLista = await respostaLista.json();
            const dadosMapa = await respostaMapa.json();

            if (!respostaLista.ok) {
                throw new Error(
                    dadosLista.mensagem || "Não foi possível carregar os relatos."
                );
            }

            if (!respostaMapa.ok) {
                throw new Error(
                    dadosMapa.mensagem || "Não foi possível carregar o mapa."
                );
            }

            setRelatos(dadosLista.relatos || []);
            setRelatosMapa(dadosMapa.relatos || []);
            setCategorias(dadosLista.categorias || []);

            setIndicadores(dadosLista.indicadores || {
                total: 0,
                pendentes: 0,
                aprovados: 0,
                rejeitados: 0
            });

            setPaginacao(dadosLista.paginacao || {
                pagina: 1,
                limite: 10,
                total: 0,
                totalPaginas: 0
            });

        } catch (error) {
            setErro(error.message);
        } finally {
            setCarregando(false);
        }
    }, [pagina, buscaAplicada, situacao, categoria]);

    useEffect(() => {
        carregarRelatos();
    }, [carregarRelatos]);

    // Troca de estilo do mapa
    function alterarEstiloMapa(event) {
        const novoEstilo = event.target.value;
        const mapa = mapaRef.current;

        if (!estilosMapa[novoEstilo] || !mapa) {
            return;
        }

        setEstiloMapa(novoEstilo);

        mapa.setStyle(estilosMapa[novoEstilo].url);
    }

    // Inicialização do mapa
    useEffect(() => {
        if (!mapaContainerRef.current || mapaRef.current) {
            return;
        }

        const mapa = new maplibregl.Map({
            container: mapaContainerRef.current,
            style: estilosMapa.positron.url,
            center: [-46.5383, -23.6639],
            zoom: 11,
            attributionControl: true
        });

        mapaRef.current = mapa;

        mapa.addControl(
            new maplibregl.NavigationControl(),
            "top-right"
        );

        mapa.on("load", () => {
            setMapaPronto(true);
            setErroMapa("");
        });

        mapa.on("error", (event) => {
            console.error("Erro detalhado do MapLibre:", event.error || event);
            setErroMapa("Não foi possível carregar o mapa. Verifique sua conexão.");
        });

        return () => {
            marcadoresRef.current.forEach((marcador) => marcador.remove());
            marcadoresRef.current = [];

            mapa.remove();
            mapaRef.current = null;
            setMapaPronto(false);
        };
    }, []);

    // Atualização dos marcadores quando os filtros ou estilo mudarem
    useEffect(() => {
        const mapa = mapaRef.current;

        if (!mapa || !mapaPronto || !mapa.isStyleLoaded()) {
            return;
        }

        marcadoresRef.current.forEach((marcador) => marcador.remove());
        marcadoresRef.current = [];

        const bounds = new maplibregl.LngLatBounds();
        let quantidadeValida = 0;

        relatosMapa.forEach((relato) => {
            const latitude = Number(relato.latitude);
            const longitude = Number(relato.longitude);

            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude) ||
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180
            ) {
                return;
            }

            const elemento = document.createElement("div");

            elemento.className = "relato-mapa-marcador";
            elemento.style.backgroundColor = obterCorMarcador(relato.situacao);
            elemento.title = `Relato #${relato.id_relato}`;

            const conteudoPopup = document.createElement("div");
            conteudoPopup.className = "relato-popup";

            const titulo = document.createElement("strong");
            titulo.textContent = `Relato #${relato.id_relato}`;

            const categoriaPopup = document.createElement("p");
            categoriaPopup.textContent = relato.categoria || "Sem categoria";

            const municipioPopup = document.createElement("p");
            municipioPopup.textContent = relato.municipio || "Município não informado";

            const situacaoPopup = document.createElement("span");
            situacaoPopup.textContent = relato.situacao;
            situacaoPopup.className = obterClasseSituacao(relato.situacao);

            const botao = document.createElement("button");
            botao.type = "button";
            botao.textContent = "Ver detalhes";

            botao.addEventListener("click", () => {
                setRelatoSelecionado(relato);
            });

            conteudoPopup.append(
                titulo,
                categoriaPopup,
                municipioPopup,
                situacaoPopup,
                botao
            );

            const popup = new maplibregl.Popup({
                offset: 18,
                maxWidth: "270px"
            }).setDOMContent(conteudoPopup);

            const marcador = new maplibregl.Marker({
                element: elemento,
                anchor: "bottom"
            })
                .setLngLat([longitude, latitude])
                .setPopup(popup)
                .addTo(mapa);

            marcadoresRef.current.push(marcador);

            bounds.extend([longitude, latitude]);
            quantidadeValida += 1;
        });

        if (quantidadeValida > 0) {
            mapa.fitBounds(bounds, {
                padding: 65,
                maxZoom: 14,
                duration: 700
            });
        }
    }, [relatosMapa, mapaPronto, estiloMapa]);

    function pesquisar(event) {
        event.preventDefault();
        setPagina(1);
        setBuscaAplicada(busca.trim());
    }

    function limparFiltros() {
        setBusca("");
        setBuscaAplicada("");
        setSituacao("");
        setCategoria("");
        setPagina(1);
    }

    function formatarSituacao(valor) {
        return situacoes[valor] || valor;
    }

    return (
        <div className="admin-content relatos-content">

            <header className="admin-header">
                <div>
                    <span className="admin-eyebrow">ADMINISTRAÇÃO</span>
                    <h1>Gerenciamento de relatos</h1>
                    <p>
                        Consulte e visualize os relatos enviados pelos cidadãos.
                    </p>
                </div>

                <button
                    className="relatos-refresh"
                    onClick={carregarRelatos}
                    disabled={carregando}
                >
                    ↻ Atualizar
                </button>
            </header>

            {/* Indicadores */}
            <section className="relatos-indicadores">
                <article className="relato-indicador">
                    <span>Total de relatos</span>
                    <strong>{indicadores.total}</strong>
                    <small>Registros cadastrados</small>
                </article>

                <article className="relato-indicador indicador-pendente">
                    <span>Pendentes</span>
                    <strong>{indicadores.pendentes}</strong>
                    <small>Aguardando análise</small>
                </article>

                <article className="relato-indicador indicador-aprovado">
                    <span>Aprovados</span>
                    <strong>{indicadores.aprovados}</strong>
                    <small>Relatos aprovados</small>
                </article>

                <article className="relato-indicador indicador-rejeitado">
                    <span>Rejeitados</span>
                    <strong>{indicadores.rejeitados}</strong>
                    <small>Relatos rejeitados</small>
                </article>
            </section>

            {/* Mapa */}
            <section className="relatos-mapa-panel">
                <div className="relatos-section-heading">
                    <div>
                        <h2>Mapa de relatos</h2>
                        <p>
                            Localização dos relatos cadastrados na plataforma.
                        </p>
                    </div>

                    <span className="relatos-mapa-total">
                        {relatosMapa.length} localização(ões)
                    </span>
                </div>

                <div className="relatos-legenda">
                    <span>
                        <i className="legenda-pendente" />
                        Pendentes
                    </span>

                    <span>
                        <i className="legenda-aprovado" />
                        Aprovados
                    </span>

                    <span>
                        <i className="legenda-rejeitado" />
                        Rejeitados
                    </span>
                </div>

                {/* Seletor de estilo */}
                <div className="relatos-mapa-estilo">
                    <label htmlFor="relatos-estilo-mapa">
                        Estilo do mapa
                    </label>

                    <select
                        id="relatos-estilo-mapa"
                        value={estiloMapa}
                        onChange={alterarEstiloMapa}
                        disabled={!mapaPronto}
                    >
                        <option value="claro">Claro</option>
                        <option value="escuro">Escuro</option>
                        <option value="liberty">Liberty</option>
                        <option value="positron">Positron</option>
                    </select>
                </div>

                <div className="relatos-mapa-container">
                    <div
                        ref={mapaContainerRef}
                        className="relatos-mapa"
                    />

                    {!mapaPronto && !erroMapa && (
                        <div className="relatos-mapa-mensagem">
                            <div className="relatos-spinner" />
                            <p>Carregando mapa...</p>
                        </div>
                    )}

                    {erroMapa && (
                        <div className="relatos-mapa-mensagem relatos-mapa-erro">
                            <p>{erroMapa}</p>
                            <button onClick={() => window.location.reload()}>
                                Recarregar página
                            </button>
                        </div>
                    )}

                    {mapaPronto && relatosMapa.length === 0 && (
                        <div className="relatos-mapa-vazio">
                            Nenhum relato com localização foi encontrado para os filtros selecionados.
                        </div>
                    )}
                </div>

                <p className="relatos-mapa-observacao">
                    Os marcadores representam os relatos com coordenadas válidas
                    cadastrados no banco de dados.
                </p>
            </section>

            {/* Listagem */}
            <section className="relatos-lista-panel">

                <div className="relatos-section-heading">
                    <div>
                        <h2>Relatos cadastrados</h2>
                        <p>
                            Pesquise, filtre e consulte os registros enviados.
                        </p>
                    </div>
                </div>

                <form
                    className="relatos-filtros"
                    onSubmit={pesquisar}
                >
                    <input
                        type="search"
                        placeholder="Buscar descrição, categoria ou município..."
                        value={busca}
                        onChange={(event) => setBusca(event.target.value)}
                    />

                    <select
                        value={situacao}
                        onChange={(event) => {
                            setSituacao(event.target.value);
                            setPagina(1);
                        }}
                        aria-label="Filtrar por situação"
                    >
                        <option value="">Todas as situações</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Rejeitado">Rejeitado</option>
                    </select>

                    <select
                        value={categoria}
                        onChange={(event) => {
                            setCategoria(event.target.value);
                            setPagina(1);
                        }}
                        aria-label="Filtrar por categoria"
                    >
                        <option value="">Todas as categorias</option>

                        {categorias.map((item) => (
                            <option
                                key={item.id_categoria}
                                value={item.id_categoria}
                            >
                                {item.nome}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="relatos-search-button"
                    >
                        Pesquisar
                    </button>

                    <button
                        type="button"
                        className="relatos-clear-button"
                        onClick={limparFiltros}
                    >
                        Limpar
                    </button>
                </form>

                {erro && (
                    <div className="relatos-error">
                        <strong>Não foi possível carregar os relatos.</strong>
                        <p>{erro}</p>

                        <button onClick={carregarRelatos}>
                            Tentar novamente
                        </button>
                    </div>
                )}

                {carregando ? (
                    <div className="relatos-loading">
                        <div className="relatos-spinner" />
                        <p>Carregando relatos...</p>
                    </div>
                ) : !erro && (
                    <>
                        <div className="relatos-table-wrapper">
                            <table className="relatos-table">
                                <thead>
                                    <tr>
                                        <th>Relato</th>
                                        <th>Categoria</th>
                                        <th>Município</th>
                                        <th>Data do fato</th>
                                        <th>Situação</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {relatos.length === 0 ? (
                                        <tr>
                                            <td colSpan="6">
                                                Nenhum relato encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        relatos.map((relato) => (
                                            <tr key={relato.id_relato}>
                                                <td>
                                                    <strong>
                                                        #{relato.id_relato}
                                                    </strong>

                                                    <p className="relato-descricao-resumo">
                                                        {relato.descricao}
                                                    </p>
                                                </td>

                                                <td>{relato.categoria}</td>

                                                <td>{relato.municipio}</td>

                                                <td>
                                                    {formatarData(relato.data_fato)}
                                                </td>

                                                <td>
                                                    <span className={`relato-status ${obterClasseSituacao(relato.situacao)}`}>
                                                        {formatarSituacao(relato.situacao)}
                                                    </span>
                                                </td>

                                                <td>
                                                    <button
                                                        className="relato-visualizar-button"
                                                        onClick={() => setRelatoSelecionado(relato)}
                                                    >
                                                        Visualizar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="relatos-pagination">
                            <span>
                                Página {pagina} de {Math.max(1, paginacao.totalPaginas)}
                                {" · "}
                                {paginacao.total} relato(s)
                            </span>

                            <div>
                                <button
                                    disabled={pagina <= 1}
                                    onClick={() => setPagina((atual) => atual - 1)}
                                >
                                    Anterior
                                </button>

                                <button
                                    disabled={
                                        pagina >= paginacao.totalPaginas ||
                                        paginacao.totalPaginas === 0
                                    }
                                    onClick={() => setPagina((atual) => atual + 1)}
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {/* Modal de detalhes */}
            {relatoSelecionado && (
                <div
                    className="relato-modal-overlay"
                    onClick={() => setRelatoSelecionado(null)}
                >
                    <section
                        className="relato-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="relato-modal-close"
                            onClick={() => setRelatoSelecionado(null)}
                            aria-label="Fechar"
                        >
                            ×
                        </button>

                        <span className="admin-eyebrow">
                            DETALHES DO RELATO
                        </span>

                        <h2>Relato #{relatoSelecionado.id_relato}</h2>

                        <span className={`relato-status ${obterClasseSituacao(relatoSelecionado.situacao)}`}>
                            {formatarSituacao(relatoSelecionado.situacao)}
                        </span>

                        <div className="relato-modal-info">
                            <div>
                                <span>Categoria</span>
                                <strong>{relatoSelecionado.categoria}</strong>
                            </div>

                            <div>
                                <span>Município</span>
                                <strong>{relatoSelecionado.municipio}</strong>
                            </div>

                            <div>
                                <span>Data do fato</span>
                                <strong>{formatarData(relatoSelecionado.data_fato)}</strong>
                            </div>

                            <div>
                                <span>Horário do fato</span>
                                <strong>{formatarHora(relatoSelecionado.hora_fato)}</strong>
                            </div>

                            <div>
                                <span>Referência local</span>
                                <strong>
                                    {relatoSelecionado.referencia_local || "Não informada"}
                                </strong>
                            </div>

                            <div>
                                <span>Enviado em</span>
                                <strong>
                                    {relatoSelecionado.enviado_em
                                        ? new Date(relatoSelecionado.enviado_em).toLocaleString("pt-BR")
                                        : "Não informado"}
                                </strong>
                            </div>

                            <div className="relato-modal-descricao">
                                <span>Descrição</span>
                                <p>{relatoSelecionado.descricao}</p>
                            </div>

                            <div>
                                <span>Latitude</span>
                                <strong>{relatoSelecionado.latitude}</strong>
                            </div>

                            <div>
                                <span>Longitude</span>
                                <strong>{relatoSelecionado.longitude}</strong>
                            </div>
                        </div>

                        <button
                            className="relato-modal-button"
                            onClick={() => setRelatoSelecionado(null)}
                        >
                            Fechar detalhes
                        </button>
                    </section>
                </div>
            )}

            <footer className="admin-footer">
                AlertABC — Painel administrativo geral
            </footer>
        </div>
    );
}
