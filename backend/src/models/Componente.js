export default class Componente {
  constructor({ id, nome, categoria, quantidade_total = 1 }) {
    if (id !== undefined && (!Number.isInteger(Number(id)) || Number(id) <= 0)) {
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

    if (id !== undefined) this.id = Number(id);
    this.nome = nome.trim();
    this.categoria = categoria.trim();
    this.quantidade_total = quantidade_total;
  }
}
