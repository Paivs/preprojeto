const leituras = new Map();

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

export function avancarLeitura(id, minimo, maximo) {
  if (minimo === maximo) return minimo;

  const anterior = leituras.get(id) || { valor: minimo, direcao: 1 };
  const passo = Math.max((maximo - minimo) * 0.05, 0.01);
  let valor = anterior.valor + anterior.direcao * passo;
  let direcao = anterior.direcao;

  if (valor >= maximo) {
    valor = maximo;
    direcao = -1;
  } else if (valor <= minimo) {
    valor = minimo;
    direcao = 1;
  }

  valor = Math.min(maximo, Math.max(minimo, arredondar(valor)));
  leituras.set(id, { valor, direcao });
  return valor;
}

export function adicionarConsumoSimulado(equipamento) {
  const minimo = equipamento.consumo_minimo;
  const maximo = equipamento.consumo_maximo;

  if (minimo === null || minimo === undefined) {
    return { ...equipamento, consumo_atual: null, consumo_atualizado_em: null };
  }

  const minimoNumero = Number(minimo);
  const maximoNumero = maximo === null || maximo === undefined
    ? minimoNumero
    : Number(maximo);
  if (
    !Number.isFinite(minimoNumero) ||
    !Number.isFinite(maximoNumero) ||
    minimoNumero < 0 ||
    maximoNumero < minimoNumero
  ) {
    return { ...equipamento, consumo_atual: null, consumo_atualizado_em: null };
  }

  return {
    ...equipamento,
    consumo_atual: avancarLeitura(
      equipamento.id_equipamento,
      minimoNumero,
      maximoNumero
    ),
    consumo_atualizado_em: new Date().toISOString()
  };
}

export function adicionarConsumoSimuladoLista(equipamentos) {
  return equipamentos.map(adicionarConsumoSimulado);
}
