"use client";

import { useState } from "react";
import { X, Clock, ChevronRight, Wrench, Settings, Power, Check } from "lucide-react";
import IconeCategoria from "./IconeCategoria";
import Interruptor from "./Interruptor";
import GraficoConsumo from "./GraficoConsumo";
import { obterEstado, obterConsumo, formatarKwh, resumoDias } from "../data/dispositivos";

export default function PainelDispositivo({ dispositivo, onFechar, onAlternar, onAtualizar, onAbrirModal }) {
  const [manutencaoSolicitada, setManutencaoSolicitada] = useState(false);
  const estado = obterEstado(dispositivo);
  const { agendamento } = dispositivo;

  let textoStatus = "Desligado";
  if (!dispositivo.conectado) textoStatus = "Desconectado";
  else if (dispositivo.ligado) textoStatus = "Ligado e conectado";

  function alternarAgendamento() {
    onAtualizar(dispositivo.id, { agendamento: { ...agendamento, ativo: !agendamento.ativo } });
  }

  return (
    <aside className="painel-detalhes" aria-label={`Detalhes de ${dispositivo.nome}`}>
      <div className="painel-topo">
        <span className={`icone-dispositivo ${estado === "atencao" ? "icone-dispositivo-atencao" : ""}`}>
          <IconeCategoria categoria={dispositivo.categoria} />
        </span>
        <div className="painel-titulo">
          <small>{dispositivo.grupo}</small>
          <h2>{dispositivo.nome}</h2>
        </div>
        <button type="button" className="botao-fechar" onClick={onFechar} aria-label="Fechar painel">
          <X size={16} />
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
          <Interruptor ligado={dispositivo.ligado} onAlternar={() => onAlternar(dispositivo.id)} />
        </div>

        <section className="painel-secao">
          <div className="painel-secao-topo">
            <div>
              <h3>Consumo nas últimas 24h</h3>
              <span className="painel-rotulo">Atualização em tempo real</span>
            </div>
            <p className="consumo-valor consumo-valor-pequeno">
              {formatarKwh(obterConsumo(dispositivo))} <small>kWh</small>
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
            onClick={() => onAbrirModal("agendamento", dispositivo.id)}
          >
            <span className="agendamento-icone">
              <Clock size={18} />
            </span>
            <span className="agendamento-texto">
              <small>{resumoDias(agendamento.dias)}</small>
              <strong>
                {agendamento.inicio} — {agendamento.fim}
              </strong>
            </span>
            <ChevronRight size={16} />
          </button>
        </section>

        <section className="painel-secao painel-divisor">
          <h3>Manutenção</h3>
          <span className="painel-rotulo">Última revisão em {dispositivo.ultimaRevisao}</span>

          <div className="painel-botoes">
            <button
              type="button"
              className={`botao-manutencao ${manutencaoSolicitada ? "botao-manutencao-ok" : ""}`}
              onClick={() => setManutencaoSolicitada(true)}
              disabled={manutencaoSolicitada}
            >
              {manutencaoSolicitada ? <Check size={15} /> : <Wrench size={15} />}
              {manutencaoSolicitada ? "Manutenção solicitada" : "Solicitar manutenção"}
            </button>
            <button type="button" className="botao-secundario" onClick={() => onAbrirModal("configurar", dispositivo.id)}>
              <Settings size={15} /> Configurar
            </button>
          </div>
        </section>
      </div>

      <div className="painel-rodape">
        <button type="button" className="botao-desconectar" onClick={() => onAbrirModal("desconectar", dispositivo.id)}>
          <Power size={15} /> Desconectar dispositivo
        </button>
      </div>
    </aside>
  );
}
