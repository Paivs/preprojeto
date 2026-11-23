export const CATEGORIAS = [
  "Iluminação",
  "Climatização",
  "Eletrodomésticos",
  "Servidores",
  "Outros",
];

export const ROTULO_ESTADO = {
  normal: "Normal",
  atencao: "Atenção",
  desligado: "Desligado",
};

export function adaptarEquipamentoApi(equipamento) {
  return {
    id: equipamento.id_equipamento,
    nome: equipamento.nome_equipamento,
    local: equipamento.nome_setor || "Setor não informado",
    categoria: equipamento.tipo || "Outros",
    grupo: (equipamento.nome_setor || "Sem setor").toLocaleUpperCase("pt-BR"),
    status: equipamento.status || "Não informado",
    consumoAtual:
      equipamento.consumo_atual === null || equipamento.consumo_atual === undefined
        ? null
        : Number(equipamento.consumo_atual),
    consumoAtualizadoEm: equipamento.consumo_atualizado_em || null,
    consumoMinimo:
      equipamento.consumo_minimo === null || equipamento.consumo_minimo === undefined
        ? null
        : Number(equipamento.consumo_minimo),
    consumoMaximo:
      equipamento.consumo_maximo === null || equipamento.consumo_maximo === undefined
        ? null
        : Number(equipamento.consumo_maximo),
  };
}

const NOMES_DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function gerarHistorico(base) {
  return Array.from({ length: 24 }, (_, i) => {
    const onda = Math.sin(i / 3) * 0.18 + (i / 24) * 0.25;
    return Number((base * (0.7 + onda)).toFixed(2));
  });
}

export const DISPOSITIVOS_EXEMPLO = [
  {
    id: 1,
    nome: "Ar-condicionado Setor A",
    local: "Bloco administrativo · 1º andar",
    categoria: "Climatização",
    grupo: "CLIMATIZAÇÃO",
    consumo: 12.4,
    ligado: true,
    conectado: true,
    alerta: "",
    atualizado: "Atualizado agora",
    historico: gerarHistorico(12.4),
    ultimaRevisao: "14 Jan, 2026",
    agendamento: {
      ativo: true,
      dias: [1, 2, 3, 4, 5],
      inicio: "08:00",
      fim: "18:00",
    },
  },
  {
    id: 2,
    nome: "Servidores",
    local: "Sala técnica · Rack Central",
    categoria: "Servidores",
    grupo: "INFRAESTRUTURA",
    consumo: 18.7,
    ligado: true,
    conectado: true,
    alerta: "+12% acima da média",
    atualizado: "Atualizado há 1 min",
    historico: gerarHistorico(18.7),
    ultimaRevisao: "02 Jun, 2026",
    agendamento: {
      ativo: true,
      dias: [0, 1, 2, 3, 4, 5, 6],
      inicio: "00:00",
      fim: "23:59",
    },
  },
  {
    id: 3,
    nome: "Cafeteira Industrial",
    local: "Copa · Térreo",
    categoria: "Eletrodomésticos",
    grupo: "COPA",
    consumo: 0,
    ligado: false,
    conectado: true,
    alerta: "",
    atualizado: "Atualizado há 12 min",
    historico: gerarHistorico(1.2),
    ultimaRevisao: "20 Mar, 2026",
    agendamento: {
      ativo: false,
      dias: [1, 2, 3, 4, 5],
      inicio: "07:00",
      fim: "10:00",
    },
  },
  {
    id: 4,
    nome: "Ar-condicionado Setor B",
    local: "Bloco operacional · Prédio",
    categoria: "Climatização",
    grupo: "CLIMATIZAÇÃO",
    consumo: 9.8,
    ligado: true,
    conectado: true,
    alerta: "",
    atualizado: "Atualizado agora",
    historico: gerarHistorico(9.8),
    ultimaRevisao: "08 Fev, 2026",
    agendamento: {
      ativo: true,
      dias: [1, 2, 3, 4, 5],
      inicio: "08:00",
      fim: "18:00",
    },
  },
  {
    id: 5,
    nome: "Iluminação do Galpão",
    local: "Galpão · Área de carga",
    categoria: "Iluminação",
    grupo: "ILUMINAÇÃO",
    consumo: 4.3,
    ligado: true,
    conectado: true,
    alerta: "",
    atualizado: "Atualizado há 2 min",
    historico: gerarHistorico(4.3),
    ultimaRevisao: "30 Abr, 2026",
    agendamento: {
      ativo: true,
      dias: [0, 1, 2, 3, 4, 5, 6],
      inicio: "18:00",
      fim: "06:00",
    },
  },
  {
    id: 6,
    nome: "Compressor de Ar",
    local: "Casa de máquinas",
    categoria: "Outros",
    grupo: "PRODUÇÃO",
    consumo: 0,
    ligado: false,
    conectado: false,
    alerta: "",
    atualizado: "Atualizado há 3 h",
    historico: gerarHistorico(6.5),
    ultimaRevisao: "11 Mai, 2026",
    agendamento: {
      ativo: false,
      dias: [1, 2, 3, 4, 5],
      inicio: "08:00",
      fim: "17:00",
    },
  },
];

export function novoDispositivo({ nome, categoria, local }) {
  return {
    id: Date.now(),
    nome,
    categoria,
    local,
    grupo: categoria.toUpperCase(),
    consumo: 0,
    ligado: false,
    conectado: true,
    alerta: "",
    atualizado: "Atualizado agora",
    historico: gerarHistorico(0),
    ultimaRevisao: "—",
    agendamento: {
      ativo: false,
      dias: [1, 2, 3, 4, 5],
      inicio: "08:00",
      fim: "18:00",
    },
  };
}

export function obterEstado(d) {
  const status = String(d.status || "").trim().toLocaleLowerCase("pt-BR");
  if (status.includes("alerta") || status.includes("atenção")) return "atencao";
  if (status.includes("inativo") || status.includes("desligado")) return "desligado";
  return "normal";
}

export function formatarFaixaConsumo(dispositivo) {
  const minimo = Number.isFinite(dispositivo.consumoMinimo)
    ? formatarKwh(dispositivo.consumoMinimo)
    : null;
  const maximo = Number.isFinite(dispositivo.consumoMaximo)
    ? formatarKwh(dispositivo.consumoMaximo)
    : null;

  if (minimo === null && maximo === null) return "Não informado";
  if (minimo === null) return `Máx. ${maximo}`;
  if (maximo === null) return `Mín. ${minimo}`;
  return `${minimo} – ${maximo}`;
}

export function formatarKwh(valor) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function resumoDias(dias) {
  if (dias.length === 7) return "Todos os dias";
  if (dias.length === 5 && [1, 2, 3, 4, 5].every((d) => dias.includes(d)))
    return "Segunda a sexta";
  if (dias.length === 0) return "Nenhum dia";
  return dias.map((d) => NOMES_DIAS[d]).join(", ");
}
