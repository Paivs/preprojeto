import Icone from "./Icone";
import { obterEstado, formatarFaixaConsumo, formatarKwh } from "./dados";
import "./card.css";

export default function CardDispositivo({
  dispositivo,
  selecionado,
  onSelecionar,
}) {
  const estado = obterEstado(dispositivo);
  const faixaConsumo = formatarFaixaConsumo(dispositivo);

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
            {dispositivo.status}
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
        <span className="consumo-rotulo">Consumo atual simulado</span>
        <div className="consumo-linha">
          <p className="consumo-valor consumo-faixa">
            {Number.isFinite(dispositivo.consumoAtual)
              ? <>{formatarKwh(dispositivo.consumoAtual)} <small>kWh</small></>
              : "Não informado"}
          </p>
        </div>
        <p className="consumo-faixa-cadastrada">
          Faixa: {faixaConsumo === "Não informado" ? faixaConsumo : `${faixaConsumo} kWh`}
        </p>
      </div>

      <div className="card-divisor" />

      <div className="card-rodape">
        <span className="card-conexao">Tipo: {dispositivo.categoria}</span>
      </div>
    </article>
  );
}
