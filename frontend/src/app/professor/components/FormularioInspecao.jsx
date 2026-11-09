"use client";
import { useState } from "react";
import styles from "./FormularioInspecao.module.css";

export default function FormularioInspecao({ etapa, checklist = [], onSubmit, onCancel }) {
  const [answers, setAnswers] = useState({});
  const [observacoes, setObs] = useState("");
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(false);
  const respondidos = checklist.filter(i => typeof answers[i.id] === "boolean").length;
  const progresso = checklist.length ? Math.round(respondidos / checklist.length * 100) : 0;
  async function enviar(e) {
    e.preventDefault();
    if (checklist.some(i => typeof answers[i.id] !== "boolean")) { setErro("Responda todos os itens."); return; }
    setBusy(true);
    const r = await onSubmit({ respostas: checklist.map(i => ({ itemId: i.id, conforme: answers[i.id] })), observacoes });
    setBusy(false);
    if (!r.ok) setErro(r.message);
  }
  return <form className={styles.formulario} onSubmit={enviar}>
    <div className={styles.progresso} aria-live="polite"><div><span>Inspeção {etapa === "PRE_USO" ? "pré-uso" : "pós-uso"}</span><strong>{respondidos} de {checklist.length} itens respondidos</strong></div><div className={styles.trilho} role="progressbar" aria-valuenow={respondidos} aria-valuemin={0} aria-valuemax={checklist.length}><span style={{ width: `${progresso}%` }} /></div></div>
    <fieldset className={styles.listaItens}><legend>Itens de verificação</legend>{checklist.map((i, n) => {
      const value = answers[i.id];
      const falha = value === false;
      return <article key={i.id} className={`${styles.item} ${value === true ? styles.itemOk : ""} ${falha ? styles.itemFalha : ""} ${falha && i.critico ? styles.itemCritico : ""}`}>
        <div className={styles.enunciado}><span className={styles.numero}>{String(n + 1).padStart(2, "0")}</span><div><p>{i.texto}</p>{i.critico && <small>Item crítico</small>}</div></div>
        <div className={styles.opcoes} role="group" aria-label={`Resposta para ${i.texto}`}><label className={value === true ? styles.selecionado : ""}><input type="radio" name={`item-${i.id}`} checked={value === true} onChange={() => setAnswers(a => ({ ...a, [i.id]: true }))} />Conforme</label><label className={value === false ? styles.selecionadoFalha : ""}><input type="radio" name={`item-${i.id}`} checked={value === false} onChange={() => setAnswers(a => ({ ...a, [i.id]: false }))} />Não conforme</label></div>
      </article>;
    })}</fieldset>
    <label className={styles.campoObservacao}>Observações<textarea rows={3} value={observacoes} onChange={e => setObs(e.target.value)} placeholder="Registre informações relevantes para esta inspeção." /></label>
    {erro && <p className={styles.erro} role="alert">{erro}</p>}
    <div className={styles.acoes}><button type="button" onClick={onCancel}>Voltar</button><button className={styles.salvar} type="submit" disabled={busy}>{busy ? "Salvando..." : "Salvar inspeção"}</button></div>
  </form>;
}
