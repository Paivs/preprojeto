/* ============================================================
   UTILITÁRIOS E CONSTANTES DA INTERFACE
   ============================================================ */

/** 1234.5 -> "R$ 1.235" */
export const brl = valor =>
  Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

/** 6.4 -> "6,4" (casas decimais fixas) */
export const num = (valor, casas = 1) =>
  Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

/** Textos exibidos para cada código (status, nível, prioridade). */
export const NOMES = {
  critico: 'Crítico', atencao: 'Atenção', normal: 'Normal', info: 'Info',
  alta: 'Alta', media: 'Média', baixa: 'Baixa'
};

export const STATUS_OS = {
  aberta: 'Abertas',
  andamento: 'Em andamento',
  peca: 'Aguardando peça',
  concluida: 'Concluídas'
};

export const GRANDEZAS = [
  { codigo: 'vibracao', nome: 'Vibração', unidade: 'mm/s' },
  { codigo: 'temperatura', nome: 'Temperatura', unidade: '°C' },
  { codigo: 'corrente', nome: 'Corrente', unidade: 'A' }
];

export const PERFIS = { gestor: 'Gestor', tecnico: 'Técnico', funcionario: 'Funcionário' };

/** Cor do selo de cada situação de chamado. */
export const COR_SITUACAO = {
  'Registrado': 'neutro',
  'Triado': 'info',
  'Técnico designado': 'info',
  'Em reparo': 'atencao',
  'Concluído': 'normal'
};

/** "Bom dia" / "Boa tarde" / "Boa noite" */
export function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Lê um parâmetro da URL atual (ex.: /maquinas?id=PH-03 -> param('id') = 'PH-03'). */
export const param = nome =>
  typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get(nome);

/** Primeira letra maiúscula. */
export const capitalizar = texto => (texto ? texto[0].toUpperCase() + texto.slice(1) : '');
