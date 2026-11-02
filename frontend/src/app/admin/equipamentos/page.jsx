"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import PainelEquipamentos from "../components/PainelEquipamentos";
import tabela from "../components/TabelaAdmin.module.css";
import styles from "./page.module.css";
import { chamarApi } from "../lib/adminApi";

const STATUS = ["DISPONIVEL", "RESERVADO", "EM_USO", "EM_MANUTENCAO", "INATIVO"];
const ROTULO_STATUS = { DISPONIVEL: "Operacional", RESERVADO: "Reservado", EM_USO: "Em Uso", EM_MANUTENCAO: "Em Manutenção", INATIVO: "Inativo" };
const TOM_STATUS = { DISPONIVEL: "ok", EM_USO: "ok", RESERVADO: "neutro", EM_MANUTENCAO: "atencao", INATIVO: "neutro" };
const TRANSICOES = {
  DISPONIVEL: [["RESERVADO", "Reservar"], ["EM_USO", "Marcar em uso"], ["EM_MANUTENCAO", "Enviar p/ manutenção"]],
  EM_USO: [["DISPONIVEL", "Disponibilizar"], ["EM_MANUTENCAO", "Enviar p/ manutenção"]],
  RESERVADO: [["DISPONIVEL", "Disponibilizar"], ["EM_USO", "Marcar em uso"]],
  EM_MANUTENCAO: [["DISPONIVEL", "Disponibilizar"]],
  INATIVO: [["DISPONIVEL", "Reativar"]],
};
const ITENS_POR_PAGINA = 10;
const vazio = { codigo_patrimonio: "", nome: "", tipo: "BANCADA", localizacao: "" };

export default function PaginaEquipamentos() {
  return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>;
}

function IconeBusca() {
  return (
    <svg className={styles.iconeBusca} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconeFechar() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <line x1="4" y1="4" x2="20" y2="20" /><line x1="20" y1="4" x2="4" y2="20" />
    </svg>
  );
}

function IconeSeta() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Conteudo({ token }) {
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const [form, setForm] = useState(vazio);
  const [aberto, setAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [menuStatusId, setMenuStatusId] = useState(null);
  const [historico, setHistorico] = useState([]);

  const carregar = useCallback(async () => {
    setLoading(true); setErro("");
    try {
      const q = new URLSearchParams({ pagina: "1", limite: "100" });
      if (statusFiltro) q.set("status", statusFiltro);
      const dados = await chamarApi(`/equipamentos?${q}`, token);
      setItens(dados.dados ?? dados ?? []);
    } catch (e) { setErro(e.message); } finally { setLoading(false); }
  }, [token, statusFiltro]);

  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { setPagina(1); }, [busca, statusFiltro]);

  const contagemPorStatus = useMemo(() => {
    const mapa = Object.fromEntries(STATUS.map((s) => [s, 0]));
    itens.forEach((item) => { if (mapa[item.status] !== undefined) mapa[item.status] += 1; });
    return mapa;
  }, [itens]);

  const metricas = useMemo(() => {
    const total = itens.length || 0;
    const operacionais = contagemPorStatus.DISPONIVEL + contagemPorStatus.EM_USO;
    const criar = (valor, tom) => ({ valor, percentual: total ? Math.round((valor / total) * 100) : 0, tom });
    return [
      { rotulo: "Operacionais", ...criar(operacionais, "ok") },
      { rotulo: "Reservados", ...criar(contagemPorStatus.RESERVADO, "neutro") },
      { rotulo: "Em Manutenção", ...criar(contagemPorStatus.EM_MANUTENCAO, "atencao") },
      { rotulo: "Inativos", ...criar(contagemPorStatus.INATIVO, "neutro") },
    ];
  }, [itens, contagemPorStatus]);

  const porCategoria = useMemo(() => {
    const bancadas = itens.filter((i) => i.tipo === "BANCADA").length;
    const robos = itens.filter((i) => i.tipo === "ROBO").length;
    return [{ status: "Bancadas", total: bancadas }, { status: "Robôs", total: robos }];
  }, [itens]);

  const visiveis = useMemo(
    () => itens.filter((item) => `${item.nome} ${item.codigo_patrimonio} ${item.localizacao}`.toLowerCase().includes(busca.toLowerCase())),
    [itens, busca]
  );

  const totalPaginas = Math.max(1, Math.ceil(visiveis.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const paginados = visiveis.slice((paginaAtual - 1) * ITENS_POR_PAGINA, paginaAtual * ITENS_POR_PAGINA);

  async function salvar(event) {
    event.preventDefault(); setErro("");
    try {
      await chamarApi("/equipamentos", token, { method: "POST", body: JSON.stringify(form) });
      setForm(vazio); setAberto(false); setAviso("Equipamento cadastrado.");
      await carregar();
    } catch (e) { setErro(e.message); }
  }

  async function mudarStatus(item, status) {
    setMenuStatusId(null);
    try {
      await chamarApi(`/equipamentos/${item.id}/status`, token, { method: "PATCH", body: JSON.stringify({ status }) });
      setHistorico((atual) => [{ id: `${item.id}-${Date.now()}`, nome: item.nome, de: item.status, para: status, quando: new Date() }, ...atual].slice(0, 6));
      await carregar();
    } catch (e) { setErro(e.message); }
  }

  async function inativar(item) {
    if (!window.confirm(`Inativar ${item.nome}?`)) return;
    try {
      await chamarApi(`/equipamentos/${item.id}`, token, { method: "DELETE" });
      setHistorico((atual) => [{ id: `${item.id}-${Date.now()}`, nome: item.nome, de: item.status, para: "INATIVO", quando: new Date() }, ...atual].slice(0, 6));
      setAviso("Equipamento inativado.");
      await carregar();
    } catch (e) { setErro(e.message); }
  }

  function limparFiltros() { setBusca(""); setStatusFiltro(""); }

  return (
    <>
      <header className={tabela.cabecalhoPagina}>
        <div><h2>Equipamentos</h2><p>Inventário conectado à API do Tenken.</p></div>
        <button className={tabela.botao} onClick={() => setAberto(!aberto)}>{aberto ? "Fechar cadastro" : "+ Cadastrar Equipamento"}</button>
      </header>

      {erro && <p className={tabela.erro} role="alert">{erro}</p>}
      {aviso && <p className={tabela.estado}>{aviso}</p>}

      <div className={styles.metricas}>
        {metricas.map((m) => (
          <div key={m.rotulo} className={`${styles.metricaCard} ${styles[`tom-${m.tom}`]}`}>
            <span className={styles.metricaRotulo}>{m.rotulo}</span>
            <div className={styles.metricaLinha}>
              <strong className={styles.metricaValor}>{m.valor}</strong>
              <span className={styles.metricaPercentual}>{m.percentual}%</span>
            </div>
            <div className={styles.metricaBarraFundo}><div className={styles.metricaBarraPreenchida} style={{ width: `${m.percentual}%` }} /></div>
          </div>
        ))}
      </div>

      {aberto && (
        <form className={tabela.painel} style={{ padding: 16, marginBottom: 16 }} onSubmit={salvar}>
          <h3 className={tabela.subTitulo} style={{ marginTop: 0 }}>Cadastrar Novo Equipamento</h3>
          <div className={tabela.formGrid}>
            <label className={tabela.formField}>Patrimônio<input required value={form.codigo_patrimonio} onChange={(e) => setForm({ ...form, codigo_patrimonio: e.target.value })} /></label>
            <label className={tabela.formField}>Nome do Equipamento<input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></label>
            <label className={tabela.formField} style={{ gridColumn: "1 / -1" }}>
              Tipo
              <div className={styles.tipoSelector}>
                <button type="button" className={`${styles.tipoOpcao} ${form.tipo === "BANCADA" ? styles.tipoOpcaoAtiva : ""}`} onClick={() => setForm({ ...form, tipo: "BANCADA" })}>
                  <strong>Bancada</strong><span>Posto de trabalho ou CLP</span>
                </button>
                <button type="button" className={`${styles.tipoOpcao} ${form.tipo === "ROBO" ? styles.tipoOpcaoAtiva : ""}`} onClick={() => setForm({ ...form, tipo: "ROBO" })}>
                  <strong>Robô</strong><span>Braço, Scara, AGV</span>
                </button>
              </div>
            </label>
            <label className={tabela.formField}>Localização<input required value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} /></label>
          </div>
          <div className={tabela.modalAcoes}><button className={tabela.botao}>Salvar Equipamento</button></div>
        </form>
      )}

      <div className={tabela.barraFerramentas}>
        <div className={styles.buscaWrap}>
          <IconeBusca />
          <input className={styles.buscaInput} placeholder="Buscar por nome, patrimônio ou local" value={busca} onChange={(e) => setBusca(e.target.value)} />
          {busca && <button type="button" className={styles.buscaLimpar} aria-label="Limpar busca" onClick={() => setBusca("")}><IconeFechar /></button>}
        </div>
        <select className={tabela.seletor} value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
          <option value="">Status: Todos ({itens.length})</option>
          {STATUS.map((s) => <option key={s} value={s}>Status: {ROTULO_STATUS[s]} ({contagemPorStatus[s]})</option>)}
        </select>
        {(busca || statusFiltro) && <button className={tabela.botaoSecundario} onClick={limparFiltros}>Limpar Filtros</button>}
        <button className={tabela.botaoSecundario} onClick={carregar}>Atualizar</button>
      </div>

      <section className={tabela.painel}>
        <table className={tabela.tabela}>
          <thead>
            <tr><th>Código</th><th>Nome</th><th>Tipo</th><th>Localização</th><th>Status Operacional</th><th>Ações de Controle</th></tr>
          </thead>
          <tbody>
            {paginados.map((item) => (
              <tr key={item.id}>
                <td><code>{item.codigo_patrimonio}</code></td>
                <td>{item.nome}</td>
                <td><span className={styles.badgeTipo}>{item.tipo === "ROBO" ? "Robô" : "Bancada"}</span></td>
                <td>{item.localizacao}</td>
                <td>
                  <span className={`${styles.badgeStatus} ${styles[`tom-${TOM_STATUS[item.status] ?? "neutro"}`]}`}>
                    <span className={styles.pontoStatus} />{ROTULO_STATUS[item.status] ?? item.status}
                  </span>
                </td>
                <td>
                  <div className={tabela.acoes} style={{ position: "relative" }}>
                    <button className={tabela.botaoSecundario} onClick={() => setMenuStatusId(menuStatusId === item.id ? null : item.id)}>
                      Mudar Status <IconeSeta />
                    </button>
                    {menuStatusId === item.id && (
                      <div className={styles.menuStatus}>
                        {(TRANSICOES[item.status] ?? []).map(([novoStatus, rotulo]) => (
                          <button key={novoStatus} className={styles.menuStatusItem} onClick={() => mudarStatus(item, novoStatus)}>{rotulo}</button>
                        ))}
                        {(TRANSICOES[item.status] ?? []).length === 0 && <span className={styles.menuStatusVazio}>Sem transições disponíveis</span>}
                      </div>
                    )}
                    {item.status !== "INATIVO" && <button className={tabela.botaoSecundario} onClick={() => inativar(item)}>Inativar</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading ? (
          <p className={tabela.estado}>Carregando equipamentos…</p>
        ) : visiveis.length === 0 ? (
          <p className={tabela.estado}>Nenhum equipamento localizado.</p>
        ) : null}

        <div className={tabela.paginacao}>
          <span>{visiveis.length} equipamento(s) · {ITENS_POR_PAGINA} por página</span>
          <div className={styles.paginacaoBotoes}>
            <button className={tabela.botaoSecundario} disabled={paginaAtual === 1} onClick={() => setPagina(paginaAtual - 1)}>‹</button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).slice(0, 7).map((n) => (
              <button key={n} className={n === paginaAtual ? styles.paginaAtiva : tabela.botaoSecundario} onClick={() => setPagina(n)}>{n}</button>
            ))}
            <button className={tabela.botaoSecundario} disabled={paginaAtual === totalPaginas} onClick={() => setPagina(paginaAtual + 1)}>›</button>
          </div>
        </div>
      </section>

      <div className={styles.rodapeGrid}>
        <section className={tabela.painel} style={{ padding: 16 }}>
          <h3 className={tabela.subTitulo} style={{ marginTop: 0 }}>Histórico de Alterações de Status</h3>
          {historico.length === 0 ? (
            <p className={tabela.estado}>Nenhuma alteração nesta sessão.</p>
          ) : (
            <ul className={styles.historicoLista}>
              {historico.map((h) => (
                <li key={h.id} className={styles.historicoItem}>
                  <span>{h.nome}: alterado de <strong>{ROTULO_STATUS[h.de] ?? h.de}</strong> para <strong>{ROTULO_STATUS[h.para] ?? h.para}</strong></span>
                  <span className={styles.historicoHora}>{h.quando.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <PainelEquipamentos titulo="Distribuição por Categoria" total={itens.length} porStatus={porCategoria} carregando={loading} />
      </div>
    </>
  );
}
