import { valorItem } from "./formatadores";

const CORES_DONUT = ["#a4161a", "#ba181b", "#b1a7a6", "#d3d3d3", "#660708"];

export function montarSegmentosDonut(itens, raio = 62) {
  const circunferencia = 2 * Math.PI * raio;
  const total = itens.reduce((soma, item) => soma + valorItem(item), 0) || 1;
  let acumulado = 0;

  return itens.map((item, index) => {
    const valor = valorItem(item);
    const fracao = valor / total;
    const comprimento = fracao * circunferencia;
    const deslocamento = -acumulado;
    acumulado += comprimento;
    return {
      cor: CORES_DONUT[index % CORES_DONUT.length],
      comprimento,
      deslocamento,
    };
  });
}

export { CORES_DONUT };
