import { pool } from "../config/database.js";
import bcrypt from "bcrypt";
import * as TurmaModel from "../models/turmaModel.js";
import { validarTokenTurma } from "../utils/token.js";

const MAX_INSERT_ATTEMPTS = 5;

export async function solicitarAcesso(request, response, next) {
  const { token } = request.body ?? {};

  if (!validarTokenTurma(token)) {
    return response.status(400).json({ message: "Token invalido" });
  }

  try {
    const turma = await TurmaModel.buscarTurmaPorToken(token);
    if (!turma) {
      return response.status(404).json({ message: "Token nao encontrado" });
    }

    const [agendamentos] = await pool.execute(
      `SELECT id FROM agendamentos
       WHERE turma_id = ?
         AND inicio <= NOW() AND fim >= NOW()
         AND status IN ('CONFIRMADO', 'EM_ANDAMENTO')
       ORDER BY inicio DESC
       LIMIT 1`,
      [turma.id],
    );
    const agendamento = agendamentos[0];
    if (!agendamento) {
      return response.status(422).json({ message: "Nao ha aula ativa para esta turma agora" });
    }

    const [vinculos] = await pool.execute(
      "SELECT 1 FROM turma_alunos WHERE turma_id = ? AND aluno_id = ? LIMIT 1",
      [turma.id, request.usuario.id],
    );
    if (!vinculos.length) {
      return response.status(403).json({ message: "Aluno nao pertence a esta turma" });
    }

    try {
      await pool.execute(
        "INSERT INTO checkins (agendamento_id, aluno_id, aprovado_em) VALUES (?, ?, NULL)",
        [agendamento.id, request.usuario.id],
      );
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return response.status(409).json({ message: "Solicitacao ja registrada" });
      }
      throw error;
    }

    return response.status(201).json({
      status: "AGUARDANDO_APROVACAO",
      turma: { id: turma.id, nome: turma.nome },
    });
  } catch (error) {
    return next(error);
  }
}

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

export async function cadastrarAluno(request, response, next) {
  const { matricula, senha, confirmarSenha } = request.body ?? {};
  const errors = [];

  if (typeof matricula !== "string" || !matricula.trim()) {
    errors.push({ field: "matricula", message: "Matrícula é obrigatória" });
  }

  if (typeof senha !== "string" || senha.length < 8) {
    errors.push({ field: "senha", message: "A senha deve ter no mínimo 8 caracteres" });
  }

  if (typeof confirmarSenha !== "string" || confirmarSenha !== senha) {
    errors.push({ field: "confirmarSenha", message: "A confirmação deve ser igual à senha" });
  }

  if (errors.length) {
    return response.status(400).json({ errors });
  }

  let connection;
  let transactionStarted = false;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [preMatriculas] = await connection.execute(
      `SELECT id, nome, email, utilizada
       FROM pre_matriculas_alunos
       WHERE matricula = ?
       FOR UPDATE`,
      [matricula.trim()],
    );

    const preMatricula = preMatriculas[0];

    if (!preMatricula) {
      await connection.rollback();
      transactionStarted = false;
      return response.status(404).json({ message: "Matrícula não encontrada" });
    }

    if (preMatricula.utilizada) {
      await connection.rollback();
      transactionStarted = false;
      return response.status(409).json({ message: "Esta matrícula já foi utilizada" });
    }

    const senhaHash = await bcrypt.hash(senha, 12);
    const [insertResult] = await connection.execute(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo, matricula)
       VALUES (?, ?, ?, 'ALUNO', TRUE, ?)`,
      [preMatricula.nome, preMatricula.email, senhaHash, matricula.trim()],
    );

    await connection.execute(
      "UPDATE pre_matriculas_alunos SET utilizada = true WHERE id = ?",
      [preMatricula.id],
    );

    await connection.commit();
    transactionStarted = false;

    return response.status(201).json({
      id: insertResult.insertId,
      nome: preMatricula.nome,
      matricula: matricula.trim(),
    });
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        return next(rollbackError);
      }
    }

    if (error.code === "ER_DUP_ENTRY") {
      return response.status(409).json({
        message: "Não foi possível concluir o cadastro com os dados informados",
      });
    }

    return next(error);
  } finally {
    connection?.release();
  }
}
