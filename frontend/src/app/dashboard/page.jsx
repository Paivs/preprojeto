"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { getUsuario } from "@/lib/session";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const [usuario, setUsuario] = useState(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setUsuario(getUsuario());
    setCarregado(true);
  }, []);

  return (
    <AuthGuard>
      <main className={styles.page}>
        {carregado && usuario && (
          <section className={styles.card}>
            <h1>Bem-vindo, {usuario.nome}</h1>
            <p>Matrícula: {usuario.matricula}</p>
            <p>Perfil: {usuario.perfil}</p>
          </section>
        )}
      </main>
    </AuthGuard>
  );
}
