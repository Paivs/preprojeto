// Nome e turma abaixo são fictícios e usados apenas como mock.
// Dados fictícios; serão substituídos pela sessão quando a integração existir.
export const sessaoAluno = {
  nome: "Miguel Cantarino",
  turma: "Automação Industrial — Turma 3B",
  tokenExemplo: "482193",
  entradaEm: "13:02",
  acessosMes: 7,
  fimDaAula: "2026-11-13T16:30:00-03:00",
};

export const progressoSemestre = { concluidas: 4, total: 6 };

export const aulaHoje = {
  tema: "Controle de atuadores pneumáticos com CLP",
  professor: "Carlos Mendes",
};

export const episObrigatorios = [
  "Óculos de proteção",
  "Calçado fechado",
  "Sem adornos metálicos",
];

export const equipamentosSessao = [
  {
    id: "PAT-204",
    tipo: "Bancada didática",
    nome: "Bancada 04 — Siemens S7-1200",
    detalhe: "CLP · IHM KTP700 · Fonte 24V",
    icone: "caixa",
    detalhes: {
      alimentacao: "24V DC / 2A",
      ultimaInspecao: "13/11/2026 às 13:10 — sem avarias",
      seguranca: "NR-12 · parada de emergência no painel frontal",
    },
  },
  {
    id: "MOD-PN-12",
    tipo: "Componente didático",
    nome: "Módulo de Atuadores Pneumáticos",
    detalhe: "4 cilindros · Válvulas 5/2",
    icone: "lista",
    detalhes: {
      alimentacao: "6 bar nominal / 8 bar máximo",
      ultimaInspecao: "13/11/2026 às 13:15 — sem avarias",
      seguranca: "NR-12 · válvulas com bloqueio manual",
    },
  },
  {
    id: "COBOT-04",
    tipo: "Braço robótico / Cobot",
    nome: "Universal Robots UR5",
    detalhe: "6 eixos · Payload 5 kg",
    icone: "robo",
    detalhes: {
      alimentacao: "220V AC · controlador 16A",
      ultimaInspecao: "13/11/2026 às 12:50 — sem avarias",
      seguranca: "ISO 10218 · parada de emergência no teach pendant",
    },
  },
];
