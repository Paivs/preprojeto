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
const ITENS_POR_PAGINA = 10;

const ROTULO_STATUS = {
  ABERTO: "Aberto",
  EM_ATENDIMENTO: "Em Atendimento",
  AGUARDANDO_PECAS: "Aguardando Peças",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

export default function P\u00e1ginaChamados() {
  return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>;
}

function Conteudo({ token }) {
  const [itens, setItens] = useState([]);
  const [tiposEquipamento, setTiposEquipamento] = useState({});
  const [status, setStatus] = useState("");
  const [severidade, setSeveridade] = useState("");
  const [busca, setBusca] = useState("");
  const [pagina, setP\u00e1gina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [historico, setHist\u00f3rico] = useState({});
  const [selecionado, setSelecionado] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const q = new URLSearchP\u00e1gina: "1", limite: "100" });
      if (status) q.set("status", status);
      if (severidade) q.set("severidade", severidade);
      const [data, equipamentos] = await Promise.all([
        chamarApi(`/chamados?${q}`, token),
        chamarApi("/equipamentos?pagina=1&limite=100", token).catch(() => []),
      ]);
      setItens(data.dados ?? data ?? []);
      setTiposEquipamento(Object.fromEntries((equipamentos.dados ?? equipamentos ?? []).map((equipamento) => [equipamento.id, equipamento.tipo])));
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, status, severidade]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    setP\u00e1gina(1);
  }, [busca, status, severidade]);

  async function atualizarStatus(item, value) {
    try {
      await chamarApi(`/chamados/${item.id}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({ status: value }),
      });
      setSelecionado((atual) => atual?.id === item.id ? { ...atual, status: value } : atual);
      setA\u00e7\u00f5essage);
    }
  }

  async function encaminhar(item) {
    const id = window.prompt("ID do usu\u00e1rio com perfil TECNICO:");
    if (!id) return;
    t\u00e9cnico`, token, {
        method: "PATCH",
        body: JSON.stringify({ t\u00e9cnico_id: Number(id) }),
      });
      setAviso(`Chamado #${item.id} encaminhado ao t\u00e9cnico ID ${id}.`);
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
      setAviso(`Ordem de serviço ${os.n\u00famero ?? os.id} emitida com sucesso.`);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function verHist\u00f3rico(id) {
    try {
      const data = await chamarApi(`/chamados/${id}/historico`, token);
      setHist\u00f3rico((atual) => ({ ...atual, [id]: data.dados ?? data ?? [] }));
    } catch (e) {
      setErro(e.message);
    }
  }

  async function adicionarHist\u00f3rico(id) {
    const descricao = window.prompt("Descri\u00e7\u00e3o do registro de manutenção:");
    if (!descricao) return;
    try {
      await chamarApi(`/chamados/${id}/historico`, token, {
        method: "POST",
        body: JSON.stringify({ descricao }),
      });
      setAviso(`Registro adicionado ao chamado #${id}.`);
      await verHist\u00f3rico(id);
    } catch (e) {
      setErro(e.message);
    }
  }

  const filtrados = itens.filter((item) => {
    const\u00edtulo} ${item.equipamento_nome ?? ""} ${item.id}`.toLowerCase();
    return termo.includes(busca.toLowerCase());
  });
  const totalP\u00e1ginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalP\u00e1ginas);
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const chamadosP\u00e1gina = filtrados.slice(inicio, inicio + ITENS_POR_PAGINA);

  return (
    <div className={styles.container}>
      {/* Top Utility Bar */}
      <div className={styles.topUtilityBar}>
        <div className={styles.headerTitleBlock}>
          <h1 className={styles.title}>Chamados e Ordens de Servi\u00e7o</h1>
          <p className={styles.subtitle}>
            Acompanhe problemas relatados nos equipamentos e atualize o andamento do atendimento.
          </p>
        </div>

        <button type="button" className={styles.refreshBtn} onClick={carregar} aria-label="Atualizar lista">
          <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--accent-tertiary)" }}>
            refresh
          </span>
          <span className={styles.refreshLabel}>Atualizar lista</span>
        </button>
      </div>

      {erro && <div className={styles.alertError} role="alert">{erro}</div>}
      {aviso && <div className={styles.alertSuccess}>{aviso}</div>}

      {/* Filters inspired by the Stitch work order screen */}
      <div className={styles.filterBar}>
        <div className={styles.filterTopRow}>
          <div className={styles.searchBox}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
            <input\u00edtulo, equipamento ou n\u00famero..." value={busca} onChange={(e) => setBusca(e.target.value)} className={styles.searchInput} />
            {busca && <button type="button" className={styles.clearBtn} onClick={() => setBusca("")} aria-label="Limpar busca"><span className="material-symbols-outlined">close</span></button>}
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Severidade:</span>
            <button type="button" className={`${styles.filterPill} ${!severidade ? styles.filterPillActive : ""}`} onClick={() => setSeveridade("")}>Todas</button>
            {SEVERIDADES.map((value) => <button key={value} type="button" className={`${styles.filterPill} ${severidade === value ? styles.filterPillActive : ""}`} onClick={() => setSeveridade(value)}>{value}</button>)}
          </div>
        </div>
        <div className={styles.filterBottomRow}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Status:</span>
            <button type="button" className={`${styles.filterPill} ${!status ? styles.filterPillActive : ""}`} onClick={() => setStatus("")}>Todos</button>
            {STATUS.map((value) => <button key={value} type="button" className={`${styles.filterPill} ${status === value ? styles.filterPillActive : ""}`} onClick={() => setStatus(value)}>{ROTULO_STATUS[value] || value}</button>)}
          </div>
          <span className={styles.resultsCount}>Exibindo <strong>{filtrados.length}</strong> itens</span>
        </div>
      </div>

      <div className={styles.ticketList}>
        {chamadosP\u00e1gina.map((item) => {
          const tipoEquipamento = tiposEquipamento[item.equipamento_id];
          const iconeEquipamento = tipoEquipamento === "BA\u00e7\u00f5estaurant" : tipoEquipamento === "ROBO" ? "smart_toy" : "precision_manufacturing";
          const severidadeAtual = String(item.severidade || "").toUpperCase();
          const severidadeClass = severidadeA\u00e7\u00f5es.sevCritica : severidadeA\u00e7\u00f5es.sevA\u00e7\u00f5es.sevMedia : styles.sevBaixa;
          const statusClass = item.status === "CONCLUIDO" ? styles.statusDone : item.status === "EM_A\u00e7\u00f5es.statusA\u00e7\u00f5es.statusWaiting;
          const dataAbertura = item.aberto_em ? new Date(item.aberto_em).toLocaleString("pt-BR") : "Data n\u00e3o informada";

          return (
            <article key={item.id} className={styles.ticketCard}>
              <span className={`${styles.ticketAccent} ${severidadeClass}`} />
              <div className={styles.ticketIdentity}>
                <div className={styles.ticketIcon}><span className="material-symbols-outlined" aria-hidden="true">{iconeEquipamento}</span></div>
                <div className={styles.ticketIdBlock}>
                  <strong className={styles.ticketCode}>#CH-{String(item.id).padStart(4, "0")}</strong>
                  <span className={styles.ticketPlace}>Equipamento #{item.equipamento_id}</span>
                </div>
              </div>
              <div className={styles.ticketDetails}>
                <span className={styles.ticketEquipment}><span className="material-symbols-outlined">token</span>{item.equipamento_nome || `Equipamento #${item.equipamento_id}`}</span>
                <h2 className={st\u00edtulo}</h2>
                <div className={styles.ticketMeta}>
                  <span><span className="material-symbols-outlined">account_circle</span>Solicitante #{item.solicitante_id ?? "—"}</span>
                  <span><span className="material-symbols-outlined">schedule</span>{dataAbertura}</span>
                </div>
              </div>
              <div className={styles.ticketActions}>
                <div className={styles.ticketBadges}>
                  <span className={`${styles.sevBadge} ${severidadeClass}`}><span className={styles.sevDot} />{item.severidade}</span>
                  <span className={`${styles.statusBadge} ${statusClass}`}>{ROTULO_STATUS[item.status] || item.status}</span>
                </div>
                <button type="button" className={styles.openTicketBtn} onClick={() => setSelecionado(item)}>
                  Abrir <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </article>
          );
        })}
        {loading ? <div className={styles.emptyState}>Carregando chamados...</div> : filtrados.length === 0 ? <div className={styles.emptyState}>Nenhum chamado encontrado.</div> : null}
      </div>
      <div className={styles.listFooter}>
        <span>Exibindo <strong>{filtrados.length === 0 ? 0 : inicio + 1}–{Math.min(inicio + ITENS_POR_PAGINA, filtrados.length)}</strong> de <strong>{filtrados.length}</strong> chamados</span>
        <nav className={styles.paginationButtons} aria-label="P\u00e1ginação dos chamados">
          <button type="button" className={styles.pageBtn} disabled={paginaAtual === 1} onClick={() => setP\u00e1gina(paginaAtual - 1)} aria-label="P\u00e1gina anterior"><span className="material-symbols-outlined">chevron_left</span></button>
          {Array.from({ length: totalP\u00e1ginas }, (_, i) => i + 1).map((n\u00famero) => (
            <button key={n\u00famero} type="button" className={`${styles.pageBtn} ${n\u00famero === paginaA\u00e7\u00f5es.pageBtnActive : ""}`} aria-current={n\u00famero === paginaAtual ? "page" : undefined} onClick={() => setP\u00e1gina(n\u00famero)}>{n\u00famero}</button>
          ))}
          <button type="button" className={styles.pageBtn} disabled={paginaAtual === totalP\u00e1ginas} onClick={() => setP\u00e1gina(paginaAtual + 1)} aria-label="P\u00e1gina"><span className="material-symbols-outlined">chevron_right</span></button>
        </nav>
      </div>
      {selecionado && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="ticket-detail-title" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelecionado(null); }}>
          <section className={styles.modalCard}>
            <header className={styles.modalHeader}>
              <div className={styles.modalHeading}>
                <div className={styles.modalIcon}><span className="material-symbols-outlined">assignment_late</span></div>
                <div>
                  <div className={styles.modalBadges}>
                    <strong className={styles.modalCode}>#CH-{String(selecionado.id).padStart(4, "0")}</strong>
                    <span className={`${styles.sevBadge} ${String(selecionado.severidade).toUpperCase() === "CRITICA\u00e7\u00f5es.sevCritica : String(selecionado.severidade).toUpperCase() === "A\u00e7\u00f5es.sevAlta : String(selecionado.severidade).toUpperCase() === "MEDIA\u00e7\u00f5es.sevMedia : styles.sevBaixa}`}>{selecionado.severidade}</span>
                    <span className={styles.statusBadge}>{ROTULO_STATUS[selecionado.status] || selecionado.status}</span>
                  </div>
                  <span className={styles.modalEyebrow}>Ficha técnica do chamado</span>
                </div>
              </div>
              <button type="button" className={styles.closeModalBtn} onClick={() => setSelecionado(null)} aria-label="Fechar detalhes"><span className="material-symbols-outlined">close</span></button>
            </header>
            <div className={styles.modalBody}>
              <div className={styles.modalMetaGrid}>
                <div><span>Equipamento</span><strong>{selecionado.equipamento_nome || `Equipamento #${selecionado.equipamento_id}`}</strong></div>
                <div><span>Solicitante</span><strong>Usuário #{selecionado.solicitante_id ?? "—"}</strong></div>
                <div><span>Abertura</span><strong>{selecionado.aberto_em ? new Date(selecionado.aberto_em).toLocaleString("pt-BR") : "Data n\u00e3o informada"}</strong></div>
              </div>
              <section className={styles.modalDescri\u00e7\u00e3on}>
                <span>Descri\u00e7\u00e3o técnica</span>
                <h2 id="ticket-detail-title">{selecionado.t\u00edtulo}</h2>
                <p>{selecionado.descricao || "Nenhuma descrição adicional foi informada."}</p>
              </section>
              <div className={styles.modalActionPanel}>
                <div>
                  <span className={styles.modalEyebrow}>A\u00e7\u00f5es de atendimento</span>
                  <h3>Atualiza\u00e7\u00e3o e ordem de serviço</h3>
                </div>
                <label className={styles.statusControl}>
                  <span>Status</span>
                  <select aria-label={`Status do chamado ${selecionado.id}`} className={styles.statusSelect} value={selecionado.status} onChange={(e) => atualizarStatus(selecionado, e.target.value)}>
                    {STATUS.map((value) => <option key={value} value={value}>{ROTULO_STATUS[value] || value}</option>)}
                  </select>
                </label>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.actionBtn} onClick={() => encaminhar(selecionado)}><span className="material-symbols-outlined">engineering</span>Encaminhar t\u00e9cnico</button>
                  <button type="button" className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => emitirOS(selecionado)}><span className="material-symbols-outlined">build_circle</span>Emitir OS</button>
                  <button type="button" className={styles.actionBtn} onClick={() => verHist\u00f3rico(selecionado.id)}><span className="material-symbols-outlined">history</span>Ver histórico</button>
                  <button type="button" className={styles.actionBtn} onClick={() => adicionarHist\u00f3rico(selecionado.id)}><span className="material-symbols-outlined">post_add</span>Registrar manutenção</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
      {/* Pain\u00e9is de Hist\u00f3rico Expandidos */}
      {Object.entries(historico).map(([id, registros]) => (
        <div className={styles.historyPanel} key={id}>
          <div className={styles.historyHeader}>
            <div className={styles.historyTitleRow}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#ffb4ac" }}>history</span>
              <strong>Hist\u00f3rico de Manuten\u00e7\u00e3o do Chamado #{id}</strong>
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
              <p className={styles.emptyState}>Ainda n\u00e3o h\u00e1 atualiza\u00e7\u00f5es para este chamado.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
