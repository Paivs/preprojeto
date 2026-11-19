"use client";

import { useEffect } from "react";
import Icone from "./Icone";
import { formatarFaixaConsumo, obterEstado } from "./dados";
import "./painel.css";

export default function PainelDispositivo({ dispositivo, onFechar }) {
  const estado = obterEstado(dispositivo);

  useEffect(() => {
    function aoPressionarTecla(evento) {
      if (evento.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", aoPressionarTecla);
    return () => window.removeEventListener("keydown", aoPressionarTecla);
  }, [onFechar]);

  return (
    <div className="modal-fundo" onClick={onFechar}>
      <aside
        className="painel-detalhes"
        aria-label={`Detalhes de ${dispositivo.nome}`}
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="painel-topo">
          <span className={`icone-dispositivo ${estado === "atencao" ? "icone-dispositivo-atencao" : ""}`}>
            <Icone categoria={dispositivo.categoria} tamanho={22} />
          </span>
          <div className="painel-titulo">
            <small>{dispositivo.grupo}</small>
            <h2>{dispositivo.nome}</h2>
          </div>
          <button
            type="button"
            className="botao-fechar"
            onClick={onFechar}
            aria-label="Fechar painel"
          >
            <Icone nome="x" />
          </button>
        </div>

        <div className="painel-corpo">
          <section className="painel-status">
            <div>
              <span className="painel-rotulo">Status do equipamento</span>
              <p className={`painel-status-texto status-${estado}`}>
                <span className="status-ponto" /> {dispositivo.status}
              </p>
            </div>
          </section>

          <section className="painel-secao">
            <h3>Dados cadastrados</h3>
            <dl className="painel-dados-lista">
              <div>
                <dt>Setor</dt>
                <dd>{dispositivo.local}</dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>{dispositivo.categoria}</dd>
              </div>
              <div>
                <dt>Faixa de consumo</dt>
                <dd>{formatarFaixaConsumo(dispositivo)}</dd>
              </div>
              <div>
                <dt>Identificador</dt>
                <dd>#{dispositivo.id}</dd>
              </div>
            </dl>
          </section>

          <p className="painel-nota-consumo">
            A tabela de equipamentos contém consumo mínimo e máximo cadastrados; ela não fornece uma medição atual ou histórico.
          </p>
        </div>
      </aside>
    </div>
  );
}
