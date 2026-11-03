"use client";

import { useProfessorDemo } from "./ProfessorDemoProvider";
import styles from "./BarraSuperiorProfessor.module.css";

export default function BarraSuperiorProfessor({ titulo }) {
  const { dados } = useProfessorDemo();

  return (
    <header className={styles.barra}>
      <nav className={styles.trilha} aria-label="Trilha de navegação">
        <span>TENKEN</span>
        <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
        <span>Espaço do professor</span>
        <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
        <strong>{titulo}</strong>
      </nav>
      <div className={styles.conta}>
        <span className={styles.avatar} aria-hidden="true">{dados.professora?.nome?.split(/\s+/).map((parte) => parte[0]).slice(0, 2).join("") || "PR"}</span>
        <span className={styles.nome}>{dados.professora?.nome || "Professora"}</span>
        <span className={styles.status}>PRÉVIA LOCAL</span>
      </div>
    </header>
  );
}
