"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import ModalNovoCliente from "@/components/clientes/ModalNovoCliente";
import ModalGerenciarCliente from "@/components/clientes/ModalGerenciarCliente";
import { useToast } from "@/components/toast/ToastProvider";
import "./clientes.css";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
).replace(/\/$/, "");
const LIMITE_POR_PAGINA = 5;

function formatarNumero(valor) {
  const numero = Number(valor);
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(
    Number.isFinite(numero) ? numero : 0
  );
}

function obterStatus(status) {
  const statusMapeados = {
    pago: { texto: "Pago", classe: "pago" },
    nao_pago: { texto: "Não pago", classe: "nao-pago" },
    atrasado: { texto: "Atrasado", classe: "atrasado" },
    cancelado: { texto: "Cancelado", classe: "cancelado" },
    "Sem pagamentos": { texto: "Sem pagamentos", classe: "sem-pagamentos" },
  };

  return (
    statusMapeados[status] || {
      texto: status || "Sem pagamentos",
      classe: "sem-pagamentos",
    }
  );
}

function iniciaisEmpresa(nome = "") {
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

export default function Clientes() {
  const toast = useToast();
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteParaGerenciar, setClienteParaGerenciar] = useState(null);
  const [modoModal, setModoModal] = useState("gerenciar");
  const [clientes, setClientes] = useState([]);
  const [buscaInput, setBuscaInput] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [pagina, setPagina] = useState(1);
  const [paginacao, setPaginacao] = useState({ total: 0, totalPaginas: 0 });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregarClientes = useCallback(async (paginaSolicitada, termoBusca) => {
    setCarregando(true);
    setErro("");

    const token = sessionStorage.getItem("token");
    if (!token) {
      setErro(
        "Sua sessão não foi encontrada. Entre novamente como administrador."
      );
      setClientes([]);
      setPaginacao({ total: 0, totalPaginas: 0 });
      setCarregando(false);
      return;
    }

    const parametros = new URLSearchParams({
      pagina: String(paginaSolicitada),
      limite: String(LIMITE_POR_PAGINA),
      nivel_permissao: "cliente",
    });
    if (termoBusca) parametros.set("busca", termoBusca);

    try {
      const resposta = await fetch(
        `${API_URL}/usuarios?${parametros.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      const resultado = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        if (resposta.status === 401 || resposta.status === 403) {
          throw new Error(
            "Acesso não autorizado. Entre novamente com uma conta administradora."
          );
        }
        throw new Error(
          resultado.erro || "Não foi possível carregar os clientes."
        );
      }

      const dados = Array.isArray(resultado.dados) ? resultado.dados : [];
      setClientes(dados);
      setPagina(resultado.paginacao?.pagina || paginaSolicitada);
      setPaginacao({
        total: Number(resultado.paginacao?.total) || 0,
        totalPaginas: Number(resultado.paginacao?.totalPaginas) || 0,
      });
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message || "Não foi possível conectar à API.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarClientes(1, "");
  }, [carregarClientes]);

  function pesquisar(evento) {
    evento.preventDefault();
    const termo = buscaInput.trim();
    setBuscaAplicada(termo);
    carregarClientes(1, termo);
  }

  function irParaPagina(novaPagina) {
    const totalPaginas = Math.max(1, paginacao.totalPaginas);
    if (novaPagina < 1 || novaPagina > totalPaginas || novaPagina === pagina)
      return;
    carregarClientes(novaPagina, buscaAplicada);
  }

  const totalEquipamentos = clientes.reduce(
    (total, cliente) => total + (Number(cliente.qtd_equipamentos) || 0),
    0
  );
  const primeiraLinha =
    paginacao.total === 0 ? 0 : (pagina - 1) * LIMITE_POR_PAGINA + 1;
  const ultimaLinha = Math.min(pagina * LIMITE_POR_PAGINA, paginacao.total);

  return (
    <div className="pagina">
      <Sidebar />

      <div className="conteudo-principal">
        <Header tipoUsuario="admin" />

        <main className="conteudo-pagina">
          <div className="cabecalho-pagina">
            <div>
              <span className="cabecalho-etiqueta">CONTROLE DE CLIENTES</span>
              <h1>Clientes</h1>
              <p>
                Consulte empresas, equipamentos, consumo e situação dos
                pagamentos.
              </p>
            </div>
            <div className="btn-adicionar">
              <button type="button" onClick={() => setModalAberto(true)}>
                <i className="bi bi-plus" aria-hidden="true"></i>
                Adicionar cliente
              </button>
            </div>
          </div>

          <div className="grid-kpi">
            <div className="kpi-group">
              <div className="cabecalho-kpi">
                <span>Clientes encontrados</span>
                <i className="bi bi-people" aria-hidden="true"></i>
              </div>
              <div className="main-kpi">
                <h3>{formatarNumero(paginacao.total)}</h3>
              </div>
              <div className="footer-kpi">
                <span>Resultado da consulta atual</span>
              </div>
            </div>

            <div className="kpi-group">
              <div className="cabecalho-kpi">
                <span>Equipamentos na página</span>
                <i className="bi bi-lightning-charge" aria-hidden="true"></i>
              </div>
              <div className="main-kpi">
                <h3>{formatarNumero(totalEquipamentos)}</h3>
              </div>
              <div className="footer-kpi">
                <span>Somatório dos clientes exibidos</span>
              </div>
            </div>
          </div>

          <section id="table" className="container-tabela">
            <div className="cabecalho-table">
              <div className="cabecalho-left">
                <h2>Base de clientes</h2>
                <span>Consulte os clientes cadastrados.</span>
              </div>
              <div className="cabecalho-right">
                <form className="barra-pesquisa" onSubmit={pesquisar}>
                  <i
                    className="bi bi-search icone-busca"
                    aria-hidden="true"
                  ></i>
                  <input
                    type="search"
                    placeholder="Buscar empresa..."
                    aria-label="Buscar clientes por empresa, e-mail ou CNPJ"
                    value={buscaInput}
                    onChange={(evento) => setBuscaInput(evento.target.value)}
                  />
                  <button type="submit" aria-label="Pesquisar clientes">
                    Buscar
                  </button>
                </form>
              </div>
            </div>

            {erro && (
              <p className="mensagem-tabela erro-tabela" role="alert">
                {erro}
              </p>
            )}

            <div className="tabela-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>EMPRESA</th>
                    <th>DISPOSITIVOS</th>
                    <th>CONSUMO TOTAL</th>
                    <th>STATUS DO PAGAMENTO</th>
                    <th>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {carregando ? (
                    <tr>
                      <td colSpan={5} className="mensagem-tabela">
                        Carregando clientes...
                      </td>
                    </tr>
                  ) : clientes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="mensagem-tabela">
                        {erro ? "" : "Nenhum cliente encontrado."}
                      </td>
                    </tr>
                  ) : (
                    clientes.map((cliente) => {
                      const status = obterStatus(cliente.status_cliente);
                      return (
                        <tr key={cliente.id_usuario}>
                          <td>
                            <div className="info-empresa">
                              <div className="avatar-sigla">
                                {iniciaisEmpresa(cliente.nome_empresa)}
                              </div>
                              <div>
                                <strong>{cliente.nome_empresa}</strong>
                                <p>{cliente.email}</p>
                                <small>CNPJ: {cliente.cnpj}</small>
                              </div>
                            </div>
                          </td>
                          <td>{formatarNumero(cliente.qtd_equipamentos)}</td>
                          <td>
                            <strong>
                              {formatarNumero(cliente.consumo_total_energia)}{" "}
                              kWh
                            </strong>
                          </td>
                          <td>
                            <span className={`badge-status ${status.classe}`}>
                              <span aria-hidden="true">●</span> {status.texto}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-gerenciar-cliente"
                              onClick={() => {
                                setModoModal("gerenciar");
                                setClienteParaGerenciar(cliente);
                              }}
                              aria-label={`Editar ${cliente.nome_empresa} e consultar seus pagamentos`}
                            >
                              <i
                                className="bi bi-pencil-square"
                                aria-hidden="true"
                              ></i>
                              Gerenciar
                            </button>
                            <button
                              type="button"
                              className="btn-cobrar-cliente"
                              onClick={() => {
                                setModoModal("cobranca");
                                setClienteParaGerenciar(cliente);
                              }}
                              aria-label={`Gerar cobrança para ${cliente.nome_empresa}`}
                            >
                              <i className="bi bi-receipt" aria-hidden="true"></i>
                              Gerar cobrança
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="rodape-tabela">
              <p>
                Exibindo {primeiraLinha}–{ultimaLinha} de{" "}
                {formatarNumero(paginacao.total)} clientes
              </p>
              <div className="paginacao">
                <button
                  type="button"
                  className="btn-paginacao"
                  onClick={() => irParaPagina(pagina - 1)}
                  disabled={carregando || pagina <= 1}
                >
                  Anterior
                </button>
                <span className="pagina-atual">
                  Página {pagina} de {Math.max(1, paginacao.totalPaginas)}
                </span>
                <button
                  type="button"
                  className="btn-paginacao"
                  onClick={() => irParaPagina(pagina + 1)}
                  disabled={carregando || pagina >= paginacao.totalPaginas}
                >
                  Próxima
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
      {modalAberto && (
        <ModalNovoCliente
          onFechar={() => setModalAberto(false)}
          onSucesso={() => {
            setModalAberto(false);
            carregarClientes(1, buscaAplicada);
          }}
        />
      )}
      {clienteParaGerenciar && (
        <ModalGerenciarCliente
          cliente={clienteParaGerenciar}
          modo={modoModal}
          onFechar={() => setClienteParaGerenciar(null)}
          onAlteracao={(mensagem) => {
            if (mensagem) toast.success(mensagem);
            setClienteParaGerenciar(null);
            carregarClientes(pagina, buscaAplicada);
          }}
        />
      )}
    </div>
  );
}
