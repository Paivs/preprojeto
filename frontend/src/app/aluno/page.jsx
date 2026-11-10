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
  const [token, setToken] = useState("");
  const largura = estado === "liberado" ? styles.largo : styles.compacto;

  function enviarToken(tokenEnviado) {
    setToken(tokenEnviado);
    setEstado("aguardando");
  }

  function cancelarSolicitacao() {
    setToken("");
    setEstado("formulario");
  }

  return (
    <AuthGuard>
      <main className={styles.pagina}>
        <div className={`${styles.conteudo} ${largura}`}>
          {estado !== "formulario" && (
            <div className={styles.status}>
              <StatusConexao estado={estado} />
            </div>
          )}

          {estado === "formulario" && (
            <section className={styles.formulario}>
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
              sessao={sessaoAluno}
              token={token}
              onCancelar={cancelarSolicitacao}
              onSimularAprovacao={() => setEstado("liberado")}
            />
          )}

          {estado === "liberado" && (
            <EstadoLiberado
              sessao={sessaoAluno}
              equipamentos={equipamentosSessao}
            />
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
