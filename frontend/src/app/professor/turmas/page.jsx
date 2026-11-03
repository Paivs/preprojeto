import ProfessorLayout from "../components/ProfessorLayout";
import TurmasProfessor from "../components/TurmasProfessor";
import styles from "./page.module.css";

export default function PaginaTurmasProfessor() {
  return (
    <ProfessorLayout titulo="Minhas turmas">
      <div className={styles.pagina}>
        <TurmasProfessor />
      </div>
    </ProfessorLayout>
  );
}
