"use client";

import { useState } from "react";
import authForm from "@/components/auth/authForm.module.css";
import styles from "./FormularioVinculo.module.css";

const mensagemTokenInvalido =
  "Token inválido. Use os 6 números informados pelo professor.";

export default function FormularioVinculo({ onEnviar }) {
  const [token, setToken] = useState("");
  const [erro, setErro] = useState("");

  function enviar(evento) {
    evento.preventDefault();

    if (!/^\d{6}$/.test(token)) {
      setErro(mensagemTokenInvalido);
      return;
    }

    setErro("");
    onEnviar(token);
  }

  function editar(evento) {
    setToken(evento.target.value.replace(/\D/g, "").slice(0, 6));
    if (erro) setErro("");
  }

  return (
    <form className={authForm.form} onSubmit={enviar} noValidate>
      <div className={authForm.field}>
        <label className={authForm.label} htmlFor="token-aula">
          Token da aula
        </label>
        <input
          className={`${authForm.input} ${styles.tokenInput}`}
          id="token-aula"
          name="token"
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          value={token}
          onChange={editar}
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? "token-aula-erro" : undefined}
        />
      </div>

      {erro && (
        <p className={authForm.alert} id="token-aula-erro" role="alert">
          {erro}
        </p>
      )}

      <button className={authForm.button} type="submit">
        Solicitar acesso à bancada
      </button>
    </form>
  );
}
