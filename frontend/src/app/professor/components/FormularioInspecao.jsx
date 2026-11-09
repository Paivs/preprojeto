"use client";
import { useState } from "react";
import styles from "./FormularioInspecao.module.css";
export default function FormularioInspecao({etapa,checklist=[],onSubmit,onCancel}){
 const [answers,setAnswers]=useState({}),[observacoes,setObs]=useState(""),[erro,setErro]=useState(""),[busy,setBusy]=useState(false);
 async function enviar(e){e.preventDefault();if(checklist.some(i=>typeof answers[i.id]!=="boolean")){setErro("Responda todos os itens.");return;}setBusy(true);const r=await onSubmit({respostas:checklist.map(i=>({itemId:i.id,conforme:answers[i.id]})),observacoes});setBusy(false);if(!r.ok)setErro(r.message);}
 return <form className={styles.formulario} onSubmit={enviar}><fieldset className={styles.listaItens}><legend>Checklist {etapa==="PRE_USO"?"pré-uso":"pós-uso"}</legend>{checklist.map((i,n)=><div className={styles.item} key={i.id}><p>{n+1}. {i.texto}{i.critico?" (crítico)":""}</p><label><input type="radio" name={`item-${i.id}`} onChange={()=>setAnswers(a=>({...a,[i.id]:true}))}/> Conforme</label><label><input type="radio" name={`item-${i.id}`} onChange={()=>setAnswers(a=>({...a,[i.id]:false}))}/> Com falha</label></div>)}</fieldset><label className={styles.campoObservacao}>Observações<textarea value={observacoes} onChange={e=>setObs(e.target.value)}/></label>{erro&&<p className={styles.erro}>{erro}</p>}<div className={styles.acoes}><button type="button" onClick={onCancel}>Voltar</button><button type="submit" disabled={busy}>{busy?"Salvando...":"Salvar inspeção"}</button></div></form>;
}
