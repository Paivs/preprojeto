"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar.jsx";
import Header from "@/components/headerAdmin/HeaderAdmin.jsx";
import { API_BASE_URL } from "@/lib/api";
import "./configuracaoAdmin.css";

const perfilVazio = {
  nome_empresa: "",
  email: "",
  cnpj: "",
  telefone: "",
  consumo_maximo: "",
};

async function requisitarConfiguracao(token, rota, opcoes = {}) {
  const resposta = await fetch(`${API_BASE_URL}/configuracoes/admin${rota}`, {
    ...opcoes,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
      ...opcoes.headers,
    },
  });
  const resultado = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const erro = new Error(
      resultado.erro || "Não foi possível salvar as configurações.",
    );
    erro.status = resposta.status;
    throw erro;
  }
  return resultado.dados;
}

export default function ConfiguracaoAdmin() {
  const [token, setToken] = useState("");
  const [perfil, setPerfil] = useState(perfilVazio);
  const [senha, setSenha] = useState({
    senha_atual: "",
    nova_senha: "",
    confirmar_senha: "",
  });
  const [erroSenha, setErroSenha] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [perfilCarregado, setPerfilCarregado] = useState(false);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const tokenSessao = sessionStorage.getItem("token");
      if (!tokenSessao) {
        if (ativo) {
          setFeedback({
            tipo: "erro",
            texto:
              "Sua sessão expirou. Entre novamente para editar as configurações.",
          });
          setCarregando(false);
        }
        return;
      }
      setToken(tokenSessao);
      try {
        const dados = await requisitarConfiguracao(tokenSessao, "");
        if (ativo) {
          setPerfil({
            nome_empresa: dados.nome_empresa || "",
            email: dados.email || "",
            cnpj: dados.cnpj || "",
            telefone: dados.telefone || "",
            consumo_maximo: String(dados.consumo_maximo ?? 0),
          });
          setPerfilCarregado(true);
        }
      } catch (erro) {
        if (ativo) setFeedback({ tipo: "erro", texto: erro.message });
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  function atualizarCampo(evento) {
    const { name, value } = evento.target;
    setPerfil((atual) => ({ ...atual, [name]: value }));
  }

  async function salvarPerfil(evento) {
    evento.preventDefault();
    setFeedback(null);
    setSalvandoPerfil(true);
    try {
      const dados = await requisitarConfiguracao(token, "", {
        method: "PUT",
        body: JSON.stringify({
          ...perfil,
          consumo_maximo: Number(perfil.consumo_maximo),
        }),
      });
      setPerfil({
        nome_empresa: dados.nome_empresa || "",
        email: dados.email || "",
        cnpj: dados.cnpj || "",
        telefone: dados.telefone || "",
        consumo_maximo: String(dados.consumo_maximo ?? 0),
      });
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
          nome: dados.nome_empresa,
          email: dados.email,
        }),
      );
      window.dispatchEvent(new Event("volthouse:perfil-atualizado"));
      setFeedback({
        tipo: "sucesso",
        texto: "Configurações salvas com sucesso.",
      });
    } catch (erro) {
      setFeedback({ tipo: "erro", texto: erro.message });
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function salvarSenha(evento) {
    evento.preventDefault();
    setFeedback(null);
    setErroSenha(null);
    setSalvandoSenha(true);
    try {
      const resultado = await requisitarConfiguracao(token, "/senha", {
        method: "PUT",
        body: JSON.stringify(senha),
      });
      setSenha({ senha_atual: "", nova_senha: "", confirmar_senha: "" });
      setFeedback({ tipo: "sucesso", texto: resultado.mensagem });
    } catch (erro) {
      const textoErro = erro.message.toLowerCase();
      const campo =
        erro.status === 401 || textoErro.includes("senha atual")
          ? "senha_atual"
          : textoErro.includes("confirma")
            ? "confirmar_senha"
            : "nova_senha";
      setErroSenha({ campo, texto: erro.message });
    } finally {
      setSalvandoSenha(false);
    }
  }

  return (
    <div className="pagina pagina-configuracao">
      <Sidebar />
      <div className="conteudo-principal">
        <Header tipoUsuario="admin" />
        <main className="conteudo-pagina">
          <div className="cabecalho-pagina">
            <div>
              <span className="cabecalho-etiqueta">PAINEL CONFIGURAÇÕES</span>
              <h1>Configurações</h1>
              <p>
                Gerencie seu perfil e personalize sua experiência na Volt House.
              </p>
            </div>
          </div>

          {feedback && (
            <p
              className={`config-feedback ${feedback.tipo}`}
              role={feedback.tipo === "erro" ? "alert" : "status"}
            >
              {feedback.texto}
            </p>
          )}
          {carregando && (
            <p className="config-feedback" role="status">
              Carregando configurações...
            </p>
          )}

          <div className="grid-group-config">
            <form onSubmit={salvarPerfil}>
              <section className="group-config">
                <div className="cabecalho-dados">
                  <i className="bi bi-database" />
                  <div className="tema-dados">
                    <h4>Dados da plataforma</h4>
                    <span>
                      Identificação exibida no painel e nas comunicações
                    </span>
                  </div>
                </div>
                <div className="main-dados">
                  <div className="card-config">
                    <div className="group-value">
                      <div className="dados-config">
                        <label htmlFor="nome_empresa">Nome da plataforma</label>
                        <input
                          id="nome_empresa"
                          type="text"
                          name="nome_empresa"
                          value={perfil.nome_empresa}
                          onChange={atualizarCampo}
                          maxLength={150}
                          required
                          disabled={carregando || !perfilCarregado}
                        />
                      </div>
                      <div className="dados-config">
                        <label htmlFor="email">E-mail de suporte</label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={perfil.email}
                          onChange={atualizarCampo}
                          maxLength={100}
                          required
                          disabled={carregando || !perfilCarregado}
                        />
                      </div>
                    </div>
                    <div className="group-value">
                      <div className="dados-config">
                        <label htmlFor="cnpj">CNPJ</label>
                        <input
                          id="cnpj"
                          type="text"
                          name="cnpj"
                          value={perfil.cnpj}
                          onChange={atualizarCampo}
                          maxLength={18}
                          required
                          disabled={carregando || !perfilCarregado}
                        />
                      </div>
                      <div className="dados-config">
                        <label htmlFor="telefone">Telefone de contato</label>
                        <input
                          id="telefone"
                          type="tel"
                          name="telefone"
                          value={perfil.telefone}
                          onChange={atualizarCampo}
                          maxLength={20}
                          disabled={carregando || !perfilCarregado}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="group-config">
                <div className="cabecalho-dados">
                  <i className="bi bi-lightning" />
                  <div className="tema-dados">
                    <h4>Parâmetros de energia</h4>
                    <span>
                      Limite usado como referência para o monitoramento
                      energético.
                    </span>
                  </div>
                </div>
                <div className="main-dados">
                  <div className="card-config">
                    <div className="group-value-limite">
                      <div className="dados-config">
                        <label htmlFor="consumo_maximo">
                          Limite padrão de consumo (kWh)
                        </label>
                        <input
                          id="consumo_maximo"
                          type="number"
                          min="0"
                          max="99999999.99"
                          step="0.01"
                          name="consumo_maximo"
                          value={perfil.consumo_maximo}
                          onChange={atualizarCampo}
                          required
                          disabled={carregando || !perfilCarregado}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  className="config-botao"
                  type="submit"
                  disabled={
                    carregando || !perfilCarregado || salvandoPerfil || !token
                  }
                >
                  {salvandoPerfil ? "Salvando..." : "Salvar configurações"}
                </button>
              </section>
            </form>

            <form className="group-config" onSubmit={salvarSenha}>
              <div className="cabecalho-dados">
                <i className="bi bi-shield-lock" />
                <div className="tema-dados">
                  <h4>Segurança e sistema</h4>
                  <span>Altere sua senha administrativa com segurança.</span>
                </div>
              </div>
              <div className="main-dados">
                <div className="card-config">
                  <div className="group-value">
                    <div className="dados-config">
                      <label htmlFor="senha_atual">Senha atual</label>
                      <input
                        id="senha_atual"
                        type="password"
                        autoComplete="current-password"
                        value={senha.senha_atual}
                        aria-invalid={erroSenha?.campo === "senha_atual"}
                        aria-describedby={
                          erroSenha?.campo === "senha_atual"
                            ? "erro-senha-atual"
                            : undefined
                        }
                        onChange={(evento) => {
                          setSenha((atual) => ({
                            ...atual,
                            senha_atual: evento.target.value,
                          }));
                          setErroSenha(null);
                        }}
                        disabled={carregando}
                      />
                      {erroSenha?.campo === "senha_atual" && (
                        <span
                          className="erro-campo-senha"
                          id="erro-senha-atual"
                          role="alert"
                        >
                          {erroSenha.texto}
                        </span>
                      )}
                    </div>
                    <div className="dados-config">
                      <label htmlFor="nova_senha">Nova senha</label>
                      <input
                        id="nova_senha"
                        type="password"
                        autoComplete="off"
                        value={senha.nova_senha}
                        aria-invalid={erroSenha?.campo === "nova_senha"}
                        aria-describedby={
                          erroSenha?.campo === "nova_senha"
                            ? "erro-nova-senha"
                            : undefined
                        }
                        onChange={(evento) => {
                          setSenha((atual) => ({
                            ...atual,
                            nova_senha: evento.target.value,
                          }));
                          setErroSenha(null);
                        }}
                        disabled={carregando}
                      />
                      {erroSenha?.campo === "nova_senha" && (
                        <span
                          className="erro-campo-senha"
                          id="erro-nova-senha"
                          role="alert"
                        >
                          {erroSenha.texto}
                        </span>
                      )}
                    </div>
                    <div className="dados-config">
                      <label htmlFor="confirmar_senha">
                        Confirmar nova senha
                      </label>
                      <input
                        id="confirmar_senha"
                        type="password"
                        autoComplete="off"
                        value={senha.confirmar_senha}
                        aria-invalid={erroSenha?.campo === "confirmar_senha"}
                        aria-describedby={
                          erroSenha?.campo === "confirmar_senha"
                            ? "erro-confirmar-senha"
                            : undefined
                        }
                        onChange={(evento) => {
                          setSenha((atual) => ({
                            ...atual,
                            confirmar_senha: evento.target.value,
                          }));
                          setErroSenha(null);
                        }}
                        disabled={carregando}
                      />
                      {erroSenha?.campo === "confirmar_senha" && (
                        <span
                          className="erro-campo-senha"
                          id="erro-confirmar-senha"
                          role="alert"
                        >
                          {erroSenha.texto}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="config-botao config-botao-secundario"
                type="submit"
                disabled={carregando || salvandoSenha || !token}
              >
                {salvandoSenha ? "Atualizando..." : "Alterar senha"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
