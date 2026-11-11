"use client";

import { useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import EstadoAguardando from "@/components/aluno/EstadoAguardando";
import EstadoLiberado from "@/components/aluno/EstadoLiberado";
import FormularioVinculo from "@/components/aluno/FormularioVinculo";
import StatusConexao from "@/components/aluno/StatusConexao";
import { equipamentosSessao, sessaoAluno } from "@/mocks/aluno";
import styles from "./aluno.module.css";

export default function PaginaAluno() {
  const [estado, setEstado] = useState("formulario");
  const [solicitacao, setSolicitacao] = useState(null);
  const largura = estado === "liberado" ? styles.largo : styles.compacto;

  function enviarToken(dadosFormulario) {
    setSolicitacao(dadosFormulario);
    setEstado("aguardando");
  }

  function cancelarSolicitacao() {
    setSolicitacao(null);
    setEstado("formulario");
  }

  return (
    <AuthGuard>
      <main className={styles.pagina}>
        <header className={styles.cabecalho}>
          <div className={styles.marca}>
            <span className={styles.marcaIcone} aria-hidden="true">⌘</span>
            <span><span className={styles.marcaTexto}>TENKEN</span><small className={styles.marcaSubtexto}>STUDENT ACCESS / LAB</small></span>
          </div>
          <StatusConexao estado={estado} />
        </header>
        <div className={`${styles.conteudo} ${largura}`}>
          {estado !== "formulario" && (
            <div className={styles.status}>
              <StatusConexao estado={estado} />
            </div>
          )}

          {estado === "formulario" && (
            <section className={styles.formulario}>
              <p className={styles.eyebrow}>Vinculação de sessão</p>
              <h1 className={styles.titulo}>Acesso à bancada do laboratório</h1>
              <p className={styles.descricao}>
                Insira o token compartilhado pelo professor para acessar os
                ativos da aula
              </p>
              <FormularioVinculo onEnviar={enviarToken} />
            </section>
          )}

          {estado === "aguardando" && (
            <EstadoAguardando
              sessao={{ nome: solicitacao.nome, turma: solicitacao.turma }}
              token={solicitacao.token}
              onCancelar={cancelarSolicitacao}
              onSimularAprovacao={() => setEstado("liberado")}
            />
          )}

          {estado === "liberado" && (
            <EstadoLiberado
              sessao={{ nome: solicitacao?.nome || sessaoAluno.nome, turma: solicitacao?.turma || sessaoAluno.turma }}
              equipamentos={equipamentosSessao}
            />
          )}
        </div>
        <footer className={styles.rodape}><span>TENKEN · Student terminal</span><span>Ambiente seguro · LAB-AUT-01</span></footer>
      </main>
    </AuthGuard>
  );
}
