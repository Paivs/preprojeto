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

export function cancelarReservaLocal(dados, id) {
  const reserva = dados.agendamentos.find((item) => item.id === id);
  if (!reserva || reserva.status !== "CONFIRMADO") {
    return { ok: false, message: "Somente reservas confirmadas podem ser canceladas." };
  }

  const outrasReservasAtivas = dados.agendamentos.some((item) =>
    item.id !== id &&
    item.equipamentoId === reserva.equipamentoId &&
    !["CANCELADO", "CONCLUIDO"].includes(item.status),
  );

  return {
    ok: true,
    dados: {
      ...dados,
      agendamentos: dados.agendamentos.map((item) =>
        item.id === id ? { ...item, status: "CANCELADO" } : item,
      ),
      inspecoes: dados.inspecoes.map((item) =>
        item.agendamentoId === id && !item.resultado ? { ...item, cancelada: true } : item,
      ),
      equipamentos: dados.equipamentos.map((item) =>
        item.id === reserva.equipamentoId &&
        item.status === "RESERVADO" &&
        !outrasReservasAtivas
          ? { ...item, status: "DISPONIVEL" }
          : item,
      ),
    },
  };
}

export function concluirReservaLocal(dados, id) {
  const reserva = dados.agendamentos.find((item) => item.id === id);
  if (!reserva || reserva.status !== "EM_ANDAMENTO") {
    return { ok: false, message: "Somente uma atividade em andamento pode ser finalizada." };
  }

  const jaExistePosUso = dados.inspecoes.some(
    (item) => item.agendamentoId === id && item.etapa === "POS_USO",
  );
  const tipoEquipamento = dados.equipamentos.find(
    (item) => item.id === reserva.equipamentoId,
  )?.tipo;
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
    modelo: tipoEquipamento === "ROBO" ? "Robôs · Pós-uso" : "Bancadas · Pós-uso",
  };

  return {
    ok: true,
    dados: {
      ...dados,
      agendamentos: dados.agendamentos.map((item) =>
        item.id === id ? { ...item, status: "CONCLUIDO" } : item,
      ),
      inspecoes: inspecaoPosUso
        ? [...dados.inspecoes, inspecaoPosUso]
        : dados.inspecoes,
    },
  };
}

export function registrarInspecaoLocal(dados, id, formulario, obterChecklist) {
  const inspecao = dados.inspecoes.find((item) => item.id === id);
  if (!inspecao || inspecao.resultado || inspecao.cancelada) {
    return { ok: false, message: "Esta inspeção não está mais pendente." };
  }

  const equipamento = dados.equipamentos.find(
    (item) => item.id === inspecao.equipamentoId,
  );
  const checklist = obterChecklist(inspecao, equipamento);
  if (!checklist.length || checklist.some((item) => typeof formulario.respostas[item.id] !== "boolean")) {
    return { ok: false, message: "Responda todos os itens antes de salvar." };
  }

  const resultado = calcularResultadoInspecao(checklist, formulario.respostas);
  const statusEquipamento = resultado === "REPROVADO"
    ? "EM_MANUTENCAO"
    : inspecao.etapa === "POS_USO" ? "DISPONIVEL" : "EM_USO";
  const liberaAtividade = inspecao.etapa === "PRE_USO" && resultado !== "REPROVADO";

  return {
    ok: true,
    resultado,
    equipamento: equipamento?.nome,
    dados: {
      ...dados,
      inspecoes: dados.inspecoes.map((item) => item.id === id
        ? {
            ...item,
            resultado,
            respostas: formulario.respostas,
            observacoes: formulario.observacoes,
            concluidaEm: new Date().toISOString(),
          }
        : item),
      agendamentos: dados.agendamentos.map((item) => {
        if (item.id !== inspecao.agendamentoId) return item;
        return {
          ...item,
          ...(liberaAtividade ? { status: "EM_ANDAMENTO" } : {}),
          inspecao: resultado,
        };
      }),
      equipamentos: dados.equipamentos.map((item) =>
        item.id === inspecao.equipamentoId ? { ...item, status: statusEquipamento } : item,
      ),
    },
  };
}

export function calcularResultadoInspecao(checklist, respostas) {
  const falhaCritica = checklist.some((item) => item.critico && respostas[item.id] === false);
  if (falhaCritica) return "REPROVADO";
  const temFalha = checklist.some((item) => respostas[item.id] === false);
  return temFalha ? "APROVADO_COM_RESSALVAS" : "APROVADO";
}
