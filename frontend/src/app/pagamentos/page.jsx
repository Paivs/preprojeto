"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { obterTokenSessao } from "@/lib/session";
import "./pagamentos.css";

const metodos = [
  { id: "cartao", nome: "Cartão", icone: "bi-credit-card" },
  { id: "pix", nome: "PIX", icone: "bi-qr-code" },
  { id: "boleto", nome: "Boleto", icone: "bi-upc" },
];

function QrCodeIlustrativo() {
  const tamanho = 29;
  const celulas = [];
  for (let y = 0; y < tamanho; y += 1) {
    for (let x = 0; x < tamanho; x += 1) {
      const cantos = [
        [0, 0],
        [tamanho - 7, 0],
        [0, tamanho - 7],
      ];
      const canto = cantos.find(
        ([cx, cy]) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7,
      );
      let preenchida;
      if (canto) {
        const dx = x - canto[0];
        const dy = y - canto[1];
        preenchida =
          dx === 0 ||
          dx === 6 ||
          dy === 0 ||
          dy === 6 ||
          (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
      } else {
        preenchida = (x * 13 + y * 7 + x * y * 3) % 11 < 5;
      }
      if (preenchida)
        celulas.push(
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />,
        );
    }
  }
  return (
    <svg
      className="pagamento-qr-svg"
      viewBox={`-2 -2 ${tamanho + 4} ${tamanho + 4}`}
      role="img"
      aria-label="QR code ilustrativo, não escaneável"
    >
      <rect
        x="-2"
        y="-2"
        width={tamanho + 4}
        height={tamanho + 4}
        rx="1"
        className="qr-fundo"
      />
      <g className="qr-celulas">{celulas}</g>
    </svg>
  );
}

function CodigoBarrasIlustrativo() {
  const barras = Array.from({ length: 72 }, (_, indice) => ({
    x: indice * 3,
    largura: ((indice * 7 + indice * indice) % 3) + 1,
    visivel: indice % 4 !== 1,
  }));
  return (
    <svg
      className="pagamento-barras-svg"
      viewBox="0 0 216 58"
      role="img"
      aria-label="Código de barras ilustrativo"
    >
      <rect width="216" height="58" fill="white" />
      {barras
        .filter((barra) => barra.visivel)
        .map((barra, indice) => (
          <rect
            key={indice}
            x={barra.x}
            y="2"
            width={barra.largura}
            height="52"
            fill="#182033"
          />
        ))}
    </svg>
  );
}

export default function Pagamentos() {
  const router = useRouter();
  const [metodo, setMetodo] = useState("cartao");
  const [cobrancaGerada, setCobrancaGerada] = useState(false);
  const [temaClaro, setTemaClaro] = useState(false);
  const [pagamento, setPagamento] = useState(null);
  const [erroPagamento, setErroPagamento] = useState("");
  const [salvando, setSalvando] = useState(false);

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

  async function pagar(evento) {
    evento.preventDefault();
    if ((metodo === "pix" || metodo === "boleto") && !cobrancaGerada) {
      setCobrancaGerada(true);
      return;
    }
    setErroPagamento("");
    setSalvando(true);
    try {
      const token = obterTokenSessao();
      if (!token) {
        router.replace("/login");
        return;
      }
      const resposta = await fetch(
        `${API_BASE_URL}/auth/pagamentos/${pagamento.id_pagamento}/confirmar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ forma_pagamento: metodo }),
        },
      );
      const resultado = await resposta.json();
      if (!resposta.ok)
        throw new Error(
          resultado.erro || "Não foi possível registrar o pagamento.",
        );
      sessionStorage.removeItem("pagamentoPendente");
      router.push("/userPages/dashboard");
    } catch (erro) {
      setErroPagamento(
        erro.message || "Não foi possível registrar o pagamento.",
      );
    } finally {
      setSalvando(false);
    }
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
                    setCobrancaGerada(false);
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

          {metodo === "pix" &&
            (cobrancaGerada ? (
              <div className="pagamento-gerado">
                <QrCodeIlustrativo />
                <strong>QR code para pagamento</strong>
              </div>
            ) : (
              <div className="pagamento-instrucao">
                <i className="bi bi-qr-code" />
                <div>
                  <strong>Pagamento via PIX</strong>
                  <span>
                    Gerar um QR code
                  </span>
                </div>
              </div>
            ))}
          {metodo === "boleto" &&
            (cobrancaGerada ? (
              <div className="pagamento-gerado pagamento-boleto-gerado">
                <CodigoBarrasIlustrativo />
                <strong>Boleto</strong>
                <span>
                  00000.00000 00000.000000 00000.000000 0 00000000000000
                </span>
                <small>
                  Esta linha digitável é fictícia e não pode ser paga.
                </small>
              </div>
            ) : (
              <div className="pagamento-instrucao">
                <i className="bi bi-file-earmark-text" />
                <div>
                  <strong>Pagamento via boleto</strong>
                  <span>
                    Gerar um boleto
                  </span>
                </div>
              </div>
            ))}
          {erroPagamento && (
            <p role="alert" className="pagamento-erro">
              {erroPagamento}
            </p>
          )}
          <button
            className="pagamento-submit"
            type="submit"
            disabled={salvando}
          >
            <i
              className={`bi ${
                metodo !== "cartao" && !cobrancaGerada
                  ? "bi-qr-code"
                  : "bi-arrow-right-circle"
              }`}
            />{" "}
            {salvando
              ? "Registrando pagamento..."
              : metodo === "cartao" || cobrancaGerada
                ? "Pagar e ir para o dashboard"
                : metodo === "pix"
                  ? "Gerar QR code "
                  : "Gerar boleto "}
          </button>
          <p className="pagamento-seguranca">
            <i className="bi bi-lock-fill" /> Seus dados estão protegidos
          </p>
        </form>
      </section>
    </main>
  );
}
