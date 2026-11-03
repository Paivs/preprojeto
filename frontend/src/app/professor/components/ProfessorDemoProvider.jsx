"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { agendamentosDemo } from "../lib/agendamentosDemo";
import { equipamentosDemo } from "../lib/equipamentosDemo";
import { inspecoesDemo } from "../lib/inspecoesDemo";
import { turmasDemo } from "../lib/turmasDemo";

const ProfessorDemoContext = createContext(null);
const STORAGE_KEY = "tenken_professor_demo_v1";

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
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        const dadosSalvos = JSON.parse(salvo);
        const iniciais = criarDadosIniciais();
        setDados({
          ...iniciais,
          ...dadosSalvos,
          agendamentos: Array.isArray(dadosSalvos.agendamentos) ? dadosSalvos.agendamentos : iniciais.agendamentos,
          equipamentos: Array.isArray(dadosSalvos.equipamentos) ? dadosSalvos.equipamentos : iniciais.equipamentos,
          inspecoes: Array.isArray(dadosSalvos.inspecoes) ? dadosSalvos.inspecoes : iniciais.inspecoes,
          turmas: Array.isArray(dadosSalvos.turmas) ? dadosSalvos.turmas : iniciais.turmas,
        });
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setCarregado(true);
    }
  }, []);

  useEffect(() => {
    if (!carregado) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  }, [dados, carregado]);

  return (
    <ProfessorDemoContext.Provider value={{ dados, setDados }}>
      {children}
    </ProfessorDemoContext.Provider>
  );
}
