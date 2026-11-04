"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  cancelarReservaLocal,
  concluirReservaLocal,
  criarReservaLocal,
  registrarInspecaoLocal,
} from "../lib/professorDemoActions";
import { obterChecklist } from "../lib/checklistDemo";

const ProfessorDemoContext = createContext(null);

function criarDadosIniciais(professora) {
  return {
    professora: professora ?? {},
    agendamentos: [],
    equipamentos: [],
    inspecoes: [],
    turmas: [],
  };
}

export function useProfessorDemo() {
  const contexto = useContext(ProfessorDemoContext);
  if (!contexto) {
    throw new Error("useProfessorDemo deve ser usado dentro de ProfessorDemoProvider.");
  }
  return contexto;
}

export default function ProfessorDemoProvider({ children, professora }) {
  const [dados, setDados] = useState(() => criarDadosIniciais(professora));

  useEffect(() => {
    if (!professora?.nome) return;
    setDados((atual) => ({
      ...atual,
      professora: { ...atual.professora, ...professora },
    }));
  }, [professora]);

  function criarAgendamento(formulario) {
    const resultado = criarReservaLocal(dados, formulario);
    if (!resultado.ok) return resultado;

    setDados((atual) => ({
      ...atual,
      agendamentos: [...atual.agendamentos, resultado.reserva],
      inspecoes: [...atual.inspecoes, resultado.inspecao],
      equipamentos: atual.equipamentos.map((item) =>
        item.id === resultado.equipamentoAtualizado.id
          ? resultado.equipamentoAtualizado
          : item,
      ),
    }));
    return { ok: true, reserva: resultado.reserva };
  }

  function cancelarAgendamento(id) {
    const resultado = cancelarReservaLocal(dados, id);
    if (!resultado.ok) return resultado;
    setDados(resultado.dados);
    return { ok: true };
  }

  function concluirAgendamento(id) {
    const resultado = concluirReservaLocal(dados, id);
    if (!resultado.ok) return resultado;
    setDados(resultado.dados);
    return { ok: true };
  }

  function registrarInspecao(id, formulario) {
    const resultado = registrarInspecaoLocal(dados, id, formulario, obterChecklist);
    if (!resultado.ok) return resultado;
    setDados(resultado.dados);
    return {
      ok: true,
      resultado: resultado.resultado,
      equipamento: resultado.equipamento,
    };
  }

  return (
    <ProfessorDemoContext.Provider
      value={{ dados, criarAgendamento, cancelarAgendamento, concluirAgendamento, registrarInspecao }}
    >
      {children}
    </ProfessorDemoContext.Provider>
  );
}
