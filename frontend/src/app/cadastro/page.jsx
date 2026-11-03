"use client";

import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import styles from "@/components/auth/authForm.module.css";

export default function CadastroPage() {
  const [etapa, setEtapa] = useState(1);
  const [formulario, setFormulario] = useState({ nome: "", email: "", cpf: "", telefone: "", matricula: "" });
  const [erros, setErros] = useState({});

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
    setErros((atuais) => ({ ...atuais, [name]: "", contato: "" }));
  }

  function enviarFormulario(event) {
    event.preventDefault();
    const novosErros = {};

    if (!formulario.nome.trim()) novosErros.nome = "Informe seu nome completo.";
    if (!formulario.email.trim() && !formulario.cpf.trim()) {
      novosErros.contato = "Informe seu e-mail ou CPF.";
    }

    setErros(novosErros);
  }

  function irParaEtapaMatricula() {
    setFormulario((atual) => ({ ...atual, matricula: "" }));
    setEtapa(2);
  }

  function campo(nome, rotulo, tipo = "text", obrigatorio = false) {
    return (
      <div className={styles.field}>
        <label className={styles.label} htmlFor={nome}>{rotulo}</label>
        <input
          className={`${styles.input} ${erros[nome] || (nome === "email" || nome === "cpf") && erros.contato ? styles.inputError : ""}`}
          id={nome}
          name={nome}
          type={tipo}
          value={formulario[nome]}
          onChange={atualizarCampo}
          required={obrigatorio}
          aria-invalid={Boolean(erros[nome] || ((nome === "email" || nome === "cpf") && erros.contato))}
        />
        {erros[nome] && <span className={styles.fieldError}>{erros[nome]}</span>}
        {(nome === "email" || nome === "cpf") && erros.contato && <span className={styles.fieldError}>{erros.contato}</span>}
      </div>
    );
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Você precisa de uma matrícula para entrar">
      <div className={styles.stepper}>
        <span className={etapa === 1 ? styles.stepActive : ""}>1. Gerar matrícula</span>
        <span className={etapa === 2 ? styles.stepActive : ""}>2. Criar senha</span>
      </div>
      {etapa === 1 ? (
        <>
          <p className={styles.linkRow}>
            Você já é matriculado?{" "}
            <button className={styles.linkStrong} type="button" onClick={irParaEtapaMatricula} style={{ background: "none", border: 0, cursor: "pointer", font: "inherit" }}>
              Já tenho matrícula
            </button>
          </p>
          <form className={styles.form} onSubmit={enviarFormulario} noValidate>
            {campo("nome", "Nome completo", "text", true)}
            {campo("email", "E-mail", "email")}
            {campo("cpf", "CPF")}
            {campo("telefone", "Telefone (opcional)", "tel")}
            <button className={styles.button} type="submit">Gerar matrícula</button>
          </form>
        </>
      ) : (
        <div className={styles.form}>
          {campo("matricula", "Matrícula")}
        </div>
      )}
    </AuthLayout>
  );
}
