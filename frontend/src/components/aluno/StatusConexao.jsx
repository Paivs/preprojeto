import styles from "./StatusConexao.module.css";

export default function StatusConexao({ estado }) {
  const liberado = estado === "liberado";
  const texto = liberado ? "Bancada liberada" : "Aguardando aprovação";

  return (
    <div
      className={`${styles.status} ${liberado ? styles.liberado : styles.aguardando}`}
      role="status"
      aria-label={texto}
    >
      <span className={styles.ponto} aria-hidden="true" />
      <span>{texto}</span>
    </div>
  );
}
