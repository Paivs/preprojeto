"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import { API_BASE_URL } from "@/lib/api";
import "./userDashboard.css";

const CORES_GRAFICO = ["#914ff0", "#4b70fc", "#e8b547", "#39a981", "#e77f5d"];

function numero(valor) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : 0;
}

function formatarNumero(valor) {
  return numero(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatarMoeda(valor) {
  return numero(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function obterFaixa(equipamento) {
  const minimo = equipamento.consumo_minimo == null || equipamento.consumo_minimo === ""
    ? null
    : Number(equipamento.consumo_minimo);
  const maximo = equipamento.consumo_maximo == null || equipamento.consumo_maximo === ""
    ? null
    : Number(equipamento.consumo_maximo);
  const minimoValido = Number.isFinite(minimo);
  const maximoValido = Number.isFinite(maximo);

  if (!minimoValido && !maximoValido) return "Não informado";
  if (!minimoValido) return `Até ${formatarNumero(maximo)} kWh`;
  if (!maximoValido) return `A partir de ${formatarNumero(minimo)} kWh`;
  return `${formatarNumero(minimo)} a ${formatarNumero(maximo)} kWh`;
}

function classeStatus(status) {
  const valor = String(status || "").toLocaleLowerCase("pt-BR");
  if (valor.includes("alerta") || valor.includes("atenção")) return "atencao";
  if (valor.includes("inativo") || valor.includes("desligado")) return "desligado";
  if (valor.includes("ativo")) return "normal";
  return "desconhecido";
}

function iconeEquipamento(tipo) {
  const valor = String(tipo || "").toLocaleLowerCase("pt-BR");
  if (valor.includes("climat") || valor.includes("refrig")) return "bi-snow";
  if (valor.includes("ilum")) return "bi-lightbulb";
  if (valor.includes("aquec")) return "bi-thermometer-sun";
  if (valor.includes("transporte")) return "bi-truck";
  if (valor.includes("tecnologia") || valor.includes("servidor")) return "bi-hdd-network";
  return "bi-lightning-charge";
}

function Indicador({ titulo, valor, unidade, descricao, icone, cor }) {
  return (
    <article className="indicador-dashboard">
      <div className="indicador-dashboard-topo">
        <span className={`indicador-dashboard-icone indicador-${cor}`}>
          <i className={`bi ${icone}`} aria-hidden="true" />
        </span>
      </div>
      <span className="indicador-dashboard-titulo">{titulo}</span>
      <strong className="indicador-dashboard-valor">
        {valor}
        {unidade && <small> {unidade}</small>}
      </strong>
      <span className="indicador-dashboard-descricao">{descricao}</span>
    </article>
  );
}

function GraficoConsumo({ setores }) {
  const maiorConsumo = Math.max(...setores.map((setor) => setor.consumo), 0);

  if (!setores.length) {
    return <p className="dashboard-estado-vazio">Nenhum setor cadastrado.</p>;
  }

  return (
    <div className="grafico-setores-dashboard">
      {setores.map((setor) => {
        const percentual = maiorConsumo > 0 ? (setor.consumo / maiorConsumo) * 100 : 0;
        return (
          <div className="grafico-setor-dashboard" key={setor.id_setor}>
            <div className="grafico-setor-topo-dashboard">
              <span title={setor.nome_setor}>{setor.nome_setor}</span>
              <strong>{formatarNumero(setor.consumo)} kWh</strong>
            </div>
            <div
              className="grafico-setor-fundo-dashboard"
              role="meter"
              aria-label={`Consumo informado em ${setor.nome_setor}`}
              aria-valuenow={setor.consumo}
              aria-valuemin="0"
              aria-valuemax={maiorConsumo || 1}
            >
              <span style={{ width: `${percentual}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function gradienteCustos(setores, total) {
  if (!total) return "conic-gradient(var(--cor-borda) 0 100%)";

  let inicio = 0;
  const faixas = setores.map((setor, indice) => {
    const fim = indice === setores.length - 1
      ? 100
      : inicio + (setor.custo / total) * 100;
    const faixa = `${CORES_GRAFICO[indice % CORES_GRAFICO.length]} ${inicio}% ${fim}%`;
    inicio = fim;
    return faixa;
  });

  return `conic-gradient(from -90deg, ${faixas.join(", ")})`;
}

export default function UserDashboard() {
  const [setores, setSetores] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const dadosCarregados = useRef(false);

  const carregarDados = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setErro("Sua sessão não foi encontrada. Entre novamente para ver o dashboard.");
      setCarregando(false);
      return;
    }

    if (dadosCarregados.current) setAtualizando(true);
    else setCarregando(true);
    setErro("");

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [respostaSetores, respostaEquipamentos] = await Promise.all([
        fetch(`${API_BASE_URL}/setores`, { headers, cache: "no-store" }),
        fetch(`${API_BASE_URL}/equipamentos`, { headers, cache: "no-store" }),
      ]);
      const [resultadoSetores, resultadoEquipamentos] = await Promise.all([
        respostaSetores.json().catch(() => ({})),
        respostaEquipamentos.json().catch(() => ({})),
      ]);

      if (!respostaSetores.ok || !resultadoSetores.sucesso) {
        throw new Error(resultadoSetores.erro || "Não foi possível carregar os setores.");
      }
      if (!respostaEquipamentos.ok || !resultadoEquipamentos.sucesso) {
        throw new Error(resultadoEquipamentos.erro || "Não foi possível carregar os equipamentos.");
      }

      setSetores(Array.isArray(resultadoSetores.dados) ? resultadoSetores.dados : []);
      setEquipamentos(Array.isArray(resultadoEquipamentos.dados) ? resultadoEquipamentos.dados : []);
      setUltimaAtualizacao(new Date());
      dadosCarregados.current = true;
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message || "Não foi possível conectar à API.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
    const intervalo = window.setInterval(carregarDados, 60_000);
    return () => window.clearInterval(intervalo);
  }, [carregarDados]);

  const setoresComDados = useMemo(() => setores.map((setor) => ({
    ...setor,
    consumo: numero(setor.consumo_geral),
    custo: numero(setor.custo),
  })), [setores]);

  const totalConsumo = setoresComDados.reduce((total, setor) => total + setor.consumo, 0);
  const totalCusto = setoresComDados.reduce((total, setor) => total + setor.custo, 0);
  const setoresConsumo = [...setoresComDados]
    .sort((a, b) => b.consumo - a.consumo)
    .slice(0, 5);
  const setoresCustoOrdenados = [...setoresComDados]
    .filter((setor) => setor.custo > 0)
    .sort((a, b) => b.custo - a.custo);
  const setoresCusto = setoresCustoOrdenados.slice(0, 4);
  const outrosCustos = setoresCustoOrdenados.slice(4).reduce((total, setor) => total + setor.custo, 0);
  const distribuicaoCustos = outrosCustos > 0
    ? [...setoresCusto, { id_setor: "outros", nome_setor: "Outros setores", custo: outrosCustos }]
    : setoresCusto;
  const equipamentosDestaque = [...equipamentos]
    .sort((a, b) => numero(b.consumo_maximo) - numero(a.consumo_maximo))
    .slice(0, 3);

  const indicadores = [
    {
      titulo: "Consumo acumulado",
      valor: formatarNumero(totalConsumo),
      unidade: "kWh",
      descricao: "Soma dos valores informados por setor",
      icone: "bi-lightning-charge",
      cor: "roxo",
    },
    {
      titulo: "Custo acumulado",
      valor: formatarMoeda(totalCusto),
      unidade: "",
      descricao: "Soma dos custos cadastrados por setor",
      icone: "bi-currency-dollar",
      cor: "verde",
    },
    {
      titulo: "Setores cadastrados",
      valor: setores.length.toLocaleString("pt-BR"),
      unidade: "",
      descricao: "Vinculados à sua conta",
      icone: "bi-grid",
      cor: "amarelo",
    },
    {
      titulo: "Equipamentos cadastrados",
      valor: equipamentos.length.toLocaleString("pt-BR"),
      unidade: "",
      descricao: "Vinculados aos seus setores",
      icone: "bi-cpu",
      cor: "azul",
    },
  ];

  return (
    <div className="pagina">
      <Sidebar />

      <div className="conteudo-principal">
        <Header />

        <main className="conteudo-pagina dashboard-pagina">
          <div className="cabecalho-pagina">
            <div>
              <span className="cabecalho-etiqueta">ACOMPANHAMENTO DE ENERGIA</span>
              <h1>Visão Geral</h1>
              <p>Dados cadastrados nos seus setores e equipamentos.</p>
            </div>
            <button
              type="button"
              className="botao-periodo-dashboard"
              onClick={carregarDados}
              disabled={carregando || atualizando}
            >
              <i className={`bi ${atualizando ? "bi-arrow-repeat" : "bi-arrow-clockwise"}`} aria-hidden="true" />
              {ultimaAtualizacao
                ? `Atualizado às ${ultimaAtualizacao.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                : "Atualizar dados"}
            </button>
          </div>

          {erro && (
            <div className="dashboard-mensagem-erro" role="alert">
              <span>{erro}</span>
              <button type="button" onClick={carregarDados} disabled={atualizando}>
                Tentar novamente
              </button>
            </div>
          )}

          <section className="row g-3 g-xl-4 indicadores-dashboard" aria-label="Resumo dos dados cadastrados">
            {indicadores.map((indicador) => (
              <div className="col-12 col-sm-6 col-xl-3" key={indicador.titulo}>
                <Indicador {...indicador} valor={carregando ? "—" : indicador.valor} />
              </div>
            ))}
          </section>

          <section className="row g-3 g-xl-4 dashboard-secao-graficos">
            <div className="col-12 col-xl-8">
              <article className="painel-dashboard painel-consumo-dashboard">
                <div className="topo-painel-dashboard">
                  <div>
                    <h2>Consumo informado por setor</h2>
                    <p>Valores acumulados cadastrados no banco de dados</p>
                  </div>
                  <span className="consumo-total-dashboard">
                    {carregando ? "—" : formatarNumero(totalConsumo)} <small>kWh</small>
                  </span>
                </div>
                <GraficoConsumo setores={carregando ? [] : setoresConsumo} />
                {!carregando && setoresComDados.length > 5 && (
                  <p className="dashboard-nota-grafico">Exibindo os 5 setores com maior consumo informado.</p>
                )}
              </article>
            </div>

            <div className="col-12 col-xl-4">
              <article className="painel-dashboard painel-meta-dashboard">
                <div className="topo-painel-dashboard">
                  <div>
                    <h2>Custos por setor</h2>
                    <p>Distribuição dos custos cadastrados</p>
                  </div>
                </div>
                {carregando ? (
                  <p className="dashboard-estado-vazio">Carregando custos...</p>
                ) : distribuicaoCustos.length ? (
                  <>
                    <div
                      className="grafico-rosca-dashboard"
                      role="img"
                      aria-label={`Custos cadastrados por setor. Total: ${formatarMoeda(totalCusto)}.`}
                      style={{ background: gradienteCustos(distribuicaoCustos, totalCusto) }}
                    >
                      <div className="grafico-rosca-centro">
                        <strong>{formatarMoeda(totalCusto)}</strong>
                        <span>custo cadastrado</span>
                      </div>
                    </div>
                    <div className="legenda-distribuicao-dashboard">
                      {distribuicaoCustos.map((setor, indice) => (
                        <div className="item-legenda-dashboard" key={setor.id_setor}>
                          <span style={{ backgroundColor: CORES_GRAFICO[indice % CORES_GRAFICO.length] }} />
                          <span title={setor.nome_setor}>{setor.nome_setor}</span>
                          <strong>{formatarMoeda(setor.custo)}</strong>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="dashboard-estado-vazio">Nenhum custo informado nos setores.</p>
                )}
              </article>
            </div>
          </section>

          <section className="painel-dashboard painel-dispositivos-dashboard">
            <div className="topo-painel-dashboard">
              <div>
                <h2>Equipamentos cadastrados</h2>
                <p>Status e faixa de consumo configurados</p>
              </div>
              <Link href="/userPages/dispositivos" className="link-painel-dashboard">
                Ver todos <i className="bi bi-arrow-right" aria-hidden="true" />
              </Link>
            </div>
            {carregando ? (
              <p className="dashboard-estado-vazio">Carregando equipamentos...</p>
            ) : equipamentosDestaque.length ? (
              <div className="row g-3 dispositivos-dashboard-lista">
                {equipamentosDestaque.map((equipamento) => {
                  const status = equipamento.status || "Não informado";
                  return (
                    <div className="col-12 col-md-4" key={equipamento.id_equipamento}>
                      <article className="dispositivo-dashboard-card">
                        <div className="dispositivo-dashboard-topo">
                          <span className="icone-dispositivo-dashboard">
                            <i className={`bi ${iconeEquipamento(equipamento.tipo)}`} aria-hidden="true" />
                          </span>
                          <span className={`status-dispositivo status-${classeStatus(status)}`}>
                            <span className="status-ponto" />
                            {status}
                          </span>
                        </div>
                        <h3>{equipamento.nome_equipamento}</h3>
                        <p className="dispositivo-dashboard-local">
                          <i className="bi bi-geo-alt" aria-hidden="true" />
                          {equipamento.nome_setor || "Setor não informado"}
                        </p>
                        <div className="card-divisor" />
                        <div className="dispositivo-dashboard-consumo">
                          <span>Faixa cadastrada</span>
                          <strong>{obterFaixa(equipamento)}</strong>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="dashboard-estado-vazio">Nenhum equipamento cadastrado.</p>
            )}
          </section>

          <p className="dashboard-nota-dados">
            Dados atualizados ao abrir o dashboard e a cada minuto. O banco ainda não armazena histórico nem leituras em tempo real.
          </p>
        </main>
      </div>
    </div>
  );
}
