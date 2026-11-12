import Link from "next/link";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import "./userDashboard.css";

const indicadores = [
  {
    titulo: "Consumo de hoje",
    valor: "28,4",
    unidade: "kWh",
    variacao: "12,8%",
    descricao: "em relação a ontem",
    icone: "bi-lightning-charge",
    cor: "roxo",
    tendencia: "queda",
  },
  {
    titulo: "Economia no mês",
    valor: "R$ 428",
    unidade: "",
    variacao: "18,2%",
    descricao: "em relação ao mês passado",
    icone: "bi-piggy-bank",
    cor: "verde",
    tendencia: "alta",
  },
  {
    titulo: "Consumo médio",
    valor: "6,2",
    unidade: "kW",
    variacao: "4,6%",
    descricao: "em relação ao mês passado",
    icone: "bi-speedometer2",
    cor: "amarelo",
    tendencia: "queda",
  },
  {
    titulo: "Emissões evitadas",
    valor: "18,6",
    unidade: "kg CO₂",
    variacao: "9,4%",
    descricao: "a menos neste mês",
    icone: "bi-tree",
    cor: "azul",
    tendencia: "alta",
  },
];

const dispositivos = [
  {
    nome: "Ar-condicionado",
    local: "Sala de estar",
    consumo: "1,80",
    icone: "bi-snow",
    estado: "Ligado",
  },
  {
    nome: "Aquecedor solar",
    local: "Área externa",
    consumo: "0,90",
    icone: "bi-sun",
    estado: "Ligado",
  },
  {
    nome: "Iluminação",
    local: "Casa toda",
    consumo: "0,40",
    icone: "bi-lightbulb",
    estado: "Automático",
  },
];

function Indicador({ indicador }) {
  return (
    <article className="indicador-dashboard">
      <div className="indicador-dashboard-topo">
        <span
          className={`indicador-dashboard-icone indicador-${indicador.cor}`}
        >
          <i className={`bi ${indicador.icone}`} aria-hidden="true" />
        </span>
        <span
          className={`indicador-variacao indicador-variacao-${indicador.tendencia}`}
        >
          <i
            className={`bi ${
              indicador.tendencia === "alta"
                ? "bi-arrow-up-right"
                : "bi-arrow-down-right"
            }`}
          />
          {indicador.variacao}
        </span>
      </div>
      <span className="indicador-dashboard-titulo">{indicador.titulo}</span>
      <strong className="indicador-dashboard-valor">
        {indicador.valor}
        <small>{indicador.unidade && ` ${indicador.unidade}`}</small>
      </strong>
      <span className="indicador-dashboard-descricao">
        {indicador.descricao}
      </span>
    </article>
  );
}

function GraficoSemanal() {
  return (
    <div className="grafico-dashboard">
      <div className="grafico-dashboard-eixo-y" aria-hidden="true">
        <span>40</span>
        <span>30</span>
        <span>20</span>
        <span>10</span>
        <span>0</span>
      </div>
      <svg
        viewBox="0 0 700 210"
        preserveAspectRatio="none"
        role="img"
        aria-label="Consumo de energia ao longo dos últimos sete dias"
      >
        <defs>
          <linearGradient id="area-consumo" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#914ff0" stopOpacity=".26" />
            <stop offset="100%" stopColor="#914ff0" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20, 62, 104, 146, 188].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="700"
            y2={y}
            className="grafico-dashboard-grade"
          />
        ))}
        <path
          d="M0 94 C35 90 45 62 88 72 S143 130 188 117 S245 84 288 94 S336 147 388 128 S440 55 488 70 S545 105 588 89 S651 52 700 60 L700 188 L0 188Z"
          fill="url(#area-consumo)"
        />
        <path
          d="M0 94 C35 90 45 62 88 72 S143 130 188 117 S245 84 288 94 S336 147 388 128 S440 55 488 70 S545 105 588 89 S651 52 700 60"
          className="grafico-dashboard-linha"
        />
        <circle cx="488" cy="70" r="5" className="grafico-dashboard-ponto" />
      </svg>
      <div className="grafico-dashboard-eixo-x" aria-hidden="true">
        <span>Seg</span>
        <span>Ter</span>
        <span>Qua</span>
        <span>Qui</span>
        <span>Sex</span>
        <span>Sáb</span>
        <span>Dom</span>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  return (
    <div className="pagina">
      <Sidebar />

      <div className="conteudo-principal">
        <Header />

        <main className="conteudo-pagina dashboard-pagina">
          <div className="cabecalho-pagina">
            <div>
              <span className="cabecalho-etiqueta">
                ACOMPANHAMENTO DE ENERGIA
              </span>
              <h1>Visão Geral</h1>
              <p>Monitore o consumo e a economia de energia da sua casa.</p>
            </div>
            <button type="button" className="botao-periodo-dashboard">
              <i className="bi bi-calendar3" /> Últimos 7 dias{" "}
              <i className="bi bi-chevron-down" />
            </button>
          </div>

          <section
            className="row g-3 g-xl-4 indicadores-dashboard"
            aria-label="Resumo do consumo"
          >
            {indicadores.map((indicador) => (
              <div className="col-12 col-sm-6 col-xl-3" key={indicador.titulo}>
                <Indicador indicador={indicador} />
              </div>
            ))}
          </section>

          <section className="row g-3 g-xl-4 dashboard-secao-graficos">
            <div className="col-12 col-xl-8">
              <article className="painel-dashboard painel-consumo-dashboard">
                <div className="topo-painel-dashboard">
                  <div>
                    <h2>Consumo de energia</h2>
                    <p>Consumo diário ao longo da semana</p>
                  </div>
                  <span className="consumo-total-dashboard">
                    184,6 <small>kWh</small>
                  </span>
                </div>
                <div className="resumo-grafico-dashboard">
                  <span className="indicador-variacao indicador-variacao-queda">
                    <i className="bi bi-arrow-down-right" /> 8,4%
                  </span>
                  <span>em relação à semana passada</span>
                </div>
                <GraficoSemanal />
              </article>
            </div>

            <div className="col-12 col-xl-4">
              <article className="painel-dashboard painel-meta-dashboard">
                <div className="topo-painel-dashboard">
                  <div>
                    <h2>Distribuição</h2>
                    <p>Economia por setor</p>
                  </div>
                  <button type="button" className="menu-grafico-dashboard" aria-label="Mais opções do gráfico">
                    <i className="bi bi-three-dots" />
                  </button>
                </div>
                <div className="grafico-rosca-dashboard" role="img" aria-label="Distribuição da economia: climatização 38%, equipamentos 27%, iluminação 21%, outros 14%">
                  <div className="grafico-rosca-centro">
                    <strong>R$ 428</strong>
                    <span>economizados</span>
                  </div>
                  <span className="meta-icone-dashboard">
                    <i className="bi bi-bullseye" />
                  </span>
                </div>
                <div
                  className="meta-progresso-dashboard"
                  role="img"
                  aria-label="72 por cento da meta de economia concluída"
                >
                  <div>
                    <strong>
                      72<small>%</small>
                    </strong>
                    <span>da meta</span>
                  </div>
                </div>
                <div className="meta-valores-dashboard">
                  <strong>R$ 428,00</strong>
                  <span>de R$ 600,00</span>
                </div>
                <div
                  className="progress progresso-meta-dashboard"
                  role="progressbar"
                  aria-label="Progresso da meta de economia"
                  aria-valuenow="72"
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div className="progress-bar" style={{ width: "72%" }} />
                </div>
                <div className="mensagem-meta-dashboard">
                  <i className="bi bi-stars" />
                  <p>
                    <strong>Você está no caminho certo!</strong>
                    <br />
                    Mantendo esse ritmo, pode superar sua meta.
                  </p>
                </div>
              </article>
            </div>
          </section>

          <section className="painel-dashboard painel-dispositivos-dashboard">
            <div className="topo-painel-dashboard">
              <div>
                <h2>Dispositivos em destaque</h2>
                <p>Consumo dos equipamentos em tempo real</p>
              </div>
              <Link
                href="/userPages/dispositivos"
                className="link-painel-dashboard"
              >
                Ver todos <i className="bi bi-arrow-right" />
              </Link>
            </div>
            <div className="row g-3 dispositivos-dashboard-lista">
              {dispositivos.map((dispositivo) => (
                <div className="col-12 col-md-4" key={dispositivo.nome}>
                  <article className="dispositivo-dashboard-card">
                    <div className="dispositivo-dashboard-topo">
                      <span className="icone-dispositivo-dashboard">
                        <i className={`bi ${dispositivo.icone}`} />
                      </span>
                      <span className="status-dispositivo status-normal">
                        <span className="status-ponto" />
                        {dispositivo.estado}
                      </span>
                    </div>
                    <h3>{dispositivo.nome}</h3>
                    <p className="dispositivo-dashboard-local">
                      <i className="bi bi-geo-alt" />
                      {dispositivo.local}
                    </p>
                    <div className="card-divisor" />
                    <div className="dispositivo-dashboard-consumo">
                      <span>Consumo em tempo real</span>
                      <strong>
                        {dispositivo.consumo} <small>kW</small>
                      </strong>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </section>

          <aside className="dica-dashboard">
            <span className="dica-dashboard-icone">
              <i className="bi bi-stars" />
            </span>
            <div>
              <span className="dica-dashboard-etiqueta">DICA DE ECONOMIA</span>
              <p>
                Programe o ar-condicionado para desligar durante a madrugada e
                economize até <strong>R$ 46,00</strong> este mês.
              </p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
