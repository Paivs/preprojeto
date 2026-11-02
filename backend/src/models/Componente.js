export default class Componente {
  constructor({ id, nome, categoria, quantidade_total = 1 }) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new TypeError("ID deve ser um inteiro positivo.");
    }
    if (typeof nome !== "string" || nome.trim() === "") {
      throw new TypeError("Nome é obrigatório.");
    }
    if (typeof categoria !== "string" || categoria.trim() === "") {
      throw new TypeError("Categoria é obrigatória.");
    }
    if (!Number.isInteger(quantidade_total) || quantidade_total < 0) {
      throw new TypeError("Quantidade total deve ser um inteiro maior ou igual a zero.");
    }

    this.id = id;
    this.nome = nome.trim();
    this.categoria = categoria.trim();
    this.quantidade_total = quantidade_total;
  }
}