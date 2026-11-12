"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import BarraLateral from "@/components/aluno/BarraLateral";
import styles from "@/components/aluno/BarraLateral.module.css";

export default function LayoutAluno({ children }) {
  return (
    <AuthGuard>
      <div className={styles.layout}>
        <BarraLateral itemAtivo="bem-vindo" />
        <main className={styles.conteudo}>{children}</main>
      </div>
    </AuthGuard>
  );
}
