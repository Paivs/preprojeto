"use client";

import { useMemo, useState } from "react";
import { agendamentosDemo } from "../lib/agendamentosDemo";
import styles from "./AgendamentosProfessor.module.css";

const rotulosStatus = {
  CONFIRMADO: "Confirmado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

const rotulosInspecao = {
  APROVADO: "Pré-uso aprovado",
  PENDENTE: "Inspeção pendente",
  NAO_INICIADO: "A iniciar",
};

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function formatarData(data) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${data}T12:00:00`));
}

export default function AgendamentosProfessor() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  const resumo = useMemo(() => ({
    total: agendamentosDemo.length,
    confirmados: agendamentosDemo.filter((item) => item.status === "CONFIRMADO").length,
    emAndamento: agendamentosDemo.filter((item) => item.status === "EM_ANDAMENTO").length,
    inspecoesPendentes: agendamentosDemo.filter((item) => item.inspecao === "PENDENTE").length,
  }), []);

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim());
    return agendamentosDemo.filter((item) => {
      const correspondeStatus = filtroStatus === "TODOS" || item.status === filtroStatus;
      const texto = normalizar(`${item.atividade} ${item.turma} ${item.equipamento} ${item.patrimonio}`);
      return correspondeStatus && (!termo || texto.includes(termo));
    });
  }, [busca, filtroStatus]);

  return (
    <div className={styles.container}>
      <section className={styles.cabecalhoPagina} aria-labelledby="titulo-agendamentos">
        <div>
          <p className={styles.contexto}>DADOS DEMONSTRATIVOS · SEMANA DE 02 A 08 DE NOVEMBRO</p>
          <h1 id="titulo-agendamentos">Agendamentos</h1>
          <p className={styles.subtitulo}>Consulte as reservas das suas turmas e acompanhe as inspeções necessárias.</p>
        </div>
        <button className={styles.botaoPrimario} type="button" disabled>
          <span className="material-symbols-outlined" aria-hidden="true">add</span>
          Novo agendamento
        </button>
      </section>

      <section className={styles.resumo} aria-label="Resumo dos agendamentos da semana">
        <article className={styles.metrica}><span>Reservas na semana</span><strong>{resumo.total}</strong><small>na agenda demonstrativa</small></article>
        <article className={styles.metrica}><span>Confirmados</span><strong>{resumo.confirmados}</strong><small>aguardando o horário reservado</small></article>
        <article className={styles.metrica}><span>Em andamento</span><strong>{resumo.emAndamento}</strong><small>uso acontecendo agora</small></article>
        <article className={`${styles.metrica} ${styles.metricaAtencao}`}><span>Inspeções pendentes</span><strong>{resumo.inspecoesPendentes}</strong><small>associadas às reservas</small></article>
      </section>

      <section className={styles.painelAgenda} aria-labelledby="titulo-lista-agendamentos">
        <div className={styles.cabecalhoPainel}>
          <div>
            <h2 id="titulo-lista-agendamentos">Agenda do laboratório</h2>
            <p>Reservas vinculadas às suas turmas e projetos.</p>
          </div>
          <div className={styles.semana}>
            <button type="button" disabled aria-label="Semana anterior">‹</button>
            <span>02 — 08 nov. 2026</span>
            <button type="button" disabled aria-label="Próxima semana">›</button>
          </div>
        </div>

        <div className={styles.filtros}>
          <label className={styles.busca} htmlFor="busca-agendamentos">
            <span className="material-symbols-outlined" aria-hidden="true">search</span>
            <input
              id="busca-agendamentos"
              type="search"
              placeholder="Buscar turma, equipamento ou patrimônio"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </label>
          <label className={styles.filtroStatus} htmlFor="filtro-status">
            <span>Status</span>
            <select id="filtro-status" value={filtroStatus} onChange={(evento) => setFiltroStatus(evento.target.value)}>
              <option value="TODOS">Todos</option>
              <option value="CONFIRMADO">Confirmados</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="CONCLUIDO">Concluídos</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
          </label>
          <span className={styles.contagem}>{visiveis.length} {visiveis.length === 1 ? "reserva" : "reservas"}</span>
        </div>

        {visiveis.length > 0 ? (
          <div className={styles.tabelaViewport}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th scope="col">Data e horário</th>
                  <th scope="col">Turma / atividade</th>
                  <th scope="col">Equipamento</th>
                  <th scope="col">Status</th>
                  <th scope="col">Inspeção pré-uso</th>
                  <th scope="col"><span className={styles.somenteLeitor}>Ação</span></th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{formatarData(item.data)}</strong>
                      <span className={styles.horario}>{item.inicio}–{item.fim}</span>
                    </td>
                    <td>
                      <strong>{item.turma}</strong>
                      <span className={styles.atividade}>{item.atividade}</span>
                    </td>
                    <td>
                      <strong>{item.equipamento}</strong>
                      <span className={styles.patrimonio}>{item.patrimonio}</span>
                    </td>
                    <td><span className={`${styles.status} ${styles[`status_${item.status}`]}`}>{rotulosStatus[item.status]}</span></td>
                    <td><span className={`${styles.inspecao} ${styles[`inspecao_${item.inspecao}`]}`}>{rotulosInspecao[item.inspecao]}</span></td>
                    <td><button className={styles.botaoDetalhes} type="button" disabled aria-label={`Detalhes de ${item.atividade}`}>Detalhes</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.estadoVazio}>
            <span className="material-symbols-outlined" aria-hidden="true">event_busy</span>
            <h3>Nenhuma reserva encontrada</h3>
            <p>Altere a busca ou o filtro de status para consultar outros agendamentos.</p>
          </div>
        )}
        <p className={styles.notaDados}>Prévia de interface: os registros exibidos são fictícios e não vêm do banco de dados.</p>
      </section>
    </div>
  );
}
