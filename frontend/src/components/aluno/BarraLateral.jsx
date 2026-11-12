"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconeCasa, IconeEquipamento } from "./IconesNavegacao";
import styles from "./BarraLateral.module.css";

export default function BarraLateral({ itemAtivo }) {
  const pathname = usePathname();
  const itemAtual = pathname === "/aluno/equipamentos"
    ? "equipamentos"
    : pathname === "/aluno/bem-vindo"
      ? "bem-vindo"
      : itemAtivo;

  return (
    <aside className={styles.barra} aria-label="Navegação do aluno">
      <div className={styles.marca}>Tenken</div>
      <nav className={styles.navegacao}>
        <Link
          className={`${styles.link} ${itemAtual === "bem-vindo" ? styles.ativo : ""}`}
          href="/aluno/bem-vindo"
          aria-current={itemAtual === "bem-vindo" ? "page" : undefined}
        >
          <span className={`${styles.caixaIcone} ${itemAtual === "bem-vindo" ? styles.caixaIconeAtiva : ""}`}>
            <IconeCasa className={`${styles.icone} ${itemAtual === "bem-vindo" ? styles.iconeAtivo : ""}`} />
          </span>
          <span>Bem-vindo</span>
        </Link>
        <Link
          className={`${styles.link} ${itemAtual === "equipamentos" ? styles.ativo : ""}`}
          href="/aluno/equipamentos"
          aria-current={itemAtual === "equipamentos" ? "page" : undefined}
        >
          <span className={`${styles.caixaIcone} ${itemAtual === "equipamentos" ? styles.caixaIconeAtiva : ""}`}>
            <IconeEquipamento className={`${styles.icone} ${itemAtual === "equipamentos" ? styles.iconeAtivo : ""}`} />
          </span>
          <span>Equipamentos</span>
        </Link>
      </nav>
      <div className={styles.status} role="status">
        <span className={styles.pontoVerde} aria-hidden="true" />
        Bancada liberada
      </div>
    </aside>
  );
}
