import styles from "./BarraSuperior.module.css";

export default function BarraSuperior({ usuario, logado, onSair }) {
  return (
    <header className={styles.barra}>
      <div>
        <span className={styles.trilha}>Tenken / Administração</span>
        <h1>Dashboard</h1>
      </div>
      {logado && (
        <div className={styles.conta}>
          <span>{usuario?.nome || usuario?.matricula || "Administrador"}</span>
          <button onClick={onSair}>Sair</button>
        </div>
      )}
    </header>
  );
}
