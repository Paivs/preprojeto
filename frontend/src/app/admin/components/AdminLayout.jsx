"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import BarraLateral from "./BarraLateral";
import FormularioLogin from "./FormularioLogin";
import { carregarSessao, entrarComoAdmin, limparSessao, salvarSessao, verificarSaude } from "../lib/adminApi";
import { API_URL } from "../lib/constantes";
import styles from "./AdminLayout.module.css";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [token, setToken] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [statusApi, setStatusApi] = useState("checking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    verificarSaude().then(setStatusApi);
    const sessao = carregarSessao();
    if (sessao.token) {
      setToken(sessao.token);
      setUsuario(sessao.usuario);
    }
  }, []);

  const titulosPagina = {
    "/admin": "Visão geral",
    "/admin/chamados": "Chamados",
    "/admin/equipamentos": "Equipamentos",
    "/admin/relatorios": "Relatórios",
    "/admin/usuarios": "Usuários",
  };
  const tituloPagina = titulosPagina[pathname] || "Administração";

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

  return (
    <div className={styles.wrapper}>
      {/* Persistent Technical Sidebar */}
      <BarraLateral statusApi={statusApi} aberta={menuAberto} onNavegar={() => setMenuAberto(false)} onFechar={() => setMenuAberto(false)} />
      {menuAberto && <button type="button" className={styles.backdrop} aria-label="Fechar menu" onClick={() => setMenuAberto(false)} />}

      {/* Main Administrative Spine */}
      <div className={styles.contentSpine}>
        {/* Fixed Technical Topbar */}
        <header className={styles.topbar}>
          <button type="button" className={styles.menuBtn} onClick={() => setMenuAberto(true)} aria-label="Abrir menu" aria-expanded={menuAberto}>
            <span className="material-symbols-outlined">menu</span>
          </button>

          <nav className={styles.breadcrumb} aria-label="Localização atual">
              <span>TENKEN</span>
              <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
              <span>Administração</span>
              <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
              <strong className={styles.breadcrumbCurrent}>{tituloPagina}</strong>
          </nav>

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
