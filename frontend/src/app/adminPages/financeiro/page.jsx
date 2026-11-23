"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import CardIndicador from "@/components/CardIndicador";
import { API_BASE_URL } from "@/lib/api";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./financeiro.css";

const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });

export default function Financeiro() {
  const [resumo, setResumo] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [atualizando, setAtualizando] = useState(false);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const requisicaoAtiva = useRef(false);

  const carregarResumo = useCallback(async () => {
    if (requisicaoAtiva.current) return;
    requisicaoAtiva.current = true;
    setAtualizando(true);

    try {
      const token = sessionStorage.getItem("token");
      if (!token)
        throw new Error(
          "Sua sess\u00e3o expirou. Entre novamente para ver os dados financeiros.",
        );

      const resposta = await fetch(
        `${API_BASE_URL}/financeiro/resumo?_atualizacao=${Date.now()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        },
      );
      const resultado = await resposta.json();
      if (!resposta.ok)
        throw new Error(
          resultado.erro ||
            "N\u00e3o foi poss\u00edvel carregar o resumo financeiro.",
        );

      setResumo(resultado.dados);
      setAtualizadoEm(new Date());
      setErro("");
    } catch (erroRequisicao) {
      setErro(
        erroRequisicao.message ||
          "N\u00e3o foi poss\u00edvel conectar ao servidor.",
      );
    } finally {
      requisicaoAtiva.current = false;
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarResumo();
    const atualizarAoVoltar = () => {
      if (document.visibilityState === "visible") carregarResumo();
    };
    const intervalo = window.setInterval(atualizarAoVoltar, 5000);
    document.addEventListener("visibilitychange", atualizarAoVoltar);
    window.addEventListener("focus", atualizarAoVoltar);

    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", atualizarAoVoltar);
      window.removeEventListener("focus", atualizarAoVoltar);
    };
  }, [carregarResumo]);
  const percentual = resumo?.percentualRecebido ?? 0;
  const variacao = resumo?.variacaoMensal;
  const dadosGrafico = [
    { rotulo: "Mês anterior", valor: Number(resumo?.recebidoMesAnterior || 0) },
    { rotulo: "Este mês", valor: Number(resumo?.recebidoMes || 0) },
  ];
  const maiorValor = Math.max(...dadosGrafico.map(({ valor }) => valor), 1);
  const textoVariacao =
    variacao === null || variacao === undefined
      ? "Sem dados do mês anterior para comparação"
      : `${variacao > 0 ? "+" : ""}${variacao.toLocaleString("pt-BR")}% em relação ao mês anterior`;

  return (
    <div className=" pagina financeiro-page">
      <Sidebar />
      <div className="conteudo-principal">
        <Header tipoUsuario="admin" />
        <main className="conteudo-pagina">
          <div className="cabecalho-pagina">
            <div>
              <span className="cabecalho-etiqueta">VISÃO GERAL</span>
              <h1>Financeiro</h1>
              <p>Acompanhe faturamento, recebimentos e pagamentos pendentes.</p>
            </div>
          </div>
          {erro && (
            <p className="financeiro-feedback erro" role="alert">
              {erro}
            </p>
          )}
          {carregando && (
            <p className="financeiro-feedback" role="status">
              Carregando resumo financeiro...
            </p>
          )}

          {!carregando && (
            <div className="financeiro-atualizacao">
              <span>
                {atualizadoEm
                  ? `Atualizado \u00e0s ${atualizadoEm.toLocaleTimeString("pt-BR")}`
                  : "Aguardando atualiza\u00e7\u00e3o"}
              </span>
              <button
                type="button"
                onClick={carregarResumo}
                disabled={atualizando}
              >
                <i
                  className={`bi ${atualizando ? "bi-arrow-repeat" : "bi-arrow-clockwise"}`}
                  aria-hidden="true"
                />
                {atualizando ? "Atualizando..." : "Atualizar agora"}
              </button>
            </div>
          )}

          <div className="topo-pag">
            <CardIndicador
              titulo="Total Recebido"
              valor={resumo ? formatarMoeda(resumo.totalRecebido) : "—"}
              icone="bi bi-cash-stack"
              numero="01"
            />
            <CardIndicador
              titulo="Total Faturado"
              valor={resumo ? formatarMoeda(resumo.totalFaturado) : "—"}
              icone="bi bi-wallet2"
              numero="02"
            />
            <CardIndicador
              titulo="Qtd. Clientes"
              valor={
                resumo
                  ? Number(resumo.quantidadeClientes).toLocaleString("pt-BR")
                  : "—"
              }
              icone="bi bi-briefcase-fill"
              numero="03"
            />
            <CardIndicador
              titulo="Recebimentos"
              valor={
                resumo
                  ? Number(resumo.quantidadeRecebimentos).toLocaleString(
                      "pt-BR",
                    )
                  : "—"
              }
              icone="bi bi-person-workspace"
              numero="04"
            />
          </div>

          <div className="baixo-pag">
            <section className="card financeiro-card financeiro-resumo-card">
              <h2>Resumo Financeiro</h2>
              <div className="info">
                <h3>
                  {resumo ? formatarMoeda(resumo.totalRecebido) : "—"}{" "}
                  <span className="simple-text">Total recebido</span>
                </h3>
                <p className="box-pagamentos">
                  <i className="bi bi-info-circle-fill" />{" "}
                  {resumo?.pagamentosPendentes ?? 0} pagamentos pendentes
                </p>
              </div>
              <div className="flex-p">
                <p className="box-barra">
                  <span className="flex-barra">
                    Total recebido{" "}
                    <strong className="flex-end">{percentual}%</strong>
                  </span>
                  <span
                    className="barra"
                    style={{ "--percentual-recebido": `${percentual}%` }}
                  />
                </p>
              </div>
            </section>

            <section className="card financeiro-card financeiro-analysis-card">
              <h2>
                Análise Financeira <i className="bi bi-graph-up-arrow" />
              </h2>
              <hr />
              <p className="insight">
                {resumo
                  ? `Há ${resumo.pagamentosPendentes} pagamento(s) pendente(s). ${variacao === null ? "Ainda não há dados suficientes para comparar o recebimento mensal." : `O recebimento deste mês está ${variacao >= 0 ? "acima" : "abaixo"} do mês anterior em ${Math.abs(variacao).toLocaleString("pt-BR")}%.`}`
                  : "Os indicadores financeiros serão exibidos assim que os dados forem carregados."}
              </p>
            </section>
          </div>

          <section
            className="financeiro-grafico card financeiro-card"
            aria-labelledby="titulo-grafico-financeiro"
          >
            <div className="financeiro-grafico-cabecalho">
              <div>
                <h2 id="titulo-grafico-financeiro">Recebimentos mensais</h2>
                <p>{textoVariacao}</p>
              </div>
              <span className="financeiro-grafico-unidade">BRL</span>
            </div>
            {resumo ? (
              <div
                className="financeiro-grafico-barras"
                role="img"
                aria-label={`Recebimentos: mês anterior ${formatarMoeda(dadosGrafico[0].valor)}; este mês ${formatarMoeda(dadosGrafico[1].valor)}`}
              >
                {dadosGrafico.map(({ rotulo, valor }) => (
                  <div className="financeiro-grafico-coluna" key={rotulo}>
                    <span className="financeiro-grafico-rotulo">{rotulo}</span>
                    <strong>{formatarMoeda(valor)}</strong>
                    <div
                      className="financeiro-grafico-trilho"
                      aria-hidden="true"
                    >
                      <span
                        style={{ width: `${(valor / maiorValor) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="financeiro-grafico-vazio">
                {carregando
                  ? "Carregando dados do gráfico..."
                  : "Não foi possível carregar os dados do gráfico."}
              </p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
