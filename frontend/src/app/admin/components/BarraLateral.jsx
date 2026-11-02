import styles from "./BarraLateral.module.css";

const itensEmBreve = [
  { rotulo: "Equipamentos" },
  { rotulo: "Chamados" },
  { rotulo: "Checklist" },
  { rotulo: "Ocorrências" },
  { rotulo: "Usuários" },
  { rotulo: "Relatórios" },
];

export default function BarraLateral({ statusApi }) {
  const textoStatus = statusApi === "online" ? "Conectada" : statusApi === "offline" ? "Indisponível" : "Verificando";

  return (
    <aside className={styles.barra}>
      <a className={styles.marca} href="/" aria-label="Tenken, página inicial">
        <img src="/assets/img/logo-site/logo_horizontal.svg" alt="Tenken" />
      </a>

      <nav className={styles.navegacao}>
        <span className={styles.rotuloSecao}>Administração</span>
        <a className={styles.itemAtivo} href="/admin" aria-current="page">
          <span className={styles.marcador} />
          Dashboard
        </a>

        <span className={styles.rotuloSecao}>Em breve</span>
        {itensEmBreve.map((item) => (
          <span className={styles.itemFuturo} key={item.rotulo}>
            {item.rotulo}
            <span className={styles.selo}>em breve</span>
          </span>
        ))}
      </nav>

      <div className={styles.rodape}>
        <span className={`${styles.ponto} ${statusApi === "online" ? styles.pontoAtivo : ""}`} />
        API {textoStatus}
      </div>
    </aside>
  );
}
