// Nome e turma abaixo são fictícios e usados apenas como mock.
// Dados ficticios; serao substituidos pela sessao quando a integracao existir.
export const sessaoAluno = {
  nome: "Miguel Cantarino",
  turma: "Automação Industrial  Turma 3B",
  tokenExemplo: "482193",
  entradaEm: "13:02",
  acessosMes: 7,
  fimDaAula: "2026-11-12T16:30:00-03:00",
};

export const progressoSemestre = { concluidas: 4, total: 6 };

export const aulaHoje = {
  tema: "Controle de atuadores pneum\u00e1ticos com CLP",
  professor: "Carlos Mendes",
};

export const episObrigatorios = [
  "\u00d3culos de prote\u00e7\u00e3o",
  "Cal\u00e7ado fechado",
  "Sem adornos met\u00e1licos",
];

export const equipamentosSessao = [
  {
    id: "PAT-204",
    tipo: "Bancada didática",
    nome: "Bancada 04  Siemens S7-1200",
    detalhe: "CLP  IHM KTP700  Fonte 24V",
    icone: "caixa",
    detalhes: {
      alimentacao: "24V DC",
      ultimaInspecao: "Hoje \u00e0s 13:10, sem avarias",
      seguranca: "Parada de emerg\u00eancia no painel frontal",
    },
  },
  {
    id: "MOD-PN-12",
    tipo: "Componente didático",
    nome: "Módulo de Atuadores Pneumáticos",
    detalhe: "4 cilindros  Válvulas 5/2",
    icone: "lista",
    detalhes: {
      alimentacao: "24V DC",
      ultimaInspecao: "Hoje às 13:15, sem avarias",
      seguranca: "Válvulas com bloqueio manual",
    },
  },
  {
    id: "COBOT-04",
    tipo: "Braço robótico / Cobot",
    nome: "Universal Robots UR5",
    detalhe: "6 eixos  Payload 5 kg",
    icone: "robo",
    detalhes: {
      alimentacao: "220V AC no controlador",
      ultimaInspecao: "Hoje às 12:50, sem avarias",
      seguranca: "Parada de emergência no teach pendant",
    },
  },
];
