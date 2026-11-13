import Link from "next/link";
import styles from "./page.module.css";

export default function PaginaAluno() {
  return (
    <section className={styles.pagina}>
      <div className={styles.marca} aria-hidden="true">TENKEN / LABORATÓRIO</div>
      <div className={styles.conteudo}>
        <span className={styles.indicador}><span /> AMBIENTE DE APRENDIZAGEM</span>
        <h1 className={styles.titulo}>Bem-vindo ao <span>TENKEN</span></h1>
        <p className={styles.resumo}>Seu espaço para aprender, acompanhar o plano da aula e consultar os equipamentos do laboratório.</p>
        <Link className={styles.acao} href="/aluno/diagnostico">
          Ver diagnóstico da aula <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className={styles.rodape}>TECNOLOGIA INDUSTRIAL <span>•</span> SEGURANÇA <span>•</span> PRECISÃO</div>
    </section>
  );
}
