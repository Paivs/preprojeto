"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import BarraLateral from "./BarraLateral";
import FormularioLogin from "./FormularioLogin";
import { carregarSessao, entrarComoAdmin, limparSessao, salvarSessao, verificarSaude } from "../lib/adminApi";
import { API_URL } from "../lib/constantes";
import styles from "./AdminLayout.module.css";

const rotulosPagina = {
  "/admin": "Visão Geral",
  "/admin/equipamentos": "Equipamentos",
  "/admin/chamados": "Chamados e OS",
  "/admin/usuarios": "Usuários",
  "/admin/relatorios": "Relatórios",
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
    if (sessao.token) {
      setToken(sessao.token);
      setUsuario(sessao.usuario);
    }
  }, []);

  async function entrar(matricula, senha, opcoes = {}) {
    setLoading(true);
    setError("");
    try {
      const resultado = await entrarComoAdmin(matricula, senha);
      salvarSessao(resultado.token, resultado.usuario);
      setToken(resultado.token);
      setUsuario(resultado.usuario);
      return true;
    } catch (erro) {
      setError(erro.message || "Confira sua matrícula e senha e tente novamente.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  function sair() {
    limparSessao();
    setToken("");
    setUsuario(null);
  }

  if (!token) {
    return (
      <main className={styles.loginContainer}>
        <FormularioLogin
          loading={loading}
          error={error}
          statusApi={statusApi}
          apiUrl={API_URL}
          onEntrar={entrar}
        />
      </main>
    );
  }

  const online = statusApi === "online";
  const textoStatus = online ? "Sistema conectado" : statusApi === "offline" ? "Sistema indisponível" : "Verificando conexão";
  const paginaAtual = rotulosPagina[pathname] || "Administração";

  return (
    <div className={styles.wrapper}>
      {/* Persistent Technical Sidebar */}
      <BarraLateral statusApi={statusApi} />

      {/* Main Administrative Spine */}
      <div className={styles.contentSpine}>
        {/* Fixed Technical Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <nav className={styles.breadcrumb} aria-label="Trilha de navegação">
              <Link href="/admin" className={styles.breadcrumbRoot}>TENKEN</Link>
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>chevron_right</span>
              <span>Administração</span>
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>chevron_right</span>
              <span className={styles.breadcrumbCurrent}>{paginaAtual}</span>
            </nav>
            <div className={styles.verticalDivider} />
            <div className={styles.statusPill}>
              <span className={`${styles.statusDot} ${online ? styles.statusDotOnline : styles.statusDotOffline}`} />
              <span className={styles.statusText}>{textoStatus}</span>
            </div>
          </div>

          <div className={styles.topbarRight}>
            <div className={styles.userBadge}>
              <div className={styles.userAvatar}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>person</span>
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{usuario?.nome || usuario?.matricula || "Operador"}</span>
                <span className={styles.userRole}>ADMINISTRADOR</span>
              </div>
            </div>

            <button type="button" className={styles.logoutBtn} onClick={sair} aria-label="Sair da sessão">
              <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--status-critical, #ef4444)" }}>power_settings_new</span>
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Page Main View */}
        <main className={styles.mainView}>
          {typeof children === "function" ? children({ token, usuario }) : children}
        </main>
      </div>
    </div>
  );
}
