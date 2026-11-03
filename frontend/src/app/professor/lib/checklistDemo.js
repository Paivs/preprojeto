const itensBancadaPre = [
  { id: "estrutura", texto: "Estrutura, cabos e conexões sem danos", critico: true },
  { id: "energia", texto: "Alimentação elétrica e botão de emergência funcionais", critico: true },
  { id: "componentes", texto: "Componentes e ferramentas presentes", critico: false },
  { id: "limpeza", texto: "Superfície limpa e área de trabalho organizada", critico: false },
];

const itensRoboPre = [
  { id: "celula", texto: "Proteções e portas da célula em bom estado", critico: true },
  { id: "emergencia", texto: "Botões de emergência acessíveis e funcionais", critico: true },
  { id: "cabos", texto: "Cabos e conexões sem danos aparentes", critico: true },
  { id: "ferramenta", texto: "Ferramenta e acessórios corretamente instalados", critico: false },
];

const itensPos = [
  { id: "desligamento", texto: "Equipamento desligado conforme procedimento", critico: true },
  { id: "integridade", texto: "Nenhum dano ou falha percebida durante o uso", critico: true },
  { id: "devolucao", texto: "Acessórios devolvidos e identificados", critico: false },
  { id: "organizacao", texto: "Área limpa e equipamento deixado organizado", critico: false },
];

export function obterChecklist(inspecao, equipamento) {
  const itens = inspecao.etapa === "POS_USO"
    ? itensPos
    : equipamento?.tipo === "ROBO" ? itensRoboPre : itensBancadaPre;
  return itens.map((item) => ({ ...item }));
}
