"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sessaoAluno } from "@/mocks/aluno";
import FormularioVinculo from "@/components/aluno/FormularioVinculo";
import EstadoAguardando from "@/components/aluno/EstadoAguardando";
import styles from "./page.module.css";

export default function PaginaAluno() {
  const router = useRouter();
  const primeiroNome = sessaoAluno.nome.trim().split(/\s+/)[0];
  const [saudacao, setSaudacao] = useState(`Olá, ${primeiroNome}`);
  const [etapa, setEtapa] = useState("FORM");
  const [solicitacao, setSolicitacao] = useState(null);

  useEffect(() => {
    const hora = new Date().getHours();
    const cumprimento = hora < 12 ? "Bom dia" : hora <= 18 ? "Boa tarde" : "Boa noite";
    setSaudacao(`${cumprimento}, ${primeiroNome}`);
  }, [primeiroNome]);

  useEffect(() => {
    if (etapa === "APPROVED") {
      window.sessionStorage.setItem("tenken-aluno-bancada-liberada", "true");
      router.replace("/aluno/diagnostico");
    }
  }, [etapa, router]);

  function enviarSolicitacao(dados) {
    setSolicitacao(dados);
    setEtapa("WAITING");
  }

  return (
    <section className={styles.pagina}>
      <Link className={styles.voltar} href="/login">
        <span aria-hidden="true">←</span> Voltar
      </Link>
      <h1 className={styles.titulo}>{saudacao}</h1>
      <p className={styles.turma}>{sessaoAluno.turma}</p>
      {etapa === "FORM" && (
        <section className={styles.formulario} aria-labelledby="titulo-acesso-bancada">
          <h2 className={styles.tituloFormulario} id="titulo-acesso-bancada">
            Acesso à bancada do laboratório
          </h2>
          <p className={styles.descricao}>
            Insira o token compartilhado pelo professor para acessar os ativos da aula
          </p>
          <FormularioVinculo onEnviar={enviarSolicitacao} />
        </section>
      )}
      {etapa === "WAITING" && solicitacao && (
        <div className={styles.aguardando}>
          <EstadoAguardando
            sessao={solicitacao}
            token={solicitacao.token}
            onCancelar={() => setEtapa("FORM")}
            onSimularAprovacao={() => setEtapa("APPROVED")}
          />
        </div>
      )}
    </section>
  );
}
