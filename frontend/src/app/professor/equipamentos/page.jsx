import ProfessorLayout from "../components/ProfessorLayout";
import EquipamentosProfessor from "../components/EquipamentosProfessor";
import styles from "./page.module.css";

export default function PaginaEquipamentosProfessor() {
  return (
    <ProfessorLayout titulo="Equipamentos">
      <div className={styles.pagina}>
        <EquipamentosProfessor />
      </div>
    </ProfessorLayout>
  );
}
