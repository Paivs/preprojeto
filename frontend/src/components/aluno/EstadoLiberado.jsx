"use client";

import { useEffect, useState } from "react";
import styles from "./EstadoLiberado.module.css";

export default function EstadoLiberado({ sessao, equipamentos }) {
  const [saudacao, setSaudacao] = useState("");

  useEffect(() => {
    const hora = new Date().getHours();
    const cumprimento =
      hora < 12 ? "Bom dia" : hora <= 18 ? "Boa tarde" : "Boa noite";
    const primeiroNome = sessao.nome.trim().split(/\s+/)[0];

    setSaudacao(`${cumprimento}, ${primeiroNome}!`);
  }, [sessao.nome]);

  return (
    <section className={styles.conteudo} aria-labelledby="titulo-aluno">
      <div className={styles.introducao}>
        <p className={styles.badgeLiberado} role="status"><span aria-hidden="true" /> Bancada liberada</p>
        <h1 className={styles.titulo} id="titulo-aluno">
          {saudacao || `Olá, ${sessao.nome}!`}
        </h1>
        <p className={styles.turma}>{sessao.turma}</p>
      </div>

      <section className={styles.secaoEquipamentos} aria-labelledby="titulo-equipamentos">
        <h2 className={styles.tituloEquipamentos} id="titulo-equipamentos">
          Ativos atribuídos para esta aula
        </h2>
        <p className={styles.descricaoEquipamentos}>
          Equipamentos disponibilizados pelo professor para esta aula.
        </p>

        <div className={styles.grade}>
          {equipamentos.map((equipamento) => (
            <article className={styles.card} key={equipamento.id}>
              <div className={styles.cardCabecalho}>
                <span className={styles.numeroAtivo}>{String(equipamentos.indexOf(equipamento) + 1).padStart(2, "0")}</span>
                <span className={styles.badgeAtivo}><span /> Atribuído</span>
              </div>
              <p className={styles.tipo}>{equipamento.tipo}</p>
              <h3 className={styles.nome}>{equipamento.nome}</h3>
              <p className={styles.detalhe}>{equipamento.detalhe}</p>
              <div className={styles.cardRodape}><p className={styles.id}>{equipamento.id}</p><span className={styles.preUso}>Pré-uso pendente</span></div>
            </article>
          ))}
        </div>
      </section>

    </section>
  );
}
