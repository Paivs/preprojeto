"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import styles from "../components/TabelaAdmin.module.css";
import { chamarApi } from "../lib/adminApi";

export default function PaginaOcorrencias() { return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>; }

function Conteudo({ token }) {
  const [itens, setItens] = useState([]); const [tipo, setTipo] = useState(""); const [aluno, setAluno] = useState(""); const [turma, setTurma] = useState(""); const [loading, setLoading] = useState(true); const [erro, setErro] = useState("");
  const carregar = useCallback(async () => { setLoading(true); setErro(""); try { const q = new URLSearchParams({ pagina: "1", limite: "100" }); if (tipo) q.set("tipo", tipo); if (aluno) q.set("aluno_id", aluno); if (turma) q.set("turma_id", turma); const data = await chamarApi(`/ocorrencias?${q}`, token); setItens(data.dados ?? data ?? []); } catch (e) { setErro(e.message); } finally { setLoading(false); } }, [token, tipo, aluno, turma]);
  useEffect(() => { carregar(); }, [carregar]);
  return <>
    <header className={styles.cabecalhoPagina}><div><h2>Ocorrências patrimoniais</h2><p>Registros de dano e extravio associados a agendamentos.</p></div><button className={styles.botaoSecundario} onClick={carregar}>Atualizar</button></header>
    {erro && <p className={styles.erro} role="alert">{erro}</p>}
    <div className={styles.barraFerramentas}><select className={styles.seletor} value={tipo} onChange={(e) => setTipo(e.target.value)}><option value="">Todos os tipos</option><option value="DANO">Dano</option><option value="EXTRAVIO">Extravio</option></select><input className={styles.campo} type="number" min="1" placeholder="ID do aluno" value={aluno} onChange={(e) => setAluno(e.target.value)} /><input className={styles.campo} type="number" min="1" placeholder="ID da turma" value={turma} onChange={(e) => setTurma(e.target.value)} /></div>
    <section className={styles.painel}><table className={styles.tabela}><thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Quantidade</th><th>Agendamento</th><th>Responsáveis</th></tr></thead><tbody>{itens.map((item) => <tr key={item.id}><td>{item.criada_em ? new Date(item.criada_em).toLocaleString("pt-BR") : "—"}</td><td><span className={styles.status}>{item.tipo}</span></td><td>{item.descricao || "Sem descrição"}</td><td>{item.quantidade}</td><td>#{item.agendamento_id}</td><td>Aluno {item.responsavel_id ?? "—"}<br />Turma {item.turma_id ?? "—"}</td></tr>)}</tbody></table>{loading ? <p className={styles.estado}>Carregando ocorrências…</p> : itens.length === 0 ? <p className={styles.estado}>Nenhuma ocorrência encontrada.</p> : null}<div className={styles.paginacao}><span>{itens.length} ocorrência(s) retornada(s)</span><span>GET /ocorrencias</span></div></section>
  </>;
}
