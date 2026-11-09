"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { buscarRespostasInspecao, listarInspecoes, registrarInspecao } from "../lib/professorApi";
import FormularioInspecao from "./FormularioInspecao";
import styles from "./InspecaoPagina.module.css";

const etapaLabel = { PRE_USO: "Pré-uso", POS_USO: "Pós-uso" };
const resultadoLabel = { APROVADO: "Aprovada", APROVADO_COM_RESSALVAS: "Aprovada com ressalvas", REPROVADO: "Reprovada" };

function Contexto({ item, children, subtitulo }) {
  return <div className={styles.pagina}>
    <a className={styles.voltar} href="/professor/inspecoes">← Voltar às inspeções</a>
    <header className={styles.cabecalho}>
      <div><p className={styles.eyebrow}>ÁREA DO PROFESSOR / INSPEÇÕES</p><h1>{etapaLabel[item.etapa]} · {item.equipamento}</h1><p className={styles.subtitulo}>{subtitulo}</p></div>
      <span className={styles.estado}>{item.resultado ? resultadoLabel[item.resultado] : "Pendente"}</span>
    </header>
    <section className={styles.contexto} aria-label="Dados da reserva">
      <div><span>Turma</span><strong>{item.turma}</strong></div>
      <div><span>Data e horário</span><strong>{item.data} · {item.horario}</strong></div>
      <div><span>Equipamento</span><strong>{item.equipamento}</strong></div>
      <div><span>Checklist</span><strong>{item.modelo || "Inspeção de equipamento"}</strong></div>
    </section>
    {children}
  </div>;
}

export function InspecaoPendentePagina() {
  const { agendamentoId, etapa } = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarInspecoes().then((items) => {
      const encontrado = items.find((i) => String(i.agendamentoId) === String(agendamentoId) && i.etapa === etapa);
      if (ativo) setItem(encontrado || null);
    }).catch((e) => { if (ativo) setErro(e.message || "Não foi possível carregar esta inspeção."); });
    return () => { ativo = false; };
  }, [agendamentoId, etapa]);

  async function salvar(formulario) {
    setSalvando(true);
    try {
      const resultado = await registrarInspecao({ agendamentoId: item.agendamentoId, etapa: item.etapa, respostas: formulario.respostas, observacoes: formulario.observacoes });
      router.replace(`/professor/inspecoes/registro/${resultado.id}`);
      return { ok: true };
    } catch (e) {
      setSalvando(false);
      return { ok: false, message: e.message || "Não foi possível registrar a inspeção." };
    }
  }

  if (erro) return <div className={styles.pagina}><a className={styles.voltar} href="/professor/inspecoes">← Voltar às inspeções</a><p className={styles.erro} role="alert">{erro}</p></div>;
  if (!item) return <div className={styles.pagina}><p className={styles.carregando}>Carregando inspeção…</p></div>;
  if (item.resultado) return <div className={styles.pagina}><a className={styles.voltar} href={`/professor/inspecoes/registro/${item.id}`}>Esta inspeção já foi concluída. Abrir registro →</a></div>;

  return <Contexto item={item} subtitulo="Confira o equipamento e registre cada item da vistoria.">
    <div className={styles.aviso}><span aria-hidden="true">ⓘ</span><p>Responda a todos os itens. A criticidade dos itens do checklist determina o resultado final da inspeção.</p></div>
    <FormularioInspecao checklist={item.checklist || []} etapa={item.etapa} onSubmit={salvar} onCancel={() => router.push("/professor/inspecoes")} salvando={salvando} />
  </Contexto>;
}

export function RegistroInspecaoPagina() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    Promise.all([listarInspecoes(), buscarRespostasInspecao(id)]).then(([items, respostas]) => {
      const item = items.find((i) => String(i.id) === String(id) && i.resultado);
      if (ativo) setData(item ? { item, respostas } : { item: null, respostas: [] });
    }).catch((e) => { if (ativo) setErro(e.message || "Não foi possível carregar o registro."); });
    return () => { ativo = false; };
  }, [id]);

  if (erro) return <div className={styles.pagina}><a className={styles.voltar} href="/professor/inspecoes">← Voltar às inspeções</a><p className={styles.erro} role="alert">{erro}</p></div>;
  if (!data) return <div className={styles.pagina}><p className={styles.carregando}>Carregando registro…</p></div>;
  if (!data.item) return <div className={styles.pagina}><a className={styles.voltar} href="/professor/inspecoes">← Registro não encontrado. Voltar às inspeções</a></div>;

  const { item, respostas } = data;
  const aprovadas = respostas.filter((r) => r.conforme).length;
  return <Contexto item={item} subtitulo="Registro concluído · modo de consulta">
    <section className={`${styles.resultado} ${item.resultado === "REPROVADO" ? styles.reprovado : item.resultado === "APROVADO_COM_RESSALVAS" ? styles.ressalva : ""}`}>
      <div><p>RESULTADO DA INSPEÇÃO</p><h2>{resultadoLabel[item.resultado] || item.resultado}</h2></div>
      <span>{aprovadas} de {respostas.length} itens conformes</span>
    </section>
    {item.observacoes && <section className={styles.observacoes}><h2>Observações</h2><p>{item.observacoes}</p></section>}
    <section className={styles.listaResposta}>
      <div className={styles.tituloSecao}><h2>Itens avaliados</h2><span>{respostas.length} itens</span></div>
      {respostas.map((r, index) => <article className={`${styles.resposta} ${!r.conforme ? styles.respostaFalha : ""}`} key={r.itemId}>
        <div className={styles.respostaTexto}><span className={styles.numero}>{String(index + 1).padStart(2, "0")}</span><div><p className={styles.categoria}>{r.critico ? "ITEM CRÍTICO" : "VERIFICAÇÃO"}</p><h3>{r.texto}</h3>{r.observacao && <p className={styles.observacaoItem}>{r.observacao}</p>}</div></div>
        <strong className={r.conforme ? styles.conforme : styles.naoConforme}>{r.conforme ? "✓ Conforme" : "! Não conforme"}</strong>
      </article>)}
      {!respostas.length && <p className={styles.carregando}>Nenhuma resposta encontrada para este registro.</p>}
    </section>
  </Contexto>;
}
