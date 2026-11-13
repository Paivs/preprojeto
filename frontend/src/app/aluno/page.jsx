"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sessaoAluno } from "@/mocks/aluno";
import styles from "./page.module.css";

export default function PaginaAluno() {
  const primeiroNome = sessaoAluno.nome.trim().split(/\s+/)[0];
  const [saudacao, setSaudacao] = useState(`Olá, ${primeiroNome}`);

  useEffect(() => {
    const hora = new Date().getHours();
    const cumprimento = hora < 12 ? "Bom dia" : hora <= 18 ? "Boa tarde" : "Boa noite";
    setSaudacao(`${cumprimento}, ${primeiroNome}`);
  }, [primeiroNome]);

  return (
    <section className={styles.pagina}>
      <h1 className={styles.titulo}>{saudacao}</h1>
      <p className={styles.turma}>{sessaoAluno.turma}</p>
      <p className={styles.instrucao}>
        <Link className={styles.link} href="/aluno/acesso">Acesse a bancada</Link>{" "}
        da aula com o token informado pelo professor.
      </p>
    </section>
  );
}
