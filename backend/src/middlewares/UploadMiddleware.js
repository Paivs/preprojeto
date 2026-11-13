import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { extname, resolve } from "node:path";

const DIRETORIO_UPLOADS = resolve("uploads/inspecoes");
mkdirSync(DIRETORIO_UPLOADS, { recursive: true });
const MIME_TYPES_VALIDOS = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DIRETORIO_UPLOADS),
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
});

export const uploadEvidencia = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!MIME_TYPES_VALIDOS.includes(file.mimetype)) {
      return cb(new TypeError("Formato de imagem inválido. Use JPEG, PNG ou WebP."));
    }
    return cb(null, true);
  },
}).single("foto");
