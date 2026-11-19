"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./pagamentos.css";

const metodos = [
  { id: "cartao", nome: "Cartão", icone: "bi-credit-card" },
  { id: "pix", nome: "PIX", icone: "bi-qr-code" },
  { id: "boleto", nome: "Boleto", icone: "bi-upc" },
];

export default function Pagamentos() {
  const router = useRouter();
  const [metodo, setMetodo] = useState("cartao");
  const [concluido, setConcluido] = useState(false);
  const [temaClaro, setTemaClaro] = useState(false);
  const [pagamento, setPagamento] = useState(null);

  useEffect(() => {
    const claro = document.documentElement.dataset.tema === "claro";
    setTemaClaro(claro);
    try {
      const salvo = sessionStorage.getItem("pagamentoPendente");
      if (!salvo) {
        router.replace("/login");
        return;
      }
      const cobranca = JSON.parse(salvo);
      setPagamento(cobranca);
      const forma = String(cobranca.forma_pagamento || "").toLowerCase();
      if (forma.includes("pix")) setMetodo("pix");
      else if (forma.includes("boleto")) setMetodo("boleto");
    } catch {
      sessionStorage.removeItem("pagamentoPendente");
      router.replace("/login");
    }
  }, [router]);

  function alternarTema() {
    const novoTema = temaClaro ? "escuro" : "claro";
    if (novoTema === "claro") document.documentElement.dataset.tema = "claro";
    else delete document.documentElement.dataset.tema;
    localStorage.setItem("volthouse-tema", novoTema);
    setTemaClaro(novoTema === "claro");
  }

  function pagar(evento) {
    evento.preventDefault();
    setConcluido(true);
  }

  function formatarData(data) {
    const partes = String(data || "")
      .slice(0, 10)
      .match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : "—";
  }

  if (!pagamento) {
    return (
      <main className="pagamento-page">
        <p className="pagamento-carregando">Carregando sua cobrança…</p>
      </main>
    );
  }

  const valorFormatado = Number(pagamento.valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <main className="pagamento-page">
      <nav className="pagamento-topbar" aria-label="Navegação da página">
        <a
          className="pagamento-marca"
          href="/"
          aria-label="VoltHouse, página inicial"
        >
          <i className="bi bi-lightning-charge-fill" /> VoltHouse
        </a>
        <div className="pagamento-acoes-topo">
          <button
            className="pagamento-tema"
            type="button"
            onClick={alternarTema}
            aria-label={`Ativar tema ${temaClaro ? "escuro" : "claro"}`}
            title="Trocar tema"
          >
            <i className={`bi ${temaClaro ? "bi-moon-stars" : "bi-sun"}`} />{" "}
            <span>{temaClaro ? "Tema escuro" : "Tema claro"}</span>
          </button>
          <a className="pagamento-voltar" href="/">
            <i className="bi bi-arrow-left" /> <span>Início</span>
          </a>
        </div>
      </nav>

      <section className="pagamento-card" aria-labelledby="pagamento-titulo">
        <header className="pagamento-cabecalho">
          <img
            src="/images/logo-dark.png"
            className="logo-pagamento"
            alt="VoltHouse"
          />
          <h1 id="pagamento-titulo">Finalizar pagamento</h1>
          <p>Preencha os dados para concluir seu pagamento</p>
        </header>

        <section className="pagamento-resumo" aria-label="Resumo da fatura">
          <span className="pagamento-eyebrow">Resumo da fatura</span>
          <h2>Consumo de energia</h2>
          <div className="pagamento-detalhes">
            <div>
              <span>Número da fatura</span>
              <strong>
                #VH-{String(pagamento.id_pagamento).padStart(6, "0")}
              </strong>
            </div>
            <div>
              <span>Vencimento</span>
              <strong>{formatarData(pagamento.data_vencimento)}</strong>
            </div>
          </div>
          <div className="pagamento-total">
            <span>Total a pagar</span>
            <strong>{valorFormatado}</strong>
          </div>
          <div className={`pagamento-status status-${pagamento.status}`}>
            <span aria-hidden="true" />{" "}
            {pagamento.status === "atrasado"
              ? "Pagamento em atraso"
              : "Pagamento pendente"}
          </div>
        </section>

        <form onSubmit={pagar}>
          <fieldset className="pagamento-opcoes">
            <legend>Forma de pagamento</legend>
            <div className="pagamento-metodos">
              {metodos.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={metodo === item.id ? "metodo ativo" : "metodo"}
                  onClick={() => {
                    setMetodo(item.id);
                    setConcluido(false);
                  }}
                  aria-pressed={metodo === item.id}
                >
                  <i className={`bi ${item.icone}`} aria-hidden="true" />
                  {item.nome}
                </button>
              ))}
            </div>
          </fieldset>

          {metodo === "cartao" && (
            <div className="pagamento-form-cartao">
              <div className="pagamento-subtitulo">
                <h2>Cartão de crédito</h2>
                <div className="bandeiras" aria-label="Visa, Mastercard e Elo">
                  <span>VISA</span>
                  <span className="mastercard">●●</span>
                  <span>elo</span>
                </div>
              </div>
              <label>
                Nome impresso no cartão
                <input
                  autoComplete="cc-name"
                  name="nome"
                  placeholder="Como aparece no cartão"
                  required
                />
              </label>
              <label>
                Número do cartão
                <div className="campo-icone">
                  <input
                    autoComplete="cc-number"
                    name="numero"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    minLength={12}
                    required
                  />
                  <i className="bi bi-credit-card" />
                </div>
              </label>
              <div className="pagamento-linha">
                <label>
                  Validade
                  <input
                    autoComplete="cc-exp"
                    name="validade"
                    placeholder="MM/AA"
                    required
                  />
                </label>
                <label>
                  CVV
                  <div className="campo-icone">
                    <input
                      autoComplete="cc-csc"
                      name="cvv"
                      inputMode="numeric"
                      placeholder="123"
                      minLength={3}
                      required
                    />
                    <i className="bi bi-question-circle" />
                  </div>
                </label>
              </div>
            </div>
          )}

          {metodo === "pix" && (
            <div className="pagamento-instrucao">
              <i className="bi bi-qr-code" />
              <div>
                <strong>Pagamento via PIX</strong>
                <span>
                  Um código PIX será gerado para você concluir o pagamento com
                  segurança.
                </span>
              </div>
            </div>
          )}
          {metodo === "boleto" && (
            <div className="pagamento-instrucao">
              <i className="bi bi-file-earmark-text" />
              <div>
                <strong>Pagamento via boleto</strong>
                <span>
                  O boleto será gerado após confirmar. A compensação pode levar
                  até 3 dias úteis.
                </span>
              </div>
            </div>
          )}

          {concluido && (
            <p className="pagamento-sucesso" role="status">
              <i className="bi bi-info-circle-fill" /> Este ambiente ainda não
              processa cobranças. Nenhum pagamento foi realizado.
            </p>
          )}
          <button className="pagamento-submit" type="submit">
            <i className="bi bi-lock-fill" />{" "}
            {metodo === "cartao"
              ? "Pagar agora"
              : metodo === "pix"
              ? "Gerar código PIX"
              : "Gerar boleto"}
          </button>
          <p className="pagamento-seguranca">
            <i className="bi bi-lock-fill" /> Seus dados estão protegidos
          </p>
        </form>
      </section>
    </main>
  );
}
