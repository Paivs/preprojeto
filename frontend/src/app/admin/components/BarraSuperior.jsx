import styles from "./BarraSuperior.module.css";

export default function BarraSuperior({ usuario, logado, onSair }) {
  return (
    <header className={styles.barra}>
      <div className={styles.trilhaBloco}>
        <nav className={styles.trilha} aria-label="Trilha de navegação">
          <span>Tenken</span>
          <span className={styles.separador} aria-hidden="true">›</span>
          <span>Administração</span>
        </nav>
        <h1>Dashboard</h1>
      </div>
      {logado && (
        <div className={styles.conta}>
          <div className={styles.avatar} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="8.5" r="3.4" />
              <path d="M5 19.2c.9-3.4 3.4-5.3 7-5.3s6.1 1.9 7 5.3" strokeLinecap="round" />
            </svg>
          </div>
          <div className={styles.identidade}>
            <span className={styles.nome}>{usuario?.nome || usuario?.matricula || "Administrador"}</span>
            <span className={styles.cargo}>Administrador</span>
          </div>
          <button className={styles.sair} onClick={onSair}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M12 3.6v8" strokeLinecap="round" />
              <path d="M6.5 6.4a7.4 7.4 0 1 0 11 0" strokeLinecap="round" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      )}
    </header>
  );
}
