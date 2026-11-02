"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import styles from "../components/TabelaAdmin.module.css";
import { chamarApi } from "../lib/adminApi";

const STATUS = ["DISPONIVEL", "RESERVADO", "EM_USO", "EM_MANUTENCAO", "INATIVO"];
const vazio = { codigo_patrimonio: "", nome: "", tipo: "BANCADA", localizacao: "" };

export default function PaginaEquipamentos() {
  return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>;
}

function Conteudo({ token }) {
  const [itens, setItens] = useState([]); const [busca, setBusca] = useState(""); const [statusFiltro, setStatusFiltro] = useState("");
  const [form, setForm] = useState(vazio); const [aberto, setAberto] = useState(false); const [loading, setLoading] = useState(true); const [erro, setErro] = useState(""); const [aviso, setAviso] = useState("");
  const carregar = useCallback(async () => { setLoading(true); setErro(""); try { const q = new URLSearchParams({ pagina: "1", limite: "100" }); if (statusFiltro) q.set("status", statusFiltro); const dados = await chamarApi(`/equipamentos?${q}`, token); setItens(dados.dados ?? dados ?? []); } catch (e) { setErro(e.message); } finally { setLoading(false); } }, [token, statusFiltro]);
  useEffect(() => { carregar(); }, [carregar]);
  const visiveis = itens.filter((item) => `${item.nome} ${item.codigo_patrimonio} ${item.localizacao}`.toLowerCase().includes(busca.toLowerCase()));
  async function salvar(event) { event.preventDefault(); setErro(""); try { await chamarApi("/equipamentos", token, { method: "POST", body: JSON.stringify(form) }); setForm(vazio); setAberto(false); setAviso("Equipamento cadastrado."); await carregar(); } catch (e) { setErro(e.message); } }
  async function mudarStatus(item, status) { try { await chamarApi(`/equipamentos/${item.id}/status`, token, { method: "PATCH", body: JSON.stringify({ status }) }); await carregar(); } catch (e) { setErro(e.message); } }
  async function inativar(item) { if (!window.confirm(`Inativar ${item.nome}?`)) return; try { await chamarApi(`/equipamentos/${item.id}`, token, { method: "DELETE" }); setAviso("Equipamento inativado."); await carregar(); } catch (e) { setErro(e.message); } }
  return <>
    <header className={styles.cabecalhoPagina}><div><h2>Equipamentos</h2><p>Inventário conectado à API do Tenken.</p></div><button className={styles.botao} onClick={() => setAberto(!aberto)}>{aberto ? "Fechar cadastro" : "Novo equipamento"}</button></header>
    {erro && <p className={styles.erro} role="alert">{erro}</p>}{aviso && <p className={styles.estado}>{aviso}</p>}
    {aberto && <form className={styles.painel} style={{ padding: 16, marginBottom: 16 }} onSubmit={salvar}><div className={styles.formGrid}>
      <label className={styles.formField}>Patrimônio<input required value={form.codigo_patrimonio} onChange={(e) => setForm({ ...form, codigo_patrimonio: e.target.value })} /></label>
      <label className={styles.formField}>Nome<input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></label>
      <label className={styles.formField}>Tipo<select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}><option value="BANCADA">Bancada</option><option value="ROBO">Robô</option></select></label>
      <label className={styles.formField}>Localização<input required value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} /></label>
    </div><div className={styles.modalAcoes}><button className={styles.botao}>Salvar</button></div></form>}
    <div className={styles.barraFerramentas}><input className={`${styles.campo} ${styles.campoBusca}`} placeholder="Buscar por nome, patrimônio ou local" value={busca} onChange={(e) => setBusca(e.target.value)} /><select className={styles.seletor} value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}><option value="">Todos os status</option>{STATUS.map((s) => <option key={s}>{s}</option>)}</select><button className={styles.botaoSecundario} onClick={carregar}>Atualizar</button></div>
    <section className={styles.painel}><table className={styles.tabela}><thead><tr><th>Patrimônio</th><th>Equipamento</th><th>Tipo</th><th>Localização</th><th>Status</th><th>Ações</th></tr></thead><tbody>{visiveis.map((item) => <tr key={item.id}><td>{item.codigo_patrimonio}</td><td>{item.nome}</td><td>{item.tipo}</td><td>{item.localizacao}</td><td><select aria-label={`Status ${item.nome}`} className={styles.seletor} value={item.status} onChange={(e) => mudarStatus(item, e.target.value)}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select></td><td><button className={styles.botaoSecundario} onClick={() => inativar(item)}>Inativar</button></td></tr>)}</tbody></table>{loading ? <p className={styles.estado}>Carregando equipamentos…</p> : visiveis.length === 0 ? <p className={styles.estado}>Nenhum equipamento encontrado.</p> : null}<div className={styles.paginacao}><span>{visiveis.length} equipamento(s) nesta página</span><span>GET /equipamentos</span></div></section>
  </>;
}
