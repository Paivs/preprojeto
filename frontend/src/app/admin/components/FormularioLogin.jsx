"use client";

import { useEffect, useState } from "react";
import styles from "./FormularioLogin.module.css";

export default function FormularioLogin({ loading, error, statusApi, apiUrl, onEntrar }) {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [manterSessao, setManterSessao] = useState(false);
  const [erroFechado, setErroFechado] = useState(false);

  useEffect(() => { if (error) setErroFechado(false); }, [error]);

  async function enviar(event) {
    event.preventDefault();
    const sucesso = await onEntrar(matricula, senha, { manterSessao });
    if (sucesso) setSenha("");
  }

  const textoStatus = statusApi === "online" ? "Conectada" : statusApi === "offline" ? "Indisponível" : "Verificando";
  const erroVisivel = Boolean(error) && !erroFechado;

  return (
    <section className={styles.area}>
      <div className={styles.cartao}>
        <div className={styles.marca}>
          <span className={styles.marcaIcone} aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" width="26" height="26">
              <path d="M16 2L4 9V23L16 30L28 23V9L16 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M16 8L8 12.5V20L16 24.5L24 20V12.5L16 8Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.5" />
              <path d="M16 2V30M4 9L28 23M4 23L28 9" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
            </svg>
          </span>
          <div>
            <h2 className={styles.titulo}>TENKEN</h2>
            <p className={styles.subRotulo}>PAINEL OPERACIONAL</p>
          </div>
        </div>

        {erroVisivel && (
          <div className={styles.bannerErro} role="alert">
            <span className={styles.bannerErroIcone} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M12 7v6M12 16.5v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </span>
            <div className={styles.bannerErroConteudo}>
              <span className={styles.bannerErroTitulo}>Falha de Autorização</span>
              <span className={styles.bannerErroTexto}>{error}</span>
            </div>
            <button type="button" aria-label="Fechar alerta" className={styles.bannerErroFechar} onClick={() => setErroFechado(true)}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        )}

        <form onSubmit={enviar} className={styles.formulario}>
          <div className={styles.campo}>
            <label htmlFor="matricula" className={styles.rotuloCampo}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M9 3.5h6M9 10h6M9 13.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              Matrícula de acesso
            </label>
            <input
              id="matricula"
              autoComplete="username"
              placeholder="Ex: ADM-8802"
              value={matricula}
              onChange={(event) => setMatricula(event.target.value)}
              required
            />
          </div>

          <div className={styles.campo}>
            <label htmlFor="senha" className={styles.rotuloCampo}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><circle cx="8" cy="12" r="3.3" stroke="currentColor" strokeWidth="1.6" /><path d="M10.8 12H20M16.5 12v3M20 12v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              Chave de Acesso
            </label>
            <div className={styles.inputComBotao}>
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />
              <button
                type="button"
                className={styles.botaoOlho}
                aria-label="Alternar exibição da chave de acesso"
                onClick={() => setMostrarSenha((atual) => !atual)}
              >
                {mostrarSenha ? (
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none"><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M9.9 5.6A10.6 10.6 0 0112 5c5.2 0 9 4 10.5 7-.6 1.2-1.5 2.6-2.7 3.8M6.2 6.9C4.1 8.2 2.6 10 1.5 12c1.5 3 5.3 7 10.5 7 1.1 0 2.1-.17 3-.47" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M9.8 14.2a3.3 3.3 0 004.4-4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none"><path d="M1.5 12S5.3 5 12 5s10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="12" r="3.3" stroke="currentColor" strokeWidth="1.6" /></svg>
                )}
              </button>
            </div>
          </div>

          <label className={styles.opcaoSessao}>
            <input type="checkbox" checked={manterSessao} onChange={(event) => setManterSessao(event.target.checked)} />
            <span>Manter sessão ativa (12h)</span>
          </label>

          <button className={styles.botaoPrincipal} disabled={loading}>
            <span>{loading ? "Autenticando…" : "Entrar no Sistema"}</span>
            {!loading && (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M14 6l6 6-6 6M20 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </button>
        </form>

        <div className={styles.notaApi}>
          <span className={`${styles.ponto} ${statusApi === "online" ? styles.pontoAtivo : ""}`} />
          API {textoStatus}
          <code>{apiUrl}</code>
        </div>

        <div className={styles.rodapeSeguranca}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M8 10.5V7a4 4 0 018 0v3.5" stroke="currentColor" strokeWidth="1.6" /></svg>
          <span>Acesso Estritamente Restrito a Administradores</span>
        </div>
      </div>
    </section>
  );
}
