"use client";

import { useMemo, useState } from "react";
import { useProfessorDemo } from "./ProfessorDemoProvider";
import FormularioAgendamento from "./FormularioAgendamento";
import ModalProfessor from "./ModalProfessor";
import styles from "./AgendamentosProfessor.module.css";

const rotulosStatus = {
  CONFIRMADO: "Confirmado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function paraISO(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

function formatarData(data, opcoes = { day: "2-digit", month: "short" }) {
  return new Intl.DateTimeFormat("pt-BR", opcoes).format(new Date(`${data}T12:00:00`));
}

function rotuloInspecao(registro) {
  if (!registro) return "A iniciar";
  if (!registro.resultado) return registro.cancelada ? "Cancelada" : "Inspeção pendente";
  if (registro.resultado === "APROVADO_COM_RESSALVAS") return "Aprovada com ressalvas";
  if (registro.resultado === "REPROVADO") return "Reprovada";
  return "Pré-uso aprovado";
}

export default function AgendamentosProfessor() {
  const { dados, criarAgendamento, cancelarAgendamento, concluirAgendamento } = useProfessorDemo();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [inicioSemana, setInicioSemana] = useState(() => new Date(2026, 10, 2, 12));
  const [criando, setCriando] = useState(false);
  const [detalheId, setDetalheId] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const dataInicio = paraISO(inicioSemana);
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(fimSemana.getDate() + 6);
  const dataFim = paraISO(fimSemana);

  const reservasDaSemana = useMemo(() => dados.agendamentos
    .filter((item) => item.data >= dataInicio && item.data <= dataFim)
    .sort((a, b) => `${a.data}${a.inicio}`.localeCompare(`${b.data}${b.inicio}`)),
  [dados.agendamentos, dataInicio, dataFim]);

  const resumo = useMemo(() => ({
    total: reservasDaSemana.filter((item) => item.status !== "CANCELADO").length,
    confirmados: reservasDaSemana.filter((item) => item.status === "CONFIRMADO").length,
    emAndamento: reservasDaSemana.filter((item) => item.status === "EM_ANDAMENTO").length,
    inspecoesPendentes: dados.inspecoes.filter((item) => !item.resultado && !item.cancelada && item.data >= dataInicio && item.data <= dataFim).length,
  }), [reservasDaSemana, dados.inspecoes, dataInicio, dataFim]);

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim());
    return reservasDaSemana.filter((item) => {
      const correspondeStatus = filtroStatus === "TODOS" || item.status === filtroStatus;
      const texto = normalizar(`${item.atividade} ${item.turma} ${item.equipamento} ${item.patrimonio}`);
      return correspondeStatus && (!termo || texto.includes(termo));
    });
  }, [reservasDaSemana, busca, filtroStatus]);

  const reservaDetalhe = dados.agendamentos.find((item) => item.id === detalheId);
  const preUsoDetalhe = reservaDetalhe && dados.inspecoes.find((item) => item.agendamentoId === reservaDetalhe.id && item.etapa === "PRE_USO");
  const fimLabel = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(fimSemana);
  const semanaLabel = `${formatarData(dataInicio)} – ${fimLabel} ${inicioSemana.getFullYear()}`;

  function moverSemana(dias) {
    setInicioSemana((atual) => {
      const proxima = new Date(atual);
      proxima.setDate(proxima.getDate() + dias);
      return proxima;
    });
  }

  function salvarReserva(formulario) {
    const resultado = criarAgendamento(formulario);
    if (resultado.ok) setMensagem("Agendamento criado e inspeção pré-uso adicionada.");
    return resultado;
  }

  function executarAcaoReserva(acao) {
    const resultado = acao === "cancelar"
      ? cancelarAgendamento(reservaDetalhe.id)
      : concluirAgendamento(reservaDetalhe.id);
    if (!resultado.ok) return;
    setDetalheId(null);
    setMensagem(acao === "cancelar"
      ? "Agendamento cancelado na prévia local."
      : "Atividade concluída. Uma inspeção pós-uso foi adicionada.");
  }

  return (
    <div className={styles.container}>
      <section className={styles.cabecalhoPagina} aria-labelledby="titulo-agendamentos">
        <div>
          <p className={styles.contexto}>PRÉVIA LOCAL · DADOS SALVOS NESTE NAVEGADOR</p>
          <h1 id="titulo-agendamentos">Agendamentos</h1>
          <p className={styles.subtitulo}>Organize as reservas das suas turmas e acompanhe as inspeções necessárias.</p>
        </div>
        <button className={styles.botaoPrimario} type="button" onClick={() => { setMensagem(""); setCriando(true); }}>
          <span className="material-symbols-outlined" aria-hidden="true">add</span>
          Novo agendamento
        </button>
      </section>

      {mensagem && <p className={styles.mensagemSucesso} role="status">{mensagem}<button type="button" onClick={() => setMensagem("")} aria-label="Fechar aviso">×</button></p>}

      <section className={styles.resumo} aria-label="Resumo dos agendamentos da semana">
        <article className={styles.metrica}><span>Reservas na semana</span><strong>{resumo.total}</strong><small>exceto canceladas</small></article>
        <article className={styles.metrica}><span>Confirmados</span><strong>{resumo.confirmados}</strong><small>aguardando o horário reservado</small></article>
        <article className={styles.metrica}><span>Em andamento</span><strong>{resumo.emAndamento}</strong><small>atividades acontecendo</small></article>
        <article className={`${styles.metrica} ${styles.metricaAtencao}`}><span>Inspeções pendentes</span><strong>{resumo.inspecoesPendentes}</strong><small>na semana selecionada</small></article>
      </section>

      <section className={styles.painelAgenda} aria-labelledby="titulo-lista-agendamentos">
        <div className={styles.cabecalhoPainel}>
          <div><h2 id="titulo-lista-agendamentos">Agenda do laboratório</h2><p>Reservas vinculadas às suas turmas e projetos.</p></div>
          <div className={styles.semana}>
            <button type="button" onClick={() => moverSemana(-7)} aria-label="Semana anterior">‹</button>
            <span>{semanaLabel}</span>
            <button type="button" onClick={() => moverSemana(7)} aria-label="Próxima semana">›</button>
          </div>
        </div>

        <div className={styles.filtros}>
          <label className={styles.busca} htmlFor="busca-agendamentos">
            <span className="material-symbols-outlined" aria-hidden="true">search</span>
            <input id="busca-agendamentos" type="search" placeholder="Buscar turma, equipamento ou patrimônio" value={busca} onChange={(evento) => setBusca(evento.target.value)} />
          </label>
          <label className={styles.filtroStatus} htmlFor="filtro-status"><span>Status</span>
            <select id="filtro-status" value={filtroStatus} onChange={(evento) => setFiltroStatus(evento.target.value)}>
              <option value="TODOS">Todos</option><option value="CONFIRMADO">Confirmados</option><option value="EM_ANDAMENTO">Em andamento</option><option value="CONCLUIDO">Concluídos</option><option value="CANCELADO">Cancelados</option>
            </select>
          </label>
          <span className={styles.contagem}>{visiveis.length} {visiveis.length === 1 ? "reserva" : "reservas"}</span>
        </div>

        {visiveis.length ? (
          <div className={styles.tabelaViewport}>
            <table className={styles.tabela}>
              <thead><tr><th scope="col">Data e horário</th><th scope="col">Turma / atividade</th><th scope="col">Equipamento</th><th scope="col">Status</th><th scope="col">Inspeção pré-uso</th><th scope="col"><span className={styles.somenteLeitor}>Ação</span></th></tr></thead>
              <tbody>
                {visiveis.map((item) => {
                  const preUso = dados.inspecoes.find((registro) => registro.agendamentoId === item.id && registro.etapa === "PRE_USO");
                  return (
                    <tr key={item.id}>
                      <td><strong>{formatarData(item.data)}</strong><span className={styles.horario}>{item.inicio}–{item.fim}</span></td>
                      <td><strong>{item.turma}</strong><span className={styles.atividade}>{item.atividade}</span></td>
                      <td><strong>{item.equipamento}</strong><span className={styles.patrimonio}>{item.patrimonio}</span></td>
                      <td><span className={`${styles.status} ${styles[`status_${item.status}`]}`}>{rotulosStatus[item.status] || item.status}</span></td>
                      <td><span className={`${styles.inspecao} ${preUso?.resultado ? styles.inspecao_APROVADO : styles.inspecao_PENDENTE}`}>{rotuloInspecao(preUso)}</span></td>
                      <td><button className={styles.botaoDetalhes} type="button" onClick={() => { setMensagem(""); setDetalheId(item.id); }}>Detalhes</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.estadoVazio}><span className="material-symbols-outlined" aria-hidden="true">event_busy</span><h3>Nenhuma reserva encontrada</h3><p>Altere a semana, a busca ou o filtro de status.</p><button type="button" onClick={() => { setMensagem(""); setCriando(true); }}>Criar agendamento</button></div>
        )}
        <p className={styles.notaDados}>As alterações desta prévia ficam salvas somente neste navegador.</p>
      </section>

      {criando && (
        <ModalProfessor titulo="Novo agendamento" descricao="Informe a atividade, a turma, o equipamento e o horário." onClose={() => setCriando(false)}>
          <FormularioAgendamento dataInicial={dataInicio} turmas={dados.turmas} equipamentos={dados.equipamentos} onCreate={salvarReserva} onCancel={() => setCriando(false)} />
        </ModalProfessor>
      )}

      {reservaDetalhe && (
        <ModalProfessor titulo={reservaDetalhe.atividade} descricao="Detalhes da reserva demonstrativa." onClose={() => setDetalheId(null)}>
          <div className={styles.detalhesReserva}>
            <p><span>Data</span><strong>{formatarData(reservaDetalhe.data, { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</strong></p>
            <p><span>Horário</span><strong>{reservaDetalhe.inicio}–{reservaDetalhe.fim}</strong></p>
            <p><span>Turma / projeto</span><strong>{reservaDetalhe.turma}</strong></p>
            <p><span>Equipamento</span><strong>{reservaDetalhe.equipamento} · {reservaDetalhe.patrimonio}</strong></p>
            <p><span>Status</span><strong>{rotulosStatus[reservaDetalhe.status] || reservaDetalhe.status}</strong></p>
            <p><span>Inspeção pré-uso</span><strong>{rotuloInspecao(preUsoDetalhe)}</strong></p>
          </div>
          <div className={styles.acoesDetalhe}>
            {reservaDetalhe.status === "CONFIRMADO" && <button className={styles.botaoPerigo} type="button" onClick={() => executarAcaoReserva("cancelar")}>Cancelar reserva</button>}
            {reservaDetalhe.status === "EM_ANDAMENTO" && <button className={styles.botaoAcao} type="button" onClick={() => executarAcaoReserva("concluir")}>Concluir atividade</button>}
            <button type="button" onClick={() => setDetalheId(null)}>Fechar</button>
          </div>
        </ModalProfessor>
      )}
    </div>
  );
}
