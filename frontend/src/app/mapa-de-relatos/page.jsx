"use client";

import { useEffect, useRef, useState } from "react";

import {
    Map as MapLibre,
    NavigationControl,
    Marker,
    Popup,
    LngLatBounds,
    setWorkerUrl,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";
import "./mapa-de-relatos.css";

setWorkerUrl(
    new URL(
        "maplibre-gl/dist/maplibre-gl-worker.mjs",
        import.meta.url
    ).toString()
);

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function MapaDeRelatos() {
    const mapaRef = useRef(null);
    const instanciaMapaRef = useRef(null);
    const marcadoresRef = useRef([]);
    const popupRef = useRef(null);

    const [mapaPronto, setMapaPronto] = useState(false);

    const [relatos, setRelatos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [pesquisa, setPesquisa] = useState("");
    const [categoria, setCategoria] = useState("");
    const [municipio, setMunicipio] = useState("");

    const [pagina, setPagina] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);

    const [categorias, setCategorias] = useState([]);
    const [municipios, setMunicipios] = useState([]);

    const limite = 12;

    // Inicialização do mapa
    useEffect(() => {
        if (!mapaRef.current || instanciaMapaRef.current) {
            return;
        }

        const mapa = new MapLibre({
            container: mapaRef.current,
            style: "https://tiles.openfreemap.org/styles/liberty",
            center: [-46.53, -23.67],
            zoom: 9,
        });

        mapa.addControl(
            new NavigationControl(),
            "top-right"
        );

        mapa.on("error", (evento) => {
            console.error("Erro no MapLibre:", evento.error);
        });

        mapa.once("load", () => {
            setMapaPronto(true);
        });

        instanciaMapaRef.current = mapa;

        return () => {
            marcadoresRef.current.forEach((marcador) => {
                marcador.remove();
            });

            marcadoresRef.current = [];

            popupRef.current?.remove();
            popupRef.current = null;

            mapa.remove();
            instanciaMapaRef.current = null;
        };
    }, []);

    // Busca dos relatos públicos
    useEffect(() => {
        let ativo = true;

        async function buscarRelatos() {
            try {
                setCarregando(true);
                setErro("");

                const parametros = new URLSearchParams({
                    pagina: String(pagina),
                    limite: String(limite),
                });

                if (pesquisa.trim()) {
                    parametros.set("pesquisa", pesquisa.trim());
                }

                if (categoria) {
                    parametros.set("categoria", categoria);
                }

                if (municipio) {
                    parametros.set("municipio", municipio);
                }

                const resposta = await fetch(
                    `${API_URL}/relatos?${parametros.toString()}`
                );

                if (!resposta.ok) {
                    throw new Error(
                        "Não foi possível carregar os relatos."
                    );
                }

                const dados = await resposta.json();

                if (!ativo) return;

                const lista = Array.isArray(dados.relatos)
                    ? dados.relatos
                    : [];

                setRelatos(lista);
                setTotal(Number(dados.total) || 0);

                setTotalPaginas(
                    Number(dados.totalPaginas) || 1
                );

                setCategorias((anteriores) => [
                    ...new Set([
                        ...anteriores,
                        ...lista
                            .map((item) => item.categoria)
                            .filter(Boolean),
                    ]),
                ]);

                setMunicipios((anteriores) => [
                    ...new Set([
                        ...anteriores,
                        ...lista
                            .map((item) => item.municipio)
                            .filter(Boolean),
                    ]),
                ]);
            } catch (error) {
                if (!ativo) return;

                console.error("Erro ao buscar relatos:", error);

                setErro(error.message);
                setRelatos([]);
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        buscarRelatos();

        return () => {
            ativo = false;
        };
    }, [pagina, pesquisa, categoria, municipio]);

    // Formatação de data
    function formatarData(data) {
        if (!data) return "Data não informada";

        const dataFormatada = new Date(data);

        if (Number.isNaN(dataFormatada.getTime())) {
            return "Data não informada";
        }

        return dataFormatada.toLocaleDateString("pt-BR", {
            timeZone: "America/Sao_Paulo",
        });
    }

    // Formatação da data de publicação
    function formatarDataHora(data) {
        if (!data) return "Não informada";

        const dataFormatada = new Date(data);

        if (Number.isNaN(dataFormatada.getTime())) {
            return "Não informada";
        }

        return dataFormatada.toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
        });
    }

    // Cria uma linha de informação do popup
    function criarInformacaoPopup(rotulo, valor) {
        const linha = document.createElement("div");
        linha.className = "popup-relato-info";

        const titulo = document.createElement("span");
        titulo.className = "popup-relato-rotulo";
        titulo.textContent = rotulo;

        const conteudo = document.createElement("strong");
        conteudo.className = "popup-relato-valor";
        conteudo.textContent = valor || "Não informado";

        linha.appendChild(titulo);
        linha.appendChild(conteudo);

        return linha;
    }

    // Monta o conteúdo do popup sem inserir HTML vindo da API
    function criarPopupRelato(relato) {
        const container = document.createElement("div");
        container.className = "popup-relato";

        const topo = document.createElement("div");
        topo.className = "popup-relato-topo";

        const identificacao = document.createElement("span");
        identificacao.className = "popup-relato-identificacao";
        identificacao.textContent = `RELATO #${relato.id_relato}`;

        const status = document.createElement("span");
        status.className = "popup-relato-status";
        status.textContent = "Aprovado";

        topo.appendChild(identificacao);
        topo.appendChild(status);

        const titulo = document.createElement("h3");
        titulo.className = "popup-relato-titulo";
        titulo.textContent = relato.categoria || "Categoria não informada";

        const informacoes = document.createElement("div");
        informacoes.className = "popup-relato-informacoes";

        informacoes.appendChild(
            criarInformacaoPopup(
                "Município",
                relato.municipio
            )
        );

        informacoes.appendChild(
            criarInformacaoPopup(
                "Data da ocorrência",
                formatarData(relato.data_fato)
            )
        );

        informacoes.appendChild(
            criarInformacaoPopup(
                "Horário",
                relato.hora_fato || "Não informado"
            )
        );

        const descricaoContainer = document.createElement("div");
        descricaoContainer.className = "popup-relato-descricao";

        const descricaoTitulo = document.createElement("span");
        descricaoTitulo.className = "popup-relato-rotulo";
        descricaoTitulo.textContent = "Descrição";

        const descricaoTexto = document.createElement("p");
        descricaoTexto.textContent =
            relato.descricao?.trim() ||
            "Nenhuma descrição pública foi disponibilizada.";

        descricaoContainer.appendChild(descricaoTitulo);
        descricaoContainer.appendChild(descricaoTexto);

        const publicacao = document.createElement("p");
        publicacao.className = "popup-relato-publicacao";
        publicacao.textContent =
            `Publicado em ${formatarDataHora(relato.enviado_em)}`;

        const aviso = document.createElement("div");
        aviso.className = "popup-relato-aviso";

        const iconeAviso = document.createElement("i");
        iconeAviso.className = "bi bi-shield-lock";

        const textoAviso = document.createElement("span");
        textoAviso.textContent =
            "A localização exibida é aproximada. Dados pessoais não são apresentados.";

        aviso.appendChild(iconeAviso);
        aviso.appendChild(textoAviso);

        container.appendChild(topo);
        container.appendChild(titulo);
        container.appendChild(informacoes);
        container.appendChild(descricaoContainer);
        container.appendChild(publicacao);
        container.appendChild(aviso);

        return container;
    }

    // Criação e atualização dos marcadores
    useEffect(() => {
        const mapa = instanciaMapaRef.current;

        if (!mapa || !mapaPronto) return;

        marcadoresRef.current.forEach((marcador) => {
            marcador.remove();
        });

        marcadoresRef.current = [];

        popupRef.current?.remove();
        popupRef.current = null;

        const relatosComCoordenadas = relatos.filter((relato) => {
            if (
                relato.latitude === null ||
                relato.latitude === undefined ||
                relato.longitude === null ||
                relato.longitude === undefined ||
                relato.latitude === "" ||
                relato.longitude === ""
            ) {
                return false;
            }

            const latitude = Number(relato.latitude);
            const longitude = Number(relato.longitude);

            return (
                Number.isFinite(latitude) &&
                Number.isFinite(longitude) &&
                latitude >= -90 &&
                latitude <= 90 &&
                longitude >= -180 &&
                longitude <= 180
            );
        });

        relatosComCoordenadas.forEach((relato) => {
            const latitude = Number(relato.latitude);
            const longitude = Number(relato.longitude);

            const marcador = new Marker({
                color: "#2457C5",
            })
                .setLngLat([longitude, latitude])
                .addTo(mapa);

            marcador.getElement().style.cursor = "pointer";

            marcador.getElement().setAttribute(
                "aria-label",
                `Abrir relato ${relato.id_relato}`
            );

            marcador.getElement().addEventListener("click", () => {
                popupRef.current?.remove();

                const popup = new Popup({
                    closeButton: true,
                    closeOnClick: false,
                    offset: 22,
                    maxWidth: "340px",
                })
                    .setLngLat([longitude, latitude])
                    .setDOMContent(criarPopupRelato(relato))
                    .addTo(mapa);

                popupRef.current = popup;

                popup.on("close", () => {
                    if (popupRef.current === popup) {
                        popupRef.current = null;
                    }
                });
            });

            marcadoresRef.current.push(marcador);
        });

        // Ajusta a visualização aos relatos encontrados
        if (relatosComCoordenadas.length > 1) {
            const limites = new LngLatBounds();

            relatosComCoordenadas.forEach((relato) => {
                limites.extend([
                    Number(relato.longitude),
                    Number(relato.latitude),
                ]);
            });

            mapa.fitBounds(limites, {
                padding: 90,
                maxZoom: 12,
                duration: 800,
            });
        } else if (relatosComCoordenadas.length === 1) {
            const relato = relatosComCoordenadas[0];

            mapa.flyTo({
                center: [
                    Number(relato.longitude),
                    Number(relato.latitude),
                ],
                zoom: 11,
                duration: 800,
            });
        }

        return () => {
            marcadoresRef.current.forEach((marcador) => {
                marcador.remove();
            });

            marcadoresRef.current = [];
            popupRef.current?.remove();
            popupRef.current = null;
        };
    }, [relatos, mapaPronto]);

    function limparFiltros() {
        setPesquisa("");
        setCategoria("");
        setMunicipio("");
        setPagina(1);
    }

    function alterarPesquisa(valor) {
        setPesquisa(valor);
        setPagina(1);
    }

    function alterarCategoria(valor) {
        setCategoria(valor);
        setPagina(1);
    }

    function alterarMunicipio(valor) {
        setMunicipio(valor);
        setPagina(1);
    }

    return (
        <main className="mapa-relatos-page">
            <div
                ref={mapaRef}
                className="mapa-interativo"
                aria-label="Mapa de relatos públicos do AlertABC"
            />

            {/* Identificação e filtros flutuantes */}
            <section className="mapa-controles">
                <div className="mapa-controles-cabecalho">
                    <div>
                        <span className="mapa-relatos-eyebrow">
                            ALERTABC / TRANSPARÊNCIA
                        </span>

                        <h1>Mapa de Relatos</h1>

                        <p>
                            Explore os relatos públicos da região.
                        </p>
                    </div>

                    <span className="mapa-relatos-status">
                        <span className="status-indicator" />
                        Dados públicos
                    </span>
                </div>

                <div className="mapa-filtros">
                    <label className="mapa-pesquisa">
                        <i className="bi bi-search" />

                        <input
                            type="search"
                            placeholder="Pesquisar relatos..."
                            value={pesquisa}
                            onChange={(evento) =>
                                alterarPesquisa(evento.target.value)
                            }
                            aria-label="Pesquisar relatos"
                        />
                    </label>

                    <select
                        value={categoria}
                        onChange={(evento) =>
                            alterarCategoria(evento.target.value)
                        }
                        aria-label="Filtrar por categoria"
                    >
                        <option value="">Todas as categorias</option>

                        {categorias.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>

                    <select
                        value={municipio}
                        onChange={(evento) =>
                            alterarMunicipio(evento.target.value)
                        }
                        aria-label="Filtrar por município"
                    >
                        <option value="">Todos os municípios</option>

                        {municipios.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        className="mapa-limpar-filtros"
                        onClick={limparFiltros}
                        title="Limpar filtros"
                        aria-label="Limpar filtros"
                    >
                        <i className="bi bi-arrow-counterclockwise" />
                    </button>
                </div>

                <div className="mapa-controles-rodape">
                    <span>
                        <i className="bi bi-geo-alt" />
                        {total} relatos encontrados
                    </span>

                    <span className="mapa-regiao">
                        Região do ABC Paulista
                    </span>
                </div>
            </section>

            {/* Carregamento e mensagens */}
            {carregando && (
                <div className="mapa-mensagem">
                    <div className="relatos-spinner" />
                    <span>Carregando relatos...</span>
                </div>
            )}

            {!carregando && erro && (
                <div className="mapa-mensagem mapa-mensagem-erro">
                    <i className="bi bi-exclamation-circle" />
                    <strong>Não foi possível carregar os relatos</strong>
                    <span>{erro}</span>
                </div>
            )}

            {!carregando && !erro && relatos.length === 0 && (
                <div className="mapa-mensagem">
                    <i className="bi bi-search" />
                    <strong>Nenhum relato encontrado</strong>
                    <span>Experimente alterar os filtros.</span>
                </div>
            )}

            {/* Paginação flutuante */}
            {!carregando && !erro && totalPaginas > 1 && (
                <div className="mapa-paginacao">
                    <button
                        type="button"
                        disabled={pagina <= 1}
                        onClick={() => setPagina((atual) => atual - 1)}
                        aria-label="Página anterior"
                    >
                        <i className="bi bi-chevron-left" />
                    </button>

                    <span>
                        Página <strong>{pagina}</strong> de{" "}
                        <strong>{totalPaginas}</strong>
                    </span>

                    <button
                        type="button"
                        disabled={pagina >= totalPaginas}
                        onClick={() => setPagina((atual) => atual + 1)}
                        aria-label="Próxima página"
                    >
                        <i className="bi bi-chevron-right" />
                    </button>
                </div>
            )}

            {/* Aviso de privacidade */}
            <div className="mapa-privacidade">
                <i className="bi bi-shield-lock" />

                <span>
                    Localizações aproximadas. Dados pessoais protegidos.
                </span>
            </div>
        </main>
    );
}