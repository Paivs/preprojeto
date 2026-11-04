/* ============================================================
   CRIA (OU RECRIA) O BANCO DE DADOS
   Executa ../database/schema.sql e ../database/seed.sql usando os
   dados de conexão do .env. Uso:  npm run db:criar
   ATENÇÃO: apaga o banco "predictmaint" se ele já existir.
   ============================================================ */
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const PASTA_SQL = path.resolve(__dirname, '..', '..', 'database');

async function main() {
  const conexao = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // permite rodar o arquivo .sql inteiro de uma vez
  });

  for (const arquivo of ['schema.sql', 'seed.sql']) {
    console.log('Executando', arquivo, '...');
    await conexao.query(fs.readFileSync(path.join(PASTA_SQL, arquivo), 'utf8'));
  }
  await conexao.end();
  console.log('Banco "predictmaint" criado com os dados de demonstração.');
}

main().catch(erro => {
  console.error('Falhou:', erro.message);
  process.exit(1);
});
