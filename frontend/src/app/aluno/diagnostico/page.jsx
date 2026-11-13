"use client";

import { useEffect, useState } from "react";
import {
  aulaHoje,
  episObrigatorios,
  progressoSemestre,
  sessaoAluno,
} from "@/mocks/aluno";
import styles from "./page.module.css";

function formatarTempo(segundos) {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segundosRestantes = segundos % 60;
  return [horas, minutos, segundosRestantes]
    .map((valor) => String(valor).padStart(2, "0"))
    .join(":");
}

export default function BemVindoAluno() {
  const primeiroNome = sessaoAluno.nome.trim().split(/\s+/)[0];
  const [saudacao, setSaudacao] = useState(`Olá, ${primeiroNome}`);
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  useEffect(() => {
    const hora = new Date().getHours();
    const cumprimento = hora < 12 ? "Bom dia" : hora <= 18 ? "Boa tarde" : "Boa noite";
    setSaudacao(`${cumprimento}, ${primeiroNome}`);
  }, [primeiroNome]);

  useEffect(() => {
    function atualizarCronometro() {
      const restante = Math.max(
        0,
        Math.floor((new Date(sessaoAluno.fimDaAula).getTime() - Date.now()) / 1000),
      );
      setSegundosRestantes(restante);
    }

    atualizarCronometro();
    const intervalo = window.setInterval(atualizarCronometro, 1000);
    return () => window.clearInterval(intervalo);
  }, []);

  const barras = Array.from({ length: progressoSemestre.total }, (_, indice) => indice < progressoSemestre.concluidas);

  return (
    <section className={styles.pagina}>
      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>{saudacao}</h1>
        <p className={styles.subtitulo}>{sessaoAluno.turma}</p>
      </header>

      <section className={styles.telemetria} aria-label="Informações da sessão">
        <div className={styles.dadoTelemetria}>
          <span className={styles.rotulo}>LOCAL / POSTO</span>
          <span className={styles.valor}>LAB-AUT-01&nbsp;&nbsp; PAT-204</span>
        </div>
        <div className={styles.dadoTelemetria}>
          <span className={styles.rotulo}>DOCENTE</span>
          <span className={styles.valor}>{aulaHoje.professor}</span>
        </div>
        <div className={styles.dadoTelemetria}>
          <span className={styles.rotulo}>TOKEN</span>
          <span className={`${styles.valor} ${styles.token}`}>TNK-K7P4</span>
        </div>
        <div className={styles.dadoTelemetria}>
          <span className={styles.rotulo}>TEMPO RESTANTE</span>
          <span className={`${styles.valor} ${styles.cronometro}`}>{formatarTempo(segundosRestantes)}</span>
        </div>
      </section>

      <section className={styles.faixaPessoal} aria-label="Resumo pessoal">
        <div className={styles.dadoPessoal}>
          <span className={styles.rotulo}>SUA ENTRADA</span>
          <span className={styles.valor}>{sessaoAluno.entradaEm}</span>
        </div>
        <div className={styles.dadoPessoal}>
          <span className={styles.rotulo}>ACESSOS ESTE MÊS</span>
          <span className={styles.valor}>{sessaoAluno.acessosMes}</span>
        </div>
      </section>

      <section className={styles.progresso} aria-label="Progresso no semestre">
        <div className={styles.linhaProgresso}>
          <span className={styles.rotuloProgresso}>Seu progresso no semestre</span>
          <span className={styles.textoProgresso}>
            {progressoSemestre.concluidas} de {progressoSemestre.total} aulas concluídas
          </span>
        </div>
        <div
          className={styles.barrasProgresso}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={progressoSemestre.total}
          aria-valuenow={progressoSemestre.concluidas}
          aria-label="Aulas concluídas no semestre"
        >
          {barras.map((concluida, indice) => (
            <span className={concluida ? styles.barraConcluida : styles.barraPendente} key={indice} aria-hidden="true" />
          ))}
        </div>
      </section>

      <section className={styles.detalhesAula} aria-label="Detalhes da aula">
        <div className={styles.blocoAula}>
          <h2 className={styles.rotuloBloco}>TEMA DE HOJE</h2>
          <p className={styles.valorBloco}>{aulaHoje.tema}</p>
        </div>
        <div className={styles.blocoAula}>
          <h2 className={styles.rotuloBloco}>PROFESSOR</h2>
          <p className={styles.valorBloco}>{aulaHoje.professor}</p>
        </div>
        <div className={styles.blocoAula}>
          <h2 className={styles.rotuloBloco}>EPIs OBRIGATÓRIOS</h2>
          <ul className={styles.listaEpis}>
            {episObrigatorios.map((epi) => <li className={styles.tagEpi} key={epi}>{epi}</li>)}
          </ul>
        </div>
      </section>

      <footer className={styles.rodape}>
        Antes de usar: inspecione, use, devolva e faça o pós-uso. Você responde por danos ou perdas nos equipamentos desta sessão.
      </footer>
    </section>
  );
}
