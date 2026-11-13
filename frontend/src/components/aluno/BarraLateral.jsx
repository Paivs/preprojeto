"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { IconeCasa, IconeEquipamento } from "./IconesNavegacao";
import styles from "./BarraLateral.module.css";

export default function BarraLateral({ itemAtivo }) {
  const pathname = usePathname();
  const itemAtual = pathname === "/aluno/equipamentos"
    ? "equipamentos"
    : pathname === "/aluno/diagnostico"
      ? "diagnostico"
      : itemAtivo;

  return (
    <aside className={styles.barra} aria-label="Navegação do aluno">
      <div className={styles.brandHeader}>
        <Link href="/" className={styles.brandLink} aria-label="Tenken inicio">
          <Image
            src="/assets/img/logo-site/logo_horizontal.svg"
            alt="Tenken"
            width={150}
            height={36}
            priority
            className={styles.brandLogo}
          />
        </Link>
      </div>
      <div className={styles.sectionHeading}>Área do aluno</div>
      <nav className={styles.navegacao}>
        <Link
          className={`${styles.link} ${itemAtual === "diagnostico" ? styles.ativo : ""}`}
          href="/aluno/diagnostico"
          aria-current={itemAtual === "diagnostico" ? "page" : undefined}
        >
          <span className={styles.caixaIcone}>
            <IconeCasa className={`${styles.icone} ${itemAtual === "diagnostico" ? styles.iconeAtivo : ""}`} />
          </span>
          <span>Diagnóstico</span>
        </Link>
        <Link
          className={`${styles.link} ${itemAtual === "equipamentos" ? styles.ativo : ""}`}
          href="/aluno/equipamentos"
          aria-current={itemAtual === "equipamentos" ? "page" : undefined}
        >
          <span className={styles.caixaIcone}>
            <IconeEquipamento className={`${styles.icone} ${itemAtual === "equipamentos" ? styles.iconeAtivo : ""}`} />
          </span>
          <span>Equipamentos</span>
        </Link>
      </nav>
      <footer className={styles.footer}>
        <div className={styles.statusCard} role="status">
          <span className={styles.pontoVerde} aria-hidden="true" />
          <span>Bancada liberada</span>
        </div>
      </footer>
    </aside>
  );
}
