"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const paginas = [
  { nome: "Visão geral", caminho: "/admin", icone: "⌂" },
  { nome: "Relatos", caminho: "/admin/relatos", icone: "▤" },
  { nome: "Usuários", caminho: "/admin/usuarios", icone: "♙" },
  { nome: "Configurações", caminho: "/admin/configuracoes", icone: "⚙" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-icon">F</div>
        <div>
          <h2>AlertAbc</h2>
          <span>Painel administrativo</span>
        </div>
      </div>

      <div className="admin-menu-label">MENU PRINCIPAL</div>

      <nav className="admin-nav">
        {paginas.map((pagina) => {
          const ativo =
            pagina.caminho === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(pagina.caminho);

          return (
            <Link
              key={pagina.caminho}
              href={pagina.caminho}
              className={`admin-nav-link ${ativo ? "active" : ""}`}
            >
              <span className="admin-nav-icon">{pagina.icone}</span>

              <span>{pagina.nome}</span>
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-bottom">
        <div className="admin-profile">
          <div className="admin-avatar">A</div>

          <div className="admin-profile-info">
            <strong>Administrador</strong>
            <span>Administrador geral</span>
          </div>
        </div>

        <Link href="/login" className="admin-logout">
          <span>↪</span>
          Sair do painel
        </Link>
      </div>
    </aside>
  );
}
