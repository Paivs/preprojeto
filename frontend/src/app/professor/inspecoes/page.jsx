import ProfessorLayout from "../components/ProfessorLayout";
import InspecoesProfessor from "../components/InspecoesProfessor";
import styles from "./page.module.css";

export default function PaginaInspecoesProfessor() {
  return (
    <ProfessorLayout titulo="Inspeções">
      <div className={styles.pagina}>
        <InspecoesProfessor />
      </div>
    </ProfessorLayout>
  );
}
