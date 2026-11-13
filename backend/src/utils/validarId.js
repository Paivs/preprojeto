export function validarId(idRecebido, nomeCampo = "ID") {
  const id = Number(idRecebido);
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError(`${nomeCampo} deve ser um número inteiro positivo.`);
  }
  return id;
}
