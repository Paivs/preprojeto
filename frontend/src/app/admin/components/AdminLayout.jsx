"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import BarraLateral from "./BarraLateral";
import FormularioLogin from "./FormularioLogin";
import { carregarSessao, entrarComoAdmin, limparSessao, salvarSessao, verificarSaude } from "../lib/adminApi";
import { API_URL } from "../lib/constantes";
import styles from "./AdminLayout.module.css";

const rotulosPagina = {
  "/admin": "Visão Geral",
  "/admin/equipamentos": "Equipamentos",
  "/admin/chamados": "Chamados e OS",
  "/admin/checklists": "Checklists",
  "/admin/ocorrencias": "Ocorrências",
  "/admin/gestao": "Usuários e Relatórios",
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [token, setToken] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [statusApi, setStatusApi] = useState("checking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    verificarSaude().then(setStatusApi);
    const sessao = carregarSessao();
    if (sessao.token) { setToken(sessao.token); setUsuario(sessao.usuario); }
  }, []);

  async function entrar(matricula, senha) {
    setLoading(true); setError("");
    try {
      const resultado = await entrarComoAdmin(matricula, senha);
      salvarSessao(resultado.token, resultado.usuario);
      setToken(resultado.token); setUsuario(resultado.usuario);
      return true;
    } catch (erro) { setError(erro.message); return false; }
    finally { setLoading(false); }
  }

  function sair() { limparSessao(); setToken(""); setUsuario(null); }

  if (!token) {
    return (
      <main className={styles.loginPage}>
        <div className={styles.loginHead}>
          <a href="/">Tenken</a>
          <span>Administração</span>
        </div>
        <FormularioLogin loading={loading} error={error} statusApi={statusApi} apiUrl={API_URL} onEntrar={entrar} />
      </main>
    );
  }

  const textoStatus = statusApi === "online" ? "API Conectada" : statusApi === "offline" ? "API Indisponível" : "Verificando API";
  const paginaAtual = rotulosPagina[pathname] || "Área Administrativa";

  return (
    <main className={styles.layout}>
      <BarraLateral statusApi={statusApi} />
      <section className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerEsquerda}>
            <nav className={styles.breadcrumb} aria-label="Trilha de navegação">
              <span>Tenken</span>
              <span className={styles.separador} aria-hidden="true">›</span>
              <span>Painel Operacional</span>
              <span className={styles.separador} aria-hidden="true">›</span>
              <span className={styles.breadcrumbAtual}>{paginaAtual}</span>
            </nav>
            <div className={`${styles.statusApi} ${styles[statusApi] || ""}`}>
              <span className={styles.statusPonto} aria-hidden="true" />
              <span>{textoStatus}</span>
            </div>
          </div>
          <div className={styles.user}>
            <div className={styles.avatar} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="8.5" r="3.4" />
                <path d="M5 19.2c.9-3.4 3.4-5.3 7-5.3s6.1 1.9 7 5.3" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles.identidade}>
              <span className={styles.nome}>{usuario?.nome || usuario?.matricula}</span>
              <span className={styles.cargo}>Administrador</span>
            </div>
            <button className={styles.sair} onClick={sair}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M12 3.6v8" strokeLinecap="round" />
                <path d="M6.5 6.4a7.4 7.4 0 1 0 11 0" strokeLinecap="round" />
              </svg>
              <span>Sair</span>
            </button>
          </div>
        </header>
        {typeof children === "function" ? children({ token, usuario }) : children}
      </section>
    </main>
  );
}
