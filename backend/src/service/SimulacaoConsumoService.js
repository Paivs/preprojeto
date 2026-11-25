function arredondar(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function consumoEsperadoNoMes(consumoEsperado, agora = new Date()) {
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const inicioProximoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);
  const progresso = (agora.getTime() - inicioMes.getTime()) /
    (inicioProximoMes.getTime() - inicioMes.getTime());
  return arredondar(consumoEsperado * Math.min(1, Math.max(0, progresso)));
}

export function adicionarConsumoSimulado(equipamento) {
  const status = String(equipamento.status || '').trim().toLocaleLowerCase('pt-BR');
  if (equipamento.consumo_mes !== undefined) {
    return {
      ...equipamento,
      consumo_atual: status === 'inativo' ? 0 : Number(equipamento.consumo_mes),
      consumo_atualizado_em: equipamento.consumo_atualizado_em
    };
  }

  if (status === 'inativo') {
    return {
      ...equipamento,
      consumo_atual: 0,
      consumo_atualizado_em: new Date().toISOString()
    };
  }

  const esperado = equipamento.consumo_minimo;
  if (esperado === null || esperado === undefined) {
    return { ...equipamento, consumo_atual: null, consumo_atualizado_em: null };
  }

  const esperadoNumero = Number(esperado);
  if (!Number.isFinite(esperadoNumero) || esperadoNumero < 0) {
    return { ...equipamento, consumo_atual: null, consumo_atualizado_em: null };
  }

  return {
    ...equipamento,
    consumo_atual: consumoEsperadoNoMes(esperadoNumero),
    consumo_atualizado_em: new Date().toISOString()
  };
}

export function adicionarConsumoSimuladoLista(equipamentos) {
  return equipamentos.map(adicionarConsumoSimulado);
}
