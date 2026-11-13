"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { aulaHoje, equipamentosSessao, episObrigatorios, sessaoAluno } from "@/mocks/aluno";
import FormularioVinculo from "@/components/aluno/FormularioVinculo";
import EstadoAguardando from "@/components/aluno/EstadoAguardando";
import { IconeSeta } from "@/components/aluno/IconesNavegacao";
import styles from "./page.module.css";

function formatarTempo(segundos) {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const restantes = segundos % 60;
  return [horas, minutos, restantes].map((valor) => String(valor).padStart(2, "0")).join(":");
}

export default function DiagnosticoAluno() {
  const router = useRouter();
  const [etapa, setEtapa] = useState("FORM");
  const [solicitacao, setSolicitacao] = useState(null);
  const [itemAberto, setItemAberto] = useState(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const bancadaLiberada = etapa === "APPROVED";

  useEffect(() => {
    if (!bancadaLiberada) return;
    window.sessionStorage.setItem("tenken-aluno-bancada-liberada", "true");
  }, [bancadaLiberada]);

  useEffect(() => {
    function atualizarCronometro() {
      const fim = new Date(sessaoAluno.fimDaAula).getTime();
      setSegundosRestantes(Number.isNaN(fim) ? 0 : Math.max(0, Math.floor((fim - Date.now()) / 1000)));
    }
    atualizarCronometro();
    const intervalo = window.setInterval(atualizarCronometro, 1000);
    return () => window.clearInterval(intervalo);
  }, []);

  function enviarSolicitacao(dados) {
    setSolicitacao(dados);
    setEtapa("WAITING");
  }

  function liberarBancada() {
    setEtapa("APPROVED");
  }

  return (
    <section className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <p className={styles.sobretitulo}>ÁREA DO ALUNO / LABORATÓRIO</p>
          <h1 className={styles.titulo}>Diagnóstico</h1>
          <p className={styles.subtitulo}>{sessaoAluno.turma}</p>
        </div>
        <div className={`${styles.status} ${bancadaLiberada ? styles.statusAtivo : styles.statusEspera}`} role="status">
          <span className={`${styles.led} ${bancadaLiberada ? styles.ledAtivo : ""}`} aria-hidden="true" />
          {bancadaLiberada ? "Bancada liberada" : etapa === "WAITING" ? "Aguardando aprovação" : "Acesso não solicitado"}
        </div>
      </header>

      {etapa === "FORM" && (
        <section className={styles.formulario} aria-labelledby="titulo-acesso-bancada">
          <div className={styles.cabecalhoFormulario}>
            <span className={styles.numeroEtapa}>01 / ACESSO À BANCADA</span>
            <h2 id="titulo-acesso-bancada">Solicitar acesso ao laboratório</h2>
            <p>Informe seus dados e o token compartilhado pelo professor para iniciar a atividade.</p>
          </div>
          <FormularioVinculo onEnviar={enviarSolicitacao} />
        </section>
      )}

      {etapa === "WAITING" && solicitacao && (
        <div className={styles.estadoAguardando}>
          <EstadoAguardando sessao={solicitacao} token={solicitacao.token} onCancelar={() => setEtapa("FORM")} onSimularAprovacao={liberarBancada} />
        </div>
      )}

      {bancadaLiberada && (
        <>
          <section className={styles.telemetria} aria-label="Telemetria da sessão">
            <div><span>LOCAL / POSTO</span><strong>LAB-AUT-01 <i>•</i> PAT-204</strong></div>
            <div><span>DOCENTE</span><strong>{aulaHoje.professor}</strong></div>
            <div><span>TOKEN</span><strong className={styles.token}>{solicitacao?.token || sessaoAluno.tokenExemplo}</strong></div>
            <div><span>TEMPO RESTANTE</span><strong className={styles.tempo}>{formatarTempo(segundosRestantes)}</strong></div>
          </section>

          <section className={styles.conteudoLiberado}>
            <div className={styles.cabecalhoEquipamentos}>
              <div><p className={styles.sobretitulo}>SESSÃO ATIVA</p><h2>Equipamentos da aula</h2></div>
              <span>{equipamentosSessao.length} ATIVOS</span>
            </div>
            <ul className={styles.lista}>
              {equipamentosSessao.map((equipamento) => {
                const aberto = itemAberto === equipamento.id;
                const idPainel = `detalhes-${equipamento.id}`;
                return (
                  <li className={styles.item} key={equipamento.id}>
                    <button className={styles.linha} type="button" onClick={() => setItemAberto(aberto ? null : equipamento.id)} aria-expanded={aberto} aria-controls={idPainel}>
                      <span className={styles.idEquipamento}>{equipamento.id}</span>
                      <span className={styles.dadosEquipamento}><strong>{equipamento.nome}</strong><small>{equipamento.tipo} <i>·</i> {equipamento.detalhe}</small></span>
                      <span className={styles.acoesLinha}><span className={styles.badge}>OPERACIONAL</span><IconeSeta className={`${styles.seta} ${aberto ? styles.setaAberta : ""}`} direcao="baixo" /></span>
                    </button>
                    <div className={`${styles.painel} ${aberto ? styles.painelAberto : ""}`} id={idPainel} aria-hidden={!aberto}>
                      <div className={styles.detalhes}>
                        <p><span>Alimentação / pressão nominal</span><strong>{equipamento.detalhes.alimentacao}</strong></p>
                        <p><span>Última inspeção</span><strong>{equipamento.detalhes.ultimaInspecao}</strong></p>
                        <p><span>Protocolo de segurança</span><strong>{equipamento.detalhes.seguranca}</strong></p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className={styles.faixaEpis}><span>EPIs OBRIGATÓRIOS</span><ul>{episObrigatorios.map((epi) => <li key={epi}>{epi}</li>)}</ul></div>
          </section>
        </>
      )}
    </section>
  );
}
