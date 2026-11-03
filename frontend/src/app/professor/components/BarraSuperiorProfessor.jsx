import styles from "./BarraSuperiorProfessor.module.css";

export default function BarraSuperiorProfessor({ titulo }) {
  return (
    <header className={styles.barra}>
      <nav className={styles.trilha} aria-label="Trilha de navegação">
        <span>TENKEN</span>
        <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
        <span>Espaço do professor</span>
        <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
        <strong>{titulo}</strong>
      </nav>
      <span className={styles.status}>PRÉVIA · DADOS DEMONSTRATIVOS</span>
    </header>
  );
}
