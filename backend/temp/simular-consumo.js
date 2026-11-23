import "dotenv/config";
import { pool } from "../src/config/database.js";
import { avancarLeitura } from "../src/service/SimulacaoConsumoService.js";

const intervaloMs = Math.max(500, Number(process.env.SIMULACAO_INTERVALO_MS) || 3000);
const ciclosEntreAlertas = 2;
let cicloAtual = 0;

async function registrarAlertaSimulado(equipamento, agora) {
  const limite = Number(equipamento.consumo_maximo);
  if (!Number.isFinite(limite) || limite < 0) return false;

  const [linhas] = await pool.query(
    `SELECT COALESCE(SUM(consumo_kwh), 0) AS consumo_mes
       FROM leitura_consumo_equipamento
      WHERE id_equipamento = ?
        AND criado_em >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
        AND criado_em < DATE_FORMAT(DATE_ADD(CURRENT_DATE, INTERVAL 1 MONTH), '%Y-%m-01')`,
    [equipamento.id_equipamento]
  );
  const consumoMes = Number(linhas[0]?.consumo_mes || 0);
  if (consumoMes > limite) return false;

  const excedente = Math.max(0.01, Number((limite * 0.05).toFixed(2)));
  const totalAlvo = Math.min(
    99999999.99,
    Number((limite + excedente).toFixed(2))
  );
  if (totalAlvo <= limite) {
    console.warn(`Equipamento ${equipamento.id_equipamento}: limite maximo; excedente nao gerado.`);
    return false;
  }

  const consumoLeitura = Number((totalAlvo - consumoMes).toFixed(2));
  await pool.query(
    `INSERT INTO leitura_consumo_equipamento (id_equipamento, consumo_kwh)
     VALUES (?, ?)`,
    [equipamento.id_equipamento, consumoLeitura]
  );
  console.log(
    `[${agora}] ALERTA ${equipamento.nome_equipamento}: ${totalAlvo.toFixed(2)} kWh no mes (limite ${limite.toFixed(2)} kWh).`
  );
  return true;
}

async function simular() {
  try {
    cicloAtual += 1;
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
    let alertaGerado = false;
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
      if (cicloAtual % ciclosEntreAlertas === 0 && !alertaGerado) {
        alertaGerado = await registrarAlertaSimulado(equipamento, agora);
      }
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
