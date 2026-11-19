import Icone from "./Icone";
import { obterEstado, formatarFaixaConsumo } from "./dados";
import "./card.css";

export default function CardDispositivo({
  dispositivo,
  selecionado,
  onSelecionar,
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
          className="icone-dispositivo"
        >
          <Icone categoria={dispositivo.categoria} tamanho={22} />
        </span>

        <div className="card-topo-direita">
          <span className={`status-dispositivo status-${estado}`}>
            <span className="status-ponto" />
            {dispositivo.status}
          </span>
        </div>
      </div>

      <h3 className="card-nome">{dispositivo.nome}</h3>
      <p className="card-local">
        <Icone nome="local" tamanho={13} /> {dispositivo.local}
      </p>

      <div className="card-divisor" />

      <div>
        <span className="consumo-rotulo">Faixa de consumo cadastrada</span>
        <div className="consumo-linha">
          <p className="consumo-valor consumo-faixa">
            {formatarFaixaConsumo(dispositivo)}
          </p>
        </div>
      </div>

      <div className="card-divisor" />

      <div className="card-rodape">
        <span className="card-conexao">Tipo: {dispositivo.categoria}</span>
      </div>
    </article>
  );
}
