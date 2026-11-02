"use client";

import { useState } from "react";
import styles from "./FormularioLogin.module.css";

export default function FormularioLogin({ loading, error, statusApi, apiUrl, onEntrar }) {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");

  async function enviar(event) {
    event.preventDefault();
    const sucesso = await onEntrar(matricula, senha);
    if (sucesso) setSenha("");
  }

  const textoStatus = statusApi === "online" ? "Conectada" : statusApi === "offline" ? "Indisponível" : "Verificando";

  return (
    <section className={styles.area}>
      <div className={styles.cartao}>
        <span className={styles.selo}>Acesso administrativo</span>
        <h2>Conecte-se à API</h2>
        <p>Entre com uma conta ADMIN para carregar os dados reais do dashboard.</p>
        <form onSubmit={enviar} className={styles.formulario}>
          <label htmlFor="matricula">Matrícula</label>
          <input id="matricula" autoComplete="username" value={matricula} onChange={(event) => setMatricula(event.target.value)} required />
          <label htmlFor="senha">Senha</label>
          <input id="senha" type="password" autoComplete="current-password" value={senha} onChange={(event) => setSenha(event.target.value)} required />
          {error && <p className={styles.erro} role="alert">{error}</p>}
          <button className={styles.botaoPrincipal} disabled={loading}>{loading ? "Conectando…" : "Entrar"}</button>
        </form>
        <div className={styles.notaApi}>
          <span className={`${styles.ponto} ${statusApi === "online" ? styles.pontoAtivo : ""}`} />
          API {textoStatus}
          <code>{apiUrl}</code>
        </div>
      </div>
    </section>
  );
}
