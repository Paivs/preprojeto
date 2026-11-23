
"use client";

import { useCallback, useEffect, useState } from "react";
import "./usuarios.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function obterEnderecoAPI() {
    if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL não foi configurada.");
    }

    const base = API_URL.replace(/\/+$/, "");

    return base.endsWith("/api") ? base : `${base}/api`;
}

const perfis = {
    cidadao: "Cidadão",
    admin_municipal: "Admin Municipal",
    admin_geral: "Admin Geral"
};

const formularioInicial = {
    nome: "",
    email: "",
    senha: "",
    perfil: "cidadao",
    fk_id_municipio: ""
};

export default function UsuariosAdmin() {
    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [busca, setBusca] = useState("");
    const [buscaAplicada, setBuscaAplicada] = useState("");
    const [perfil, setPerfil] = useState("");

    const [pagina, setPagina] = useState(1);
    const [paginacao, setPaginacao] = useState({
        pagina: 1,
        limite: 10,
        total: 0,
        totalPaginas: 0
    });

    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

    // Cadastro de contas
    const [modalCadastro, setModalCadastro] = useState(false);
    const [municipios, setMunicipios] = useState([]);
    const [carregandoMunicipios, setCarregandoMunicipios] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [mensagemCadastro, setMensagemCadastro] = useState("");
    const [erroCadastro, setErroCadastro] = useState("");
    const [novoUsuario, setNovoUsuario] = useState(formularioInicial);

    const carregarUsuarios = useCallback(async () => {
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

            if (perfil) {
                parametros.set("perfil", perfil);
            }

            const resposta = await fetch(
                `${obterEnderecoAPI()}/admin-geral/usuarios?${parametros}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || "Não foi possível carregar os usuários."
                );
            }

            setUsuarios(dados.usuarios || []);
            setPaginacao(dados.paginacao || {
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
    }, [pagina, buscaAplicada, perfil]);

    useEffect(() => {
        carregarUsuarios();
    }, [carregarUsuarios]);

    function pesquisar(event) {
        event.preventDefault();
        setPagina(1);
        setBuscaAplicada(busca.trim());
    }

    function alterarPerfil(event) {
        setPerfil(event.target.value);
        setPagina(1);
    }

    function limparFiltros() {
        setBusca("");
        setBuscaAplicada("");
        setPerfil("");
        setPagina(1);
    }

    function formatarPerfil(valor) {
        return perfis[valor] || valor;
    }

    function alterarCampoCadastro(event) {
        const { name, value } = event.target;

        setNovoUsuario((atual) => ({
            ...atual,
            [name]: value,
            ...(name === "perfil" && value !== "admin_municipal"
                ? { fk_id_municipio: "" }
                : {})
        }));
    }

    async function abrirCadastro() {
        setModalCadastro(true);
        setErroCadastro("");
        setMensagemCadastro("");
        setNovoUsuario(formularioInicial);
        setCarregandoMunicipios(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Faça login novamente.");
            }

            const resposta = await fetch(
                `${obterEnderecoAPI()}/admin-geral/municipios`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || "Não foi possível carregar os municípios."
                );
            }

            setMunicipios(dados.municipios || []);
        } catch (error) {
            setErroCadastro(error.message);
        } finally {
            setCarregandoMunicipios(false);
        }
    }

    async function cadastrarUsuario(event) {
        event.preventDefault();

        try {
            setSalvando(true);
            setErroCadastro("");
            setMensagemCadastro("");

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Faça login novamente.");
            }

            const resposta = await fetch(
                `${obterEnderecoAPI()}/admin-geral/usuarios`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...novoUsuario,
                        fk_id_municipio:
                            novoUsuario.perfil === "admin_municipal"
                                ? Number(novoUsuario.fk_id_municipio)
                                : null
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || "Não foi possível criar a conta."
                );
            }

            setMensagemCadastro("Conta criada com sucesso!");

            setNovoUsuario(formularioInicial);

            // Limpa os filtros para encontrar a nova conta.
            setBusca("");
            setBuscaAplicada("");
            setPerfil("");
            setPagina(1);

            // Aguarda a atualização dos filtros e fecha o modal.
            // A tabela será atualizada pelo efeito de paginação/filtros.
            window.setTimeout(() => {
                setModalCadastro(false);
                setMensagemCadastro("");
            }, 1200);

        } catch (error) {
            setErroCadastro(error.message);
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="admin-content usuarios-content">

            <header className="admin-header">
                <div>
                    <span className="admin-eyebrow">ADMINISTRAÇÃO</span>
                    <h1>Gerenciamento de usuários</h1>
                    <p>
                        Consulte e gerencie as contas cadastradas na plataforma AlertABC.
                    </p>
                </div>

                <div className="usuarios-header-actions">
                    <button
                        className="usuarios-add-button"
                        onClick={abrirCadastro}
                    >
                        + Adicionar conta
                    </button>

                    <button
                        className="usuarios-refresh"
                        onClick={carregarUsuarios}
                        disabled={carregando}
                    >
                        ↻ Atualizar
                    </button>
                </div>
            </header>

            <section className="usuarios-overview">
                <div className="usuarios-overview-icon">♙</div>

                <div>
                    <span>CONTAS CADASTRADAS</span>
                    <strong>
                        {paginacao.total.toLocaleString("pt-BR")}
                    </strong>
                    <p>Total de usuários encontrados na plataforma.</p>
                </div>
            </section>

            <section className="usuarios-panel">

                <div className="usuarios-panel-heading">
                    <div>
                        <h2>Usuários cadastrados</h2>
                        <p>Pesquise e consulte as contas registradas.</p>
                    </div>
                </div>

                <form
                    className="usuarios-filtros"
                    onSubmit={pesquisar}
                >
                    <div className="usuarios-search">
                        <span>⌕</span>

                        <input
                            type="search"
                            placeholder="Buscar por nome ou e-mail..."
                            value={busca}
                            onChange={(event) => setBusca(event.target.value)}
                        />
                    </div>

                    <select
                        value={perfil}
                        onChange={alterarPerfil}
                        aria-label="Filtrar por perfil"
                    >
                        <option value="">Todos os perfis</option>
                        <option value="cidadao">Cidadão</option>
                        <option value="admin_municipal">Admin Municipal</option>
                        <option value="admin_geral">Admin Geral</option>
                    </select>

                    <button type="submit" className="usuarios-search-button">
                        Pesquisar
                    </button>

                    <button
                        type="button"
                        className="usuarios-clear-button"
                        onClick={limparFiltros}
                    >
                        Limpar
                    </button>
                </form>

                {erro && (
                    <div className="usuarios-error">
                        <strong>Não foi possível carregar os usuários.</strong>
                        <p>{erro}</p>

                        <button onClick={carregarUsuarios}>
                            Tentar novamente
                        </button>
                    </div>
                )}

                {carregando ? (
                    <div className="usuarios-loading">
                        <div className="usuarios-spinner" />
                        <p>Carregando usuários...</p>
                    </div>
                ) : !erro && (
                    <>
                        <div className="usuarios-table-wrapper">
                            <table className="usuarios-table">
                                <thead>
                                    <tr>
                                        <th>Usuário</th>
                                        <th>E-mail</th>
                                        <th>Perfil</th>
                                        <th>Município</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {usuarios.length === 0 ? (
                                        <tr>
                                            <td colSpan="5">
                                                Nenhum usuário encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        usuarios.map((usuario) => (
                                            <tr key={usuario.id_conta}>
                                                <td>
                                                    <div className="usuario-identificacao">
                                                        <div className="usuario-avatar">
                                                            {usuario.nome
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <strong>{usuario.nome}</strong>
                                                    </div>
                                                </td>

                                                <td>{usuario.email}</td>

                                                <td>
                                                    <span className={`usuario-perfil perfil-${usuario.perfil}`}>
                                                        {formatarPerfil(usuario.perfil)}
                                                    </span>
                                                </td>

                                                <td>
                                                    {usuario.municipio || "Não vinculado"}
                                                </td>

                                                <td>
                                                    <button
                                                        className="usuario-details-button"
                                                        onClick={() => setUsuarioSelecionado(usuario)}
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

                        <div className="usuarios-pagination">
                            <span>
                                Página {pagina} de {Math.max(1, paginacao.totalPaginas)}
                                {" · "}
                                {paginacao.total} usuário(s)
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
            {usuarioSelecionado && (
                <div
                    className="usuario-modal-overlay"
                    onClick={() => setUsuarioSelecionado(null)}
                >
                    <section
                        className="usuario-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="usuario-modal-close"
                            onClick={() => setUsuarioSelecionado(null)}
                            aria-label="Fechar"
                        >
                            ×
                        </button>

                        <span className="admin-eyebrow">
                            DETALHES DA CONTA
                        </span>

                        <h2>{usuarioSelecionado.nome}</h2>

                        <div className="usuario-modal-info">
                            <div>
                                <span>ID da conta</span>
                                <strong>{usuarioSelecionado.id_conta}</strong>
                            </div>

                            <div>
                                <span>Nome</span>
                                <strong>{usuarioSelecionado.nome}</strong>
                            </div>

                            <div>
                                <span>E-mail</span>
                                <strong>{usuarioSelecionado.email}</strong>
                            </div>

                            <div>
                                <span>Perfil</span>
                                <strong>
                                    {formatarPerfil(usuarioSelecionado.perfil)}
                                </strong>
                            </div>

                            <div>
                                <span>Município</span>
                                <strong>
                                    {usuarioSelecionado.municipio || "Não vinculado"}
                                </strong>
                            </div>
                        </div>

                        <button
                            className="usuarios-modal-button"
                            onClick={() => setUsuarioSelecionado(null)}
                        >
                            Fechar detalhes
                        </button>
                    </section>
                </div>
            )}

            {/* Modal de cadastro */}
            {modalCadastro && (
                <div
                    className="usuario-modal-overlay"
                    onClick={() => !salvando && setModalCadastro(false)}
                >
                    <section
                        className="usuario-modal usuario-cadastro-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="usuario-modal-close"
                            onClick={() => !salvando && setModalCadastro(false)}
                            disabled={salvando}
                            aria-label="Fechar"
                        >
                            ×
                        </button>

                        <span className="admin-eyebrow">
                            GERENCIAMENTO DE CONTAS
                        </span>

                        <h2>Adicionar conta</h2>

                        <p>Preencha os dados para cadastrar um novo usuário.</p>

                        <form
                            onSubmit={cadastrarUsuario}
                            className="usuario-cadastro-form"
                        >
                            <label>
                                Nome completo
                                <input
                                    type="text"
                                    name="nome"
                                    value={novoUsuario.nome}
                                    onChange={alterarCampoCadastro}
                                    placeholder="Digite o nome completo"
                                    maxLength={150}
                                    required
                                />
                            </label>

                            <label>
                                E-mail
                                <input
                                    type="email"
                                    name="email"
                                    value={novoUsuario.email}
                                    onChange={alterarCampoCadastro}
                                    placeholder="exemplo@email.com"
                                    maxLength={255}
                                    required
                                />
                            </label>

                            <label>
                                Senha inicial
                                <input
                                    type="password"
                                    name="senha"
                                    value={novoUsuario.senha}
                                    onChange={alterarCampoCadastro}
                                    placeholder="Mínimo de 8 caracteres"
                                    minLength={8}
                                    required
                                />
                            </label>

                            <label>
                                Perfil da conta
                                <select
                                    name="perfil"
                                    value={novoUsuario.perfil}
                                    onChange={alterarCampoCadastro}
                                    required
                                >
                                    <option value="cidadao">Cidadão</option>
                                    <option value="admin_municipal">Admin Municipal</option>
                                    <option value="admin_geral">Admin Geral</option>
                                </select>
                            </label>

                            {novoUsuario.perfil === "admin_municipal" && (
                                <label>
                                    Município
                                    <select
                                        name="fk_id_municipio"
                                        value={novoUsuario.fk_id_municipio}
                                        onChange={alterarCampoCadastro}
                                        required
                                        disabled={carregandoMunicipios}
                                    >
                                        <option value="">
                                            {carregandoMunicipios
                                                ? "Carregando municípios..."
                                                : "Selecione um município"}
                                        </option>

                                        {municipios.map((municipio) => (
                                            <option
                                                key={municipio.id_municipio}
                                                value={municipio.id_municipio}
                                            >
                                                {municipio.nome}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            )}

                            {erroCadastro && (
                                <div className="usuarios-error">
                                    {erroCadastro}
                                </div>
                            )}

                            {mensagemCadastro && (
                                <div className="usuarios-success">
                                    {mensagemCadastro}
                                </div>
                            )}

                            <div className="usuario-cadastro-actions">
                                <button
                                    type="button"
                                    className="usuarios-clear-button"
                                    onClick={() => setModalCadastro(false)}
                                    disabled={salvando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="usuarios-add-button"
                                    disabled={salvando || carregandoMunicipios}
                                >
                                    {salvando ? "Cadastrando..." : "Cadastrar conta"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            <footer className="admin-footer">
                AlertABC — Painel administrativo geral
            </footer>
        </div>
    );
}
