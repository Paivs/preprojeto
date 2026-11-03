"use client";

import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import styles from "@/components/auth/authForm.module.css";
import { apiFetch } from "@/lib/api";

export default function CadastroPage() {
  const [etapa, setEtapa] = useState(1);
  const [formulario, setFormulario] = useState({ nome: "", email: "", cpf: "", telefone: "", matricula: "" });
  const [erros, setErros] = useState({});
  const [alerta, setAlerta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [matriculaGerada, setMatriculaGerada] = useState("");

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
    setErros((atuais) => ({ ...atuais, [name]: "", contato: "" }));
  }

  async function enviarFormulario(event) {
    event.preventDefault();
    setAlerta("");
    const novosErros = {};

    if (!formulario.nome.trim()) novosErros.nome = "Informe seu nome completo.";
    if (!formulario.email.trim() && !formulario.cpf.trim()) {
      novosErros.contato = "Informe seu e-mail ou CPF.";
    }

    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    const body = Object.fromEntries(
      Object.entries(formulario)
        .filter(([campo]) => campo !== "matricula")
        .filter(([, valor]) => valor.trim())
    );

    setEnviando(true);
    try {
      const resultado = await apiFetch("/api/alunos/gerar-matricula", { method: "POST", body });
      setMatriculaGerada(resultado.matricula);
    } catch (error) {
      if (error.status === 400 && Array.isArray(error.errors)) {
        const errosCampos = {};
        error.errors.forEach(({ field, message }) => {
          if (["nome", "email", "cpf", "telefone"].includes(field)) errosCampos[field] = message;
        });
        setErros(errosCampos);
      } else if (error.status === 409) {
        setAlerta("Já existe uma solicitação de matrícula para estes dados");
      } else {
        setAlerta("Não foi possível gerar a matrícula. Tente de novo.");
      }
    } finally {
      setEnviando(false);
    }
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
          {alerta && <p className={styles.alert} role="alert">{alerta}</p>}
          {matriculaGerada ? (
            <div className={styles.form}>
              <p>Matrícula gerada:</p>
              <strong style={{ color: "var(--white)", fontSize: "2rem" }}>{matriculaGerada}</strong>
              <button className={styles.button} type="button" onClick={() => {
                setFormulario((atual) => ({ ...atual, matricula: matriculaGerada }));
                setEtapa(2);
              }}>Continuar</button>
            </div>
          ) : <>
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
            <button className={styles.button} type="submit" disabled={enviando}>{enviando ? "Gerando" : "Gerar matrícula"}</button>
          </form>
          </>}
      ) : (
        <div className={styles.form}>
          {campo("matricula", "Matrícula")}
        </div>
      )}
    </AuthLayout>
  );
}
