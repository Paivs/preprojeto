export function resumirEquipamentos(equipamentos) {
  const resumo = {
    total: equipamentos.length,
    disponiveis: 0,
    emUso: 0,
    emManutencao: 0,
    primeiroEmUso: null,
  };

  for (const equipamento of equipamentos) {
    if (equipamento.status === "DISPONIVEL") resumo.disponiveis += 1;
    if (equipamento.status === "EM_USO") {
      resumo.emUso += 1;
      resumo.primeiroEmUso ??= equipamento;
    }
    if (equipamento.status === "EM_MANUTENCAO") resumo.emManutencao += 1;
  }

  return resumo;
}

export function percentualEquipamentos(quantidade, total) {
  return total ? (quantidade / total) * 100 : 0;
}
