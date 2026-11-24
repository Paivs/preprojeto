"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import { API_BASE_URL } from "@/lib/api";
import "./configuracoes.css";

const abas = [
  { id: "perfil", rotulo: "Perfil", icone: "bi-person" },
  { id: "limites", rotulo: "Limites de consumo", icone: "bi-lightning-charge" },
  { id: "seguranca", rotulo: "Segurança", icone: "bi-shield-lock" },
];

export default function ConfiguracaoUser() {
  const [abaAtiva, setAbaAtiva] = useState("perfil");
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [senha, setSenha] = useState({ atual: "", nova: "", confirmar: "" });

  const carregarPerfil = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setErro(
        "Sua sessão não foi encontrada. Entre novamente para acessar as configurações."
      );
      setCarregando(false);
      return;
    }
    try {
      const resposta = await fetch(`${API_BASE_URL}/configuracoes/usuario`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok)
        throw new Error(
          resultado.erro || "Não foi possível carregar seus dados."
        );
      setPerfil({
        ...resultado.dados,
        nome_empresa: resultado.dados.nome_empresa || "",
        email: resultado.dados.email || "",
        telefone: resultado.dados.telefone || "",
        cnpj: resultado.dados.cnpj || "",
        consumo_maximo: resultado.dados.consumo_maximo ?? 0,
      });
      setErro("");
    } catch (falha) {
      setErro(falha.message || "Não foi possível conectar à API.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const agendamento = window.setTimeout(() => carregarPerfil(), 0);
    return () => window.clearTimeout(agendamento);
  }, [carregarPerfil]);

  function alterarCampo(campo, valor) {
    setPerfil((atual) => ({ ...atual, [campo]: valor }));
    setSucesso("");
    setErro("");
  }

  async function salvarPerfil(evento) {
    evento.preventDefault();
    await enviar(
      `${API_BASE_URL}/configuracoes/usuario`,
      {
        nome_empresa: perfil.nome_empresa,
        email: perfil.email,
        telefone: perfil.telefone,
        cnpj: perfil.cnpj,
        consumo_maximo: Number(perfil.consumo_maximo),
      },
      "Dados da conta atualizados."
    );
  }

  async function salvarLimite(evento) {
    evento.preventDefault();
    await enviar(
      `${API_BASE_URL}/configuracoes/usuario`,
      {
        nome_empresa: perfil.nome_empresa,
        email: perfil.email,
        telefone: perfil.telefone,
        cnpj: perfil.cnpj,
        consumo_maximo: Number(perfil.consumo_maximo),
      },
      "Limite mensal atualizado."
    );
  }

  async function alterarSenha(evento) {
    evento.preventDefault();
    await enviar(
      `${API_BASE_URL}/configuracoes/usuario/senha`,
      {
        senha_atual: senha.atual,
        nova_senha: senha.nova,
        confirmar_senha: senha.confirmar,
      },
      "Senha alterada com sucesso.",
      "PUT",
      () => setSenha({ atual: "", nova: "", confirmar: "" })
    );
  }

  async function enviar(url, dados, mensagem, metodo = "PUT", aoConcluir) {
    setSalvando(true);
    setErro("");
    setSucesso("");
    const token = sessionStorage.getItem("token");
    if (!token) {
      setErro("Sua sessão expirou. Entre novamente.");
      setSalvando(false);
      return;
    }
    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dados),
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok)
        throw new Error(
          resultado.erro || "Não foi possível salvar as alterações."
        );
      if (
        resultado.dados &&
        typeof resultado.dados === "object" &&
        "nome_empresa" in resultado.dados
      ) {
        setPerfil((atual) => ({ ...atual, ...resultado.dados }));
        let usuarioSessao = {};
        try {
          usuarioSessao = JSON.parse(sessionStorage.getItem("usuario") || "{}");
        } catch {
          sessionStorage.removeItem("usuario");
        }
        sessionStorage.setItem(
          "usuario",
          JSON.stringify({
            ...usuarioSessao,
            nome: resultado.dados.nome_empresa,
            email: resultado.dados.email,
          })
        );
        window.dispatchEvent(new Event("volthouse:perfil-atualizado"));
      }
      aoConcluir?.();
      setSucesso(mensagem);
    } catch (falha) {
      setErro(falha.message || "Não foi possível conectar à API.");
    } finally {
      setSalvando(false);
    }
  }

  const consumoTotal = Number(perfil?.consumo_total || 0);
  const consumoMaximo = Number(perfil?.consumo_maximo || 0);
  const percentualConsumo =
    consumoMaximo > 0
      ? Math.min(100, Math.round((consumoTotal / consumoMaximo) * 100))
      : 0;

  return (
    <div className="pagina">
      <Sidebar />
      <div className="conteudo-principal">
        <Header />
        <main className="configuracoes-pagina">
          <header className="config-hero">
            <span className="cabecalho-etiqueta">PREFERÊNCIAS DA CONTA</span>
            <h1>Configurações</h1>
            <p>
              Gerencie os dados da sua unidade, os limites e a segurança da
              conta.
            </p>
          </header>

          <div className="config-layout">
            <nav
              className="config-nav"
              role="tablist"
              aria-label="Seções de configuração"
            >
              {abas.map((aba) => (
                <button
                  key={aba.id}
                  type="button"
                  role="tab"
                  id={`tab-${aba.id}`}
                  aria-controls={`painel-${aba.id}`}
                  aria-selected={abaAtiva === aba.id}
                  className={abaAtiva === aba.id ? "ativa" : ""}
                  onClick={() => {
                    setAbaAtiva(aba.id);
                    setErro("");
                    setSucesso("");
                  }}
                >
                  <i className={`bi ${aba.icone}`} aria-hidden="true" />
                  <span>{aba.rotulo}</span>
                  <i
                    className="bi bi-chevron-right config-nav-seta"
                    aria-hidden="true"
                  />
                </button>
              ))}
              {perfil && (
                <div className="config-conta-resumo">
                  <div className="config-avatar">
                    {perfil.nome_empresa
                      ?.trim()
                      .charAt(0)
                      .toLocaleUpperCase("pt-BR") || "V"}
                  </div>
                  <div>
                    <strong>{perfil.nome_empresa}</strong>
                    <span>Conta #{perfil.id_usuario}</span>
                  </div>
                </div>
              )}
            </nav>

            <section className="config-conteudo" aria-live="polite">
              {(erro || sucesso) && (
                <div
                  className={`config-feedback ${
                    erro ? "feedback-erro" : "feedback-sucesso"
                  }`}
                  role={erro ? "alert" : "status"}
                >
                  <i
                    className={`bi ${
                      erro ? "bi-exclamation-circle" : "bi-check-circle"
                    }`}
                  />
                  {erro || sucesso}
                  {erro && !perfil && (
                    <button
                      type="button"
                      onClick={() => {
                        setCarregando(true);
                        setErro("");
                        carregarPerfil();
                      }}
                    >
                      Tentar novamente
                    </button>
                  )}
                </div>
              )}

              {carregando ? (
                <div className="config-carregando">
                  <span className="config-spinner" />
                  Carregando configurações...
                </div>
              ) : !perfil ? (
                <div className="config-vazio">
                  <i className="bi bi-person-exclamation" />
                  <h2>Não foi possível abrir suas configurações</h2>
                  <p>Confira sua conexão e tente novamente.</p>
                </div>
              ) : (
                <>
                  {abaAtiva === "perfil" && (
                    <div
                      className="config-card"
                      role="tabpanel"
                      id="painel-perfil"
                      aria-labelledby="tab-perfil"
                    >
                      <div className="config-card-topo">
                        <div className="config-card-icone">
                          <i className="bi bi-building" />
                        </div>
                        <div>
                          <h2>Perfil da unidade</h2>
                          <p>
                            Informações usadas para identificar sua conta na
                            VoltHouse.
                          </p>
                        </div>
                      </div>
                      <form className="config-form" onSubmit={salvarPerfil}>
                        <label className="config-campo config-campo-largo">
                          Nome da empresa
                          <input
                            value={perfil.nome_empresa}
                            onChange={(e) =>
                              alterarCampo("nome_empresa", e.target.value)
                            }
                            maxLength={150}
                            required
                          />
                        </label>
                        <label className="config-campo">
                          E-mail
                          <input
                            type="email"
                            value={perfil.email}
                            onChange={(e) =>
                              alterarCampo("email", e.target.value)
                            }
                            maxLength={100}
                            required
                          />
                        </label>
                        <label className="config-campo">
                          Telefone
                          <input
                            type="tel"
                            value={perfil.telefone}
                            onChange={(e) =>
                              alterarCampo("telefone", e.target.value)
                            }
                            maxLength={20}
                            placeholder="(11) 99999-9999"
                            required
                          />
                        </label>
                        <label className="config-campo">
                          CNPJ
                          <input
                            value={perfil.cnpj}
                            onChange={(e) =>
                              alterarCampo("cnpj", e.target.value)
                            }
                            maxLength={18}
                            required
                          />
                        </label>
                        <label className="config-campo">
                          ID da conta
                          <input value={perfil.id_usuario} readOnly />
                        </label>
                        <label className="config-campo">
                          Tipo de acesso
                          <input
                            value={
                              perfil.perfil === "admin"
                                ? "Administrador"
                                : "Cliente"
                            }
                            readOnly
                          />
                        </label>
                        <div className="config-form-acoes">
                          <span>
                            Alterações aplicadas somente a esta conta.
                          </span>
                          <button type="submit" disabled={salvando}>
                            <i className="bi bi-check2" />
                            {salvando ? "Salvando..." : "Salvar alterações"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {abaAtiva === "limites" && (
                    <div
                      className="config-card"
                      role="tabpanel"
                      id="painel-limites"
                      aria-labelledby="tab-limites"
                    >
                      <div className="config-card-topo">
                        <div className="config-card-icone icone-verde">
                          <i className="bi bi-lightning-charge" />
                        </div>
                        <div>
                          <h2>Limite de consumo</h2>
                          <p>
                            Defina um teto mensal de energia para acompanhar sua
                            unidade.
                          </p>
                        </div>
                      </div>
                      <div className="limite-atual">
                        <div>
                          <span>Consumo registrado</span>
                          <strong>
                            {consumoTotal.toLocaleString("pt-BR")}{" "}
                            <small>kWh</small>
                          </strong>
                        </div>
                        <div>
                          <span>Uso do limite</span>
                          <strong>
                            {consumoMaximo > 0
                              ? `${percentualConsumo}%`
                              : "Sem limite"}
                          </strong>
                        </div>
                        {consumoMaximo > 0 && (
                          <div
                            className="limite-barra"
                            role="progressbar"
                            aria-label="Uso do limite de consumo"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow={percentualConsumo}
                          >
                            <span style={{ width: `${percentualConsumo}%` }} />
                          </div>
                        )}
                      </div>
                      <form
                        className="config-form config-form-limite"
                        onSubmit={salvarLimite}
                      >
                        <label className="config-campo config-campo-largo">
                          Limite mensal de energia (kWh)
                          <input
                            type="number"
                            min="0"
                            max="99999999.99"
                            step="0.01"
                            value={perfil.consumo_maximo}
                            onChange={(e) =>
                              alterarCampo("consumo_maximo", e.target.value)
                            }
                            required
                          />
                          <small>
                            Informe zero para deixar o consumo sem limite
                            definido.
                          </small>
                        </label>
                        <div className="config-form-acoes">
                          <span>
                            O limite é usado como referência para sua conta.
                          </span>
                          <button type="submit" disabled={salvando}>
                            <i className="bi bi-check2" />
                            {salvando ? "Salvando..." : "Salvar limite"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {abaAtiva === "seguranca" && (
                    <div
                      className="config-card"
                      role="tabpanel"
                      id="painel-seguranca"
                      aria-labelledby="tab-seguranca"
                    >
                      <div className="config-card-topo">
                        <div className="config-card-icone icone-ambar">
                          <i className="bi bi-shield-lock" />
                        </div>
                        <div>
                          <h2>Segurança da conta</h2>
                          <p>
                            Atualize sua senha periodicamente para proteger o
                            acesso.
                          </p>
                        </div>
                      </div>
                      <form
                        className="config-form config-form-seguranca"
                        onSubmit={alterarSenha}
                      >
                        <label className="config-campo config-campo-largo">
                          Senha atual
                          <input
                            type="password"
                            autoComplete="current-password"
                            value={senha.atual}
                            onChange={(e) =>
                              setSenha((atual) => ({
                                ...atual,
                                atual: e.target.value,
                              }))
                            }
                            required
                          />
                        </label>
                        <label className="config-campo config-campo-largo">
                          Nova senha
                          <input
                            type="password"
                            autoComplete="off"
                            minLength={8}
                            value={senha.nova}
                            onChange={(e) =>
                              setSenha((atual) => ({
                                ...atual,
                                nova: e.target.value,
                              }))
                            }
                            required
                          />
                          <small>
                            Use ao menos 8 caracteres, com maiúscula, minúscula,
                            número e símbolo.
                          </small>
                        </label>
                        <label className="config-campo config-campo-largo">
                          Confirme a nova senha
                          <input
                            type="password"
                            autoComplete="off"
                            minLength={8}
                            value={senha.confirmar}
                            onChange={(e) =>
                              setSenha((atual) => ({
                                ...atual,
                                confirmar: e.target.value,
                              }))
                            }
                            required
                          />
                        </label>
                        <div className="config-form-acoes">
                          <span>
                            Sua senha é armazenada de forma protegida.
                          </span>
                          <button type="submit" disabled={salvando}>
                            <i className="bi bi-key" />
                            {salvando ? "Atualizando..." : "Atualizar senha"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
