import { pool } from "../config/database.js";

const MAX_INSERT_ATTEMPTS = 5;

function validationErrors(body) {
  const errors = [];
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const cpf = typeof body.cpf === "string" ? body.cpf.trim() : "";

  if (!nome) {
    errors.push({ field: "nome", message: "Nome é obrigatório" });
  }

  if (!email && !cpf) {
    errors.push({ field: "email", message: "Informe email ou CPF" });
    errors.push({ field: "cpf", message: "Informe email ou CPF" });
  }

  if (body.email != null && typeof body.email !== "string") {
    errors.push({ field: "email", message: "Email deve ser um texto" });
  }

  if (body.cpf != null && typeof body.cpf !== "string") {
    errors.push({ field: "cpf", message: "CPF deve ser um texto" });
  }

  if (body.telefone != null && typeof body.telefone !== "string") {
    errors.push({ field: "telefone", message: "Telefone deve ser um texto" });
  }

  return { errors, nome, email, cpf };
}

function generateMatricula() {
  return `MAT-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
}

export async function gerarMatricula(request, response, next) {
  const { errors, nome, email, cpf } = validationErrors(request.body ?? {});

  if (errors.length) {
    return response.status(400).json({ errors });
  }

  const telefone = request.body.telefone?.trim() || null;

  for (let attempt = 1; attempt <= MAX_INSERT_ATTEMPTS; attempt += 1) {
    const matricula = generateMatricula();

    try {
      await pool.execute(
        `INSERT INTO pre_matriculas_alunos
          (nome, email, cpf, telefone, matricula)
         VALUES (?, ?, ?, ?, ?)`,
        [nome, email, cpf, telefone, matricula],
      );

      return response.status(201).json({ matricula, nome });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        const duplicateKey = String(error.sqlMessage ?? "");

        const duplicateEntry = String(error.message ?? "");
        const isMatriculaDuplicate =
          duplicateKey.includes("matricula") ||
          duplicateEntry.includes("matricula");

        if (isMatriculaDuplicate) {
          if (attempt < MAX_INSERT_ATTEMPTS) continue;

          return response.status(409).json({
            message: "Não foi possível gerar uma matrícula única. Tente novamente.",
          });
        }

        return response.status(409).json({
          message: "Já existe uma solicitação de matrícula para estes dados",
        });
      }

      return next(error);
    }
  }
}
