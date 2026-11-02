"use client";

import { useEffect, useState } from "react";
import BarraLateral from "./BarraLateral";
import FormularioLogin from "./FormularioLogin";
import { carregarSessao, entrarComoAdmin, limparSessao, salvarSessao, verificarSaude } from "../lib/adminApi";
import { API_URL } from "../lib/constantes";
import styles from "./AdminLayout.module.css";

export default function AdminLayout({ children }) {
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

  if (!token) return <main className={styles.loginPage}><div className={styles.loginHead}><a href="/">Tenken</a><span>Administração</span></div><FormularioLogin loading={loading} error={error} statusApi={statusApi} apiUrl={API_URL} onEntrar={entrar} /></main>;

  return (
    <main className={styles.layout}>
      <BarraLateral statusApi={statusApi} />
      <section className={styles.main}>
        <header className={styles.header}><div><span className={styles.breadcrumb}>Tenken / Administração</span><h1>Área administrativa</h1></div><div className={styles.user}><span>{usuario?.nome || usuario?.matricula}</span><button onClick={sair}>Sair</button></div></header>
        {typeof children === "function" ? children({ token, usuario }) : children}
      </section>
    </main>
  );
}
