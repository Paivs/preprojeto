"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import tabelaStyles from "../components/TabelaAdmin.module.css";
import styles from "./page.module.css";
import { chamarApi } from "../lib/adminApi";
import { formatarNumero } from "../lib/formatadores";

const hoje = new Date().toISOString().slice(0, 10);
const META_MTTR_HORAS = 5;
const LIMITE_SOBRECARGA = 85;
const TIPOS_RELATORIO = [
  { valor: "TODOS", rotulo: "Todos os indicadores" },
  { valor: "EQUIPAMENTOS", rotulo: "Equipamentos" },
  { valor: "CHAMADOS", rotulo: "Chamados" },
  { valor: "USO", rotulo: "Uso e ocupação" },
];

export default function PaginaRelatorios() {
  return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>;
}

function Conteudo({ token }) {
  const [relatorio, setRelatorio] = useState(null);
  const [periodoInicio, setPeriodoInicio] = useState(hoje.slice(0, 8) + "01");
  const [periodoFim, setPeriodoFim] = useState(hoje);
  const [tipo, setTipo] = useState("TODOS");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const carregarRelatorio = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      setRelatorio(await chamarApi(`/admin/relatorios?periodo_inicio=${periodoInicio}&periodo_fim=${periodoFim}`, token));
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, periodoInicio, periodoFim]);

  useEffect(() => {
    carregarRelatorio();
  }, [carregarRelatorio]);

  const mostrarEquipamentos = tipo === "TODOS" || tipo === "EQUIPAMENTOS";
  const mostrarChamados = tipo === "TODOS" || tipo === "CHAMADOS";
  const mostrarUso = tipo === "TODOS" || tipo === "USO";

  // "Eficiência Geral" não é uma métrica da API: é derivada aqui como a proporção
  // de equipamentos com status OPERACIONAL sobre o total retornado em equipamentos_por_status.
  const eficienciaGeral = useMemo(() => {
    const lista = relatorio?.equipamentos_por_status;
    if (!Array.isArray(lista) || lista.length === 0) return null;
    const total = lista.reduce((soma, item) => soma + Number(item.total ?? 0), 0);
    if (!total) return null;
    const operacionais = lista.find((item) => String(item.status).toUpperCase() === "OPERACIONAL");
    if (!operacionais) return null;
    return (Number(operacionais.total ?? 0) / total) * 100;
  }, [relatorio]);

  const dentroDaMeta = relatorio?.mttr_horas !== null && relatorio?.mttr_horas !== undefined && relatorio.mttr_horas <= META_MTTR_HORAS;

  function exportarCsv() {
    if (!relatorio) return;
    const linhas = [];
    linhas.push(["Relatório Tenken", `Período: ${relatorio.periodo?.inicio ?? "—"} a ${relatorio.periodo?.fim ?? "—"}`]);
    linhas.push([]);
    linhas.push(["MTTR (horas)", relatorio.mttr_horas ?? ""]);
    linhas.push(["Eficiência Geral (%)", eficienciaGeral === null ? "" : eficienciaGeral.toFixed(1)]);
    linhas.push([]);

    function bloco(titulo, rows, columns) {
      linhas.push([titulo]);
      linhas.push(columns.map(([label]) => label));
      (rows ?? []).forEach((row) => linhas.push(columns.map(([, key]) => row[key] ?? "")));
      linhas.push([]);
    }

    bloco("Equipamentos por status", relatorio.equipamentos_por_status, [["Status", "status"], ["Total", "total"]]);
    bloco("Ranking de falhas", relatorio.ranking_falhas, [["Equipamento", "equipamento_id"], ["Falhas", "total"]]);
    bloco("Ranking de uso", relatorio.ranking_uso, [["Equipamento", "equipamento_id"], ["Agendamentos", "total_agendamentos"]]);
    bloco("Taxa de ocupação", relatorio.taxa_ocupacao, [["Equipamento", "equipamento_id"], ["Horas reservadas", "horas_reservadas"], ["Ocupação (%)", "taxa_ocupacao_percentual"]]);

    const csv = linhas.map((linha) => linha.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-tenken-${periodoInicio}-a-${periodoFim}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function graficoBarras(titulo, rows, config) {
    if (!Array.isArray(rows)) return null;
    const maiorValor = rows.reduce((max, item) => Math.max(max, Number(item[config.chave] ?? 0)), 0) || 1;
    return (
      <section className={styles.cardGrafico}>
        <header className={styles.cabecalhoGrafico}>
          <h2>{titulo}</h2>
        </header>
        {rows.length === 0 ? (
          <p className={tabelaStyles.estado}>Sem registros no período.</p>
        ) : (
          <div className={styles.barras}>
            {rows.map((item, i) => {
              const valor = Number(item[config.chave] ?? 0);
              const percentual = Math.min(100, (valor / maiorValor) * 100);
              const sobrecarregado = config.limiteSobrecarga !== undefined && valor >= config.limiteSobrecarga;
              return (
                <div className={styles.linhaBarra} key={item.equipamento_id ?? item.status ?? i}>
                  <span className={styles.rotuloBarra}>{item[config.rotuloChave] ?? "—"}</span>
                  <div className={styles.trilhaBarra}>
                    <div
                      className={`${styles.preenchimentoBarra} ${sobrecarregado ? styles.preenchimentoAlerta : ""}`}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                  <span className={styles.valorBarra}>
                    {config.formatarValor ? config.formatarValor(valor) : formatarNumero(valor)}
                    {sobrecarregado && <span className={styles.tagSobrecarga}>Sobrecarga</span>}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <table className={tabelaStyles.tabela}>
          <thead>
            <tr>
              {config.colunas.map(([label]) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, i) => (
                <tr key={row.id ?? row.equipamento_id ?? row.status ?? i}>
                  {config.colunas.map(([label, key]) => (
                    <td key={key}>{row[key] ?? "—"}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={config.colunas.length}>Sem registros no período.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    );
  }

  return (
    <>
      <header className={tabelaStyles.cabecalhoPagina}>
        <div>
          <h2>Relatórios e indicadores</h2>
          <p>Indicadores agregados de equipamentos, chamados e uso.</p>
        </div>
        <div className={styles.acoesExportar}>
          <button className={tabelaStyles.botaoSecundario} onClick={carregarRelatorio}>
            Atualizar
          </button>
          <button className={tabelaStyles.botao} onClick={exportarCsv} disabled={!relatorio}>
            Exportar CSV
          </button>
          <button className={tabelaStyles.botaoSecundario} disabled title="Em breve">
            Exportar PDF
          </button>
        </div>
      </header>

      {erro && (
        <p className={tabelaStyles.erro} role="alert">
          {erro}
        </p>
      )}

      <div className={tabelaStyles.barraFerramentas}>
        <label className={tabelaStyles.formField}>
          Período · De
          <input className={tabelaStyles.campo} type="date" value={periodoInicio} onChange={(e) => setPeriodoInicio(e.target.value)} />
        </label>
        <label className={tabelaStyles.formField}>
          Até
          <input className={tabelaStyles.campo} type="date" value={periodoFim} onChange={(e) => setPeriodoFim(e.target.value)} />
        </label>
        <label className={tabelaStyles.formField}>
          Tipo
          <select className={tabelaStyles.seletor} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS_RELATORIO.map((item) => (
              <option key={item.valor} value={item.valor}>
                {item.rotulo}
              </option>
            ))}
          </select>
        </label>
        <span className={tabelaStyles.status}>
          Período retornado: {relatorio?.periodo?.inicio ?? "—"} a {relatorio?.periodo?.fim ?? "—"}
        </span>
      </div>

      {loading && <p className={tabelaStyles.estado}>Carregando relatórios…</p>}

      {relatorio && (
        <>
          <div className={styles.cardsKpi}>
            <div className={styles.cardKpi}>
              <span className={styles.rotuloKpi}>Tempo Médio para Conserto (MTTR)</span>
              <strong className={styles.valorKpi}>
                {relatorio.mttr_horas === null || relatorio.mttr_horas === undefined ? "Sem dados" : `${relatorio.mttr_horas}h`}
              </strong>
              <div className={styles.rodapeKpi}>
                <span className={dentroDaMeta ? styles.tagMetaOk : styles.tagMetaFora}>
                  {relatorio.mttr_horas === null || relatorio.mttr_horas === undefined ? "Sem dados suficientes" : dentroDaMeta ? "Dentro da meta" : "Fora da meta"}
                </span>
                <span className={styles.metaReferencia}>Meta máxima: {META_MTTR_HORAS}h</span>
              </div>
            </div>
            <div className={styles.cardKpi}>
              <span className={styles.rotuloKpi}>Eficiência Geral</span>
              <strong className={styles.valorKpi}>{eficienciaGeral === null ? "Indisponível" : `${eficienciaGeral.toFixed(1)}%`}</strong>
              <div className={styles.rodapeKpi}>
                <span className={styles.metaReferencia}>
                  {eficienciaGeral === null ? "Sem status OPERACIONAL na amostra" : "Equipamentos operacionais / total"}
                </span>
              </div>
            </div>
          </div>

          {mostrarEquipamentos &&
            graficoBarras("Status Geral de Equipamentos", relatorio.equipamentos_por_status, {
              chave: "total",
              rotuloChave: "status",
              colunas: [["Status", "status"], ["Total", "total"]],
            })}

          {mostrarChamados &&
            graficoBarras("Falhas por Equipamento", relatorio.ranking_falhas, {
              chave: "total",
              rotuloChave: "equipamento_id",
              colunas: [["Equipamento", "equipamento_id"], ["Falhas", "total"]],
            })}

          {mostrarUso &&
            graficoBarras("Uso por Equipamento", relatorio.ranking_uso, {
              chave: "total_agendamentos",
              rotuloChave: "equipamento_id",
              colunas: [["Equipamento", "equipamento_id"], ["Agendamentos", "total_agendamentos"]],
            })}

          {mostrarUso &&
            graficoBarras("Taxa de Ocupação por Equipamento", relatorio.taxa_ocupacao, {
              chave: "taxa_ocupacao_percentual",
              rotuloChave: "equipamento_id",
              limiteSobrecarga: LIMITE_SOBRECARGA,
              formatarValor: (v) => `${v}%`,
              colunas: [["Equipamento", "equipamento_id"], ["Horas reservadas", "horas_reservadas"], ["Ocupação (%)", "taxa_ocupacao_percentual"]],
            })}
        </>
      )}
    </>
  );
}
