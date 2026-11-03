import ProfessorLayout from "../components/ProfessorLayout";
import AgendamentosProfessor from "../components/AgendamentosProfessor";
import styles from "./page.module.css";

export default function PaginaAgendamentosProfessor() {
  return (
    <ProfessorLayout titulo="Agendamentos">
      <div className={styles.pagina}>
        <AgendamentosProfessor />
      </div>
    </ProfessorLayout>
  );
}
