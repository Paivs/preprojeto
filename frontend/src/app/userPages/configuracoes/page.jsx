"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import "./configuracoes.css";

export default function ConfiguracaoUser() {
  const [abaAtiva, setAbaAtiva] = useState("perfil");
  const [alertaAtivo, setAlertaAtivo] = useState(true);

  return (
    <div className="pagina">
      <Sidebar />

      <div className="conteudo-principal">
        <Header />

        <main className="conteudo-pagina">
          {/* CABEÇALHO */}
          <div className="cabecalho-pagina">
            <span className="cabecalho-etiqueta">CONFIGURAÇÕES</span>

            <h1>Seu espaço, do seu jeito.</h1>

            <p>
              Gerencie sua conta, preferências e a segurança da sua unidade.
            </p>
          </div>

          {/* NAVEGAÇÃO DAS ABAS */}
          <nav className="navegacao-config" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={abaAtiva === "perfil"}
              className={`aba-config ${
                abaAtiva === "perfil" ? "aba-ativa" : ""
              }`}
              onClick={() => setAbaAtiva("perfil")}
            >
              Perfil
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={abaAtiva === "limites"}
              className={`aba-config ${
                abaAtiva === "limites" ? "aba-ativa" : ""
              }`}
              onClick={() => setAbaAtiva("limites")}
            >
              Limites de Consumo
            </button>
          </nav>

          {/* CONTEÚDO DAS ABAS */}
          <section className="conteudo-abas">
            {/* ================= PERFIL ================= */}

            {abaAtiva === "perfil" && (
              <div className="container-abas">
                <div className="cabecalho-conteudo-abas">
                  <p>Informações pessoais</p>
                  <span>Mantenha seus dados de identificação atualizados.</span>
                </div>

                <form className="formulario-perfil">
                  <div className="form-group">
                    <label htmlFor="nome">Nome da empresa</label>

                    <input
                      type="text"
                      name="nome"
                      id="nome"
                      defaultValue="Financeiro Lab"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">E-mail</label>

                    <input
                      type="email"
                      name="email"
                      id="email"
                      defaultValue="financeiro@volthouse.com.br"
                    />
                  </div>

                  <div className="grid-form">
                    <div className="form-group">
                      <label htmlFor="cnpj">CNPJ</label>

                      <input
                        type="text"
                        name="cnpj"
                        id="cnpj"
                        placeholder="00.000.000/0000-00"
                        defaultValue="99.999.999/9999-99"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="id">ID do usuário</label>

                      <input
                        type="text"
                        name="id"
                        id="id"
                        defaultValue="0042"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="permissao">Permissão</label>

                    <select
                      name="permissao"
                      id="permissao"
                      defaultValue="cliente"
                      disabled
                    >
                      <option value="cliente">Cliente</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </form>
              </div>
            )}

            {/*  LIMITES DE CONSUMO = */}

            {abaAtiva === "limites" && (
              <div className="limites-consumo">
                <div className="limites-layout">
                  <section className="card-limites">
                    <div className="titulo-card-limites">
                      <h2>Limites de consumo</h2>

                      <p>
                        Defina tetos mensais para evitar surpresas na conta.
                      </p>
                    </div>

                    <form
                      className="form-limites"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <div className="campos-limites">
                        <div className="campo-limite">
                          <label htmlFor="limiteEnergia">
                            Limite mensal de energia (kWh)
                          </label>

                          <div className="campo-somente-leitura">
                            <input
                              type="text"
                              id="limiteEnergia"
                              value="15.000 kWh"
                              readOnly
                              aria-describedby="aviso-limite-admin"
                            />

                            <span className="icone-bloqueio" aria-hidden="true">
                              <i className="bi bi-lock-fill"></i>
                            </span>
                          </div>

                          <span
                            className="aviso-limite-admin"
                            id="aviso-limite-admin"
                          >
                            <i className="bi bi-shield-check"></i>
                            Definido pelo administrador
                          </span>
                        </div>

                        <div className="campo-limite">
                          <label htmlFor="limiteCusto">
                            Limite mensal de custo (R$)
                          </label>

                          <input
                            type="number"
                            id="limiteCusto"
                            name="limiteCusto"
                            min="0"
                            step="any"
                            placeholder="Defina seu limite de custo"
                          />
                        </div>
                      </div>
                    </form>
                  </section>

                  <aside className="coluna-resumo-limites">
                    <section className="card-resumo-consumo">
                      <h2>Seu mês até agora</h2>

                      <div className="resumo-energia">
                        <strong>— / — kWh</strong>

                        <div
                          className="barra-progresso-limite"
                          role="progressbar"
                          aria-label="Consumo mensal de energia"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          aria-valuenow="0"
                        >
                          <span />
                        </div>

                        <span className="percentual-limite">
                          Aguardando dados de consumo
                        </span>
                      </div>

                      <div className="resumo-custo">
                        <strong>R$ — de R$ —</strong>

                        <span>Saldo disponível: R$ —</span>
                      </div>

                      <p className="descricao-resumo">
                        Seu limite foi definido por você e pode ser ajustado a
                        qualquer momento.
                      </p>
                    </section>

                    <section className="card-info-limites">
                      <span>SUA UNIDADE, SUAS REGRAS</span>

                      <h3>Mais controle. Menos preocupação.</h3>

                      <p>
                        Preferências vinculadas à sua unidade.
                        <br />
                        Suas escolhas podem ser aplicadas em toda a experiência
                        Volt House.
                      </p>
                    </section>
                  </aside>
                </div>

                <p className="aviso-limites">
                  Alterações de configuração ficam registradas no histórico da
                  sua conta.
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
