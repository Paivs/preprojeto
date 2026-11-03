"use client";

import { useMemo, useState } from "react";
import { inspecoesDemo } from "../lib/inspecoesDemo";
import styles from "./InspecoesProfessor.module.css";

const etapas = {
  PRE_USO: "Pré-uso",
  POS_USO: "Pós-uso",
};

const resultados = {
  APROVADO: "Aprovada",
  APROVADO_COM_RESSALVAS: "Aprovada com ressalvas",
};

function formatarData(data) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${data}T12:00:00`));
}

export default function InspecoesProfessor() {
  const [filtro, setFiltro] = useState("TODAS");

  const resumo = useMemo(() => ({
    pendentes: inspecoesDemo.filter((item) => !item.resultado).length,
    realizadas: inspecoesDemo.filter((item) => Boolean(item.resultado)).length,
    ressalvas: inspecoesDemo.filter((item) => item.resultado === "APROVADO_COM_RESSALVAS").length,
  }), []);

  const visiveis = useMemo(() => inspecoesDemo.filter((item) => {
    if (filtro === "PENDENTES") return !item.resultado;
    if (filtro === "REALIZADAS") return Boolean(item.resultado);
    return true;
  }), [filtro]);

  return (
    <div className={styles.container}>
      <section className={styles.cabecalhoPagina} aria-labelledby="titulo-inspecoes">
        <div>
          <p className={styles.contexto}>SEGURANÇA DE USO · DADOS DEMONSTRATIVOS</p>
          <h1 id="titulo-inspecoes">Inspeções</h1>
          <p className={styles.subtitulo}>Acompanhe as vistorias pré e pós-uso relacionadas às reservas das suas turmas.</p>
        </div>
      </section>

      <section className={styles.resumo} aria-label="Resumo das inspeções">
        <article className={`${styles.metrica} ${styles.metricaPendente}`}><span>Aguardando inspeção</span><strong>{resumo.pendentes}</strong><small>etapas sem registro</small></article>
        <article className={styles.metrica}><span>Inspeções realizadas</span><strong>{resumo.realizadas}</strong><small>registros demonstrativos</small></article>
        <article className={`${styles.metrica} ${styles.metricaRessalva}`}><span>Aprovadas com ressalvas</span><strong>{resumo.ressalvas}</strong><small>verifique as observações</small></article>
      </section>

      <section className={styles.painel} aria-labelledby="titulo-lista-inspecoes">
        <div className={styles.cabecalhoPainel}>
          <div>
            <h2 id="titulo-lista-inspecoes">Inspeções das reservas</h2>
            <p>Cada reserva pode ter uma inspeção pré-uso e outra pós-uso.</p>
          </div>
          <span className={styles.contagem}>{visiveis.length} registros</span>
        </div>

        <div className={styles.filtros} role="group" aria-label="Filtrar inspeções">
          {[
            ["TODAS", "Todas"],
            ["PENDENTES", "Pendentes"],
            ["REALIZADAS", "Realizadas"],
          ].map(([valor, texto]) => (
            <button key={valor} type="button" className={filtro === valor ? styles.filtroAtivo : ""} onClick={() => setFiltro(valor)} aria-pressed={filtro === valor}>
              {texto}
            </button>
          ))}
        </div>

        {visiveis.length > 0 ? (
          <div className={styles.tabelaViewport}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th scope="col">Reserva</th>
                  <th scope="col">Turma / projeto</th>
                  <th scope="col">Etapa</th>
                  <th scope="col">Checklist</th>
                  <th scope="col">Resultado</th>
                  <th scope="col"><span className={styles.somenteLeitor}>Ação</span></th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{formatarData(item.data)} · {item.horario}</strong>
                      <span>{item.equipamento}</span>
                    </td>
                    <td>{item.turma}</td>
                    <td><span className={styles.etapa}>{etapas[item.etapa]}</span></td>
                    <td>{item.modelo}</td>
                    <td>
                      <span className={`${styles.resultado} ${item.resultado ? styles.resultadoRealizado : styles.resultadoPendente}`}>
                        {item.resultado ? resultados[item.resultado] : "Aguardando inspeção"}
                      </span>
                    </td>
                    <td>
                      <button className={styles.botaoAcao} type="button" disabled aria-label={`${item.resultado ? "Ver" : "Iniciar"} inspeção de ${item.equipamento}`}>
                        {item.resultado ? "Detalhes" : "Iniciar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.estadoVazio}>
            <span className="material-symbols-outlined" aria-hidden="true">fact_check</span>
            <h3>Nenhuma inspeção nesta lista</h3>
            <p>Quando houver registros ou etapas pendentes, eles aparecerão aqui.</p>
          </div>
        )}
        <p className={styles.notaDados}>Prévia de interface: registros fictícios. As inspeções ainda não são gravadas no sistema.</p>
      </section>
    </div>
  );
}
