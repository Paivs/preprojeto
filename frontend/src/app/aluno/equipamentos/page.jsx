"use client";

import { useState } from "react";
import { equipamentosSessao } from "@/mocks/aluno";
import styles from "./page.module.css";

export default function EquipamentosAluno() {
  const [itemAberto, setItemAberto] = useState(null);

  function alternarItem(equipamento) {
    if (!equipamento.detalhes) return;
    setItemAberto((atual) => atual === equipamento.id ? null : equipamento.id);
  }

  return (
    <section className={styles.pagina}>
      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>Equipamentos</h1>
        <p className={styles.subtitulo}>Três equipamentos atribuídos para esta aula</p>
      </header>

      <ul className={styles.lista}>
        {equipamentosSessao.map((equipamento) => {
          const temDetalhes = Boolean(equipamento.detalhes);
          const aberto = temDetalhes && itemAberto === equipamento.id;
          const idPainel = `detalhes-${equipamento.id}`;

          return (
            <li className={styles.item} key={equipamento.id}>
              <button
                className={styles.linha}
                type="button"
                onClick={() => alternarItem(equipamento)}
                aria-expanded={aberto}
                aria-controls={temDetalhes ? idPainel : undefined}
              >
                <span className={styles.idEquipamento}>{equipamento.id}</span>
                <span className={styles.dadosEquipamento}>
                  <span className={styles.nomeEquipamento}>{equipamento.nome}</span>
                  <span className={styles.descricaoEquipamento}>
                    {equipamento.tipo} · {equipamento.detalhe}
                  </span>
                </span>
                <span className={styles.acoesLinha}>
                  <span className={styles.badge}>OPERACIONAL</span>
                  {temDetalhes && (
                    <span
                      className={`ti ${aberto ? "ti-chevron-up" : "ti-chevron-down"} ${styles.seta}`}
                      aria-hidden="true"
                    />
                  )}
                </span>
              </button>

              {aberto && (
                <div className={styles.painel} id={idPainel}>
                  <div className={styles.linhaDetalhe}>
                    <span>Especificação nominal</span>
                    <span>{equipamento.detalhes.alimentacao}</span>
                  </div>
                  <div className={styles.linhaDetalhe}>
                    <span>Última inspeção</span>
                    <span>{equipamento.detalhes.ultimaInspecao}</span>
                  </div>
                  <div className={styles.linhaDetalhe}>
                    <span>Segurança</span>
                    <span>{equipamento.detalhes.seguranca}</span>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
