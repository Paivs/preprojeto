function validarConsumo(valor, nome) {
  const numero = Number(valor);
  if (valor === null || valor === '' || !Number.isFinite(numero) || numero < 0) {
    throw new TypeError(`${nome} deve ser um nÃºmero vÃ¡lido e nÃ£o negativo.`);
  }
  return numero;
}

/** Converte energia de watt-hora (Wh) para quilowatt-hora (kWh). */
export function converterWhParaKwh(consumoWh) {
  return validarConsumo(consumoWh, 'O consumo em Wh') / 1000;
}

/** Calcula energia em kWh a partir da potÃªncia em watts e do tempo em horas. */
export function calcularConsumoKwh(potenciaWatts, horasUso) {
  const potencia = validarConsumo(potenciaWatts, 'A potÃªncia em watts');
  const horas = validarConsumo(horasUso, 'O tempo de uso em horas');
  return (potencia * horas) / 1000;
}
