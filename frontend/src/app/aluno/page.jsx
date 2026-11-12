"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import EstadoAguardando from "@/components/aluno/EstadoAguardando";
import FormularioVinculo from "@/components/aluno/FormularioVinculo";
import styles from "./aluno.module.css";

export default function PaginaAluno() {
  const router = useRouter();
  const [step, setStep] = useState("FORM");
  const [solicitacao, setSolicitacao] = useState(null);
  const compacto = step !== "APPROVED";

  useEffect(() => {
    if (step === "APPROVED") router.replace("/aluno/bem-vindo");
  }, [step, router]);

  function enviarSolicitacao(dados) {
    setSolicitacao(dados);
    setStep("WAITING");
  }

  function cancelarSolicitacao() {
    setSolicitacao(null);
    setStep("FORM");
  }

  return (
    <AuthGuard>
      <main className={styles.pagina}>
        <div className={`${styles.conteudo} ${compacto ? styles.compacto : styles.largo}`}>
          {step === "FORM" && (
            <section className={styles.formulario}>
              <p className={styles.eyebrow}>Vinculação de sessão</p>
              <h1 className={styles.titulo}>Acesso à bancada do laboratório</h1>
              <p className={styles.descricao}>
                Insira seu nome, turma e o token compartilhado pelo professor para solicitar acesso aos ativos da aula.
              </p>
              <FormularioVinculo onEnviar={enviarSolicitacao} />
            </section>
          )}

          {step === "WAITING" && solicitacao && (
            <EstadoAguardando
              sessao={{ nome: solicitacao.nome, turma: solicitacao.turma }}
              token={solicitacao.token}
              onCancelar={cancelarSolicitacao}
              onSimularAprovacao={() => setStep("APPROVED")}
            />
          )}

        </div>
      </main>
    </AuthGuard>
  );
}
