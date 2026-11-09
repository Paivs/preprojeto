"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getToken, getUsuario } from "@/lib/session";
import styles from "./T\u00e9cnicoLayout.module.css";

export default function T\u00e9cnicoLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const\u00edtuloP\u00e1gina = pathname.st\u00e9cnico/chamados") ? "Chamados" : "Visi\u00e3o geral";
  const [usu\u00e1rio, setUsuario] = useState(null);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    const usu\u00e1rioAtual = getUsuario();
    if (usu\u00e1rioAtual?.perfil !== "TECNICO") {
      router.replace("/dashboard");
      return;
    }

    setUsuario(usu\u00e1rioAtual);
  }, [router]);

  function sair() {
    clearSession();
    router.replace("/login");
  }

  if (!usu\u00e1rio) return null;

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${menuA\u00e7\u00f5es.sidebarA\u00e7\u00f5es.brand}>
          <Link href="/t\u00e9cnico" aria-label="Tenken — painel t\u00e9cnico">
            <Image src="/assets/img/logo-site/logo_horizontal.svg" alt="Tenken" width={160} height={38} priority />
          </Link>
          <button type="button" className={styles.closeMenu} onClick={() => setMenuAberto(false)} aria-label="Fechar menu">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className={styles.sectionLabel}>Opera\u00e7\u00e3o t\u00e9cnica</p>
        <nav className={styles.navigation} aria-label="Navegação técnica">
          <Link
            href="/t\u00e9cnico"
            className={`${styles.navLink} ${pathname === "/t\u00e9cnico" ? styles.navLinkAtivo : ""}`}
            aria-current={pathname === "/t\u00e9cnico" ? "page" : undefined}
            onClick={() => setMenuAberto(false)}
          >
            <span className="material-symbols-outlined">monitoring</span>
            <span>Visi\u00e3o geral</span>
          </Link>
          <Link
            href="/t\u00e9cnico/chamados"
            className={`${styles.navLink} ${pathname.st\u00e9cnico/chamados") ? styles.navLinkAtivo : ""}`}
            aria-current={pathname.st\u00e9cnico/chamados") ? "page" : undefined}
            onClick={() => setMenuAberto(false)}
          >
            <span className="material-symbols-outlined">confirmation_number</span>
            <span>Chamados</span>
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.statusDot} />
          <span>Painel do t\u00e9cnico</span>
        </div>
      </aside>

      {menuAberto && <button type="button" className={styles.backdrop} onClick={() => setMenuAberto(false)} aria-label="Fechar menu" />}

      <div className={styles.content}>
        <header className={styles.topbar}>
          <button type="button" className={styles.menuButton} onClick={() => setMenuAberto(true)} aria-label="Abrir menu">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <nav className={styles.trilha} aria-label="Localiza\u00e7\u00e3o atual">
            <span>TENKEN</span>
            <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
            <span>Opera\u00e7\u00e3o t\u00e9cnica</span>
            <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
            <strong>{t\u00edtuloP\u00e1gina}</strong>
          </nav>
          <div className={styles.account}>
            <span className={styles.avatar}><span className="material-symbols-outlined">engineering</span></span>
            <span className={styles.accountInfo}>
              <strong>{usu\u00e1rio.nome || usu\u00e1rio.matricula || "T\u00e9cnico"}</strong>
              <small>TÉCNICO</small>
            </span>
            <button type="button" className={styles.logoutButton} onClick={sair}>
              <span className="material-symbols-outlined">logout</span>
              <span>Sair</span>
            </button>
          </div>
        </header>

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
