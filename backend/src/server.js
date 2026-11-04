/* ============================================================
   PONTO DE ENTRADA DA API
   npm run dev   -> reinicia sozinho a cada alteração
   npm start     -> produção
   ============================================================ */
require('dotenv').config({ quiet: true });

const app = require('./app');
const { pool } = require('./config/db');

const PORTA = Number(process.env.PORT) || 8080;

app.listen(PORTA, async () => {
  console.log(`API do PredictMaint em http://localhost:${PORTA}/api`);
  try {
    await pool.query('SELECT 1');
    console.log('Banco de dados conectado.');
  } catch (erro) {
    console.error('ATENÇÃO: não consegui conectar no MySQL ->', erro.message);
    console.error('Confira o arquivo .env e se o banco foi criado (npm run db:criar).');
  }
});
