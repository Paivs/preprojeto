
"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function UsuariosMunicipaisPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    async function carregarUsuarios() {
        try {
            setCarregando(true);
            setErro("");

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Sua sessão expirou. Faça login novamente.");
            }

            const resposta = await fetch(
                `${API_URL}/admin-municipal/usuarios`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
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
        } catch (error) {
            setErro(error.message);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const usuariosFiltrados = useMemo(() => {
        const termo = busca.toLowerCase().trim();

        return usuarios.filter((usuario) =>
            usuario.nome?.toLowerCase().includes(termo) ||
            usuario.email?.toLowerCase().includes(termo) ||
            usuario.perfil?.toLowerCase().includes(termo)
        );
    }, [usuarios, busca]);

    function formatarPerfil(perfil) {
        const perfis = {
            cidadao: "Cidadão",
            admin_municipal: "Administrador municipal",
            admin_geral: "Administrador geral"
        };

        return perfis[perfil] || perfil;
    }

    return (
        <section className="municipal-page">

            <div className="municipal-heading">
                <div>
                    <span>GESTÃO MUNICIPAL</span>
                    <h1>Usuários</h1>
                    <p>
                        Consulte os usuários vinculados ao seu município.
                    </p>
                </div>

                <button
                    type="button"
                    className="municipal-refresh"
                    onClick={carregarUsuarios}
                    disabled={carregando}
                >
                    <i className="bi bi-arrow-clockwise"></i>
                    Atualizar
                </button>
            </div>

            <div className="municipal-panel">

                <div className="municipal-panel-heading">
                    <div>
                        <h2>Usuários cadastrados</h2>
                        <p>
                            {usuarios.length} usuário(s) encontrado(s).
                        </p>
                    </div>
                </div>

                <div className="municipal-filters">
                    <div className="municipal-search">
                        <i className="bi bi-search"></i>

                        <input
                            type="search"
                            placeholder="Buscar por nome, e-mail ou perfil..."
                            value={busca}
                            onChange={(event) => setBusca(event.target.value)}
                        />
                    </div>
                </div>

                {erro && (
                    <div className="municipal-error-message">
                        <i className="bi bi-exclamation-circle"></i>
                        {erro}
                    </div>
                )}

                {carregando ? (
                    <div className="municipal-empty">
                        <i className="bi bi-arrow-repeat"></i>
                        <strong>Carregando usuários...</strong>
                    </div>
                ) : !erro && usuariosFiltrados.length === 0 ? (
                    <div className="municipal-empty">
                        <i className="bi bi-people"></i>
                        <strong>Nenhum usuário encontrado</strong>
                        <span>
                            {busca
                                ? "Tente utilizar outro termo de pesquisa."
                                : "Ainda não existem usuários cadastrados neste município."}
                        </span>
                    </div>
                ) : !erro && (
                    <div className="table-responsive">
                        <table className="municipal-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>E-mail</th>
                                    <th>Perfil</th>
                                </tr>
                            </thead>

                            <tbody>
                                {usuariosFiltrados.map((usuario) => (
                                    <tr key={usuario.id_conta}>
                                        <td>#{usuario.id_conta}</td>
                                        <td>{usuario.nome}</td>
                                        <td>{usuario.email}</td>
                                        <td>
                                            <span className="municipal-readonly">
                                                {formatarPerfil(usuario.perfil)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </section>
    );
}
