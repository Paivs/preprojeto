import Icone from "./Icone";
import Interruptor from "./Interruptor";
import { obterEstado, formatarKwh, ROTULO_ESTADO } from "./dados";
import "./card.css";

export default function CardDispositivo({
  dispositivo,
  selecionado,
  onSelecionar,
  onAlternar,
}) {
  const estado = obterEstado(dispositivo);

  return (
    <article
      className={`card-dispositivo ${selecionado ? "card-dispositivo-selecionado" : ""}`}
      onClick={onSelecionar}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelecionar()}
      role="button"
      tabIndex={0}
      aria-pressed={selecionado}
    >
      <div className="card-topo">
        <span
          className={`icone-dispositivo ${estado === "atencao" ? "icone-dispositivo-atencao" : ""}`}
        >
          <Icone categoria={dispositivo.categoria} tamanho={22} />
        </span>

        <div className="card-topo-direita">
          <span className={`status-dispositivo status-${estado}`}>
            <span className="status-ponto" />
            {ROTULO_ESTADO[estado]}
          </span>
          <span className="card-pontos" aria-hidden="true">
            <Icone nome="pontos" />
          </span>
        </div>
      </div>

      <h3 className="card-nome">{dispositivo.nome}</h3>
      <p className="card-local">
        <Icone nome="local" tamanho={13} /> {dispositivo.local}
      </p>

      <div className="card-divisor" />

      <div>
        <span className="consumo-rotulo">Consumo em tempo real</span>
        <div className="consumo-linha">
          <p className="consumo-valor">
            {formatarKwh(dispositivo.consumo)} <small>kWh</small>
          </p>
          {dispositivo.ligado && dispositivo.alerta && (
            <span className="alerta-consumo">{dispositivo.alerta}</span>
          )}
        </div>
      </div>

      <div className="card-divisor" />

      <div className="card-rodape">
        <span className="card-conexao">
          {dispositivo.conectado ? dispositivo.atualizado : "Desconectado"}
        </span>
        <Interruptor
          ligado={dispositivo.ligado}
          onAlternar={onAlternar}
          rotulo={`Ligar ou desligar ${dispositivo.nome}`}
        />
      </div>
    </article>
  );
}
