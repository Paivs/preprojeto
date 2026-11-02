import CartaoMetrica from "./CartaoMetrica";
import PainelEquipamentos from "./PainelEquipamentos";
import PainelChamados from "./PainelChamados";
import { somarTotais } from "../lib/formatadores";
import styles from "./VisaoDashboard.module.css";

const iconeEquipamento = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8" /></svg>
);
const iconeChamado = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M4 4h16v12H7l-3 3z" /></svg>
);
const iconeAlerta = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 3 2 20h20z" /><path d="M12 9v5" /><path d="M12 17h.01" /></svg>
);
const iconeOcorrencia = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></svg>
);

export default function VisaoDashboard({ dashboard, loading, error, updatedAt, onRefresh }) {
  const equipamentos = dashboard?.equipamentos;
  const chamados = dashboard?.chamados;
  const ocorrencias = dashboard?.ocorrencias;
  const totalChamados = somarTotais(chamados?.por_status);
  const semDados = loading && !dashboard;

  return (
    <>
      <div className={styles.intro}>
        <div>
          <h2>Visão geral</h2>
          <p>Indicadores retornados pelo endpoint administrativo.</p>
        </div>
        <button className={styles.botaoAtualizar} onClick={onRefresh} disabled={loading}>
          {loading ? "Atualizando…" : "Atualizar dados"}
        </button>
      </div>

      {error && <div className={styles.faixaErro} role="alert">{error}</div>}

      <div className={styles.cartoes}>
        <CartaoMetrica icone={iconeEquipamento} rotulo="Equipamentos" valor={equipamentos?.total ?? "—"} descricao="Total cadastrado" />
        <CartaoMetrica icone={iconeChamado} rotulo="Chamados abertos" valor={totalChamados || "—"} descricao="Soma dos status retornados" />
        <CartaoMetrica icone={iconeAlerta} rotulo="Equipamentos críticos" valor={equipamentos?.criticos ?? "—"} descricao="Com chamados críticos" />
        <CartaoMetrica icone={iconeOcorrencia} rotulo="Ocorrências recentes" valor={ocorrencias?.ultimos_30_dias ?? "—"} descricao="Últimos 30 dias" />
      </div>

      <div className={styles.paineis}>
        <PainelEquipamentos total={equipamentos?.total} porStatus={equipamentos?.por_status} carregando={semDados} />
        <PainelChamados porStatus={chamados?.por_status} porSeveridade={chamados?.por_severidade_em_aberto} carregando={semDados} />
      </div>

      <footer className={styles.rodape}>
        <span>Última atualização: {updatedAt ? updatedAt.toLocaleTimeString("pt-BR") : "aguardando"}</span>
        <span>Endpoint: GET /admin/dashboard</span>
      </footer>
    </>
  );
}
