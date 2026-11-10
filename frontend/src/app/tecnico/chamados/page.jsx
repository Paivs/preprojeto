"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import styles from "./page.module.css";
import EmptyState from "@/components/EmptyState";

const STATUS = [
  ["ABERTO", "Aberto"],
  ["EM_ATENDIMENTO", "Em atendimento"],
  ["AGUARDANDO_PECAS", "Aguardando peças"],
  ["CONCLUIDO", "Concluído"],
  ["CANCELADO", "Cancelado"],
];
const SEVERIDADES = [["CRITICA", "Crítica"], ["ALTA", "Alta"], ["MEDIA", "Média"], ["BAIXA", "Baixa"]];
const ROTULO_STATUS = Object.fromEntries(STATUS);
const ROTULO_SEVERIDADE = Object.fromEntries(SEVERIDADES);

function formatarData(valor) {
  if (!valor) return "Data não informada";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "Data não informada" : data.toLocaleDateString("pt-BR");
}

export default function PaginaChamadosTecnico() {
  const [chamados, setChamados] = useState([]);
  const [status, setStatus] = useState("");
  const [severidade, setSeveridade] = useState("");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const params = new URLSearchParams({ pagina: "1", limite: "100" });
      if (status) params.set("status", status);
      if (severidade) params.set("severidade", severidade);
      const resposta = await apiFetch(`/api/chamados?${params}`);
      setChamados(Array.isArray(resposta?.dados) ? resposta.dados : []);
    } catch (error) {
      setErro(error.message || "Não foi possível carregar os chamados.");
    } finally {
      setCarregando(false);
    }
  }, [status, severidade]);

  useEffect(() => { carregar(); }, [carregar]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return chamados;
    return chamados.filter((chamado) =>
      [chamado.id, chamado.titulo, chamado.descricao, chamado.equipamento_id, chamado.tipo]
        .some((valor) => String(valor ?? "").toLocaleLowerCase("pt-BR").includes(termo)),
    );
  }, [busca, chamados]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.sobretitulo}>Atendimento técnico</p>
          <h1 className={styles.titulo}>Ordens de Serviço</h1>
          <p className={styles.descricao}>Consulte as ordens de serviços atribuídos a você e acompanhe suas prioridades.</p>
        </div>
        <button type="button" className={styles.atualizar} onClick={carregar} disabled={carregando}>
          <span className={`material-symbols-outlined ${carregando ? styles.girando : ""}`}>sync</span>
          {carregando ? "Atualizando" : "Atualizar"}
        </button>
      </header>

      <section className={styles.filtros} aria-label="Filtros dos chamados">
        <label className={styles.busca}>
          <span className="material-symbols-outlined" aria-hidden="true">search</span>
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar chamado, equipamento ou descrição" />
        </label>
        <label className={styles.filtro}>
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos</option>
            {STATUS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className={styles.filtro}>
          <span>Prioridade</span>
          <select value={severidade} onChange={(e) => setSeveridade(e.target.value)}>
            <option value="">Todas</option>
            {SEVERIDADES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </section>

      {erro && <p className={styles.erro} role="alert">{erro}</p>}
      <p className={styles.contagem}>{carregando ? "Carregando chamados…" : `${filtrados.length} chamados encontrados`}</p>

      {!carregando && !erro && filtrados.length === 0 && (
        <EmptyState
          icone="inbox"
          titulo={chamados.length ? "Nenhum resultado para esses filtros" : "Nenhum chamado atribuído"}
          mensagem={chamados.length ? "Tente alterar a busca ou os filtros." : "Quando houver chamados atribuídos, eles aparecem aqui."}
        />
      )}

      <section className={styles.lista} aria-label="Lista de chamados">
        {filtrados.map((chamado) => {
          const prioridade = String(chamado.severidade || "").toUpperCase();
          const statusAtual = String(chamado.status || "").toUpperCase();
          return (
            <article className={styles.cartao} key={chamado.id}>
              <div className={styles.cartaoTopo}>
                <span className={`${styles.prioridade} ${styles[`prioridade_${prioridade.toLowerCase()}`] || ""}`}>
                  {ROTULO_SEVERIDADE[prioridade] || "Prioridade não informada"}
                </span>
                <span className={`${styles.status} ${styles[`status_${statusAtual.toLowerCase()}`] || ""}`}>
                  {ROTULO_STATUS[statusAtual] || statusAtual}
                </span>
              </div>
              <h2 className={styles.tituloChamado}>{chamado.titulo || `Chamado #${chamado.id}`}</h2>
              <p className={styles.resumo}>{chamado.descricao || "Sem descrição informada."}</p>
              <div className={styles.detalhes}>
                <span><strong>Chamado</strong> #{String(chamado.id).padStart(4, "0")}</span>
                <span><strong>Equipamento</strong> {chamado.equipamento_nome || (chamado.equipamento_id ? `#${chamado.equipamento_id}` : "Não informado")}</span>
                <span><strong>Aberto em</strong> {formatarData(chamado.aberto_em)}</span>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
