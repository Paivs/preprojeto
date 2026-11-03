"use client";

import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import styles from "@/components/auth/authForm.module.css";

export default function LoginPage() {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");

  function enviarFormulario(event) {
    event.preventDefault();
  }

  return (
    <AuthLayout title="Entrar" subtitle="Acesse com sua matrícula e senha">
      <form className={styles.form} onSubmit={enviarFormulario}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="matricula">Matrícula</label>
          <input
            className={styles.input}
            id="matricula"
            name="matricula"
            type="text"
            placeholder="MAT-XXXXX"
            value={matricula}
            onChange={(event) => setMatricula(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="senha">Senha</label>
          <input
            className={styles.input}
            id="senha"
            name="senha"
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
          />
        </div>

        <button className={styles.button} type="submit">Entrar</button>
      </form>
    </AuthLayout>
  );
}
