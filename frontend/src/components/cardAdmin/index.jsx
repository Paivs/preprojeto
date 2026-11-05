export default function CardDispositivo({ dispositivo, selecionado, onSelecionar }) {
  return (
    <article
      className={`card-dispositivo ${selecionado ? "card-dispositivo-selecionado" : ""}`}
      onClick={onSelecionar}
    >
      <div className="card-topo">
        <span className="icone-dispositivo">
          {dispositivo.categoria === "Iluminação" ? "💡" :
           dispositivo.categoria === "Climatização" ? "❄️" :
           dispositivo.categoria === "Eletrodomésticos" ? "🔌" : "⚡"}
        </span>

        <div className="card-topo-direita">
          <span className={`status-dispositivo status-${dispositivo.estado || "normal"}`}>
            <span className="status-ponto" />
            {dispositivo.estado === "atencao" ? "Atenção" :
             dispositivo.ligado ? "Normal" : "Desligado"}
          </span>

          <button
            type="button"
            className="botao-pontos"
            aria-label="Mais opções"
            onClick={(e) => e.stopPropagation()}
          >
            ⋯
          </button>
        </div>
      </div>

      <h3 className="card-nome">{dispositivo.nome}</h3>

      <p className="card-local">
        <span>⌂</span> {dispositivo.local}
      </p>

      <div className="card-divisor" />

      <div className="consumo-dispositivo">
        <span className="consumo-rotulo">Consumo em tempo real</span>

        <div className="consumo-linha">
          <p className="consumo-valor">
            {(dispositivo.consumo || 0).toFixed(2)} <small>kWh</small>
          </p>

          {dispositivo.ligado && dispositivo.alerta && (
            <span className="alerta-consumo">{dispositivo.alerta}</span>
          )}
        </div>
      </div>

      <div className="card-divisor" />

      <div className="card-rodape">
        <span className="card-conexao">
          {dispositivo.conectado ? "◉ Conectado" : "◉ Desconectado"}
        </span>

        <span
          className={`interruptor ${dispositivo.ligado ? "interruptor-ativo" : ""}`}
          aria-label={dispositivo.ligado ? "Ligado" : "Desligado"}
        >
          <span className="interruptor-bola" />
        </span>
      </div>
    </article>
  );
}