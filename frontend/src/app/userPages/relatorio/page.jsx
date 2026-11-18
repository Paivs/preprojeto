"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import "./relatorio.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarConsumo(valor) {
  return `${Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh`;
}

export default function Relatorios() {
  const [setores, setSetores] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [setorSelecionado, setSetorSelecionado] = useState("todos");
  const [busca, setBusca] = useState("");
  const [ordemAsc, setOrdemAsc] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
      const headers = { Authorization: `Bearer ${token}` };
      const [respostaSetores, respostaEquipamentos] = await Promise.all([
        fetch(`${API_URL}/api/setores`, { headers }),
        fetch(`${API_URL}/api/equipamentos`, { headers }),
      ]);
      const [resultadoSetores, resultadoEquipamentos] = await Promise.all([
        respostaSetores.json(), respostaEquipamentos.json(),
      ]);
      if (!respostaSetores.ok || !resultadoSetores.sucesso) {
        throw new Error(resultadoSetores.erro || "Não foi possível carregar os setores.");
      }
      if (!respostaEquipamentos.ok || !resultadoEquipamentos.sucesso) {
        throw new Error(resultadoEquipamentos.erro || "Não foi possível carregar os equipamentos.");
      }
      setSetores(resultadoSetores.dados);
      setEquipamentos(resultadoEquipamentos.dados);
    } catch (error) {
      setErro(error.message || "Não foi possível carregar os dados do relatório.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const linhas = useMemo(() => setores
    .filter((setor) => setorSelecionado === "todos" || String(setor.id_setor) === setorSelecionado)
    .map((setor) => {
      const dispositivos = equipamentos.filter((equipamento) => Number(equipamento.id_setor) === Number(setor.id_setor));
      return {
        ...setor,
        consumo_geral: Number(setor.consumo_geral || 0),
        custo: Number(setor.custo || 0),
        quantidade: dispositivos.length,
        nomesEquipamentos: dispositivos.map((item) => item.nome_equipamento).join(", "),
      };
    })
    .filter((item) => `${item.nome_setor} ${item.nomesEquipamentos}`.toLowerCase().includes(busca.trim().toLowerCase()))
    .sort((a, b) => ordemAsc ? a.consumo_geral - b.consumo_geral : b.consumo_geral - a.consumo_geral),
  [setores, equipamentos, setorSelecionado, busca, ordemAsc]);

  const totais = useMemo(() => linhas.reduce((soma, item) => ({
    consumo: soma.consumo + item.consumo_geral,
    custo: soma.custo + item.custo,
    dispositivos: soma.dispositivos + item.quantidade,
  }), { consumo: 0, custo: 0, dispositivos: 0 }), [linhas]);

  function exportarCsv() {
    const cabecalho = ["Setor", "Equipamentos", "Quantidade de equipamentos", "Consumo acumulado (kWh)", "Custo acumulado (R$)"];
    const conteudo = [cabecalho, ...linhas.map((item) => [item.nome_setor, item.nomesEquipamentos, item.quantidade, item.consumo_geral.toFixed(2), item.custo.toFixed(2)])]
      .map((linha) => linha.map((celula) => `"${String(celula).replaceAll('"', '""')}"`).join(";"))
      .join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", conteudo], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-de-consumo.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const maiorConsumo = Math.max(...linhas.map((item) => item.consumo_geral), 0);

  return (
    <div className="pagina">
      <Sidebar />
      <div className="conteudo-principal">
        <Header />
        <main className="conteudo-pagina relatorios-pagina">
          <div className="relatorios-cabecalho">
            <div>
              <span className="cabecalho-etiqueta">DESEMPENHO / RELATÓRIOS</span>
              <h1>Consumo por setor</h1>
              <p>Acompanhe os dados acumulados registrados nos seus setores.</p>
            </div>
            <button type="button" className="btn relatorio-exportar" onClick={exportarCsv} disabled={carregando || Boolean(erro)}>
              <i className="bi bi-download" aria-hidden="true" /> Exportar relatório
            </button>
          </div>

          {erro && <div className="relatorio-mensagem erro" role="alert">{erro}<button type="button" onClick={carregarDados}>Tentar novamente</button></div>}

          <section className="relatorio-resumo" aria-label="Resumo do consumo">
            <article><span>Consumo acumulado</span><strong>{formatarConsumo(totais.consumo)}</strong></article>
            <article><span>Custo acumulado</span><strong>{formatarMoeda(totais.custo)}</strong></article>
            <article><span>Equipamentos</span><strong>{totais.dispositivos.toLocaleString("pt-BR")}</strong></article>
          </section>

          <section className="relatorio-painel relatorio-grafico" aria-labelledby="grafico-titulo">
            <div className="relatorio-painel-topo">
              <div><h2 id="grafico-titulo">Consumo acumulado por setor</h2><p>Comparação com base nos valores cadastrados em cada setor.</p></div>
            </div>
            {carregando ? <p className="relatorio-estado">Carregando relatório...</p>
              : !linhas.length ? <p className="relatorio-estado">Nenhum setor encontrado para os filtros selecionados.</p>
                : <div className="relatorio-barras">{linhas.map((item) => (
                  <div className="relatorio-barra-linha" key={item.id_setor}>
                    <span title={item.nome_setor}>{item.nome_setor}</span>
                    <div className="relatorio-barra-fundo"><div style={{ width: `${maiorConsumo ? (item.consumo_geral / maiorConsumo) * 100 : 0}%` }} /></div>
                    <strong>{formatarConsumo(item.consumo_geral)}</strong>
                  </div>
                ))}</div>}
          </section>

          <section className="relatorio-painel tabela-painel" aria-labelledby="tabela-titulo">
            <div className="relatorio-painel-topo tabela-topo">
              <div><h2 id="tabela-titulo">Detalhamento por setor</h2><p>Consumo, custo e equipamentos vinculados.</p></div>
              <div className="relatorio-controles">
                <label className="relatorio-filtro-setor"><span className="visually-hidden">Filtrar por setor</span>
                  <select value={setorSelecionado} onChange={(event) => setSetorSelecionado(event.target.value)}>
                    <option value="todos">Todos os setores</option>
                    {setores.map((item) => <option key={item.id_setor} value={String(item.id_setor)}>{item.nome_setor}</option>)}
                  </select>
                </label>
                <label className="relatorio-busca"><i className="bi bi-search" /><input type="search" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar setor ou equipamento" aria-label="Buscar setor ou equipamento" /></label>
              </div>
            </div>
            <div className="table-responsive relatorio-tabela-wrap">
              <table className="table relatorio-tabela">
                <thead><tr><th>Setor</th><th>Equipamentos</th><th><button type="button" className="relatorio-ordenar" onClick={() => setOrdemAsc((atual) => !atual)}>Consumo acumulado <i className={`bi ${ordemAsc ? "bi-sort-up" : "bi-sort-down"}`} /></button></th><th>Custo acumulado</th></tr></thead>
                <tbody>{linhas.map((item) => <tr key={item.id_setor}><td>{item.nome_setor}</td><td>{item.quantidade}</td><td>{formatarConsumo(item.consumo_geral)}</td><td>{formatarMoeda(item.custo)}</td></tr>)}
                  {!carregando && !erro && !linhas.length && <tr><td className="relatorio-vazio" colSpan="4">Nenhum registro encontrado para esses filtros.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="relatorio-nota">O sistema ainda não armazena medições históricas. Estes valores refletem os acumulados cadastrados atualmente por setor.</div>
          </section>
        </main>
      </div>
    </div>
  );
}
