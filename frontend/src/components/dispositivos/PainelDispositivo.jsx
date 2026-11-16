"use client";

import { useEffect, useState } from "react";
import Icone from "./Icone";
import Interruptor from "./Interruptor";
import GraficoConsumo from "./GraficoConsumo";
import { obterEstado, formatarKwh, resumoDias } from "./dados";
import "./painel.css";

export default function PainelDispositivo({
  dispositivo,
  onFechar,
  onAlternar,
  onAtualizar,
}) {
  const [manutencaoSolicitada, setManutencaoSolicitada] = useState(false);
  const estado = obterEstado(dispositivo);
  const { agendamento } = dispositivo;

  useEffect(() => {
    function aoPressionarTecla(evento) {
      if (evento.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", aoPressionarTecla);
    return () => window.removeEventListener("keydown", aoPressionarTecla);
  }, [onFechar]);

  let textoStatus = "Desligado";
  if (!dispositivo.conectado) textoStatus = "Desconectado";
  else if (dispositivo.ligado) textoStatus = "Ligado e conectado";

  function alternarAgendamento() {
    onAtualizar(dispositivo.id, {
      agendamento: { ...agendamento, ativo: !agendamento.ativo },
    });
  }

  function desconectar() {
    onAtualizar(dispositivo.id, {
      conectado: false,
      ligado: false,
      consumo: 0,
    });
  }

  return (
    <aside
      className="painel-detalhes"
      aria-label={`Detalhes de ${dispositivo.nome}`}
    >
      <div className="painel-topo">
        <span
          className={`icone-dispositivo ${estado === "atencao" ? "icone-dispositivo-atencao" : ""}`}
        >
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
        <div className="painel-status">
          <div>
            <span className="painel-rotulo">Status do dispositivo</span>
            <p className={`painel-status-texto status-${estado}`}>
              <span className="status-ponto" /> {textoStatus}
            </p>
          </div>
          <Interruptor
            ligado={dispositivo.ligado}
            onAlternar={() => onAlternar(dispositivo.id)}
            rotulo="Ligar ou desligar o dispositivo"
          />
        </div>

        <section className="painel-secao">
          <div className="painel-secao-topo">
            <div>
              <h3>Consumo nas últimas 24h</h3>
              <span className="painel-rotulo">Atualização em tempo real</span>
            </div>
            <p className="consumo-valor consumo-valor-pequeno">
              {formatarKwh(dispositivo.consumo)} <small>kWh</small>
            </p>
          </div>
          <GraficoConsumo valores={dispositivo.historico} />
        </section>

        <section className="painel-secao painel-divisor">
          <div className="painel-secao-topo">
            <div>
              <h3>Agendamento</h3>
              <span className="painel-rotulo">Automação de funcionamento</span>
            </div>
            <Interruptor
              ligado={agendamento.ativo}
              onAlternar={alternarAgendamento}
              rotulo="Ativar ou desativar agendamento"
            />
          </div>

          <button
            type="button"
            className={`card-agendamento ${agendamento.ativo ? "" : "card-agendamento-inativo"}`}
          >
            <span className="agendamento-icone">
              <Icone nome="relogio" tamanho={18} />
            </span>
            <span className="agendamento-texto">
              <small>{resumoDias(agendamento.dias)}</small>
              <strong>
                {agendamento.inicio} — {agendamento.fim}
              </strong>
            </span>
            <Icone nome="seta" />
          </button>
        </section>

        <section className="painel-secao painel-divisor">
          <h3>Manutenção</h3>
          <span className="painel-rotulo">
            Última revisão em {dispositivo.ultimaRevisao}
          </span>

          <div className="painel-botoes">
            <button
              type="button"
              className={`botao-manutencao ${manutencaoSolicitada ? "botao-manutencao-ok" : ""}`}
              onClick={() => setManutencaoSolicitada(true)}
              disabled={manutencaoSolicitada}
            >
              <Icone
                nome={manutencaoSolicitada ? "check" : "chave"}
                tamanho={15}
              />
              {manutencaoSolicitada
                ? "Manutenção solicitada"
                : "Solicitar manutenção"}
            </button>
            <button type="button" className="botao-secundario">
              <Icone nome="ajustes" tamanho={15} /> Configurar
            </button>
          </div>
        </section>
      </div>

      <div className="painel-rodape">
        <button
          type="button"
          className="botao-desconectar"
          onClick={desconectar}
          disabled={!dispositivo.conectado}
        >
          <Icone nome="power" tamanho={15} /> Desconectar dispositivo
        </button>
      </div>
    </aside>
  );
}
