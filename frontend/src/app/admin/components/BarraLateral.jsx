"use client";

import { usePathname } from "next/navigation";
import styles from "./BarraLateral.module.css";

const itens = [
  ["/admin", "Visão geral", "dashboard"],
  ["/admin/equipamentos", "Equipamentos", "equipamentos"],
  ["/admin/chamados", "Chamados e OS", "chamados"],
  ["/admin/checklists", "Checklists", "checklists"],
  ["/admin/ocorrencias", "Ocorrências", "ocorrencias"],
  ["/admin/gestao", "Usuários e relatórios", "gestao"],
];

const icones = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3.5" y="3.5" width="7" height="9" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1" />
      <rect x="3.5" y="15.5" width="7" height="5" rx="1" />
    </svg>
  ),
  equipamentos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.4M12 18.1v2.4M20.5 12h-2.4M5.9 12H3.5M17.6 6.4l-1.7 1.7M8.1 15.9l-1.7 1.7M17.6 17.6l-1.7-1.7M8.1 8.1 6.4 6.4" />
    </svg>
  ),
  chamados: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3.5 8.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v1.2a1.6 1.6 0 0 0 0 3.2v1.6a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-1.6a1.6 1.6 0 0 0 0-3.2V8.5Z" />
      <path d="M9.5 6.5v11" strokeDasharray="2.2 2.2" />
    </svg>
  ),
  checklists: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4.5" y="3.5" width="15" height="17" rx="1.4" />
      <path d="M8 9.2l1.6 1.6 2.9-3.2M8 15.6h8M8 12.4h3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ocorrencias: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3.6 21 19.6H3L12 3.6Z" strokeLinejoin="round" />
      <path d="M12 10v4" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  gestao: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8.5" cy="8" r="2.6" />
      <path d="M3.6 19c.5-2.8 2.5-4.4 4.9-4.4s4.4 1.6 4.9 4.4" strokeLinecap="round" />
      <circle cx="16.8" cy="8.6" r="2" />
      <path d="M14.8 19c.3-2 1.7-3.4 3.4-3.6" strokeLinecap="round" />
    </svg>
  ),
};

export default function BarraLateral({ statusApi }) {
  const pathname = usePathname();
  const textoStatus = statusApi === "online" ? "Conectada" : statusApi === "offline" ? "Indisponível" : "Verificando";

  return (
    <aside className={styles.barra}>
      <div className={styles.topo}>
        <div className={styles.marcaLinha}>
          <a className={styles.marca} href="/" aria-label="Tenken, início">
            <span className={styles.marcaIcone} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 9.5 12 4l8 5.5v9L12 23l-8-4.5v-9Z" strokeLinejoin="round" />
                <path d="M12 4v9.3M4 9.5l8 3.8 8-3.8" strokeLinejoin="round" />
              </svg>
            </span>
            <span className={styles.marcaTexto}>
              <span className={styles.marcaNome}>TENKEN</span>
              <span className={styles.marcaSub}>CONTROL // OS</span>
            </span>
          </a>
          <span className={`${styles.ponto} ${statusApi === "online" ? styles.online : ""}`} aria-hidden="true" />
        </div>
        <span className={styles.rotulo}>Operação &amp; Gestão</span>
        <nav className={styles.navegacao} aria-label="Navegação administrativa">
          {itens.map(([href, label, icone]) => (
            <a
              key={href}
              className={`${styles.item} ${pathname === href ? styles.ativo : ""}`}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
            >
              <span className={styles.icone} aria-hidden="true">{icones[icone]}</span>
              <span>{label}</span>
            </a>
          ))}
        </nav>
      </div>
      <div className={styles.rodape}>
        <span className={`${styles.ponto} ${statusApi === "online" ? styles.online : ""}`} />
        <span>API {textoStatus}</span>
      </div>
    </aside>
  );
}
