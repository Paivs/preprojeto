"use client";

import { useEffect, useMemo, useState } from "react";
import CartaoMetrica from "./CartaoMetrica";
import PainelEquipamentos from "./PainelEquipamentos";
import PainelChamados from "./PainelChamados";
import { somarTotais, nomeItem, valorItem, formatarPercentual } from "../lib/formatadores";
import { dataPorExtenso, saudacaoPorHorario } from "@/lib/saudacao";
import styles from "./VisaoDashboard.module.css";

const SEVERIDADES = [
  { chave: "critica", nomes: ["CRITICA", "CRÍTICA"], rotulo: "Crítica", tom: "critica", icone: "warning", dica: "Atenda este chamado primeiro." },
  { chave: "alta", nomes: ["ALTA"], rotulo: "Alta", tom: "alta", icone: "schedule", dica: "Atenda assim que possível." },
  { chave: "media", nomes: ["MEDIA", "MÉDIA"], rotulo: "Média", tom: "media", icone: "build", dica: "Atendimento dentro do fluxo normal." },
  { chave: "baixa", nomes: ["BAIXA"], rotulo: "Baixa", tom: "baixa", icone: "checklist", dica: "Pode ser atendido após os demais." },
];

function normalizar(texto) {
  return String(texto ?? "").trim().toUpperCase();
}

export default function VisaoDashboard({ usuario, dashboard, loading, error, updatedAt, onRefresh }) {
  const [dataAtual, setDataAtual] = useState(null);
  useEffect(() => setDataAtual(new Date()), []);
  const primeiroNome = usuario?.nome?.trim().split(/\s+/)[0] || "administrador";
  const equipamentos = dashboard?.equipamentos;
  const chamados = dashboard?.chamados;
  const semDados = loading && !dashboard;

  const totalEquipamentos = equipamentos?.total ?? 0;
  const criticos = equipamentos?.criticos ?? 0;
  const naoCriticos = Math.max(totalEquipamentos - criticos, 0);
  const pctCriticos = totalEquipamentos ? formatarPercentual(criticos, totalEquipamentos) : "0%";
  const pctNaoCriticos = totalEquipamentos ? formatarPercentual(naoCriticos, totalEquipamentos) : "0%";

  const totalChamados = somarTotais(chamados?.por_status);
  const totalAbertos = somarTotais(chamados?.por_severidade_em_aberto);
  const totalConcluidos = Math.max(totalChamados - totalAbertos, 0);

  const severidadePorChave = useMemo(() => {
    const itens = Array.isArray(chamados?.por_severidade_em_aberto) ? chamados.por_severidade_em_aberto : [];
    const mapa = new Map();
    itens.forEach((item, index) => {
      const nome = normalizar(nomeItem(item, index));
      const def = SEVERIDADES.find((s) => s.nomes.includes(nome));
      if (def) mapa.set(def.chave, valorItem(item));
    });
    return mapa;
  }, [chamados]);

  const severidadeTotal = Array.from(severidadePorChave.values()).reduce((a, b) => a + b, 0);

  return (
    <div className={styles.container}>
      {/* Top Header Bar */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {dataAtual ? <p className={styles.dataHoje}>{dataPorExtenso(dataAtual)}</p> : null}
          <h1 className={styles.pageTitle}>{dataAtual ? `${saudacaoPorHorario(dataAtual)}, ${primeiroNome}.` : "Visão geral"}</h1>
          <div className={styles.syncRow}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--silver)" }}>schedule</span>
            <span className={styles.syncLabel}>Dados atualizados:</span>
            <span className={styles.syncValue}>
              {updatedAt ? updatedAt.toLocaleTimeString("pt-BR") : "Aguardando dados"}
            </span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={onRefresh}
            disabled={loading}
          >
            <span className={`material-symbols-outlined ${loading ? styles.refreshIconSpinning : ""}`} style={{ fontSize: "18px" }}>
              sync
            </span>
            <span>{loading ? "Atualizando..." : "Atualizar resumo"}</span>
          </button>
        </div>
      </div>

      {error && <div className={styles.errorBanner} role="alert">{error}</div>}

      {/* 4 Bento Metrics Strip */}
      <div className={styles.metricsGrid}>
        <CartaoMetrica
          icone={<span className="material-symbols-outlined" style={{ fontSize: "22px" }}>developer_board</span>}
          categoria="Equipamentos"
          titulo="Total cadastrado"
          valor={equipamentos ? totalEquipamentos : "—"}
          unidade="unidades ativas"
          contexto={{
            texto: "No sistema",
          }}
        />

        <CartaoMetrica
          icone={<span className="material-symbols-outlined" style={{ fontSize: "22px" }}>confirmation_number</span>}
          categoria="Atendimento"
          titulo="Total de chamados"
          valor={chamados ? totalChamados : "—"}
          unidade="registrados"
          contexto={{
            icone: <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "var(--accent-tertiary)" }}>moving</span>,
            destaque: `${totalAbertos} abertos`,
            texto: `• ${totalConcluidos} concluídos`,
          }}
        />

        <CartaoMetrica
          icone={<span className="material-symbols-outlined" style={{ fontSize: "22px", color: "var(--mahogany-red-2)" }}>warning</span>}
          categoria="Nível de Risco"
          titulo="Equipamentos Críticos"
          valor={equipamentos ? criticos : "—"}
          unidade="equipamentos"
          critico
          badge={{ texto: "Alerta Crítico" }}
          contexto={{
            icone: <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#ffb4ac" }}>warning</span>,
            destaque: pctCriticos,
            texto: "dos equipamentos cadastrados",
          }}
        />

        <CartaoMetrica
          icone={<span className="material-symbols-outlined" style={{ fontSize: "22px", color: "var(--accent-tertiary)" }}>verified</span>}
          categoria="Equipamentos"
          titulo="Demais equipamentos"
          valor={equipamentos ? naoCriticos : "—"}
          unidade="equipamentos"
          badge={{ texto: "Padrão", tom: "neutro" }}
          contexto={{
            icone: <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "var(--accent-tertiary)" }}>verified</span>,
            destaque: `${pctNaoCriticos} estáveis`,
            texto: "sem prioridade crítica",
          }}
        />
      </div>

      {/* Chamados Abertos por Severidade */}
      <section className={styles.severitySection}>
        <div className={styles.severityHeader}>
          <div className={styles.severityTitleBlock}>
            <div className={styles.severityTitleRow}>
              <h3 className={styles.severityTitle}>Chamados Abertos por Severidade</h3>
            </div>
            <p className={styles.severitySubtitle}>Veja quantos chamados abertos há em cada nível de prioridade.</p>
          </div>

          <div className={styles.activeVolumeCard}>
            <span className={styles.volumeLabel}>Chamados abertos</span>
            <div className={styles.volumeNumberRow}>
              <span className={styles.volumeNumber}>{totalAbertos}</span>
              <span className={styles.volumeUnit}>no total</span>
            </div>
          </div>
        </div>

        {/* Segmented Distribution Bar */}
        <div className={styles.segmentedBar}>
          {SEVERIDADES.map((def) => {
            const valor = severidadePorChave.get(def.chave) ?? 0;
            const pct = severidadeTotal ? (valor / severidadeTotal) * 100 : 0;
            return (
              <div
                key={def.chave}
                className={`${styles.segment} ${styles[`segment_${def.tom}`]}`}
                style={{ width: `${pct}%` }}
                title={`${def.rotulo}: ${valor} chamados (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* 4 Mini Cards */}
        <div className={styles.miniCardsGrid}>
          {SEVERIDADES.map((def) => {
            const valor = severidadePorChave.get(def.chave) ?? 0;
            const pctNum = severidadeTotal ? (valor / severidadeTotal) * 100 : 0;
            const pctText = pctNum.toFixed(1) + "%";
            return (
              <div key={def.chave} className={`${styles.miniCard} ${styles[`miniCard_${def.tom}`]}`}>
                <div className={styles.miniCardTop}>
                  <span className={`${styles.miniLabel} ${styles[`text_${def.tom}`]}`}>{def.rotulo}</span>
                </div>

                <div className={styles.miniValueRow}>
                  <span className={`${styles.miniValue} ${styles[`text_${def.tom}`]}`}>{valor}</span>
                  <span className={styles.miniUnit}>chamados</span>
                </div>

                <div className={styles.miniImpactBlock}>
                  <div className={styles.miniImpactText}>{pctText} dos chamados abertos</div>
                  <div className={styles.miniTrack}>
                    <div
                      className={`${styles.miniFill} ${styles[`fill_${def.tom}`]}`}
                      style={{ width: `${pctNum}%` }}
                    />
                  </div>
                </div>

                <div className={styles.miniHintBox}>
                  <span className={`material-symbols-outlined ${styles[`text_${def.tom}`]}`} style={{ fontSize: "16px" }}>
                    {def.icone}
                  </span>
                  <span className={styles.miniHintText}>{def.dica}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Directive Footer Strip with MTTA Ticker */}
        <div className={styles.directiveFooter}>
          <div className={styles.directiveLeft}>
            <div className={styles.directiveIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>rule</span>
            </div>
            <div className={styles.directiveText}>
              <span className={styles.directiveTitle}>Ordem de atendimento</span>
              <span className={styles.directiveSub}>Comece pelos chamados de prioridade crítica.</span>
            </div>
          </div>

          <div className={styles.directiveRight}>
            <span className={styles.mttaPulse} />
            <span className={styles.mttaText}>Acompanhe os chamados abertos e suas prioridades.</span>
          </div>
        </div>
      </section>

      {/* Distribution Panels */}
      <div className={styles.panelsRow}>
        <PainelEquipamentos
          total={equipamentos?.total}
          porStatus={equipamentos?.por_status}
          carregando={semDados}
        />
        <PainelChamados
          porStatus={chamados?.por_status}
          porSeveridade={chamados?.por_severidade_em_aberto}
          carregando={semDados}
        />
      </div>
    </div>
  );
}
