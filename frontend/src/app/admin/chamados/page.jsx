"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import styles from "./page.module.css";
import { chamarApi } from "../lib/adminApi";

const STATUS = [
  "ABERTO",
  "EM_ATENDIMENTO",
  "AGUARDANDO_PECAS",
  "CONCLUIDO",
  "CANCELADO",
];

const SEVERIDADES = ["BAIXA", "MEDIA", "ALTA", "CRITICA"];

const ROTULO_STATUS = {
  ABERTO: "Aberto",
  EM_ATENDIMENTO: "Em Atendimento",
  AGUARDANDO_PECAS: "Aguardando Peças",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

export default function PaginaChamados() {
  return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>;
}

function Conteudo({ token }) {
  const [itens, setItens] = useState([]);
  const [status, setStatus] = useState("");
  const [severidade, setSeveridade] = useState("");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [historico, setHistorico] = useState({});

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const q = new URLSearchParams({ pagina: "1", limite: "100" });
      if (status) q.set("status", status);
      if (severidade) q.set("severidade", severidade);
      const data = await chamarApi(`/chamados?${q}`, token);
      setItens(data.dados ?? data ?? []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, status, severidade]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function atualizarStatus(item, value) {
    try {
      await chamarApi(`/chamados/${item.id}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({ status: value }),
      });
      setAviso(`Status do chamado #${item.id} atualizado para ${value}.`);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function encaminhar(item) {
    const id = window.prompt("ID do usuário com perfil TECNICO:");
    if (!id) return;
    try {
      await chamarApi(`/chamados/${item.id}/tecnico`, token, {
        method: "PATCH",
        body: JSON.stringify({ tecnico_id: Number(id) }),
      });
      setAviso(`Chamado #${item.id} encaminhado ao técnico ID ${id}.`);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function emitirOS(item) {
    try {
      const os = await chamarApi(`/chamados/${item.id}/ordem-servico`, token, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setAviso(`Ordem de serviço ${os.numero ?? os.id} emitida com sucesso.`);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function verHistorico(id) {
    try {
      const data = await chamarApi(`/chamados/${id}/historico`, token);
      setHistorico((atual) => ({ ...atual, [id]: data.dados ?? data ?? [] }));
    } catch (e) {
      setErro(e.message);
    }
  }

  async function adicionarHistorico(id) {
    const descricao = window.prompt("Descrição do registro de manutenção:");
    if (!descricao) return;
    try {
      await chamarApi(`/chamados/${id}/historico`, token, {
        method: "POST",
        body: JSON.stringify({ descricao }),
      });
      setAviso(`Registro adicionado ao chamado #${id}.`);
      await verHistorico(id);
    } catch (e) {
      setErro(e.message);
    }
  }

  const filtrados = itens.filter((item) => {
    const termo = `${item.titulo} ${item.equipamento_nome ?? ""} ${item.id}`.toLowerCase();
    return termo.includes(busca.toLowerCase());
  });

  return (
    <div className={styles.container}>
      {/* Top Utility Bar */}
      <div className={styles.topUtilityBar}>
        <div className={styles.headerTitleBlock}>
          <h1 className={styles.title}>Chamados e Ordens de Serviço</h1>
          <p className={styles.subtitle}>
            Acompanhe problemas relatados nos equipamentos e atualize o andamento do atendimento.
          </p>
        </div>

        <button type="button" className={styles.refreshBtn} onClick={carregar}>
          <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--accent-tertiary)" }}>
            refresh
          </span>
          <span>Atualizar lista</span>
        </button>
      </div>

      {erro && <div className={styles.alertError} role="alert">{erro}</div>}
      {aviso && <div className={styles.alertSuccess}>{aviso}</div>}

      {/* Control / Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
          <input
            type="text"
            placeholder="Buscar por título, equipamento ou número..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
          {busca && (
            <button type="button" className={styles.clearBtn} onClick={() => setBusca("")}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
            </button>
          )}
        </div>

        <div className={styles.selectsRow}>
          <div className={styles.selectWrapper}>
            <span className={`material-symbols-outlined ${styles.selectIcon}`}>filter_alt</span>
            <select
              className={styles.select}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              {STATUS.map((x) => (
                <option key={x} value={x}>{ROTULO_STATUS[x] || x}</option>
              ))}
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <span className={`material-symbols-outlined ${styles.selectIcon}`}>warning</span>
            <select
              className={styles.select}
              value={severidade}
              onChange={(e) => setSeveridade(e.target.value)}
            >
              <option value="">Todas as prioridades</option>
              {SEVERIDADES.map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Frame */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Chamado</th>
                <th>Equipamento</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item) => {
                const sevUpper = String(item.severidade || "").toUpperCase();
                let sevClass = styles.sevBaixa;
                if (sevUpper === "CRITICA" || sevUpper === "CRÍTICA") sevClass = styles.sevCritica;
                else if (sevUpper === "ALTA") sevClass = styles.sevAlta;
                else if (sevUpper === "MEDIA" || sevUpper === "MÉDIA") sevClass = styles.sevMedia;

                return (
                  <tr key={item.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.callTitleBlock}>
                        <strong className={styles.callTitle}>{item.titulo}</strong>
                        <span className={styles.callMeta}>
                          #{item.id} · {item.aberto_em ? new Date(item.aberto_em).toLocaleDateString("pt-BR") : "Data não informada"}
                        </span>
                      </div>
                    </td>

                    <td className={styles.equipmentCell}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--silver)" }}>
                        precision_manufacturing
                      </span>
                      <span>{item.equipamento_nome || `Equipamento #${item.equipamento_id}`}</span>
                    </td>

                    <td>
                      <span className={`${styles.sevBadge} ${sevClass}`}>
                        <span className={styles.sevDot} />
                        <span>{item.severidade}</span>
                      </span>
                    </td>

                    <td>
                      <select
                        aria-label={`Status do chamado ${item.id}`}
                        className={styles.statusSelect}
                        value={item.status}
                        onChange={(e) => atualizarStatus(item, e.target.value)}
                      >
                        {STATUS.map((x) => (
                          <option key={x} value={x}>{ROTULO_STATUS[x] || x}</option>
                        ))}
                      </select>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className={styles.actionsRow}>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => encaminhar(item)}
                          title="Encaminhar para técnico"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>engineering</span>
                          <span>Técnico</span>
                        </button>

                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => emitirOS(item)}
                          title="Emitir Ordem de Serviço"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>description</span>
                          <span>Emitir OS</span>
                        </button>

                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => verHistorico(item.id)}
                          title="Consultar histórico"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>history</span>
                          <span>Histórico</span>
                        </button>

                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                          onClick={() => adicionarHistorico(item.id)}
                          title="Registrar manutenção"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>post_add</span>
                          <span>Registrar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {loading ? (
            <div className={styles.emptyState}>Carregando chamados...</div>
          ) : filtrados.length === 0 ? (
            <div className={styles.emptyState}>Nenhum chamado encontrado.</div>
          ) : null}
        </div>

        <div className={styles.tableFooter}>
          <span>{filtrados.length} chamado(s) retornado(s)</span>
          <span style={{ color: "#ffb4ac" }}>CHAMADOS TENKEN</span>
        </div>
      </div>

      {/* Painéis de Histórico Expandidos */}
      {Object.entries(historico).map(([id, registros]) => (
        <div className={styles.historyPanel} key={id}>
          <div className={styles.historyHeader}>
            <div className={styles.historyTitleRow}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#ffb4ac" }}>history</span>
              <strong>Histórico de Manutenção do Chamado #{id}</strong>
            </div>
          </div>
          <div className={styles.historyList}>
            {registros.length ? (
              registros.map((r, i) => (
                <div key={r.id ?? i} className={styles.historyItem}>
                  <span className={styles.historyDesc}>{r.descricao || r.acao || JSON.stringify(r)}</span>
                  <span className={styles.historyTime}>
                    {r.criado_em ? new Date(r.criado_em).toLocaleString("pt-BR") : ""}
                  </span>
                </div>
              ))
            ) : (
              <p className={styles.emptyState}>Ainda não há atualizações para este chamado.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
