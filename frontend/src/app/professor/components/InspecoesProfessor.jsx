"use client";
import { useEffect, useState } from "react";
import { buscarRespostasInspecao, listarInspecoes, registrarInspecao } from "../lib/professorApi";
import FormularioInspecao from "./FormularioInspecao";
import ModalProfessor from "./ModalProfessor";
import styles from "./InspecoesProfessor.module.css";

const etapas = { PRE_USO: "Pré-uso", POS_USO: "Pós-uso" };
const resultados = { APROVADO: "Aprovada", APROVADO_COM_RESSALVAS: "Aprovada com ressalvas", REPROVADO: "Reprovada" };
const filtros = [["TODAS", "Todas"], ["PENDENTES", "Pendentes"], ["REALIZADAS", "Realizadas"]];

export default function InspecoesProfessor() {
  const [items, setItems] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [respostas, setRespostas] = useState([]);
  const [filtro, setFiltro] = useState("TODAS");
  const [mensagem, setMensagem] = useState("");
  async function carregar() { setItems(await listarInspecoes()); }
  useEffect(() => { carregar().catch(() => {}); }, []);
  const visiveis = items.filter(i => filtro === "TODAS" || (filtro === "PENDENTES" && !i.resultado) || (filtro === "REALIZADAS" && i.resultado));
  async function abrir(i) { setSelecionado(i); setRespostas(i.resultado ? await buscarRespostasInspecao(i.id) : []); }
  async function salvar(f) {
    try {
      await registrarInspecao({ agendamentoId: selecionado.agendamentoId, etapa: selecionado.etapa, respostas: f.respostas, observacoes: f.observacoes });
      setSelecionado(null); setMensagem("Inspeção registrada."); await carregar(); return { ok: true };
    } catch (e) { return { ok: false, message: e.message }; }
  }
  const estadoClass = resultado => resultado === "REPROVADO" ? styles.resultadoReprovado : resultado === "APROVADO_COM_RESSALVAS" ? styles.resultadoRessalva : resultado === "APROVADO" ? styles.resultadoRealizado : styles.resultadoPendente;
  return <div className={styles.container}>
    <header className={styles.cabecalhoPagina}><div><p className={styles.contexto}>ÁREA DO PROFESSOR</p><h1>Inspeções</h1><p className={styles.subtitulo}>Acompanhe as vistorias pré e pós-uso das reservas das suas turmas.</p></div></header>
    {mensagem && <p role="status" className={styles.mensagemSucesso}>{mensagem}<button onClick={() => setMensagem("")} aria-label="Fechar mensagem">×</button></p>}
    <section className={styles.resumo} aria-label="Resumo das inspeções">
      <article className={`${styles.metrica} ${styles.metricaPendente}`}><span>Aguardando realização</span><strong>{items.filter(i => !i.resultado).length}</strong><small>Etapas pendentes</small></article>
      <article className={styles.metrica}><span>Inspeções realizadas</span><strong>{items.filter(i => i.resultado).length}</strong><small>Pré e pós-uso concluídos</small></article>
      <article className={`${styles.metrica} ${styles.metricaRessalva}`}><span>Aprovadas com ressalvas</span><strong>{items.filter(i => i.resultado === "APROVADO_COM_RESSALVAS").length}</strong><small>Requerem acompanhamento</small></article>
    </section>
    <section className={styles.painel}>
      <div className={styles.cabecalhoPainel}><div><h2>Inspeções das reservas</h2><p>Consulte o estado de cada etapa ou registre uma nova vistoria.</p></div><span className={styles.contagem}>{visiveis.length} {visiveis.length === 1 ? "registro" : "registros"}</span></div>
      <div className={styles.filtros} role="group" aria-label="Filtrar inspeções">{filtros.map(([v, l]) => <button type="button" key={v} className={filtro === v ? styles.filtroAtivo : ""} aria-pressed={filtro === v} onClick={() => setFiltro(v)}>{l}</button>)}</div>
      {visiveis.length ? <div className={styles.tabelaViewport}><table className={styles.tabela}><thead><tr><th>Reserva</th><th>Turma</th><th>Etapa</th><th>Checklist</th><th>Resultado</th><th>Ação</th></tr></thead><tbody>{visiveis.map(i => <tr key={`${i.agendamentoId}-${i.etapa}`}><td><strong>{i.data} · {i.horario}</strong><span>{i.equipamento}</span></td><td>{i.turma}</td><td><span className={styles.etapa}>{etapas[i.etapa]}</span></td><td>{i.modelo}</td><td><span className={`${styles.resultado} ${estadoClass(i.resultado)}`}>{resultados[i.resultado] || "Pendente"}</span></td><td><button className={styles.botaoAcao} onClick={() => abrir(i)}>{i.resultado ? "Ver detalhes" : "Iniciar inspeção"}</button></td></tr>)}</tbody></table></div> : <div className={styles.estadoVazio}><h3>Nenhuma inspeção encontrada</h3><p>{items.length ? "Altere o filtro para consultar outros registros." : "As inspeções das reservas das suas turmas aparecerão aqui."}</p></div>}
      <p className={styles.notaDados}>Os registros desta área são demonstrativos e ficam salvos localmente neste navegador.</p>
    </section>
    {selecionado && <ModalProfessor titulo={`${etapas[selecionado.etapa]} · ${selecionado.equipamento}`} descricao={selecionado.turma} onClose={() => setSelecionado(null)}>{selecionado.resultado ? <div><div className={styles.detalheInspecao}><p><span>Etapa</span><strong>{etapas[selecionado.etapa]}</strong></p><p><span>Resultado</span><strong className={estadoClass(selecionado.resultado)}>{resultados[selecionado.resultado]}</strong></p></div><div className={styles.respostas}><h3>Itens avaliados</h3>{respostas.map(r => <p key={r.itemId}><span>{r.texto}</span><strong className={r.conforme ? styles.respostaOk : styles.respostaFalha}>{r.conforme ? "Conforme" : "Não conforme"}</strong></p>)}</div>{selecionado.observacoes && <p className={styles.observacoes}><span>Observações</span>{selecionado.observacoes}</p>}</div> : <FormularioInspecao checklist={selecionado.checklist || []} etapa={selecionado.etapa} onSubmit={salvar} onCancel={() => setSelecionado(null)} />}</ModalProfessor>}
  </div>;
}
