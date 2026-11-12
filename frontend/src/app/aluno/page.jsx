"use client";

import { useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import EstadoAguardando from "@/components/aluno/EstadoAguardando";
import EstadoLiberado from "@/components/aluno/EstadoLiberado";
import FormularioVinculo from "@/components/aluno/FormularioVinculo";
import { equipamentosSessao } from "@/mocks/aluno";
import styles from "./aluno.module.css";

export default function PaginaAluno() {
  const [step, setStep] = useState("FORM");
  const [solicitacao, setSolicitacao] = useState(null);
  const compacto = step !== "APPROVED";

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

          {step === "APPROVED" && solicitacao && (
            <EstadoLiberado
              sessao={{ nome: solicitacao.nome, turma: solicitacao.turma }}
              equipamentos={equipamentosSessao}
            />
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
