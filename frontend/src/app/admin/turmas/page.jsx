"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import styles from "../usuarios/page.module.css";
import modalStyles from "../equipamentos/page.module.css";
import { chamarApi } from "../lib/adminApi";
import { useModalExit } from "../../useModalExit";

export default function PaginaTurmas() {
  return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>;
}

function Conteudo({ token }) {
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [nome, setNome] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [modalAberto, setModalAberto, fechandoModal, finalizarFechamentoModal] = useModalExit(false);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const [listaTurmas, listaProfessores] = await Promise.all([
        chamarApi("/turmas", token),
        chamarApi("/usuarios?pagina=1&limite=100&perfil=PROFESSOR&ativo=true", token),
      ]);
      setTurmas(listaTurmas.dados ?? listaTurmas ?? []);
      setProfessores(listaProfessores.dados ?? listaProfessores ?? []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { carregar(); }, [carregar]);

  const totalAlunos = useMemo(
    () => turmas.reduce((soma, turma) => soma + Number(turma.alunos ?? 0), 0),
    [turmas],
  );

  async function criarTurma(evento) {
    evento.preventDefault();
    setErro("");
    setAviso("");
    setSalvando(true);
    try {
      await chamarApi("/turmas", token, {
        method: "POST",
        body: JSON.stringify({ nome, professor_id: Number(professorId) }),
      });
      setAviso(`Turma ${nome.trim()} criada.`);
      setNome("");
      setProfessorId("");
      setModalAberto(false);
      await carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.topBanner}>
        <div className={styles.bannerLeft}>
          <h1 className={styles.title}>Turmas</h1>
          <p className={styles.subtitle}>Cadastre turmas e defina o professor responsável.</p>
        </div>
        <div className={styles.quickStatsRow}>
          <div className={styles.quickStatCard}><span className={styles.statLabel}>Turmas cadastradas</span><strong className={styles.statNumber}>{turmas.length}</strong></div>
          <div className={styles.quickStatCard}><span className={styles.statLabel}>Vínculos de alunos</span><strong className={styles.statNumber}>{totalAlunos}</strong></div>
        </div>
      </header>

      {erro && <div className={styles.alertError} role="alert">{erro}</div>}
      {aviso && <div className={styles.alertSuccess} role="status">{aviso}</div>}

      <div className={styles.controlBar}>
        <span className={styles.pillsPrefix}>Turmas e professores responsáveis</span>
        <button type="button" className={styles.newUserBtn} onClick={() => setModalAberto(true)}>
          <span className="material-symbols-outlined" aria-hidden="true">add</span>
          Criar turma
        </button>
      </div>

      <section className={styles.tableCard} aria-label="Turmas cadastradas">
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead><tr><th>Turma</th><th>Professor responsável</th><th>Alunos vinculados</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={3} className={styles.tableEmpty}>Carregando turmas...</td></tr>
                : turmas.length === 0 ? <tr><td colSpan={3} className={styles.tableEmpty}>Nenhuma turma cadastrada.</td></tr>
                  : turmas.map((turma) => (
                    <tr key={turma.id} className={styles.tableRow}>
                      <td><div className={styles.userMeta}><strong className={styles.userName}>{turma.nome}</strong><span className={styles.userDepartment}>Turma #{turma.id}</span></div></td>
                      <td className={styles.emailCell}>{turma.professor_nome}</td>
                      <td><span className={styles.matriculaBadge}>{turma.alunos} alunos</span></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </section>

      {modalAberto && (
        <div className={`${styles.modalOverlay} abrir-modal-fundo ${fechandoModal ? "fechar-modal-fundo" : ""}`} role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalAberto(false); }}>
          <section className={`${styles.modalCard} abrir-modal ${fechandoModal ? "fechar-modal" : ""}`} onAnimationEnd={finalizarFechamentoModal} role="dialog" aria-modal="true" aria-labelledby="titulo-criar-turma">
            <header className={styles.modalHeader}>
              <div className={styles.modalHeaderTitleRow}>
                <div className={modalStyles.modalHeaderIcon}>
                  <span className="material-symbols-outlined" aria-hidden="true">groups</span>
                </div>
                <div><h2 id="titulo-criar-turma" className={styles.modalTitle}>Criar turma</h2><p className={styles.modalDescription}>Informe o nome e o professor responsável.</p></div>
              </div>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setModalAberto(false)} aria-label="Fechar">
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </header>
            <form className={styles.modalForm} onSubmit={criarTurma}>
              {erro && <div className={styles.alertError} role="alert">{erro}</div>}
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="nome-turma">Nome da turma</label>
                <input id="nome-turma" className={styles.modalInput} value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} required autoFocus />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="professor-turma">Professor responsável</label>
                <select id="professor-turma" className={styles.modalSelect} value={professorId} onChange={(e) => setProfessorId(e.target.value)} required>
                  <option value="">Selecione um professor</option>
                  {professores.map((professor) => <option key={professor.id} value={professor.id}>{professor.nome}</option>)}
                </select>
                {professores.length === 0 && <span className={styles.modalDescription}>Cadastre e ative um professor antes de criar a turma.</span>}
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className={styles.saveBtn} disabled={salvando || professores.length === 0}>{salvando ? "Salvando..." : "Criar turma"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
