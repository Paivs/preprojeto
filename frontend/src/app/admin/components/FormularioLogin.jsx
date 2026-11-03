"use client";

import { useEffect, useState } from "react";
import styles from "./FormularioLogin.module.css";

export default function FormularioLogin({ loading, error, statusApi, apiUrl, onEntrar }) {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [manterSessao, setManterSessao] = useState(false);
  const [erroFechado, setErroFechado] = useState(false);

  useEffect(() => {
    if (error) setErroFechado(false);
  }, [error]);

  async function handleSubmit(event) {
    event.preventDefault();
    const sucesso = await onEntrar(matricula, senha, { manterSessao });
    if (sucesso) setSenha("");
  }

  const erroVisivel = Boolean(error) && !erroFechado;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.content}>
          {/* Brand Header */}
          <div className={styles.header}>
            <img
              className={styles.brandSign}
              src="/assets/img/logo-site/letreiro_tenken.svg"
              alt="Tenken"
            />
          </div>

          {/* Authorization Error Alert */}
          {erroVisivel && (
            <div className={styles.authAlert} role="alert">
              <span className={`material-symbols-outlined ${styles.alertIcon}`}>error</span>
              <div className={styles.alertBody}>
                <span className={styles.alertTitle}>Não foi possível entrar</span>
                <span className={styles.alertMessage}>{error}</span>
              </div>
              <button
                type="button"
                className={styles.alertClose}
                onClick={() => setErroFechado(true)}
                aria-label="Fechar alerta"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
              </button>
            </div>
          )}

          {/* Form */}
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <label htmlFor="reg-code" className={styles.fieldLabel}>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>badge</span>
                <span>Matrícula</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="reg-code"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Ex: ADM-8802"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="admin-key" className={styles.fieldLabel}>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>key</span>
                <span>Senha</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="admin-key"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={`${styles.input} ${styles.inputWithToggle}`}
                />
                <button
                  type="button"
                  className={styles.toggleVisibilityBtn}
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    {mostrarSenha ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className={styles.optionsRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={manterSessao}
                  onChange={(e) => setManterSessao(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>Manter sessão ativa (12h)</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              <span>{loading ? "Entrando..." : "Entrar"}</span>
              <span className={`material-symbols-outlined ${styles.submitIcon}`}>
                {loading ? "hourglass_empty" : "login"}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <div className={styles.dividerLine} />
          </div>

          {/* Footer Notice */}
          <div className={styles.footerNotice}>
            <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "var(--mahogany-red-2, #ba181b)" }}>lock</span>
            <span>Acesso exclusivo para administradores</span>
          </div>
        </div>
      </div>
    </div>
  );
}
