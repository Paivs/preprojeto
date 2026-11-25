"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./header.css";

export default function Header() {
  const pathname = usePathname();
  const [temaClaro, setTemaClaro] = useState(false);

  useEffect(() => {
    let temaSalvo =
      document.documentElement.dataset.tema === "claro" ? "claro" : "escuro";

    try {
      temaSalvo = localStorage.getItem("volthouse-tema") || temaSalvo;
    } catch {
      // A preferência aplicada no documento continua disponível nesta sessão.
    }

    const claro = temaSalvo === "claro";
    if (claro) {
      document.documentElement.dataset.tema = "claro";
    } else {
      delete document.documentElement.dataset.tema;
    }
    setTemaClaro(claro);
  }, []);

  function alternarTema() {
    const novoTema = temaClaro ? "escuro" : "claro";

    if (novoTema === "claro") {
      document.documentElement.dataset.tema = "claro";
    } else {
      delete document.documentElement.dataset.tema;
    }

    try {
      localStorage.setItem("volthouse-tema", novoTema);
    } catch {
      // A troca visual não depende do armazenamento local.
    }

    setTemaClaro(novoTema === "claro");
  }

  return (
    <header className="header">
      <nav className="navbar">
        <div className="container-navbar">
          <Link className="navbar-brand" href="/">
            <img src="/images/logo.png" alt="Logo da empresa" />
          </Link>

          <ul className="navbar-header">
            <li>
              <Link
                className={`nav-link ${pathname === "/" ? "active" : ""}`}
                href="/"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                className={`nav-link ${pathname === "/sobreNos" ? "active" : ""}`}
                href="/sobreNos"
              >
                Sobre nós
              </Link>
            </li>

            <li>
              <Link
                className={`nav-link ${pathname === "/contato" ? "active" : ""}`}
                href="/contato"
              >
                Contato
              </Link>
            </li>
          </ul>

          <div className="header-actions">
            <button
              type="button"
              className="header-theme-toggle"
              aria-label={`Ativar tema ${temaClaro ? "escuro" : "claro"}`}
              aria-pressed={temaClaro}
              title={`Ativar tema ${temaClaro ? "escuro" : "claro"}`}
              onClick={alternarTema}
            >
              <i className={`bi ${temaClaro ? "bi-moon-stars" : "bi-sun"}`} aria-hidden="true" />
            </button>

            <Link className="nav-login" href="/login">
              <span>Entrar</span>
              <i className="bi bi-arrow-up-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
