import BarraLateralProfessor from "./BarraLateralProfessor";
import BarraSuperiorProfessor from "./BarraSuperiorProfessor";
import ProfessorDemoProvider from "./ProfessorDemoProvider";
import styles from "./ProfessorLayout.module.css";

export default function ProfessorLayout({ children, titulo }) {
  return (
    <ProfessorDemoProvider>
      <div className={styles.wrapper}>
        <BarraLateralProfessor />
        <div className={styles.contentSpine}>
          <BarraSuperiorProfessor titulo={titulo} />
          <main className={styles.mainView}>{children}</main>
        </div>
      </div>
    </ProfessorDemoProvider>
  );
}
