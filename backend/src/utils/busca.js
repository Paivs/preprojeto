export function validarTermoBusca(busca) {
  if (busca === undefined || busca === null) return '';
  if (typeof busca !== 'string') {
    throw new TypeError('O parâmetro busca deve ser um texto.');
  }

  const termo = busca.trim();
  if (termo.length > 100) {
    throw new TypeError('O parâmetro busca deve ter no máximo 100 caracteres.');
  }
  return termo;
}

export function criarCondicaoBusca(termo, colunas) {
  if (!termo) return { sql: '', valores: [] };

  const escaparCuringas = (valor) => valor.replace(/[%_\\]/g, '\\$&');
  const termoLike = `%${escaparCuringas(termo.toLowerCase())}%`;
  const termoNormalizado = termo.toLowerCase().replace(/[\s_-]/g, '');
  const condicoes = [];
  const valores = [];

  for (const coluna of colunas) {
    condicoes.push(`LOWER(${coluna}) LIKE ?`);
    valores.push(termoLike);
    if (termoNormalizado) {
      condicoes.push(
        `LOWER(REPLACE(REPLACE(REPLACE(${coluna}, '-', ''), ' ', ''), '_', '')) LIKE ?`
      );
      valores.push(`%${escaparCuringas(termoNormalizado)}%`);
    }
  }

  return { sql: `(${condicoes.join(' OR ')})`, valores };
}
