"use client";

import { useMemo, useState } from "react";
import { useProfessorDemo } from "./ProfessorDemoProvider";
import FormularioInspecao from "./FormularioInspecao";
import ModalProfessor from "./ModalProfessor";
import { obterChecklist } from "../lib/checklistDemo";
import styles from "./InspecoesProfessor.module.css";

const etapas = { PRE_USO: "Pré-uso", POS_USO: "Pós-uso" };
const resultados = { APROVADO: "Aprovada", APROVADO_COM_RESSALVAS: "Aprovada com ressalvas", REPROVADO: "Reprovada" };

function formatarData(data) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(`${data}T12:00:00`));
}

export default function InspecoesProfessor() {
  const { dados, registrarInspecao } = useProfessorDemo();
  const [filtro, setFiltro] = useState("TODAS");
  const [inspecaoId, setInspecaoId] = useState(null);
  const [modo, setModo] = useState(null);
  const [mensagem, setMensagem] = useState("");

  const registrosAtivos = useMemo(() => dados.inspecoes.filter((item) => !item.cancelada), [dados.inspecoes]);
  const resumo = useMemo(() => ({
    pendentes: registrosAtivos.filter((item) => !item.resultado).length,
    realizadas: registrosAtivos.filter((item) => Boolean(item.resultado)).length,
    ressalvas: registrosAtivos.filter((item) => item.resultado === "APROVADO_COM_RESSALVAS").length,
  }), [registrosAtivos]);
  const visiveis = useMemo(() => registrosAtivos.filter((item) => {
    if (filtro === "PENDENTES") return !item.resultado;
    if (filtro === "REALIZADAS") return Boolean(item.resultado);
    return true;
  }).sort((a, b) => `${b.data}${b.horario}`.localeCompare(`${a.data}${a.horario}`)), [registrosAtivos, filtro]);
  const inspecaoSelecionada = dados.inspecoes.find((item) => item.id === inspecaoId);
  const equipamento = inspecaoSelecionada && dados.equipamentos.find((item) => item.id === inspecaoSelecionada.equipamentoId);

  function salvar(formulario) {
    const resultado = registrarInspecao(inspecaoId, formulario);
    if (!resultado.ok) return resultado;
    setInspecaoId(null);
    setModo(null);
    setMensagem(`Inspeção salva: ${resultados[resultado.resultado]}.`);
    return resultado;
  }

  return (
    <div className={styles.container}>
      <section className={styles.cabecalhoPagina} aria-labelledby="titulo-inspecoes"><div>
        <p className={styles.contexto}>SEGURANÇA DE USO</p><h1 id="titulo-inspecoes">Inspeções</h1>
        <p className={styles.subtitulo}>Acompanhe as vistorias pré e pós-uso relacionadas às reservas das suas turmas.</p>
      </div></section>

      {mensagem && <p className={styles.mensagemSucesso} role="status">{mensagem}<button type="button" onClick={() => setMensagem("")} aria-label="Fechar aviso">×</button></p>}

      <section className={styles.resumo} aria-label="Resumo das inspeções">
        <article className={`${styles.metrica} ${styles.metricaPendente}`}><span>Aguardando inspeção</span><strong>{resumo.pendentes}</strong><small>etapas sem registro</small></article>
        <article className={styles.metrica}><span>Inspeções realizadas</span><strong>{resumo.realizadas}</strong><small>registros no sistema</small></article>
        <article className={`${styles.metrica} ${styles.metricaRessalva}`}><span>Aprovadas com ressalvas</span><strong>{resumo.ressalvas}</strong><small>verifique as observações</small></article>
      </section>

      <section className={styles.painel} aria-labelledby="titulo-lista-inspecoes">
        <div className={styles.cabecalhoPainel}><div><h2 id="titulo-lista-inspecoes">Inspeções das reservas</h2><p>Cada reserva pode ter uma inspeção pré-uso e outra pós-uso.</p></div><span className={styles.contagem}>{visiveis.length} registros</span></div>
        <div className={styles.filtros} role="group" aria-label="Filtrar inspeções">{[["TODAS", "Todas"], ["PENDENTES", "Pendentes"], ["REALIZADAS", "Realizadas"]].map(([valor, texto]) => <button key={valor} type="button" className={filtro === valor ? styles.filtroAtivo : ""} onClick={() => setFiltro(valor)} aria-pressed={filtro === valor}>{texto}</button>)}</div>

        {visiveis.length > 0 ? <div className={styles.tabelaViewport}><table className={styles.tabela}>
          <thead><tr><th scope="col">Reserva</th><th scope="col">Turma / projeto</th><th scope="col">Etapa</th><th scope="col">Checklist</th><th scope="col">Resultado</th><th scope="col"><span className={styles.somenteLeitor}>Ação</span></th></tr></thead>
          <tbody>{visiveis.map((item) => <tr key={item.id}>
            <td><strong>{formatarData(item.data)} · {item.horario}</strong><span>{item.equipamento}</span></td><td>{item.turma}</td><td><span className={styles.etapa}>{etapas[item.etapa]}</span></td><td>{item.modelo}</td>
            <td><span className={`${styles.resultado} ${item.resultado ? styles.resultadoRealizado : styles.resultadoPendente} ${item.resultado === "REPROVADO" ? styles.resultadoReprovado : ""}`}>{item.resultado ? resultados[item.resultado] : "Aguardando inspeção"}</span></td>
            <td><button className={styles.botaoAcao} type="button" onClick={() => { setMensagem(""); setInspecaoId(item.id); setModo(item.resultado ? "detalhes" : "formulario"); }} aria-label={`${item.resultado ? "Ver" : "Iniciar"} inspeção de ${item.equipamento}`}>{item.resultado ? "Detalhes" : "Iniciar"}</button></td>
          </tr>)}</tbody>
        </table></div> : <div className={styles.estadoVazio}><span className="material-symbols-outlined" aria-hidden="true">fact_check</span><h3>Nenhuma inspeção nesta lista</h3><p>Quando houver registros ou etapas pendentes, eles aparecerão aqui.</p></div>}
        <p className={styles.notaDados}>As inspeções registradas no sistema aparecerão nesta lista.</p>
      </section>

      {modo === "formulario" && inspecaoSelecionada && <ModalProfessor titulo={`${etapas[inspecaoSelecionada.etapa]} · ${inspecaoSelecionada.equipamento}`} descricao={`${inspecaoSelecionada.turma} · ${formatarData(inspecaoSelecionada.data)} às ${inspecaoSelecionada.horario}`} onClose={() => { setInspecaoId(null); setModo(null); }}><FormularioInspecao inspecao={inspecaoSelecionada} equipamento={equipamento} onSubmit={salvar} onCancel={() => { setInspecaoId(null); setModo(null); }} /></ModalProfessor>}
      {modo === "detalhes" && inspecaoSelecionada && <ModalProfessor titulo={`${etapas[inspecaoSelecionada.etapa]} · ${inspecaoSelecionada.equipamento}`} descricao={`${inspecaoSelecionada.turma} · ${formatarData(inspecaoSelecionada.data)} às ${inspecaoSelecionada.horario}`} onClose={() => { setInspecaoId(null); setModo(null); }}>
        <div className={styles.detalheInspecao}><p><span>Resultado</span><strong>{resultados[inspecaoSelecionada.resultado]}</strong></p><p><span>Equipamento</span><strong>{equipamento?.patrimonio} · {equipamento?.status === "EM_MANUTENCAO" ? "Em manutenção" : equipamento?.status === "DISPONIVEL" ? "Disponível" : equipamento?.status === "EM_USO" ? "Em uso" : "Reservado"}</strong></p></div>
        {inspecaoSelecionada.respostas ? <div className={styles.respostas}><h3>Itens avaliados</h3>{obterChecklist(inspecaoSelecionada, equipamento).map((item) => <p key={item.id}><span>{item.texto}</span><strong className={inspecaoSelecionada.respostas[item.id] === false ? styles.respostaFalha : styles.respostaOk}>{inspecaoSelecionada.respostas[item.id] === false ? "Com falha" : "Conforme"}</strong></p>)}</div> : <p className={styles.observacoes}>Nenhuma resposta de checklist registrada.</p>}
        {inspecaoSelecionada.observacoes && <p className={styles.observacoes}><span>Observações</span>{inspecaoSelecionada.observacoes}</p>}
        <div className={styles.rodapeDetalhes}><button type="button" onClick={() => { setInspecaoId(null); setModo(null); }}>Fechar</button></div>
      </ModalProfessor>}
    </div>
  );
}
