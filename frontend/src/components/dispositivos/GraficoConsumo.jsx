import "./grafico.css";

export default function GraficoConsumo({ valores }) {
  const largura = 400;
  const altura = 130;
  const maximo = Math.max(...valores, 1) * 1.1;

  const pontos = valores.map((valor, i) => [
    (i / (valores.length - 1)) * largura,
    altura - (valor / maximo) * altura,
  ]);

  const linha = pontos
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${linha} L${largura},${altura} L0,${altura} Z`;
  const ultimo = pontos[pontos.length - 1];

  return (
    <div className="grafico-consumo">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label="Gráfico de consumo nas últimas 24 horas"
      >
        <defs>
          <linearGradient
            id="preenchimento-grafico"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#4b70fc" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4b70fc" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.2, 0.5, 0.8].map((p) => (
          <line
            key={p}
            x1="0"
            x2={largura}
            y1={altura * p}
            y2={altura * p}
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeDasharray="3 4"
          />
        ))}

        <path d={area} fill="url(#preenchimento-grafico)" />
        <path
          d={linha}
          fill="none"
          stroke="#4b70fc"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx={ultimo[0] - 3} cy={ultimo[1]} r="3.5" fill="#8faaff" />
      </svg>

      <div className="grafico-eixo">
        <span>00h</span>
        <span>06h</span>
        <span>12h</span>
        <span>18h</span>
        <span>Agora</span>
      </div>
    </div>
  );
}
