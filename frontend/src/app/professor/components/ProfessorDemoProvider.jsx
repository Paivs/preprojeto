"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { agendamentosDemo } from "../lib/agendamentosDemo";
import { equipamentosDemo } from "../lib/equipamentosDemo";
import { inspecoesDemo } from "../lib/inspecoesDemo";
import { turmasDemo } from "../lib/turmasDemo";
import { criarReservaLocal } from "../lib/professorDemoActions";

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

  function criarAgendamento(formulario) {
    const resultado = criarReservaLocal(dados, formulario);
    if (!resultado.ok) return resultado;

    setDados((atual) => ({
      ...atual,
      agendamentos: [...atual.agendamentos, resultado.reserva],
      inspecoes: [...atual.inspecoes, resultado.inspecao],
      equipamentos: atual.equipamentos.map((item) => item.id === resultado.equipamentoAtualizado.id ? resultado.equipamentoAtualizado : item),
    }));
    return { ok: true, reserva: resultado.reserva };
  }

  function cancelarAgendamento(id) {
    const reserva = dados.agendamentos.find((item) => item.id === id);
    if (!reserva || reserva.status !== "CONFIRMADO") {
      return { ok: false, message: "Somente reservas confirmadas podem ser canceladas nesta prévia." };
    }

    const outrasReservasAtivas = dados.agendamentos.some((item) => item.id !== id && item.equipamentoId === reserva.equipamentoId && !["CANCELADO", "CONCLUIDO"].includes(item.status));
    setDados((atual) => ({
      ...atual,
      agendamentos: atual.agendamentos.map((item) => item.id === id ? { ...item, status: "CANCELADO" } : item),
      inspecoes: atual.inspecoes.map((item) => item.agendamentoId === id && !item.resultado ? { ...item, cancelada: true } : item),
      equipamentos: atual.equipamentos.map((item) => item.id === reserva.equipamentoId && item.status === "RESERVADO" && !outrasReservasAtivas ? { ...item, status: "DISPONIVEL" } : item),
    }));
    return { ok: true };
  }

  function concluirAgendamento(id) {
    const reserva = dados.agendamentos.find((item) => item.id === id);
    if (!reserva || reserva.status !== "EM_ANDAMENTO") {
      return { ok: false, message: "Somente uma atividade em andamento pode ser finalizada." };
    }
    const jaExistePosUso = dados.inspecoes.some((item) => item.agendamentoId === id && item.etapa === "POS_USO");
    const inspecaoPosUso = jaExistePosUso ? null : {
      id: Math.max(Date.now(), ...dados.inspecoes.map((item) => Number(item.id) + 1)),
      agendamentoId: id,
      data: reserva.data,
      horario: reserva.fim,
      turmaId: reserva.turmaId,
      equipamentoId: reserva.equipamentoId,
      turma: reserva.turma,
      equipamento: reserva.equipamento,
      etapa: "POS_USO",
      resultado: null,
      observacoes: "",
      modelo: reserva.equipamentoId && dados.equipamentos.find((item) => item.id === reserva.equipamentoId)?.tipo === "ROBO" ? "Robôs · Pós-uso" : "Bancadas · Pós-uso",
    };

    setDados((atual) => ({
      ...atual,
      agendamentos: atual.agendamentos.map((item) => item.id === id ? { ...item, status: "CONCLUIDO" } : item),
      inspecoes: inspecaoPosUso ? [...atual.inspecoes, inspecaoPosUso] : atual.inspecoes,
    }));
    return { ok: true };
  }

  return (
    <ProfessorDemoContext.Provider value={{ dados, setDados, criarAgendamento, cancelarAgendamento, concluirAgendamento }}>
      {children}
    </ProfessorDemoContext.Provider>
  );
}
