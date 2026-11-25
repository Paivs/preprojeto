"use client";

import { useEffect, useRef, useState } from "react";
import "./modalGerenciarCliente.css";
import { useToast } from "@/components/toast/ToastProvider";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api").replace(/\/$/, "");

export default function ModalGerenciarCliente({ cliente, modo = "gerenciar", onFechar, onAlteracao }) {
  const toast = useToast();
  const secaoCobrancaRef = useRef(null);
  const [formulario, setFormulario] = useState({ nome_empresa: "", cnpj: "", email: "" });
  const [novoPagamento, setNovoPagamento] = useState({
    valor: "",
    data_vencimento: "",
    data_pagamento: "",
    status: "nao_pago",
    forma_pagamento: "",
  });
  const [pagamentos, setPagamentos] = useState([]);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState("");
  const [statusPagamento, setStatusPagamento] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [erro, setErro] = useState("");
  const [erroPagamentos, setErroPagamentos] = useState("");

  useEffect(() => {
    if (erro) toast.error(erro);
  }, [erro, toast]);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        const token = sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const respostaCliente = await fetch(`${API_URL}/usuarios/${cliente.id_usuario}`, { headers, cache: "no-store" });
        const resultadoCliente = await respostaCliente.json().catch(() => ({}));
        if (!respostaCliente.ok) throw new Error(resultadoCliente.erro || "Não foi possível carregar o cliente.");

        if (!ativo) return;
        setFormulario({
          nome_empresa: resultadoCliente.dados.nome_empresa || "",
          cnpj: resultadoCliente.dados.cnpj || "",
          email: resultadoCliente.dados.email || "",
        });

        const respostaPagamentos = await fetch(`${API_URL}/pagamentos`, { headers, cache: "no-store" });
        const resultadoPagamentos = await respostaPagamentos.json().catch(() => ({}));
        if (!respostaPagamentos.ok) {
          setErroPagamentos("A API de pagamentos ainda não reconhece esta rota. Reinicie o backend e reabra o modal.");
          return;
        }

        const pagamentosDoCliente = (Array.isArray(resultadoPagamentos.dados) ? resultadoPagamentos.dados : [])
          .filter((pagamento) => Number(pagamento.id_usuario) === Number(cliente.id_usuario));
        setPagamentos(pagamentosDoCliente);
        if (pagamentosDoCliente.length > 0) {
          setPagamentoSelecionado(String(pagamentosDoCliente[0].id_pagamento));
          setStatusPagamento(pagamentosDoCliente[0].status);
        }
      } catch (falha) {
        if (ativo) setErro(falha.message || "Não foi possível conectar à API.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarDados();
    return () => { ativo = false; };
  }, [cliente.id_usuario]);

  useEffect(() => {
    function fecharComEscape(evento) {
      if (evento.key === "Escape" && !salvando && !registrando) {
        if (confirmarExclusao) setConfirmarExclusao(false);
        else onFechar();
      }
    }
    window.addEventListener("keydown", fecharComEscape);
    return () => window.removeEventListener("keydown", fecharComEscape);
  }, [confirmarExclusao, onFechar, registrando, salvando]);

  function alterarCampo(evento) {
    setFormulario((atual) => ({ ...atual, [evento.target.name]: evento.target.value }));
  }

  function alterarNovoPagamento(evento) {
    setNovoPagamento((atual) => ({ ...atual, [evento.target.name]: evento.target.value }));
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const token = sessionStorage.getItem("token");
      const resposta = await fetch(`${API_URL}/usuarios/${cliente.id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formulario, nivel_permissao: "cliente" }),
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(resultado.erro || "Não foi possível salvar as alterações.");
      onAlteracao("Dados do cliente atualizados com sucesso.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível conectar à API.");
      setSalvando(false);
    }
  }

  function dataParaApi(valor) {
    return valor ? String(valor).slice(0, 10) : null;
  }

  function dataHoraParaApi(valor) {
    return valor ? String(valor).replace("T", " ").slice(0, 19) : null;
  }

  function dataHoraAtual() {
    const agora = new Date();
    const doisDigitos = (valor) => String(valor).padStart(2, "0");
    return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())} ${doisDigitos(agora.getHours())}:${doisDigitos(agora.getMinutes())}:${doisDigitos(agora.getSeconds())}`;
  }

  async function atualizarStatusPagamento() {
    const pagamento = pagamentos.find((item) => String(item.id_pagamento) === pagamentoSelecionado);
    if (!pagamento) return;

    setErro("");
    setSalvando(true);
    try {
      const token = sessionStorage.getItem("token");
      const dataPagamento = statusPagamento === "pago"
        ? (pagamento.status === "pago" && pagamento.data_pagamento
          ? dataHoraParaApi(pagamento.data_pagamento)
          : dataHoraAtual())
        : null;
      const resposta = await fetch(`${API_URL}/pagamentos/${pagamento.id_pagamento}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          valor: pagamento.valor,
          data_vencimento: dataParaApi(pagamento.data_vencimento),
          data_pagamento: dataPagamento,
          status: statusPagamento,
          forma_pagamento: pagamento.forma_pagamento,
          id_usuario: pagamento.id_usuario,
        }),
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(resultado.erro || "Não foi possível atualizar o pagamento.");
      setPagamentos((atuais) => atuais.map((item) => (
        String(item.id_pagamento) === String(resultado.dados.id_pagamento) ? resultado.dados : item
      )));
      onAlteracao("Status do pagamento atualizado com sucesso.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível conectar à API.");
      setSalvando(false);
    }
  }

  async function registrarPagamento(evento) {
    evento.preventDefault();
    setErro("");
    setRegistrando(true);
    try {
      const token = sessionStorage.getItem("token");
      const resposta = await fetch(`${API_URL}/pagamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...novoPagamento,
          valor: Number(novoPagamento.valor),
          data_pagamento: novoPagamento.data_pagamento
            ? novoPagamento.data_pagamento.replace("T", " ")
            : novoPagamento.status === "pago" ? dataHoraAtual() : null,
          id_usuario: cliente.id_usuario,
        }),
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(resultado.erro || "Não foi possível registrar o pagamento.");
      onAlteracao("Pagamento cadastrado com sucesso.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível conectar à API.");
      setRegistrando(false);
    }
  }

  async function excluir() {
    setErro("");
    setSalvando(true);
    try {
      const token = sessionStorage.getItem("token");
      const resposta = await fetch(`${API_URL}/usuarios/${cliente.id_usuario}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(resultado.erro || "Não foi possível excluir o cliente.");
      setConfirmarExclusao(false);
      onAlteracao("Cliente excluído com sucesso.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível conectar à API.");
      setSalvando(false);
    }
  }

  return (
    <div
      className="gerenciar-modal-fundo"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !salvando && !registrando) onFechar();
      }}
    >
      <section className="gerenciar-modal" role="dialog" aria-modal="true" aria-labelledby="gerenciar-cliente-titulo">
        <header className="gerenciar-modal-topo">
          <div>
            <span>CLIENTE #{cliente.id_usuario}</span>
            <h2 id="gerenciar-cliente-titulo">{modo === "cobranca" ? "Gerar cobrança" : "Gerenciar cliente"}</h2>
          </div>
          <button type="button" onClick={onFechar} disabled={salvando || registrando} aria-label="Fechar modal">
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </header>

        {carregando ? (
          <p className="gerenciar-modal-mensagem">Carregando dados do cliente...</p>
        ) : (
          <>
            {modo === "gerenciar" && <form onSubmit={salvar}>
              <label>
                Nome da empresa
                <input name="nome_empresa" value={formulario.nome_empresa} onChange={alterarCampo} />
              </label>
              <label>
                CNPJ
                <input name="cnpj" value={formulario.cnpj} onChange={alterarCampo} />
              </label>
              <label>
                E-mail
                <input name="email" type="email" value={formulario.email} onChange={alterarCampo} />
              </label>
              <footer className="gerenciar-modal-acoes">
                <button type="button" className="gerenciar-excluir" onClick={() => setConfirmarExclusao(true)} disabled={salvando || registrando}>
                  Excluir cliente
                </button>
                <div>
                  <button type="button" className="gerenciar-cancelar" onClick={onFechar} disabled={salvando || registrando}>
                    Cancelar
                  </button>
                  <button type="submit" className="gerenciar-salvar" disabled={salvando || registrando}>
                    {salvando ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              </footer>
            </form>}

            {modo === "gerenciar" && <section className="gerenciar-pagamento">
              <h3>Status do pagamento</h3>
              {erroPagamentos ? (
                <p className="gerenciar-modal-mensagem">{erroPagamentos}</p>
              ) : pagamentos.length > 0 ? (
                <>
                  <label>
                    Pagamento
                    <select
                      value={pagamentoSelecionado}
                      onChange={(evento) => {
                        const idPagamento = evento.target.value;
                        setPagamentoSelecionado(idPagamento);
                        setStatusPagamento(pagamentos.find((item) => String(item.id_pagamento) === idPagamento)?.status || "nao_pago");
                      }}
                    >
                      {pagamentos.map((pagamento) => (
                        <option key={pagamento.id_pagamento} value={pagamento.id_pagamento}>
                          {`#${pagamento.id_pagamento} · ${Number(pagamento.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · venc. ${String(pagamento.data_vencimento).slice(0, 10).split("-").reverse().join("/")}`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Status
                    <select value={statusPagamento} onChange={(evento) => setStatusPagamento(evento.target.value)}>
                      <option value="pago">Pago</option>
                      <option value="nao_pago">Não pago</option>
                      <option value="atrasado">Atrasado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </label>
                  <button type="button" className="gerenciar-salvar gerenciar-atualizar-pagamento" onClick={atualizarStatusPagamento} disabled={salvando || registrando}>
                    {salvando ? "Atualizando..." : "Atualizar pagamento"}
                  </button>
                </>
              ) : (
                <p className="gerenciar-modal-mensagem">Este cliente ainda não tem pagamentos registrados.</p>
              )}
            </section>}

            {modo === "cobranca" && <section className="gerenciar-pagamento" ref={secaoCobrancaRef}>
              <h3>Gerar cobrança</h3>
              <p className="gerenciar-modal-mensagem">
                Cadastre um valor e vencimento. A cobrança ficará pendente e o cliente poderá acessar a página de pagamento ao entrar.
              </p>
              <form className="gerenciar-form-pagamento" onSubmit={registrarPagamento}>
                <label>
                  Valor
                  <input name="valor" type="number" min="0.01" step="0.01" value={novoPagamento.valor} onChange={alterarNovoPagamento} required />
                </label>
                <label>
                  Data de vencimento
                  <input name="data_vencimento" type="date" value={novoPagamento.data_vencimento} onChange={alterarNovoPagamento} required />
                </label>
                <label>
                  Forma de pagamento
                  <select name="forma_pagamento" value={novoPagamento.forma_pagamento} onChange={alterarNovoPagamento} required>
                    <option value="">Selecione</option>
                    <option value="boleto">Boleto</option>
                    <option value="pix">PIX</option>
                    <option value="cartao">Cartão</option>
                  </select>
                  {/* <input name="forma_pagamento" value={novoPagamento.forma_pagamento} onChange={alterarNovoPagamento} maxLength={50} placeholder="Ex.: Boleto ou PIX" required /> */}
                </label>
                <label>
                  Status inicial
                  <select name="status" value={novoPagamento.status} onChange={alterarNovoPagamento}>
                    <option value="nao_pago">Não pago</option>
                    <option value="pago">Pago</option>
                    <option value="atrasado">Atrasado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </label>
                {novoPagamento.status === "pago" && (
                  <label>
                    Data do pagamento
                    <input name="data_pagamento" type="datetime-local" value={novoPagamento.data_pagamento} onChange={alterarNovoPagamento} />
                  </label>
                )}
                <button type="submit" className="gerenciar-salvar gerenciar-atualizar-pagamento" disabled={registrando || salvando}>
                  {registrando ? "Gerando cobrança..." : "Gerar cobrança"}
                </button>
              </form>
            </section>}
            {erro && <p className="gerenciar-modal-erro" role="alert">{erro}</p>}
          </>
        )}
      </section>
      {confirmarExclusao && (
        <div
          className="confirmar-exclusao-fundo"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget && !salvando) setConfirmarExclusao(false);
          }}
        >
          <section className="confirmar-exclusao-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirmar-exclusao-titulo" aria-describedby="confirmar-exclusao-descricao">
            <span className="confirmar-exclusao-icone" aria-hidden="true"><i className="bi bi-exclamation-triangle" /></span>
            <h2 id="confirmar-exclusao-titulo">Excluir cliente?</h2>
            <p id="confirmar-exclusao-descricao">
              O cliente <strong>{cliente.nome_empresa || `#${cliente.id_usuario}`}</strong> será removido. Esta ação não pode ser desfeita.
            </p>
            <footer>
              <button type="button" className="confirmar-exclusao-cancelar" onClick={() => setConfirmarExclusao(false)} disabled={salvando}>
                Cancelar
              </button>
              <button type="button" className="confirmar-exclusao-botao" onClick={excluir} disabled={salvando}>
                {salvando ? "Excluindo..." : "Sim, excluir"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
