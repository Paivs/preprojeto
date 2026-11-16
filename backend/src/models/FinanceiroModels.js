import { pool } from '../config/database.js';

export async function obterResumo() {
  const [[pagamentos]] = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN status <> 'cancelado' THEN valor ELSE 0 END), 0) AS total_faturado,
      COALESCE(SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END), 0) AS total_recebido,
      COALESCE(SUM(CASE WHEN status = 'pago' AND data_pagamento >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN valor ELSE 0 END), 0) AS recebido_mes,
      COALESCE(SUM(CASE WHEN status = 'pago' AND data_pagamento >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01') AND data_pagamento < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN valor ELSE 0 END), 0) AS recebido_mes_anterior,
      COALESCE(SUM(CASE WHEN status IN ('nao_pago', 'atrasado') THEN 1 ELSE 0 END), 0) AS pagamentos_pendentes,
      COALESCE(SUM(CASE WHEN status = 'pago' THEN 1 ELSE 0 END), 0) AS quantidade_recebimentos
    FROM pagamento
  `);
  const [[usuarios]] = await pool.query('SELECT COUNT(*) AS quantidade_clientes FROM usuario WHERE nivel_permissao <> \'admin\'');

  const totalFaturado = Number(pagamentos.total_faturado);
  const totalRecebido = Number(pagamentos.total_recebido);
  const recebidoMes = Number(pagamentos.recebido_mes);
  const recebidoMesAnterior = Number(pagamentos.recebido_mes_anterior);

  return {
    totalFaturado,
    totalRecebido,
    quantidadeClientes: Number(usuarios.quantidade_clientes),
    quantidadeRecebimentos: Number(pagamentos.quantidade_recebimentos),
    pagamentosPendentes: Number(pagamentos.pagamentos_pendentes),
    percentualRecebido: totalFaturado > 0 ? Math.round((totalRecebido / totalFaturado) * 100) : 0,
    recebidoMes,
    recebidoMesAnterior,
    variacaoMensal: recebidoMesAnterior > 0
      ? Number((((recebidoMes - recebidoMesAnterior) / recebidoMesAnterior) * 100).toFixed(1))
      : null,
  };
}
