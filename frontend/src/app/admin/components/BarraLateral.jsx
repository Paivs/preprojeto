"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BarraLateral.module.css";

const itens = [
  { href: "/admin", label: "Resumo", icon: "dashboard" },
  { href: "/admin/equipamentos", label: "Equipamentos", icon: "settings_input_component" },
  { href: "/admin/chamados", label: "Chamados e OS", icon: "confirmation_number" },
  { href: "/admin/usuarios", label: "Usuários", icon: "manage_accounts" },
  { href: "/admin/relatorios", label: "Relatórios", icon: "analytics" },
];

export default function BarraLateral({ statusApi }) {
  const pathname = usePathname();
  const online = statusApi === "online";
  const textoStatus = online ? "Sistema conectado" : statusApi === "offline" ? "Sistema indisponível" : "Verificando conexão";

  return (
    <aside className={styles.sidebar}>
      <div className={styles.topSection}>
        {/* Header / Brand */}
        <div className={styles.brandHeader}>
          <Link href="/" className={styles.brandLink} aria-label="Tenken Início">
            <div className={styles.brandBadge}>
              <span className="material-symbols-outlined">precision_manufacturing</span>
            </div>
            <div className={styles.brandInfo}>
              <span className={styles.brandTitle}>TENKEN</span>
              <span className={styles.brandSub}>GESTÃO DE LABORATÓRIO</span>
            </div>
          </Link>
          <div className={styles.brandStatusDot} />
        </div>

        {/* Section Label */}
        <div className={styles.sectionHeading}>
          <span>Administração</span>
        </div>

        {/* Navigation */}
        <nav className={styles.navMenu} aria-label="Navegação administrativa">
          {itens.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={`material-symbols-outlined ${styles.navIcon}`}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Telemetry */}
      <div className={styles.footer}>
        <div className={styles.telemetryCard}>
          <span className={`${styles.pulseDot} ${online ? styles.pulseDotOnline : styles.pulseDotOffline}`} />
          <span className={styles.telemetryText}>{textoStatus}</span>
        </div>
      </div>
    </aside>
  );
}
