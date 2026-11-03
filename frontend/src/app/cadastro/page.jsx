"use client";

import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import styles from "@/components/auth/authForm.module.css";

export default function CadastroPage() {
  const [etapa] = useState(1);

  return (
    <AuthLayout title="Criar conta" subtitle="Você precisa de uma matrícula para entrar">
      <div className={styles.stepper}>
        <span className={etapa === 1 ? styles.stepActive : ""}>1. Gerar matrícula</span>
        <span className={etapa === 2 ? styles.stepActive : ""}>2. Criar senha</span>
      </div>
      <p>{etapa === 1 ? "Etapa provisória: gerar matrícula." : "Etapa provisória: criar senha."}</p>
    </AuthLayout>
  );
}
