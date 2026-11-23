import "dotenv/config";
import { pool } from "../src/config/database.js";
import { avancarLeitura } from "../src/service/SimulacaoConsumoService.js";

const intervaloMs = Math.max(500, Number(process.env.SIMULACAO_INTERVALO_MS) || 3000);

async function simular() {
  try {
    const [equipamentos] = await pool.query(
      `SELECT id_equipamento, nome_equipamento, consumo_minimo, consumo_maximo, status
         FROM equipamento
        WHERE consumo_minimo IS NOT NULL AND consumo_maximo IS NOT NULL
        ORDER BY id_equipamento`
    );

    if (equipamentos.length === 0) {
      console.log("Nenhum equipamento tem mínimo e máximo definidos.");
      return;
    }

    const agora = new Date().toLocaleTimeString("pt-BR");
    for (const equipamento of equipamentos) {
      if (String(equipamento.status || "").trim().toLocaleLowerCase("pt-BR") === "inativo") {
        console.log(`[${agora}] ${equipamento.nome_equipamento}: 0.00 kWh (inativo)`);
        continue;
      }

      const minimo = Number(equipamento.consumo_minimo);
      const maximo = Number(equipamento.consumo_maximo);

      if (!Number.isFinite(minimo) || !Number.isFinite(maximo) || maximo < minimo) {
        console.warn(`Equipamento ${equipamento.id_equipamento}: limites inválidos; ignorado.`);
        continue;
      }

      const consumo = avancarLeitura(equipamento.id_equipamento, minimo, maximo);
      console.log(`[${agora}] ${equipamento.nome_equipamento}: ${consumo.toFixed(2)} kWh (mín. ${minimo.toFixed(2)}, máx. ${maximo.toFixed(2)})`);
    }
  } catch (erro) {
    console.error("Falha ao simular consumo:", erro.message);
  }
}

console.log(`Simulação iniciada. Intervalo: ${intervaloMs} ms. Pare com Ctrl+C.`);
await simular();
const temporizador = setInterval(simular, intervaloMs);

async function encerrar() {
  clearInterval(temporizador);
  await pool.end();
  process.exit(0);
}

process.once("SIGINT", encerrar);
process.once("SIGTERM", encerrar);
