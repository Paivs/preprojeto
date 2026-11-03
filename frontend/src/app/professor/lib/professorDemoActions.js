export function criarReservaLocal(dados, formulario) {
  if (formulario.fim <= formulario.inicio) {
    return { ok: false, message: "O horário de término precisa ser depois do início." };
  }

  const turma = dados.turmas.find((item) => item.id === Number(formulario.turmaId));
  const equipamento = dados.equipamentos.find((item) => item.id === Number(formulario.equipamentoId));
  if (!turma) return { ok: false, message: "Selecione uma turma ou projeto válido." };
  if (!equipamento) return { ok: false, message: "Selecione um equipamento válido." };
  if (["EM_MANUTENCAO", "INATIVO"].includes(equipamento.status)) {
    return { ok: false, message: "Esse equipamento está indisponível para reserva." };
  }

  const conflito = dados.agendamentos.find((reserva) => {
    if (reserva.equipamentoId !== equipamento.id || reserva.data !== formulario.data) return false;
    if (["CANCELADO", "CONCLUIDO"].includes(reserva.status)) return false;
    return formulario.inicio < reserva.fim && formulario.fim > reserva.inicio;
  });

  if (conflito) {
    return { ok: false, message: `O equipamento já está reservado das ${conflito.inicio} às ${conflito.fim}.` };
  }

  const id = Math.max(Date.now(), ...dados.agendamentos.map((item) => Number(item.id) + 1));
  const reserva = {
    id,
    turmaId: turma.id,
    equipamentoId: equipamento.id,
    data: formulario.data,
    inicio: formulario.inicio,
    fim: formulario.fim,
    atividade: formulario.atividade,
    turma: turma.nome,
    equipamento: equipamento.nome,
    patrimonio: equipamento.patrimonio,
    status: "CONFIRMADO",
    inspecao: "PENDENTE",
  };

  const inspeccaoId = Math.max(Date.now() + 1, ...dados.inspecoes.map((item) => Number(item.id) + 1));
  const inspecao = {
    id: inspeccaoId,
    agendamentoId: id,
    data: formulario.data,
    horario: formulario.inicio,
    turmaId: turma.id,
    equipamentoId: equipamento.id,
    turma: turma.nome,
    equipamento: equipamento.nome,
    etapa: "PRE_USO",
    resultado: null,
    observacoes: "",
    modelo: equipamento.tipo === "ROBO" ? "Robôs · Pré-uso" : "Bancadas · Pré-uso",
  };

  return {
    ok: true,
    reserva,
    inspecao,
    equipamentoAtualizado: { ...equipamento, status: "RESERVADO" },
  };
}

export function calcularResultadoInspecao(checklist, respostas) {
  const falhaCritica = checklist.some((item) => item.critico && respostas[item.id] === false);
  if (falhaCritica) return "REPROVADO";
  const temFalha = checklist.some((item) => respostas[item.id] === false);
  return temFalha ? "APROVADO_COM_RESSALVAS" : "APROVADO";
}
