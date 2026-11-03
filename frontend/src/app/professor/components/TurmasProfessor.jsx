"use client";

import { useMemo, useState } from "react";
import { turmasDemo } from "../lib/turmasDemo";
import styles from "./TurmasProfessor.module.css";

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function TurmasProfessor() {
  const [busca, setBusca] = useState("");

  const totalVinculos = useMemo(
    () => turmasDemo.reduce((total, turma) => total + turma.alunos, 0),
    [],
  );

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return turmasDemo;
    return turmasDemo.filter((turma) => normalizar(turma.nome).includes(termo));
  }, [busca]);

  return (
    <div className={styles.container}>
      <section className={styles.cabecalhoPagina} aria-labelledby="titulo-minhas-turmas">
        <div>
          <p className={styles.contexto}>VÍNCULOS ACADÊMICOS · DADOS DEMONSTRATIVOS</p>
          <h1 id="titulo-minhas-turmas">Minhas turmas</h1>
          <p className={styles.subtitulo}>Consulte os grupos sob sua responsabilidade e as próximas atividades no laboratório.</p>
        </div>
      </section>

      <section className={styles.resumo} aria-label="Resumo das turmas">
        <article className={styles.metrica}><span>Turmas e projetos</span><strong>{turmasDemo.length}</strong><small>vinculados à professora</small></article>
        <article className={styles.metrica}><span>Vínculos de alunos</span><strong>{totalVinculos}</strong><small>soma das participações nas turmas</small></article>
        <article className={styles.metrica}><span>Atividades agendadas</span><strong>{turmasDemo.filter((turma) => turma.proximaAtividade).length}</strong><small>próximas reservas demonstrativas</small></article>
      </section>

      <section className={styles.painel} aria-labelledby="titulo-lista-turmas">
        <div className={styles.cabecalhoPainel}>
          <div>
            <h2 id="titulo-lista-turmas">Turmas e projetos vinculados</h2>
            <p>Os nomes e vínculos abaixo são exemplos para a prévia da página.</p>
          </div>
          <span className={styles.contagem}>{visiveis.length} {visiveis.length === 1 ? "grupo" : "grupos"}</span>
        </div>

        <label className={styles.busca} htmlFor="busca-turmas">
          <span className="material-symbols-outlined" aria-hidden="true">search</span>
          <input
            id="busca-turmas"
            type="search"
            placeholder="Buscar turma ou projeto"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </label>

        {visiveis.length > 0 ? (
          <div className={styles.listaTurmas}>
            {visiveis.map((turma) => (
              <article className={styles.itemTurma} key={turma.id}>
                <div className={styles.identidadeTurma}>
                  <span className={styles.marcaTurma} aria-hidden="true">{turma.nome.slice(0, 1)}</span>
                  <div><h3>{turma.nome}</h3><span>{turma.alunos} alunos vinculados</span></div>
                </div>
                <div className={styles.proximaAtividade}>
                  <span>PRÓXIMA ATIVIDADE</span>
                  <strong>{turma.proximaAtividade}</strong>
                  <small>{turma.proximaData} · {turma.equipamento}</small>
                </div>
                <button className={styles.botaoDetalhes} type="button" disabled aria-label={`Detalhes de ${turma.nome}`}>
                  Detalhes <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.estadoVazio}>
            <span className="material-symbols-outlined" aria-hidden="true">groups</span>
            <h3>Nenhuma turma encontrada</h3>
            <p>Confira o texto digitado e tente novamente.</p>
          </div>
        )}
        <p className={styles.notaDados}>Prévia de interface: os dados são fictícios e ainda não vêm das tabelas turmas_projetos e turma_alunos.</p>
      </section>
    </div>
  );
}
