import styles from "./VisaoGeralProfessor.module.css";

// Conteúdo demonstrativo da prévia; será substituído por dados da API.
const indicadores = [
  { rotulo: "Agendamentos hoje", valor: "03", detalhe: "2 confirmados · 1 em andamento", icone: "calendar_month" },
  { rotulo: "Inspeções pendentes", valor: "01", detalhe: "Ação necessária antes das 14h", icone: "fact_check", alerta: true },
  { rotulo: "Turmas ativas", valor: "04", detalhe: "Com atividades neste semestre", icone: "groups" },
  { rotulo: "Equipamentos disponíveis", valor: "12 / 15", detalhe: "3 em uso ou manutenção", icone: "precision_manufacturing" },
];

const agenda = [
  { inicio: "09:00", fim: "10:30", titulo: "Introdução à Robótica", equipamento: "Bancada B-04", turma: "2º semestre · Turma A", estado: "Em andamento", presenca: "18 alunos presentes · 22 inscritos", atual: true },
  { inicio: "14:00", fim: "16:00", titulo: "Projeto integrador · célula robotizada", equipamento: "Robô FANUC R-02", turma: "Projeto Integrador", estado: "Confirmado", pendencia: "Inspeção pré-uso pendente" },
  { inicio: "16:30", fim: "18:00", titulo: "Prática de automação industrial", equipamento: "Bancada B-02", turma: "3º semestre · Turma B", estado: "Confirmado" },
];

const turmas = [
  { sigla: "RA", nome: "Robótica Aplicada", descricao: "2º semestre · Turma A", alunos: 22 },
  { sigla: "PI", nome: "Projeto Integrador", descricao: "Projetos · 2026", alunos: 16 },
  { sigla: "AI", nome: "Automação Industrial", descricao: "3º semestre · Turma B", alunos: 20 },
];

export default function VisaoGeralProfessor() {
  return (
    <div className={styles.container}>
      <section className={styles.introducao} aria-labelledby="titulo-visao-professor">
        <div>
          <p className={styles.dataHoje}>TERÇA-FEIRA, 03 DE NOVEMBRO DE 2026</p>
          <h1 id="titulo-visao-professor">Bom dia, Marina.</h1>
          <p className={styles.subtitulo}>Resumo demonstrativo do laboratório para hoje.</p>
        </div>
        <button className={styles.acaoPrincipal} type="button" disabled>
          <span className="material-symbols-outlined" aria-hidden="true">add</span>
          Novo agendamento
        </button>
      </section>

      <section className={styles.indicadores} aria-label="Resumo do laboratório">
        {indicadores.map((item) => (
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
            <div>
              <p className={styles.rotuloSecao}>ACOMPANHAMENTO</p>
              <h2 id="titulo-agenda">Agenda de hoje</h2>
            </div>
            <span className={styles.linkPendente} aria-disabled="true">Ver agenda completa <span aria-hidden="true">→</span></span>
          </div>

          <div className={styles.listaAgenda}>
            {agenda.map((item) => (
              <article className={`${styles.itemAgenda} ${item.atual ? styles.itemAgendaAtual : ""}`} key={`${item.inicio}-${item.titulo}`}>
                <div className={styles.horario}><strong>{item.inicio}</strong><span>{item.fim}</span></div>
                <span className={styles.marcadorHorario} aria-hidden="true" />
                <div className={styles.detalhesAgenda}>
                  <div className={styles.linhaTituloAgenda}>
                    <h3>{item.titulo}</h3>
                    <span className={`${styles.estado} ${item.atual ? styles.estadoAtual : ""}`}>{item.estado}</span>
                  </div>
                  <p>{item.equipamento}<span>·</span>{item.turma}</p>
                  {item.presenca && <p className={styles.presenca}>{item.presenca}</p>}
                  {item.pendencia && <p className={styles.pendencia}><span aria-hidden="true">!</span>{item.pendencia}</p>}
                </div>
              </article>
            ))}
          </div>
          <p className={styles.notaRodape}>Horários exibidos no fuso local do laboratório.</p>
        </section>

        <section className={styles.painelAtencao} aria-labelledby="titulo-atencao">
          <div className={styles.cabecalhoPainel}>
            <div>
              <p className={styles.rotuloSecao}>PRÓXIMO PASSO</p>
              <h2 id="titulo-atencao">Precisa da sua atenção</h2>
            </div>
            <span className={styles.contadorAtencao}>01</span>
          </div>
          <article className={styles.cartaoAtencao}>
            <div className={styles.linhaAtencao}><span>!</span><strong>PENDENTE</strong></div>
            <h3>Inspeção pré-uso</h3>
            <p>Robô FANUC R-02</p>
            <small>Hoje, às 14:00 · Projeto Integrador</small>
            <button type="button" disabled>Iniciar inspeção <span aria-hidden="true">→</span></button>
          </article>
          <p className={styles.dicaAtencao}>A inspeção registra as condições do equipamento antes de liberá-lo para a turma.</p>
        </section>
      </div>

      <div className={styles.gradeSecundaria}>
        <section className={styles.painel} aria-labelledby="titulo-turmas">
          <div className={styles.cabecalhoPainel}>
            <div><p className={styles.rotuloSecao}>ACOMPANHE SEUS GRUPOS</p><h2 id="titulo-turmas">Minhas turmas</h2></div>
            <span className={styles.linkPendente} aria-disabled="true">Todas as turmas <span aria-hidden="true">→</span></span>
          </div>
          <div className={styles.listaTurmas}>
            {turmas.map((turma) => (
              <div className={styles.itemTurma} key={turma.sigla}>
                <span className={styles.siglaTurma}>{turma.sigla}</span>
                <div><strong>{turma.nome}</strong><span>{turma.descricao}</span></div>
                <span className={styles.totalAlunos}>{turma.alunos}<small>alunos</small></span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.painel} aria-labelledby="titulo-equipamentos">
          <div className={styles.cabecalhoPainel}>
            <div><p className={styles.rotuloSecao}>VISÃO DO LABORATÓRIO</p><h2 id="titulo-equipamentos">Equipamentos</h2></div>
            <span className={styles.linkPendente} aria-disabled="true">Ver todos <span aria-hidden="true">→</span></span>
          </div>
          <div className={styles.resumoEquipamentos}>
            <strong>12 <span>disponíveis de 15</span></strong>
            <div className={styles.barraDisponibilidade} role="img" aria-label="12 disponíveis, 2 em uso e 1 em manutenção">
              <span className={styles.disponivel} /><span className={styles.emUso} /><span className={styles.manutencao} />
            </div>
            <div className={styles.legendaEquipamentos}>
              <span><i className={styles.pontoDisponivel} />Disponíveis <strong>12</strong></span>
              <span><i className={styles.pontoUso} />Em uso <strong>2</strong></span>
              <span><i className={styles.pontoManutencao} />Manutenção <strong>1</strong></span>
            </div>
          </div>
          <p className={styles.avisoEquipamento}><i />Bancada B-04 está em uso até 10:30.</p>
        </section>
      </div>

      <footer className={styles.rodape}>Tenken 点検 · Prévia estrutural com dados demonstrativos.</footer>
    </div>
  );
}
