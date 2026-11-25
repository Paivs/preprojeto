import "dotenv/config";
import { pool } from "../src/config/database.js";

const intervaloMs = Math.max(500, Number(process.env.SIMULACAO_INTERVALO_MS) || 500);
function registrarAlertaSimulado(equipamento, consumoAnterior, consumoAtual, agora) {
  const limite = Number(equipamento.consumo_maximo);
  if (Number.isFinite(limite) && consumoAnterior <= limite && consumoAtual > limite) {
    console.log(`[${agora}] ALERTA ${equipamento.nome_equipamento}: ${consumoAtual.toFixed(2)} kWh no mes (limite ${limite.toFixed(2)} kWh).`);
  }
}

async function simular() {
  try {
    const [equipamentos] = await pool.query(
      `SELECT id_equipamento, nome_equipamento, consumo_minimo, consumo_maximo, status,
              incremento_consumo_simulado,
              CASE
                WHEN consumo_mensal_atualizado_em >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
                 AND consumo_mensal_atualizado_em < DATE_FORMAT(DATE_ADD(CURRENT_DATE, INTERVAL 1 MONTH), '%Y-%m-01')
                THEN consumo_mensal
                ELSE 0
              END AS consumo_mes
         FROM equipamento
        ORDER BY id_equipamento`
    );

    if (equipamentos.length === 0) {
      console.log("Nenhum equipamento tem mi­nimo e máximo definidos.");
      return;
    }

    const agora = new Date().toLocaleTimeString("pt-BR");
    for (const equipamento of equipamentos) {
      if (String(equipamento.status || "").trim().toLocaleLowerCase("pt-BR") === "inativo") {
        console.log(`[${agora}] ${equipamento.nome_equipamento}: 0.00 kWh (inativo)`);
        continue;
      }

      const maximo = Number(equipamento.consumo_maximo);

      const consumoAnterior = Number(equipamento.consumo_mes || 0);
      let incrementoBase = Number(equipamento.incremento_consumo_simulado);
      if (!Number.isFinite(incrementoBase) || incrementoBase <= 0) {
        incrementoBase = Number((0.1 + Number(equipamento.id_equipamento) / 100).toFixed(2));
        await pool.query(
          `UPDATE equipamento
              SET incremento_consumo_simulado = ?
            WHERE id_equipamento = ? AND incremento_consumo_simulado <= 0`,
          [incrementoBase, equipamento.id_equipamento]
        );
      }
      const incremento = Math.max(
        0.01,
        Number((incrementoBase * (0.05 + Math.random() * 0.15)).toFixed(2))
      );
      await pool.query(
        `UPDATE equipamento
            SET consumo_mensal = CASE
                  WHEN consumo_mensal_atualizado_em >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
                   AND consumo_mensal_atualizado_em < DATE_FORMAT(DATE_ADD(CURRENT_DATE, INTERVAL 1 MONTH), '%Y-%m-01')
                  THEN consumo_mensal + ?
                  ELSE ?
                END,
                consumo_mensal_atualizado_em = CURRENT_TIMESTAMP
          WHERE id_equipamento = ?`,
        [incremento, incremento, equipamento.id_equipamento]
      );
      const consumoAtual = Number((consumoAnterior + incremento).toFixed(2));
      registrarAlertaSimulado(equipamento, consumoAnterior, consumoAtual, agora);
      console.log(`[${agora}] ${equipamento.nome_equipamento}: ${consumoAtual.toFixed(2)} kWh no mes (+${incremento.toFixed(2)} kWh)`);
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
