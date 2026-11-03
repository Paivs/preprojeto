"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProfessorDemo } from "./ProfessorDemoProvider";
import styles from "./VisaoGeralProfessor.module.css";

const HOJE_DEMO = "2026-11-03";

function rotuloStatus(status) {
  if (status === "EM_ANDAMENTO") return "Em andamento";
  if (status === "CONCLUIDO") return "Concluído";
  return "Confirmado";
}

export default function VisaoGeralProfessor() {
  const { dados } = useProfessorDemo();
  const primeiroNome = dados.professora?.nome?.split(" ")[0] || "professor";
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  const reservasHoje = useMemo(() => dados.agendamentos
    .filter((item) => item.data === HOJE_DEMO && item.status !== "CANCELADO")
    .sort((a, b) => a.inicio.localeCompare(b.inicio)), [dados.agendamentos]);
  const pendencias = useMemo(() => dados.inspecoes
    .filter((item) => !item.resultado && !item.cancelada)
    .sort((a, b) => `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`)), [dados.inspecoes]);

  const metricas = [
    { rotulo: "Agendamentos hoje", valor: reservasHoje.length, detalhe: `${reservasHoje.filter((item) => item.status === "CONFIRMADO").length} confirmados · ${reservasHoje.filter((item) => item.status === "EM_ANDAMENTO").length} em andamento`, icone: "calendar_month" },
    { rotulo: "Inspeções pendentes", valor: pendencias.length, detalhe: pendencias.length ? "Ação necessária" : "Tudo em dia", icone: "fact_check", alerta: pendencias.length > 0 },
    { rotulo: "Turmas e projetos", valor: dados.turmas.length, detalhe: "Vinculados à professora", icone: "groups" },
    { rotulo: "Equipamentos disponíveis", valor: `${dados.equipamentos.filter((item) => item.status === "DISPONIVEL").length} / ${dados.equipamentos.length}`, detalhe: `${dados.equipamentos.filter((item) => item.status === "EM_USO").length} em uso · ${dados.equipamentos.filter((item) => item.status === "EM_MANUTENCAO").length} em manutenção`, icone: "precision_manufacturing" },
  ];

  const primeiraPendencia = pendencias[0];

  return (
    <div className={styles.container}>
      <section className={styles.introducao} aria-labelledby="titulo-visao-professor">
        <div>
          <p className={styles.dataHoje}>TERÇA-FEIRA, 03 DE NOVEMBRO DE 2026 · PRÉVIA LOCAL</p>
          <h1 id="titulo-visao-professor">{saudacao}, {primeiroNome}.</h1>
          <p className={styles.subtitulo}>Resumo do laboratório para hoje.</p>
        </div>
        <Link className={styles.acaoPrincipal} href="/professor/agendamentos">
          <span className="material-symbols-outlined" aria-hidden="true">add</span>
          Novo agendamento
        </Link>
      </section>

      <section className={styles.indicadores} aria-label="Resumo do laboratório">
        {metricas.map((item) => (
          <article className={`${styles.indicador} ${item.alerta ? styles.indicadorAlerta : ""}`} key={item.rotulo}>
            <div className={styles.indicadorTopo}>
              <h2>{item.rotulo}</h2>
              <span className={`material-symbols-outlined ${styles.indicadorIcone}`} aria-hidden="true">{item.icone}</span>
            </div>
            <strong className={styles.indicadorValor}>{item.valor}</strong>
            <p>{item.detalhe}</p>
          </article>
        ))}
      </section>

      <div className={styles.gradePrincipal}>
        <section className={styles.painel} aria-labelledby="titulo-agenda">
          <div className={styles.cabecalhoPainel}>
            <div><p className={styles.rotuloSecao}>ACOMPANHAMENTO</p><h2 id="titulo-agenda">Agenda de hoje</h2></div>
            <Link className={styles.linkPendente} href="/professor/agendamentos">Ver agenda completa <span aria-hidden="true">→</span></Link>
          </div>
          {reservasHoje.length ? (
            <div className={styles.listaAgenda}>
              {reservasHoje.slice(0, 4).map((item) => {
                const equipamento = dados.equipamentos.find((registro) => registro.id === item.equipamentoId);
                const turma = dados.turmas.find((registro) => registro.id === item.turmaId);
                const inspeccaoPendente = dados.inspecoes.some((registro) => registro.agendamentoId === item.id && !registro.resultado && registro.etapa === "PRE_USO");
                return (
                  <article className={`${styles.itemAgenda} ${item.status === "EM_ANDAMENTO" ? styles.itemAgendaAtual : ""}`} key={item.id}>
                    <div className={styles.horario}><strong>{item.inicio}</strong><span>{item.fim}</span></div>
                    <span className={styles.marcadorHorario} aria-hidden="true" />
                    <div className={styles.detalhesAgenda}>
                      <div className={styles.linhaTituloAgenda}><h3>{item.atividade}</h3><span className={`${styles.estado} ${item.status === "EM_ANDAMENTO" ? styles.estadoAtual : ""}`}>{rotuloStatus(item.status)}</span></div>
                      <p>{equipamento?.nome || item.equipamento}<span>·</span>{turma?.nome || item.turma}</p>
                      {inspeccaoPendente && <p className={styles.pendencia}><span aria-hidden="true">!</span>Inspeção pré-uso pendente</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.vazioResumo}><p>Nenhum agendamento para hoje.</p><Link href="/professor/agendamentos">Consultar agenda</Link></div>
          )}
          <p className={styles.notaRodape}>Horários exibidos no fuso local do laboratório.</p>
        </section>

        <section className={styles.painelAtencao} aria-labelledby="titulo-atencao">
          <div className={styles.cabecalhoPainel}>
            <div><p className={styles.rotuloSecao}>PRÓXIMO PASSO</p><h2 id="titulo-atencao">Precisa da sua atenção</h2></div>
            <span className={styles.contadorAtencao}>{String(pendencias.length).padStart(2, "0")}</span>
          </div>
          {primeiraPendencia ? (
            <article className={styles.cartaoAtencao}>
              <div className={styles.linhaAtencao}><span>!</span><strong>PENDENTE</strong></div>
              <h3>Inspeção {primeiraPendencia.etapa === "PRE_USO" ? "pré-uso" : "pós-uso"}</h3>
              <p>{primeiraPendencia.equipamento}</p>
              <small>{primeiraPendencia.data} · {primeiraPendencia.horario} · {primeiraPendencia.turma}</small>
              <Link href="/professor/inspecoes">Abrir inspeções <span aria-hidden="true">→</span></Link>
            </article>
          ) : (
            <div className={styles.semPendencias}><span className="material-symbols-outlined" aria-hidden="true">task_alt</span><p>Nenhuma inspeção pendente.</p></div>
          )}
          <p className={styles.dicaAtencao}>As vistorias registram as condições do equipamento antes e depois do uso.</p>
        </section>
      </div>

      <div className={styles.gradeSecundaria}>
        <section className={styles.painel} aria-labelledby="titulo-turmas">
          <div className={styles.cabecalhoPainel}>
            <div><p className={styles.rotuloSecao}>GRUPOS VINCULADOS</p><h2 id="titulo-turmas">Minhas turmas</h2></div>
            <Link className={styles.linkPendente} href="/professor/turmas">Todas as turmas <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.listaTurmas}>
            {dados.turmas.slice(0, 4).map((turma) => (
              <div className={styles.itemTurma} key={turma.id}>
                <span className={styles.siglaTurma}>{turma.nome.slice(0, 1)}</span>
                <div><strong>{turma.nome}</strong><span>{turma.alunos} alunos vinculados</span></div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.painel} aria-labelledby="titulo-equipamentos">
          <div className={styles.cabecalhoPainel}>
            <div><p className={styles.rotuloSecao}>VISÃO DO LABORATÓRIO</p><h2 id="titulo-equipamentos">Equipamentos</h2></div>
            <Link className={styles.linkPendente} href="/professor/equipamentos">Ver todos <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.resumoEquipamentos}>
            <strong>{dados.equipamentos.filter((item) => item.status === "DISPONIVEL").length} <span>disponíveis de {dados.equipamentos.length}</span></strong>
            <div className={styles.barraDisponibilidade} role="img" aria-label="Disponibilidade atual dos equipamentos">
              <span className={styles.disponivel} style={{ width: `${dados.equipamentos.length ? dados.equipamentos.filter((item) => item.status === "DISPONIVEL").length / dados.equipamentos.length * 100 : 0}%` }} />
              <span className={styles.emUso} style={{ width: `${dados.equipamentos.length ? dados.equipamentos.filter((item) => item.status === "EM_USO").length / dados.equipamentos.length * 100 : 0}%` }} />
              <span className={styles.manutencao} style={{ width: `${dados.equipamentos.length ? dados.equipamentos.filter((item) => item.status === "EM_MANUTENCAO").length / dados.equipamentos.length * 100 : 0}%` }} />
            </div>
            <div className={styles.legendaEquipamentos}>
              <span><i className={styles.pontoDisponivel} />Disponíveis <strong>{dados.equipamentos.filter((item) => item.status === "DISPONIVEL").length}</strong></span>
              <span><i className={styles.pontoUso} />Em uso <strong>{dados.equipamentos.filter((item) => item.status === "EM_USO").length}</strong></span>
              <span><i className={styles.pontoManutencao} />Manutenção <strong>{dados.equipamentos.filter((item) => item.status === "EM_MANUTENCAO").length}</strong></span>
            </div>
          </div>
          {dados.equipamentos.find((item) => item.status === "EM_USO") && (
            <p className={styles.avisoEquipamento}><i />{dados.equipamentos.find((item) => item.status === "EM_USO").nome} está em uso.</p>
          )}
        </section>
      </div>

      <footer className={styles.rodape}>Tenken 点検 · Alterações desta prévia ficam salvas neste navegador.</footer>
    </div>
  );
}
