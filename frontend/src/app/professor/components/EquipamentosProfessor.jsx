"use client";

import { useMemo, useState } from "react";
import { equipamentosDemo } from "../lib/equipamentosDemo";
import styles from "./EquipamentosProfessor.module.css";

const statusLabels = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  EM_USO: "Em uso",
  EM_MANUTENCAO: "Em manutenção",
  INATIVO: "Inativo",
};

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function EquipamentosProfessor() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  const contagem = useMemo(() => equipamentosDemo.reduce((total, equipamento) => {
    total[equipamento.status] = (total[equipamento.status] || 0) + 1;
    return total;
  }, {}), []);

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim());
    return equipamentosDemo.filter((equipamento) => {
      const correspondeStatus = filtroStatus === "TODOS" || equipamento.status === filtroStatus;
      const texto = normalizar(`${equipamento.nome} ${equipamento.patrimonio} ${equipamento.localizacao} ${equipamento.tipo}`);
      return correspondeStatus && (!termo || texto.includes(termo));
    });
  }, [busca, filtroStatus]);

  return (
    <div className={styles.container}>
      <section className={styles.cabecalhoPagina} aria-labelledby="titulo-equipamentos-professor">
        <div>
          <p className={styles.contexto}>INVENTÁRIO DO LABORATÓRIO · DADOS DEMONSTRATIVOS</p>
          <h1 id="titulo-equipamentos-professor">Equipamentos</h1>
          <p className={styles.subtitulo}>Consulte a disponibilidade e a localização dos equipamentos do laboratório.</p>
        </div>
      </section>

      <section className={styles.resumo} aria-label="Resumo por situação">
        <article className={styles.metrica}>
          <span>Total cadastrado</span><strong>{equipamentosDemo.length}</strong><small>equipamentos demonstrativos</small>
        </article>
        <article className={`${styles.metrica} ${styles.metricaDisponivel}`}>
          <span>Disponíveis</span><strong>{contagem.DISPONIVEL || 0}</strong><small>liberados para uso</small>
        </article>
        <article className={`${styles.metrica} ${styles.metricaUso}`}>
          <span>Em uso</span><strong>{contagem.EM_USO || 0}</strong><small>reservas em andamento</small>
        </article>
        <article className={`${styles.metrica} ${styles.metricaManutencao}`}>
          <span>Em manutenção</span><strong>{contagem.EM_MANUTENCAO || 0}</strong><small>indisponíveis para reserva</small>
        </article>
      </section>

      <section className={styles.painel} aria-labelledby="titulo-inventario">
        <div className={styles.cabecalhoPainel}>
          <div>
            <h2 id="titulo-inventario">Inventário</h2>
            <p>Equipamentos disponíveis para as atividades das suas turmas.</p>
          </div>
          <span className={styles.totalVisivel}>{visiveis.length} de {equipamentosDemo.length} itens</span>
        </div>

        <div className={styles.filtros}>
          <label className={styles.busca} htmlFor="busca-equipamentos">
            <span className="material-symbols-outlined" aria-hidden="true">search</span>
            <input
              id="busca-equipamentos"
              type="search"
              placeholder="Buscar nome, patrimônio ou localização"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </label>
          <label className={styles.filtroStatus} htmlFor="filtro-status-equipamentos">
            <span>Situação</span>
            <select id="filtro-status-equipamentos" value={filtroStatus} onChange={(evento) => setFiltroStatus(evento.target.value)}>
              <option value="TODOS">Todas</option>
              {Object.entries(statusLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}
            </select>
          </label>
        </div>

        {visiveis.length > 0 ? (
          <div className={styles.tabelaViewport}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th scope="col">Equipamento</th>
                  <th scope="col">Patrimônio</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Localização</th>
                  <th scope="col">Situação</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((equipamento) => (
                  <tr key={equipamento.id}>
                    <td><strong>{equipamento.nome}</strong></td>
                    <td className={styles.codigo}>{equipamento.patrimonio}</td>
                    <td>{equipamento.tipo === "ROBO" ? "Robô" : "Bancada"}</td>
                    <td>{equipamento.localizacao}</td>
                    <td><span className={`${styles.status} ${styles[`status_${equipamento.status}`]}`}><i />{statusLabels[equipamento.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.estadoVazio}>
            <span className="material-symbols-outlined" aria-hidden="true">search_off</span>
            <h3>Nenhum equipamento encontrado</h3>
            <p>Altere a busca ou o filtro de situação para consultar o inventário.</p>
          </div>
        )}
        <p className={styles.notaDados}>Prévia de interface: os registros são fictícios e não vêm do banco de dados.</p>
      </section>
    </div>
  );
}
