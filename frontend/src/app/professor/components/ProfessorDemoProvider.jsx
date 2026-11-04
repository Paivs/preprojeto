"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { calcularResultadoInspecao, criarReservaLocal } from "../lib/professorDemoActions";
import { obterChecklist } from "../lib/checklistDemo";

const ProfessorDemoContext = createContext(null);

function criarDadosIniciais(professora = null) {
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
  if (!contexto) throw new Error("useProfessorDemo deve ser usado dentro de ProfessorDemoProvider.");
  return contexto;
}

export default function ProfessorDemoProvider({ children, professora }) {
  const [dados, setDados] = useState(() => criarDadosIniciais(professora));

  useEffect(() => {
    if (professora?.nome) setDados((atual) => ({ ...atual, professora: { ...atual.professora, ...professora } }));
  }, [professora]);

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
      return { ok: false, message: "Somente reservas confirmadas podem ser canceladas." };
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

  function registrarInspecao(id, formulario) {
    const inspecao = dados.inspecoes.find((item) => item.id === id);
    if (!inspecao || inspecao.resultado || inspecao.cancelada) {
      return { ok: false, message: "Esta inspeção não está mais pendente." };
    }
    const equipamento = dados.equipamentos.find((item) => item.id === inspecao.equipamentoId);
    const checklist = obterChecklist(inspecao, equipamento);
    if (!checklist.length || checklist.some((item) => typeof formulario.respostas[item.id] !== "boolean")) {
      return { ok: false, message: "Responda todos os itens antes de salvar." };
    }
    const resultado = calcularResultadoInspecao(checklist, formulario.respostas);
    const statusEquipamento = resultado === "REPROVADO"
      ? "EM_MANUTENCAO"
      : inspecao.etapa === "POS_USO" ? "DISPONIVEL" : "EM_USO";

    setDados((atual) => ({
      ...atual,
      inspecoes: atual.inspecoes.map((item) => item.id === id ? { ...item, resultado, respostas: formulario.respostas, observacoes: formulario.observacoes, concluidaEm: new Date().toISOString() } : item),
      agendamentos: inspecao.etapa === "PRE_USO" && resultado !== "REPROVADO"
        ? atual.agendamentos.map((item) => item.id === inspecao.agendamentoId ? { ...item, status: "EM_ANDAMENTO", inspecao: resultado } : item)
        : atual.agendamentos.map((item) => item.id === inspecao.agendamentoId ? { ...item, inspecao: resultado } : item),
      equipamentos: atual.equipamentos.map((item) => item.id === inspecao.equipamentoId ? { ...item, status: statusEquipamento } : item),
    }));
    return { ok: true, resultado, equipamento: equipamento?.nome };
  }

  return (
    <ProfessorDemoContext.Provider value={{ dados, criarAgendamento, cancelarAgendamento, concluirAgendamento, registrarInspecao }}>
      {children}
    </ProfessorDemoContext.Provider>
  );
}
