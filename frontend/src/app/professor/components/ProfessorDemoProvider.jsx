"use client";

import { createContext, useContext, useState } from "react";
import { agendamentosDemo } from "../lib/agendamentosDemo";
import { equipamentosDemo } from "../lib/equipamentosDemo";
import { inspecoesDemo } from "../lib/inspecoesDemo";
import { turmasDemo } from "../lib/turmasDemo";

const ProfessorDemoContext = createContext(null);

function copiarDados(valor) {
  return JSON.parse(JSON.stringify(valor));
}

function criarDadosIniciais() {
  return copiarDados({
    professora: { id: "demo-professora", nome: "Marina Costa" },
    agendamentos: agendamentosDemo,
    equipamentos: equipamentosDemo,
    inspecoes: inspecoesDemo,
    turmas: turmasDemo,
  });
}

export function useProfessorDemo() {
  const contexto = useContext(ProfessorDemoContext);
  if (!contexto) throw new Error("useProfessorDemo deve ser usado dentro de ProfessorDemoProvider.");
  return contexto;
}

export default function ProfessorDemoProvider({ children }) {
  const [dados, setDados] = useState(criarDadosIniciais);

  return (
    <ProfessorDemoContext.Provider value={{ dados, setDados }}>
      {children}
    </ProfessorDemoContext.Provider>
  );
}
