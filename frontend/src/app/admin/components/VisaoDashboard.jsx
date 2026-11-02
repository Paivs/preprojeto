import { useMemo } from "react";
import CartaoMetrica from "./CartaoMetrica";
import PainelEquipamentos from "./PainelEquipamentos";
import PainelChamados from "./PainelChamados";
import { somarTotais, nomeItem, valorItem, formatarPercentual } from "../lib/formatadores";
import styles from "./VisaoDashboard.module.css";

const iconeEquipamento = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8" /></svg>
);
const iconeChamado = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M4 4h16v12H7l-3 3z" /></svg>
);
const iconeAlerta = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 3 2 20h20z" /><path d="M12 9v5" /><path d="M12 17h.01" /></svg>
);
const iconeEscudo = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></svg>
);
const iconeSync = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 1-15.3 6.4M3 12a9 9 0 0 1 15.3-6.4" /><path d="M21 3v6h-6M3 21v-6h6" /></svg>
);
const iconeRelogio = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
const iconeMovendo = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h13l-3-3m3 3-3 3" /></svg>
);
const iconeAviso = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3 2 20h20z" /><path d="M12 9v5" /><path d="M12 17h.01" /></svg>
);
const iconeVerificado = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>
);
const iconeRegra = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M4 4h16v4H4zM4 12h10M4 16h10M4 20h10" /></svg>
);

const SEVERIDADES = [
  { chave: "critica", nomes: ["CRITICA", "CRÍTICA"], rotulo: "Crítica", tom: "critica", dica: "Intervenção técnica imediata obrigatória." },
  { chave: "alta", nomes: ["ALTA"], rotulo: "Alta", tom: "alta", dica: "Resposta com prioridade em andamento." },
  { chave: "media", nomes: ["MEDIA", "MÉDIA"], rotulo: "Média", tom: "media", dica: "Fila de atendimento padrão." },
  { chave: "baixa", nomes: ["BAIXA"], rotulo: "Baixa", tom: "baixa", dica: "Manutenções preventivas e revisões periódicas." },
];

function normalizar(texto) {
  return String(texto ?? "").trim().toUpperCase();
}

export default function VisaoDashboard({ dashboard, loading, error, updatedAt, onRefresh }) {
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
    <>
      <div className={styles.cabecalho}>
        <div className={styles.cabecalhoTexto}>
          <div className={styles.selo}>
            <span className={styles.seloPonto} />
            <span>Centro de Operações • Módulo Principal</span>
          </div>
          <h2>Visão Geral</h2>
          <div className={styles.sincronizacao}>
            {iconeRelogio}
            <span className={styles.sincronizacaoRotulo}>Última sincronização do cluster:</span>
            <span className={styles.sincronizacaoValor}>
              {updatedAt ? updatedAt.toLocaleTimeString("pt-BR") : "aguardando"}
            </span>
          </div>
        </div>
        <button className={styles.botaoAtualizar} onClick={onRefresh} disabled={loading}>
          <span className={loading ? styles.iconeGirando : undefined}>{iconeSync}</span>
          {loading ? "Atualizando…" : "Atualizar Indicadores"}
        </button>
      </div>

      {error && <div className={styles.faixaErro} role="alert">{error}</div>}

      <div className={styles.cartoes}>
        <CartaoMetrica
          icone={iconeEquipamento}
          categoria="Infraestrutura"
          titulo="Total de Equipamentos"
          valor={equipamentos ? totalEquipamentos : "—"}
          unidade="unidades ativas"
          contexto={{ texto: "100% integrados ao banco" }}
        />
        <CartaoMetrica
          icone={iconeChamado}
          categoria="Manutenção"
          titulo="Total de Chamados"
          valor={chamados ? totalChamados : "—"}
          unidade="registrados"
          contexto={{
            icone: iconeMovendo,
            destaque: `${totalAbertos} abertos`,
            texto: `• ${totalConcluidos} concluídos`,
          }}
        />
        <CartaoMetrica
          icone={iconeAlerta}
          categoria="Nível de Risco"
          titulo="Equipamentos Críticos"
          valor={equipamentos ? criticos : "—"}
          unidade="equipamentos"
          critico
          badge={{ texto: "Alerta Crítico" }}
          contexto={{ icone: iconeAviso, destaque: `${pctCriticos} do parque`, texto: "em rota crítica" }}
        />
        <CartaoMetrica
          icone={iconeEscudo}
          categoria="Operação Padrão"
          titulo="Equipamentos Não Críticos"
          valor={equipamentos ? naoCriticos : "—"}
          unidade="equipamentos"
          badge={{ texto: "Padrão", tom: "neutro" }}
          contexto={{ icone: iconeVerificado, destaque: `${pctNaoCriticos} estáveis`, texto: "sem interrupções" }}
        />
      </div>

      <section className={styles.painelSeveridade}>
        <div className={styles.severidadeCabecalho}>
          <div className={styles.severidadeTitulo}>
            <div className={styles.severidadeTituloLinha}>
              <span className={styles.seloPonto} />
              <h3>Chamados Abertos por Severidade</h3>
            </div>
            <p>Distribuição de chamados pendentes classificados por impacto operacional.</p>
          </div>
          <div className={styles.volumeAberto}>
            <span className={styles.volumeRotulo}>Volume Ativo em Aberto</span>
            <span className={styles.volumeValor}>
              {totalAbertos} <small>chamados</small>
            </span>
          </div>
        </div>

        <div className={styles.barraSegmentada}>
          {SEVERIDADES.map((def) => {
            const valor = severidadePorChave.get(def.chave) ?? 0;
            const pct = severidadeTotal ? (valor / severidadeTotal) * 100 : 0;
            return (
              <div
                key={def.chave}
                className={`${styles.segmento} ${styles["segmento_" + def.tom]}`}
                style={{ width: `${pct}%` }}
                title={`${def.rotulo}: ${valor} chamados (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        <div className={styles.miniCartoes}>
          {SEVERIDADES.map((def) => {
            const valor = severidadePorChave.get(def.chave) ?? 0;
            const pct = severidadeTotal ? formatarPercentual(valor, severidadeTotal) : "0%";
            return (
              <div key={def.chave} className={`${styles.miniCartao} ${styles["miniCartao_" + def.tom]}`}>
                <div className={styles.miniCartaoTopo}>
                  <span className={`${styles.miniPonto} ${styles["ponto_" + def.tom]}`} />
                  <span className={`${styles.miniRotulo} ${styles["texto_" + def.tom]}`}>{def.rotulo}</span>
                </div>
                <div className={styles.miniValorLinha}>
                  <strong className={styles["texto_" + def.tom]}>{valor}</strong>
                  <span>chamados ativos</span>
                </div>
                <div className={styles.miniImpacto}>Impacto: {pct}</div>
                <div className={styles.miniBarraFundo}>
                  <div className={`${styles.miniBarraPreenchida} ${styles["fundo_" + def.tom]}`} style={{ width: pct }} />
                </div>
                <div className={styles.miniDica}>
                  <span className={styles["texto_" + def.tom]}>⚑</span>
                  <span>{def.dica}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.diretriz}>
          <div className={styles.diretrizTexto}>
            <span className={styles.diretrizIcone}>{iconeRegra}</span>
            <div>
              <strong>Diretriz de prioridade por severidade</strong>
              <span>Chamados críticos têm prioridade máxima de atendimento.</span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.paineis}>
        <PainelEquipamentos total={equipamentos?.total} porStatus={equipamentos?.por_status} carregando={semDados} />
        <PainelChamados porStatus={chamados?.por_status} porSeveridade={chamados?.por_severidade_em_aberto} carregando={semDados} />
      </div>

      <footer className={styles.rodape}>
        <span>Endpoint: GET /admin/dashboard</span>
      </footer>
    </>
  );
}
