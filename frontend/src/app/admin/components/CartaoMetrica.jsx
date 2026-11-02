import styles from "./CartaoMetrica.module.css";

export default function CartaoMetrica({ icone, rotulo, valor, descricao }) {
  return (
    <article className={styles.cartao}>
      <div className={styles.cabecalho}>
        <span className={styles.icone}>{icone}</span>
        <span className={styles.rotulo}>{rotulo}</span>
      </div>
      <strong className={styles.valor}>{valor}</strong>
      <span className={styles.descricao}>{descricao}</span>
    </article>
  );
}
