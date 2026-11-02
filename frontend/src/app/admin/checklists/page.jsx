"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import styles from "../components/TabelaAdmin.module.css";
import { chamarApi } from "../lib/adminApi";

const modeloVazio = { titulo: "", tipo_equipamento: "BANCADA", etapa: "PRE_USO" };
export default function PaginaChecklists() { return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>; }

function Conteudo({ token }) {
  const [modelos, setModelos] = useState([]); const [modeloId, setModeloId] = useState(""); const [itens, setItens] = useState([]); const [modelo, setModelo] = useState(modeloVazio); const [descricao, setDescricao] = useState(""); const [critico, setCritico] = useState(false); const [erro, setErro] = useState(""); const [aviso, setAviso] = useState(""); const [loading, setLoading] = useState(true);
  const carregarModelos = useCallback(async () => { setLoading(true); try { const data = await chamarApi("/checklist-modelos", token); const lista = data.dados ?? data ?? []; setModelos(lista); if (!modeloId && lista.length) setModeloId(String(lista[0].id)); } catch (e) { setErro(e.message); } finally { setLoading(false); } }, [token, modeloId]);
  const carregarItens = useCallback(async () => { if (!modeloId) { setItens([]); return; } try { const data = await chamarApi(`/checklist-modelos/${modeloId}/itens`, token); setItens(data.dados ?? data ?? []); } catch (e) { setErro(e.message); } }, [token, modeloId]);
  useEffect(() => { carregarModelos(); }, [carregarModelos]); useEffect(() => { carregarItens(); }, [carregarItens]);
  async function salvarModelo(e) { e.preventDefault(); try { await chamarApi("/checklist-modelos", token, { method: "POST", body: JSON.stringify(modelo) }); setModelo(modeloVazio); setAviso("Modelo de checklist criado."); await carregarModelos(); } catch (err) { setErro(err.message); } }
  async function criarItem(e) { e.preventDefault(); try { await chamarApi(`/checklist-modelos/${modeloId}/itens`, token, { method: "POST", body: JSON.stringify({ descricao, critico }) }); setDescricao(""); setCritico(false); await carregarItens(); } catch (err) { setErro(err.message); } }
  async function mudarItem(item, patch) { try { await chamarApi(`/checklist-itens/${item.id}`, token, { method: "PUT", body: JSON.stringify({ descricao: item.descricao, critico: Boolean(item.critico), ...patch }) }); await carregarItens(); } catch (err) { setErro(err.message); } }
  async function excluirItem(item) { if (!window.confirm("Excluir este item do checklist?")) return; try { await chamarApi(`/checklist-itens/${item.id}`, token, { method: "DELETE" }); await carregarItens(); } catch (err) { setErro(err.message); } }
  async function excluirModelo() { const escolhido = modelos.find((m) => String(m.id) === modeloId); if (!escolhido || !window.confirm(`Excluir o modelo “${escolhido.titulo}”?`)) return; try { await chamarApi(`/checklist-modelos/${modeloId}`, token, { method: "DELETE" }); setModeloId(""); setItens([]); await carregarModelos(); } catch (err) { setErro(err.message); } }
  return <>
    <header className={styles.cabecalhoPagina}><div><h2>Checklists</h2><p>Gerencie modelos e itens usados nas inspeções de equipamentos.</p></div></header>
    {erro && <p className={styles.erro} role="alert">{erro}</p>}{aviso && <p className={styles.estado}>{aviso}</p>}
    <section className={styles.painel} style={{ padding: 16, marginBottom: 16 }}><h3 className={styles.subTitulo}>Novo modelo</h3><form onSubmit={salvarModelo}><div className={styles.formGrid}>
      <label className={styles.formField}>Título<input required value={modelo.titulo} onChange={(e) => setModelo({ ...modelo, titulo: e.target.value })} /></label>
      <label className={styles.formField}>Tipo de equipamento<select value={modelo.tipo_equipamento} onChange={(e) => setModelo({ ...modelo, tipo_equipamento: e.target.value })}><option value="BANCADA">Bancada</option><option value="ROBO">Robô</option></select></label>
      <label className={styles.formField}>Etapa<select value={modelo.etapa} onChange={(e) => setModelo({ ...modelo, etapa: e.target.value })}><option value="PRE_USO">Pré-uso</option><option value="POS_USO">Pós-uso</option></select></label>
    </div><div className={styles.modalAcoes}><button className={styles.botao}>Criar modelo</button></div></form></section>
    <div className={styles.barraFerramentas}><select className={styles.seletor} value={modeloId} onChange={(e) => setModeloId(e.target.value)}><option value="">Selecione um modelo</option>{modelos.map((m) => <option key={m.id} value={m.id}>{m.titulo} · {m.tipo_equipamento} · {m.etapa}</option>)}</select>{modeloId && <button className={styles.botaoSecundario} onClick={excluirModelo}>Excluir modelo</button>}</div>
    {modeloId && <section className={styles.painel} style={{ padding: 16, marginBottom: 16 }}><form onSubmit={criarItem}><div className={styles.formGrid}><label className={styles.formField}>Descrição do item<input required value={descricao} onChange={(e) => setDescricao(e.target.value)} /></label><label className={styles.check}><input type="checkbox" checked={critico} onChange={(e) => setCritico(e.target.checked)} /> Item crítico</label></div><div className={styles.modalAcoes}><button className={styles.botao}>Adicionar item</button></div></form></section>}
    <section className={styles.painel}><table className={styles.tabela}><thead><tr><th>Item</th><th>Crítico</th><th>Ações</th></tr></thead><tbody>{itens.map((item) => <tr key={item.id}><td>{item.descricao}</td><td><input type="checkbox" aria-label="Item crítico" checked={Boolean(item.critico)} onChange={(e) => mudarItem(item, { critico: e.target.checked })} /></td><td><button className={styles.botaoSecundario} onClick={() => excluirItem(item)}>Excluir</button></td></tr>)}</tbody></table>{loading ? <p className={styles.estado}>Carregando modelos…</p> : !modeloId || itens.length === 0 ? <p className={styles.estado}>Selecione um modelo com itens ou crie um novo.</p> : null}<div className={styles.paginacao}><span>{itens.length} item(ns)</span><span>GET /checklist-modelos</span></div></section>
  </>;
}
