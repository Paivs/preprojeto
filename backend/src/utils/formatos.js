/* ============================================================
   FORMATOS
   Códigos exibidos na tela (OS-0241, CH-1042, ORC-001), textos de
   tempo ("há 12 min") e pedaços de SQL para formatar datas.
   ============================================================ */

// ---------- Códigos ----------
// No banco o id é numérico; na tela ele aparece com prefixo.
const codigoOS = id => 'OS-' + String(id).padStart(4, '0');
const codigoChamado = id => 'CH-' + id;
const codigoOrcamento = id => 'ORC-' + String(id).padStart(3, '0');

/** Converte "OS-0241", "CH-1042" ou "241" para o número 241. */
function idDoCodigo(codigo) {
  const numero = Number(String(codigo).replace(/^[A-Z]+-/i, ''));
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

// ---------- Textos ----------
/** Minutos -> "1 min", "12 min", "3 h", "2 d" (a tela mostra "há 12 min"). */
function tempoDecorrido(minutos) {
  if (minutos < 60) return Math.max(1, minutos) + ' min';
  if (minutos < 1440) return Math.floor(minutos / 60) + ' h';
  return Math.floor(minutos / 1440) + ' d';
}

/** 6.4 -> "6,4" (padrão brasileiro, até 1 casa decimal). */
const numeroBR = valor => Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 1 });

// ---------- Datas no SQL ----------
// A formatação é feita pelo próprio MySQL, que está no fuso correto.
const sqlDia = coluna => `DATE_FORMAT(${coluna}, '%d/%m')`;
const sqlDiaHora = coluna => `DATE_FORMAT(${coluna}, '%d/%m %H:%i')`;
const sqlIso = coluna => `DATE_FORMAT(${coluna}, '%Y-%m-%d')`;

/** "Hoje 08:40", "Ontem 19:40" ou "20/10 14:00". */
const sqlDataRelativa = (coluna, vazio = 'Sem medição') => `
  CASE
    WHEN ${coluna} IS NULL THEN '${vazio}'
    WHEN DATE(${coluna}) = CURDATE() THEN CONCAT('Hoje ', DATE_FORMAT(${coluna}, '%H:%i'))
    WHEN DATE(${coluna}) = CURDATE() - INTERVAL 1 DAY THEN CONCAT('Ontem ', DATE_FORMAT(${coluna}, '%H:%i'))
    ELSE DATE_FORMAT(${coluna}, '%d/%m %H:%i')
  END`;

module.exports = {
  codigoOS, codigoChamado, codigoOrcamento, idDoCodigo,
  tempoDecorrido, numeroBR,
  sqlDia, sqlDiaHora, sqlIso, sqlDataRelativa
};
