"use client";

import { useMemo, useState } from "react";
import { obterChecklist } from "../lib/checklistDemo";
import styles from "./FormularioInspecao.module.css";

export default function FormularioInspecao({ inspecao, equipamento, onSubmit, onCancel }) {
  const checklist = useMemo(() => obterChecklist(inspecao, equipamento), [inspecao, equipamento]);
  const [respostas, setRespostas] = useState(inspecao.respostas || {});
  const [observacoes, setObservacoes] = useState(inspecao.observacoes || "");
  const [erro, setErro] = useState("");

  function enviar(evento) {
    evento.preventDefault();
    if (checklist.some((item) => typeof respostas[item.id] !== "boolean")) {
      setErro("Responda todos os itens do checklist antes de salvar.");
      return;
    }
    setErro("");
    onSubmit({ respostas, observacoes: observacoes.trim() });
  }

  return <form className={styles.formulario} onSubmit={enviar}>
    <p className={styles.aviso}>Prévia demonstrativa: este registro será salvo somente neste navegador.</p>
    <fieldset className={styles.listaItens}><legend>Checklist de {inspecao.etapa === "PRE_USO" ? "pré-uso" : "pós-uso"}</legend>
      {checklist.map((item, indice) => <div className={styles.item} key={item.id}>
        <div className={styles.enunciado}><span>{String(indice + 1).padStart(2, "0")}</span><p>{item.texto}{item.critico && <small>Item crítico</small>}</p></div>
        <div className={styles.opcoes} role="group" aria-label={item.texto}>
          <label className={respostas[item.id] === true ? styles.selecionado : ""}><input type="radio" name={item.id} checked={respostas[item.id] === true} onChange={() => setRespostas((atual) => ({ ...atual, [item.id]: true }))} />Conforme</label>
          <label className={respostas[item.id] === false ? styles.selecionadoFalha : ""}><input type="radio" name={item.id} checked={respostas[item.id] === false} onChange={() => setRespostas((atual) => ({ ...atual, [item.id]: false }))} />Com falha</label>
        </div>
      </div>)}
    </fieldset>
    <label className={styles.campoObservacao}>Observações <textarea rows={3} maxLength={500} value={observacoes} onChange={(evento) => setObservacoes(evento.target.value)} placeholder="Descreva ocorrências ou pontos de atenção (opcional)" /></label>
    {erro && <p className={styles.erro} role="alert">{erro}</p>}
    <div className={styles.acoes}><button type="button" onClick={onCancel}>Voltar</button><button className={styles.salvar} type="submit">Salvar inspeção</button></div>
  </form>;
}
