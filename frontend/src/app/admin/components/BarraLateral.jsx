"use client";

import { usePathname } from "next/navigation";
import styles from "./BarraLateral.module.css";

const itens = [
  ["/admin", "Visão geral"],
  ["/admin/equipamentos", "Equipamentos"],
  ["/admin/chamados", "Chamados e OS"],
  ["/admin/checklists", "Checklists"],
  ["/admin/ocorrencias", "Ocorrências"],
  ["/admin/gestao", "Usuários e relatórios"],
];

export default function BarraLateral({ statusApi }) {
  const pathname = usePathname();
  const textoStatus = statusApi === "online" ? "Conectada" : statusApi === "offline" ? "Indisponível" : "Verificando";
  return (
    <aside className={styles.barra}>
      <a className={styles.marca} href="/" aria-label="Tenken, início"><img src="/assets/img/logo-site/logo_horizontal.svg" alt="Tenken" /></a>
      <div className={styles.org}>Área administrativa</div>
      <nav className={styles.navegacao} aria-label="Navegação administrativa">
        <span className={styles.rotulo}>Gestão</span>
        {itens.map(([href, label]) => <a key={href} className={`${styles.item} ${pathname === href ? styles.ativo : ""}`} href={href} aria-current={pathname === href ? "page" : undefined}><span className={styles.icone} aria-hidden="true" /><span>{label}</span></a>)}
      </nav>
      <div className={styles.rodape}><span className={`${styles.ponto} ${statusApi === "online" ? styles.online : ""}`} />API {textoStatus}</div>
    </aside>
  );
}
