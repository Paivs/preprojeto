"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { limparSessao, obterTokenSessao, obterUsuarioSessao, validarSessao } from "@/lib/session";
import "./sidebar.css";

export default function Sidebar() {
  const [perfil, setPerfil] = useState(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let ativo = true;

    async function conferirSessao() {
      const token = obterTokenSessao();
      if (!token) {
        router.replace("/login");
        return;
      }

      const usuarioSalvo = obterUsuarioSessao();
      if (usuarioSalvo?.perfil === "admin" || usuarioSalvo?.perfil === "cliente") {
        if (ativo) setPerfil(usuarioSalvo.perfil);
        if (usuarioSalvo.perfil === "admin" && pathname.startsWith("/userPages")) {
          router.replace("/adminPages/clientes");
          return;
        }
        if (usuarioSalvo.perfil === "cliente" && pathname.startsWith("/adminPages")) {
          router.replace("/userPages/dashboard");
          return;
        }
      }

      try {
        const usuario = await validarSessao(token);
        if (usuario.perfil !== "admin" && usuario.perfil !== "cliente") {
          throw new Error("Perfil invalido.");
        }
        if (usuario.perfil === "admin" && pathname.startsWith("/userPages")) {
          router.replace("/adminPages/clientes");
          return;
        }
        if (usuario.perfil === "cliente" && pathname.startsWith("/adminPages")) {
          router.replace("/userPages/dashboard");
          return;
        }
        if (ativo) setPerfil(usuario.perfil);
      } catch (erro) {
        if (erro.status === 401) {
          limparSessao();
          router.replace("/login");
        }
      }
    }

    conferirSessao();
    return () => { ativo = false; };
  }, [pathname, router]);

  function sair() {
    limparSessao();
    setPerfil(null);
    window.location.replace("/");
  }

  if (!perfil) return null;

  return (
    <aside className="sidebar">
      <div className="logo">
        <img src="/images/logo.png" alt="Volt House" className="logo-imagem" />
      </div>

      <p className="menu-titulo">MENU PRINCIPAL</p>

      <nav className="menu-principal">
        {perfil === "admin" ? (
          // SIDEBAR DO ADMINISTRADOR
          <>
            <Link
              href="/adminPages/clientes"
              className={`menu-item ${
                pathname === "/adminPages/clientes" ? "menu-item-ativo" : ""
              }`}
            >
              <span>
                <i className="bi bi-person"></i>
              </span>
              <span>Clientes</span>
            </Link>

            <Link
              href="/adminPages/contatos"
              className={`menu-item ${
                pathname === "/adminPages/contatos" ? "menu-item-ativo" : ""
              }`}
            >
              <span>
                <i className="bi bi-inbox"></i>
              </span>
              <span>Pedidos de contato</span>
            </Link>

            <Link
              href="/adminPages/financeiro"
              className={`menu-item ${
                pathname === "/adminPages/financeiro" ? "menu-item-ativo" : ""
              }`}
            >
              <span>
                <i className="bi bi-bar-chart"></i>
              </span>
              <span>Financeiro</span>
            </Link>

            <Link
              href="/adminPages/configuracaoAdmin"
              className={`menu-item ${
                pathname === "/adminPages/configuracaoAdmin"
                  ? "menu-item-ativo"
                  : ""
              }`}
            >
              <span>
                <i className="bi bi-gear"></i>
              </span>
              <span>Configurações</span>
            </Link>
          </>
        ) : (
          // SIDEBAR DO USUÁRIO
          <>
            <Link
              href="/userPages/dashboard"
              className={`menu-item ${
                pathname === "/userPages/dashboard" ? "menu-item-ativo" : ""
              }`}
            >
              <span>
                <i className="bi bi-ui-checks-grid"></i>
              </span>
              <span>Visão Geral</span>
            </Link>

            <Link
              href="/userPages/dispositivos"
              className={`menu-item ${
                pathname === "/userPages/dispositivos" ? "menu-item-ativo" : ""
              }`}
            >
              <span>
                <i className="bi bi-inboxes"></i>
              </span>
              <span>Equipamentos</span>
            </Link>

            <Link
              href="/userPages/relatorio"
              className={`menu-item ${
                pathname === "/userPages/relatorio" ? "menu-item-ativo" : ""
              }`}
            >
              <span>
                <i className="bi bi-calendar"></i>
              </span>
              <span>Relatórios de Consumo</span>
            </Link>

            <Link
              href="/userPages/setores"
              className={`menu-item ${
                pathname.startsWith("/userPages/setores") ? "menu-item-ativo" : ""
              }`}
            >
              <span>
                <i className="bi bi-ui-checks-grid"></i>
              </span>
              <span>Setores</span>
            </Link>

            <Link
              href="/userPages/configuracoes"
              className={`menu-item ${
                pathname === "/userPages/configuracoes" ? "menu-item-ativo" : ""
              }`}
            >
              <span>
                <i className="bi bi-gear"></i>
              </span>
              <span>Configurações</span>
            </Link>
          </>
        )}
      </nav>

      <div className="sidebar-rodape">
        <button type="button" className="menu-item menu-sair" onClick={sair} aria-label="Sair da conta">
          <span>⇥</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
