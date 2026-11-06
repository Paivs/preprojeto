"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import "./sidebar.css";

export default function Sidebar({ tipoUsuario = "usuario" }) {
  const pathname = usePathname();
  const isAdmin = tipoUsuario === "admin";
  const estaAtivo = (href) => pathname === href || pathname.startsWith(`${href}/`);
  const classeItem = (href) => `menu-item ${estaAtivo(href) ? "menu-item-ativo" : ""}`;

  return (
    <aside className="sidebar">

      <div className="logo">
        <img
          src="/images/logo.png"
          alt="Volt House"
          className="logo-imagem"
        />
      </div>

      <p className="menu-titulo">MENU PRINCIPAL</p>

      <nav className="menu-principal">

        {isAdmin ? (
          // MENU DO ADMINISTRADOR
          <>
            <button type="button" className={`menu-item ${["/adminPages", "/adminPages/dashboard"].includes(pathname) ? "menu-item-ativo" : ""}`}>
              <span>▦</span>
              <span>Visão Geral</span>
            </button>

            <button type="button" className={`menu-item ${estaAtivo("/adminPages/clientes") ? "menu-item-ativo" : ""}`}>
              <span>♙</span>
              <span>Clientes</span>
            </button>

            <button type="button" className={`menu-item ${estaAtivo("/adminPages/configuracoes") ? "menu-item-ativo" : ""}`}>
              <span>⚙</span>
              <span>Configurações</span>
            </button>
          </>
        ) : (
          // MENU DO USUÁRIO COMUM
          <>
            <Link href="/userPages/dashboard" className={classeItem("/userPages/dashboard")} aria-current={estaAtivo("/userPages/dashboard") ? "page" : undefined}>
              <span>▦</span>
              <span>Visão Geral</span>
            </Link>

            <Link href="/userPages/dispositivos" className={classeItem("/userPages/dispositivos")} aria-current={estaAtivo("/userPages/dispositivos") ? "page" : undefined}>
              <span>▣</span>
              <span>Dispositivos</span>
            </Link>

            <Link href="/userPages/relatorios" className={classeItem("/userPages/relatorios")} aria-current={estaAtivo("/userPages/relatorios") ? "page" : undefined}>
              <span>▥</span>
              <span>Relatórios de Consumo</span>
            </Link>

            <Link href="/userPages/faturas" className={classeItem("/userPages/faturas")} aria-current={estaAtivo("/userPages/faturas") ? "page" : undefined}>
              <span>▤</span>
              <span>Faturas</span>
            </Link>

            <Link href="/userPages/configuracoes" className={classeItem("/userPages/configuracoes")} aria-current={estaAtivo("/userPages/configuracoes") ? "page" : undefined}>
              <span>⚙</span>
              <span>Configurações</span>
            </Link>
          </>
        )}

      </nav>

      <div className="sidebar-rodape">

        {!isAdmin && (
          <div className="painel-sistema">
            <div className="painel-sistema-topo">
              <span className="ponto-verde" />
              <span>Sistema operacional</span>
              <strong>98%</strong>
            </div>

            <div className="barra-progresso">
              <div
                className="barra-progresso-preenchida"
                style={{ width: "98%" }}
              />
            </div>

            <p>6 de 6 dispositivos respondendo</p>
          </div>
        )}

        <button type="button" className="menu-item menu-sair">
          <span>⇥</span>
          <span>Sair</span>
        </button>

      </div>

    </aside>
  );
}
