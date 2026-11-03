"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BarraLateralProfessor.module.css";

const itens = [
  { href: "/professor", label: "Visão geral", icon: "dashboard", pronto: true },
  { href: "/professor/agendamentos", label: "Agendamentos", icon: "calendar_month", pronto: true },
  { href: "/professor/turmas", label: "Minhas turmas", icon: "groups" },
  { href: "/professor/inspecoes", label: "Inspeções", icon: "fact_check" },
  { href: "/professor/equipamentos", label: "Equipamentos", icon: "precision_manufacturing" },
];

export default function BarraLateralProfessor() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.topSection}>
        <div className={styles.brandHeader}>
          <Link href="/" className={styles.brandLink} aria-label="Tenken início">
            <span className={`material-symbols-outlined ${styles.brandBadge}`} aria-hidden="true">precision_manufacturing</span>
            <span className={styles.brandInfo}>
              <strong className={styles.brandTitle}>TENKEN</strong>
              <span className={styles.brandSub}>GESTÃO DE LABORATÓRIO</span>
            </span>
          </Link>
        </div>

        <div className={styles.sectionHeading}>Espaço do professor</div>
        <nav className={styles.navMenu} aria-label="Navegação do professor">
          {itens.map((item) => {
            const ativo = pathname === item.href;

            if (!item.pronto) {
              return (
                <span key={item.href} className={`${styles.navItem} ${styles.navItemPending}`} aria-disabled="true" title="Tela será estruturada na próxima etapa">
                  <span className={`material-symbols-outlined ${styles.navIcon}`} aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                  <span className={styles.pendingLabel}>EM BREVE</span>
                </span>
              );
            }

            return (
              <Link key={item.href} href={item.href} className={`${styles.navItem} ${ativo ? styles.navItemActive : ""}`} aria-current={ativo ? "page" : undefined}>
                <span className={`material-symbols-outlined ${styles.navIcon}`} aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.profileAvatar} aria-hidden="true">MC</div>
        <div className={styles.profileInfo}>
          <strong>Marina Costa</strong>
          <span>Professora · demonstração</span>
        </div>
      </div>
    </aside>
  );
}
