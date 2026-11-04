/* ============================================================
   UPLOAD DE FOTOS (chamados)
   Os arquivos ficam na pasta backend/uploads e são servidos em /uploads.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { requisicaoInvalida } = require('../utils/http');

const PASTA_UPLOADS = path.resolve(__dirname, '..', '..', 'uploads');
fs.mkdirSync(PASTA_UPLOADS, { recursive: true });

const armazenamento = multer.diskStorage({
  destination: PASTA_UPLOADS,
  // Nome aleatório para não sobrescrever arquivos nem expor o nome original
  filename: (_req, arquivo, cb) => {
    const extensao = path.extname(arquivo.originalname).toLowerCase() || '.jpg';
    cb(null, crypto.randomUUID() + extensao);
  }
});

const uploadFoto = multer({
  storage: armazenamento,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, arquivo, cb) => {
    if (arquivo.mimetype.startsWith('image/')) cb(null, true);
    else cb(requisicaoInvalida('Envie apenas imagens (foto da máquina).'));
  }
});

module.exports = { uploadFoto, PASTA_UPLOADS };
