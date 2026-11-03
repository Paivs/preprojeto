import ProfessorLayout from "./components/ProfessorLayout";
import VisaoGeralProfessor from "./components/VisaoGeralProfessor";

export default function PaginaProfessor() {
  return (
    <ProfessorLayout titulo="Visão geral">
      <VisaoGeralProfessor />
    </ProfessorLayout>
  );
}
