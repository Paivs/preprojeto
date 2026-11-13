import { randomInt } from "node:crypto";

const CARACTERES_TOKEN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const FORMATO_TOKEN_TURMA = /^TNK-[A-Z0-9]{4}$/;

export function gerarTokenTurma() {
  let sufixo = "";
  for (let indice = 0; indice < 4; indice += 1) {
    sufixo += CARACTERES_TOKEN[randomInt(CARACTERES_TOKEN.length)];
  }
  return `TNK-${sufixo}`;
}

export function validarTokenTurma(valor) {
  return typeof valor === "string" && FORMATO_TOKEN_TURMA.test(valor);
}
