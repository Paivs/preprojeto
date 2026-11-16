"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import "./relatorio.css";

const registros = [
  { data: "30/10/2026  18:30", setor: "Sala de estar", equipamento: "Ar-condicionado", consumo: 2.4, custo: 1.80, estado: "Normal" },
  { data: "30/10/2026  17:00", setor: "Cozinha", equipamento: "Geladeira", consumo: 1.2, custo: 0.90, estado: "Normal" },
  { data: "30/10/2026  15:30", setor: "Quarto principal", equipamento: "Lâmpadas LED", consumo: 0.6, custo: 0.45, estado: "Normal" },
  { data: "29/10/2026  20:00", setor: "Sala de estar", equipamento: "TV e entretenimento", consumo: 1.8, custo: 1.35, estado: "Normal" },
  { data: "29/10/2026  13:30", setor: "Lavanderia", equipamento: "Máquina de lavar", consumo: 3.1, custo: 2.33, estado: "Atenção" },
  { data: "28/10/2026  19:00", setor: "Cozinha", equipamento: "Forno elétrico", consumo: 2.7, custo: 2.03, estado: "Normal" },
  { data: "28/10/2026  11:00", setor: "Escritório", equipamento: "Computador", consumo: 1.1, custo: 0.83, estado: "Normal" },
];

const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const colunas = Array.from({ length: 30 }, (_, i) => i + 1);

function intensidade(dia, coluna) {
  const pico = coluna >= 10 && coluna <= 20 && dia >= 2 && dia <= 5;
  return (dia * 7 + coluna * 11) % 13 < (pico ? 11 : 6)
    ? Math.min(4, Math.floor(((dia * 3 + coluna * 5) % 15) / 3))
    : 0;
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Relatorios() {
  const [periodo, setPeriodo] = useState("30");
  const [setor, setSetor] = useState("Todos os setores");
  const [agrupamento, setAgrupamento] = useState("Dia a semana");
  const [filtrosAplicados, setFiltrosAplicados] = useState({ periodo: "30", setor: "Todos os setores", agrupamento: "Dia a semana" });
  const [busca, setBusca] = useState("");
  const [ordemAsc, setOrdemAsc] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  const linhas = useMemo(() => {
    return registros
      .filter((item) => filtrosAplicados.setor === "Todos os setores" || item.setor === filtrosAplicados.setor)
      .filter((item) => `${item.data} ${item.setor} ${item.equipamento}`.toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => ordemAsc ? a.consumo - b.consumo : b.consumo - a.consumo);
  }, [filtrosAplicados, busca, ordemAsc]);

  function exportarCsv() {
    const cabecalho = ["Data", "Setor", "Equipamento", "Consumo (kWh)", "Custo (R$)", "Status"];
    const conteudo = [cabecalho, ...linhas.map((r) => [r.data, r.setor, r.equipamento, r.consumo.toFixed(2), r.custo.toFixed(2), r.estado])]
      .map((linha) => linha.map((celula) => `"${String(celula).replaceAll('"', '""')}"`).join(";"))
      .join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", conteudo], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-de-consumo.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function aplicarFiltros(evento) {
    evento.preventDefault();
    setFiltrosAplicados({ periodo, setor, agrupamento });
    setDiaSelecionado(null);
  }

  return (
    <div className="pagina">
      <Sidebar />
      <div className="conteudo-principal">
        <Header />
        <main className="conteudo-pagina relatorios-pagina">
          <div className="relatorios-cabecalho">
            <div>
              <span className="cabecalho-etiqueta">DESEMPENHO / RELATÓRIOS</span>
              <h1>Dados que revelam oportunidades.</h1>
              <p>Entenda seus padrões e tome decisões com mais precisão.</p>
            </div>
            <button type="button" className="btn relatorio-exportar" onClick={exportarCsv}>
              <i className="bi bi-download" aria-hidden="true" /> Exportar relatório
            </button>
          </div>

          <form className="relatorio-filtros row g-3 align-items-end" onSubmit={aplicarFiltros}>
            <label className="col-12 col-md-6 col-xl-3">
              <span>Período</span>
              <select className="form-select" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                <option value="7">Últimos 7 dias</option><option value="30">01 out – 30 out, 2026</option><option value="90">Últimos 90 dias</option>
              </select>
            </label>
            <label className="col-12 col-md-6 col-xl-3">
              <span>Setor</span>
              <select className="form-select" value={setor} onChange={(e) => setSetor(e.target.value)}>
                {["Todos os setores", "Sala de estar", "Cozinha", "Quarto principal", "Lavanderia", "Escritório"].map((opcao) => <option key={opcao}>{opcao}</option>)}
              </select>
            </label>
            <label className="col-12 col-md-6 col-xl-3">
              <span>Agrupar por</span>
              <select className="form-select" value={agrupamento} onChange={(e) => setAgrupamento(e.target.value)}>
                <option>Dia a semana</option><option>Por dia</option><option>Por mês</option>
              </select>
            </label>
            <div className="col-12 col-md-6 col-xl-3">
              <button className="btn relatorio-aplicar w-100" type="submit">Aplicar filtros</button>
            </div>
          </form>

          <section className="relatorio-painel heatmap-painel" aria-labelledby="heatmap-titulo">
            <div className="relatorio-painel-topo">
              <div><h2 id="heatmap-titulo">Quando seu consumo é maior?</h2><p>Mapa de consumo por hora e dia da semana · Outubro de 2026</p></div>
              <span className="heatmap-aviso"><i className="bi bi-lightning-charge-fill" /> Pico de consumo: 16h às 21h</span>
            </div>
            <div className="heatmap-scroll">
              <div className="heatmap-grid" role="grid" aria-label="Mapa de calor do consumo de energia por dia">
                <span className="heatmap-vazio" />
                {colunas.map((coluna) => <span key={`h${coluna}`} className="heatmap-coluna-label">{coluna % 5 === 0 || coluna === 1 ? coluna : ""}</span>)}
                {diasSemana.map((dia, linha) => (
                  <div className="heatmap-linha" role="row" key={dia}>
                    <span className="heatmap-dia">{dia}</span>
                    {colunas.map((coluna) => {
                      const nivel = intensidade(linha, coluna);
                      const selecionado = diaSelecionado?.linha === linha && diaSelecionado?.coluna === coluna;
                      return <button type="button" key={coluna} className={`heatmap-celula nivel-${nivel}${selecionado ? " selecionada" : ""}`} aria-label={`${dia}, ${coluna} de outubro, consumo ${nivel + 1}`} aria-pressed={selecionado} onClick={() => setDiaSelecionado({ linha, coluna })} title={`${dia}, ${coluna} de outubro · ${nivel < 2 ? "baixo" : nivel < 4 ? "moderado" : "alto"}`} />;
                    })}
                  </div>
                ))}
              </div>
            </div>
            {diaSelecionado && <div className="heatmap-selecao"><i className="bi bi-calendar-check" /> {diasSemana[diaSelecionado.linha]}, {diaSelecionado.coluna} de outubro: <strong>{(2.1 + intensidade(diaSelecionado.linha, diaSelecionado.coluna) * 1.35).toFixed(1).replace(".", ",")} kWh</strong><button type="button" aria-label="Limpar seleção" onClick={() => setDiaSelecionado(null)}><i className="bi bi-x-lg" /></button></div>}
            <div className="heatmap-rodape"><span>Dados consolidados por hora.</span><div className="heatmap-legenda"><span>Menor consumo</span>{[0, 1, 2, 3, 4].map((nivel) => <i key={nivel} className={`heatmap-legenda-cor nivel-${nivel}`} />)}<span>Maior</span></div></div>
          </section>

          <section className="relatorio-painel tabela-painel" aria-labelledby="tabela-titulo">
            <div className="relatorio-painel-topo tabela-topo">
              <div><h2 id="tabela-titulo">Dados de consumo</h2><p>Registros detalhados por setor e equipamento</p></div>
              <label className="relatorio-busca"><i className="bi bi-search" /><input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar dados" aria-label="Buscar nos dados" /></label>
            </div>
            <div className="table-responsive relatorio-tabela-wrap">
              <table className="table relatorio-tabela">
                <thead><tr><th>Data / hora</th><th>Setor</th><th>Equipamento</th><th><button type="button" className="relatorio-ordenar" onClick={() => setOrdemAsc((asc) => !asc)}>Consumo <i className={`bi ${ordemAsc ? "bi-sort-up" : "bi-sort-down"}`} /></button></th><th>Custo</th><th>Status</th></tr></thead>
                <tbody>{linhas.map((item) => <tr key={`${item.data}-${item.equipamento}`}><td>{item.data}</td><td>{item.setor}</td><td>{item.equipamento}</td><td>{item.consumo.toFixed(2).replace(".", ",")} kWh</td><td>{formatarMoeda(item.custo)}</td><td><span className={`relatorio-status ${item.estado === "Atenção" ? "status-atencao" : ""}`}><i />{item.estado}</span></td></tr>)}
                  {!linhas.length && <tr><td className="relatorio-vazio" colSpan="6">Nenhum registro encontrado para esses filtros.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="tabela-rodape"><span>Exibindo {linhas.length} de {registros.length} registros</span><div className="tabela-paginacao"><button type="button" aria-label="Página anterior" disabled><i className="bi bi-chevron-left" /></button><button type="button" className="pagina-atual">1</button><button type="button">2</button><button type="button">3</button><span>…</span><button type="button">10</button><button type="button" aria-label="Próxima página"><i className="bi bi-chevron-right" /></button><select aria-label="Registros por página" defaultValue="10"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select></div></div>
            <div className="relatorio-nota">Valores de consumo representam uma estimativa baseada nos dados de dispositivos.</div>
          </section>
        </main>
      </div>
    </div>
  );
}
