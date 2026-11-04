/* ============================================================
   APLICAÇÃO EXPRESS
   Monta os middlewares globais e registra todas as rotas em /api.
   ============================================================ */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { pool } = require('./config/db');
const { autenticar, equipeManutencao } = require('./middlewares/auth');
const { rotaNaoEncontrada, tratarErros } = require('./middlewares/erros');
const { PASTA_UPLOADS } = require('./middlewares/upload');

const app = express();

// ---------- Segurança e formato ----------
// crossOriginResourcePolicy liberado para o front (outra porta) conseguir exibir as fotos
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(s => s.trim())
}));
app.use(express.json({ limit: '1mb' }));

// Fotos dos chamados: GET /uploads/<arquivo>
app.use('/uploads', express.static(PASTA_UPLOADS));

// ---------- Rotas públicas ----------
// Verificação de saúde da API (usada pelo Docker/Coolify)
app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true, servico: 'predictmaint-api' });
});
app.use('/api/auth', require('./routes/auth.routes'));

// ---------- Rotas protegidas (exigem login) ----------
app.use('/api', autenticar);

// Usadas também pelo funcionário (chão de fábrica)
app.use('/api/maquinas', require('./routes/maquinas.routes'));
app.use('/api/chamados', require('./routes/chamados.routes'));
app.use('/api', require('./routes/alertas.routes').router);   // /alertas e /limites
app.use('/api', require('./routes/painel.routes'));            // /dashboard, /planta, /busca, /equipes

// Só a equipe de manutenção (gestor e técnico)
app.use('/api/medicoes', equipeManutencao, require('./routes/medicoes.routes'));
app.use('/api/ordens', equipeManutencao, require('./routes/ordens.routes'));
app.use('/api/orcamento', equipeManutencao, require('./routes/orcamento.routes'));

// ---------- Erros ----------
app.use(rotaNaoEncontrada);
app.use(tratarErros);

module.exports = app;
