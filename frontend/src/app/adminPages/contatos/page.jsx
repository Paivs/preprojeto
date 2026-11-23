"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import ModalNovoCliente from "@/components/clientes/ModalNovoCliente";
import "./contatos.css";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
).replace(/\/$/, "");

const SITUACOES = {
  pendente: { texto: "Pendente", classe: "pendente" },
  ignorado: { texto: "Ignorado", classe: "ignorado" },
  convertido: { texto: "Cliente cadastrado", classe: "convertido" },
};
const ITENS_POR_PAGINA = 5;

function iniciais(nome = "") {
  return (
    nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toLocaleUpperCase("pt-BR") || "?"
  );
}

export default function Contatos() {
  const [contatos, setContatos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [atualizandoId, setAtualizandoId] = useState(null);
  const [contatoSelecionado, setContatoSelecionado] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const totalPaginas = Math.ceil(contatos.length / ITENS_POR_PAGINA);
  const contatosDaPagina = contatos.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  useEffect(() => {
    if (paginaAtual > Math.max(totalPaginas, 1)) {
      setPaginaAtual(Math.max(totalPaginas, 1));
    }
  }, [paginaAtual, totalPaginas]);

  const carregarContatos = useCallback(async () => {
    setCarregando(true);
    setErro("");

    const token = sessionStorage.getItem("token");
    if (!token) {
      setErro(
        "Sua sessão não foi encontrada. Entre novamente como administrador."
      );
      setContatos([]);
      setCarregando(false);
      return;
    }

    try {
      const resposta = await fetch(`${API_URL}/contato`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const resultado = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        if (resposta.status === 401 || resposta.status === 403) {
          throw new Error(
            "Acesso não autorizado. Entre novamente com uma conta administradora."
          );
        }
        throw new Error(
          resultado.erro || "Não foi possível carregar os pedidos de contato."
        );
      }

      setContatos(Array.isArray(resultado.dados) ? resultado.dados : []);
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message || "Não foi possível conectar à API.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarContatos();
  }, [carregarContatos]);

  async function salvarSituacao(contato, situacao) {
    const token = sessionStorage.getItem("token");
    const resposta = await fetch(
      `${API_URL}/contato/${contato.id_contato}/situacao`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ situacao }),
      }
    );
    const resultado = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(resultado.erro || "Não foi possível atualizar o pedido.");
    }

    setContatos((atuais) =>
      atuais.map((item) =>
        item.id_contato === contato.id_contato ? { ...item, situacao } : item
      )
    );
  }

  async function ignorarPedido(contato) {
    setAtualizandoId(contato.id_contato);
    setErro("");
    setAviso("");
    try {
      await salvarSituacao(contato, "ignorado");
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message || "Não foi possível atualizar o pedido.");
    } finally {
      setAtualizandoId(null);
    }
  }

  async function concluirCadastro(contato) {
    let atualizado = false;
    setAviso("");
    try {
      await salvarSituacao(contato, "convertido");
      atualizado = true;
    } catch {
      setAviso(
        "Cliente cadastrado, mas não foi possível atualizar o estado deste pedido."
      );
    }

    setContatoSelecionado(null);
    await carregarContatos();
    if (!atualizado) {
      setAviso(
        "Cliente cadastrado, mas não foi possível atualizar o estado deste pedido."
      );
    }
  }

  return (
    <div className="pagina">
      <Sidebar />

      <div className="conteudo-principal">
        <Header tipoUsuario="admin" />

        <main className="conteudo-pagina">
          <div className="cabecalho-pagina">
            <div>
              <span className="cabecalho-etiqueta">SOLICITAÇÕES RECEBIDAS</span>
              <h1>Pedidos de contato</h1>
              <p>Consulte as mensagens e encaminhe cada pedido recebido.</p>
            </div>
          </div>

          <section className="container-tabela contatos-tabela">
            <div className="cabecalho-table">
              <div className="cabecalho-left">
                <h2>Solicitações de contato</h2>
                <span>{contatos.length} registros recebidos</span>
              </div>
            </div>

            {erro && (
              <p className="mensagem-tabela erro-tabela" role="alert">
                {erro}
              </p>
            )}
            {aviso && (
              <p className="contatos-aviso" role="status">
                {aviso}
              </p>
            )}

            <div className="tabela-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>NOME</th>
                    <th>E-MAIL</th>
                    <th>CNPJ</th>
                    <th>TELEFONE</th>
                    <th>MENSAGEM</th>
                    <th>SITUAÇÃO</th>
                    <th>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {carregando ? (
                    <tr>
                      <td colSpan={7} className="mensagem-tabela">
                        Carregando pedidos...
                      </td>
                    </tr>
                  ) : contatos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="mensagem-tabela">
                        {erro ? "" : "Nenhum pedido de contato recebido."}
                      </td>
                    </tr>
                  ) : (
                    contatosDaPagina.map((contato) => {
                      const situacao =
                        SITUACOES[contato.situacao] || SITUACOES.pendente;
                      return (
                        <tr key={contato.id_contato}>
                          <td>
                            <div className="contato-nome">
                              <div className="avatar-sigla">
                                {iniciais(contato.nome)}
                              </div>
                              <strong>{contato.nome}</strong>
                            </div>
                          </td>
                          <td>{contato.email}</td>
                          <td>{contato.cnpj || "—"}</td>
                          <td>{contato.telefone || "—"}</td>
                          <td className="contato-mensagem">
                            {contato.mensagem}
                          </td>
                          <td>
                            <span
                              className={`contato-status ${situacao.classe}`}
                            >
                              {situacao.texto}
                            </span>
                          </td>
                          <td>
                            {contato.situacao === "pendente" ? (
                              <div className="contato-acoes">
                                <button
                                  type="button"
                                  className="btn-adicionar-contato"
                                  onClick={() => setContatoSelecionado(contato)}
                                  aria-label={`Adicionar ${contato.nome} como cliente`}
                                >
                                  <i
                                    className="bi bi-person-plus"
                                    aria-hidden="true"
                                  />
                                  Adicionar cliente
                                </button>
                                <button
                                  type="button"
                                  className="btn-ignorar-contato"
                                  onClick={() => ignorarPedido(contato)}
                                  disabled={
                                    atualizandoId === contato.id_contato
                                  }
                                  aria-label={`Ignorar pedido de ${contato.nome}`}
                                >
                                  <i
                                    className="bi bi-archive"
                                    aria-hidden="true"
                                  />
                                  {atualizandoId === contato.id_contato
                                    ? "Atualizando..."
                                    : "Ignorar pedido"}
                                </button>
                              </div>
                            ) : (
                              <span className="contato-acao-concluida">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {!carregando && totalPaginas > 1 && (
              <nav
                className="contatos-paginacao"
                aria-label="Paginação dos pedidos de contato"
              >
                <button
                  type="button"
                  onClick={() =>
                    setPaginaAtual((pagina) => Math.max(1, pagina - 1))
                  }
                  disabled={paginaAtual === 1}
                >
                  Anterior
                </button>
                <span aria-live="polite">
                  Página {paginaAtual} de {totalPaginas}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPaginaAtual((pagina) =>
                      Math.min(totalPaginas, pagina + 1)
                    )
                  }
                  disabled={paginaAtual === totalPaginas}
                >
                  Próxima
                </button>
              </nav>
            )}
          </section>
        </main>
      </div>

      {contatoSelecionado && (
        <ModalNovoCliente
          key={contatoSelecionado.id_contato}
          contato={contatoSelecionado}
          onFechar={() => setContatoSelecionado(null)}
          onSucesso={() => concluirCadastro(contatoSelecionado)}
        />
      )}
    </div>
  );
}
