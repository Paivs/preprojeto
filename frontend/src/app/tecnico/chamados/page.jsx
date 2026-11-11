"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import styles from "./page.module.css";
import EmptyState from "@/components/EmptyState";

const STATUS = [
  ["ABERTO", "Aberto"],
  ["EM_ATENDIMENTO", "Em atendimento"],
  ["AGUARDANDO_PECAS", "Aguardando peças"],
  ["CONCLUIDO", "Concluído"],
  ["CANCELADO", "Cancelado"],
];
const SEVERIDADES = [["CRITICA", "Crítica"], ["ALTA", "Alta"], ["MEDIA", "Média"], ["BAIXA", "Baixa"]];
const ROTULO_STATUS = Object.fromEntries(STATUS);
const ROTULO_SEVERIDADE = Object.fromEntries(SEVERIDADES);

function formatarData(valor) {
  if (!valor) return "Data não informada";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "Data não informada" : data.toLocaleDateString("pt-BR");
}

export default function PaginaChamadosTecnico() {
  const [chamados, setChamados] = useState([]);
  const [status, setStatus] = useState("");
  const [severidade, setSeveridade] = useState("");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);
  const [aviso, setAviso] = useState("");
  const [historico, setHistorico] = useState([]);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [salvandoRegistro, setSalvandoRegistro] = useState(false);
  const [descricaoServico, setDescricaoServico] = useState("");
  const [pecasTrocadas, setPecasTrocadas] = useState("");
  const [custoServico, setCustoServico] = useState("0");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const params = new URLSearchParams({ pagina: "1", limite: "100" });
      if (status) params.set("status", status);
      if (severidade) params.set("severidade", severidade);
      const resposta = await apiFetch(`/api/ordens-servico?${params}`);
      const ordens = Array.isArray(resposta?.dados) ? resposta.dados : [];
      setChamados(ordens.map((ordem) => ({
        ...ordem,
        os_id: ordem.id,
        os_numero: ordem.numero,
        os_status: ordem.status,
        id: ordem.chamado_id,
        status: ordem.chamado_status,
      })));
    } catch (error) {
      setErro(error.message || "Não foi possível carregar os chamados.");
    } finally {
      setCarregando(false);
    }
  }, [status, severidade]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    const intervalo = window.setInterval(carregar, 30000);
    return () => window.clearInterval(intervalo);
  }, [carregar]);

  function abrirDetalhes(chamado) {
    setChamadoSelecionado(chamado);
    setHistorico([]);
    setMostrarHistorico(false);
    setErro("");
    setAviso("");
    setDescricaoServico("");
    setPecasTrocadas("");
    setCustoServico("0");
  }

  async function atualizarStatus(novoStatus) {
    if (!chamadoSelecionado || atualizandoStatus) return;
    setAtualizandoStatus(true);
    setErro("");
    setAviso("");
    try {
      const resposta = await apiFetch(`/api/chamados/${chamadoSelecionado.id}/status`, {
        method: "PATCH",
        body: { status: novoStatus },
      });
      const chamadoAtualizado = resposta?.dados ?? { ...chamadoSelecionado, status: novoStatus };
      setChamadoSelecionado((atual) => ({ ...atual, ...chamadoAtualizado }));
      setChamados((atuais) => atuais.map((chamado) =>
        chamado.id === chamadoAtualizado.id ? { ...chamado, ...chamadoAtualizado } : chamado,
      ));
      setAviso("Status do chamado atualizado.");
    } catch (error) {
      setErro(error.message || "Não foi possível atualizar o chamado.");
    } finally {
      setAtualizandoStatus(false);
    }
  }

  async function carregarHistorico() {
    if (!chamadoSelecionado) return;
    setCarregandoHistorico(true);
    setErro("");
    try {
      const resposta = await apiFetch(`/api/chamados/${chamadoSelecionado.id}/historico`);
      setHistorico(Array.isArray(resposta?.dados) ? resposta.dados : []);
      setMostrarHistorico(true);
    } catch (error) {
      setErro(error.message || "Não foi possível carregar o histórico.");
    } finally {
      setCarregandoHistorico(false);
    }
  }

  async function registrarServico(evento) {
    evento.preventDefault();
    if (!chamadoSelecionado || !descricaoServico.trim() || salvandoRegistro) return;
    setSalvandoRegistro(true);
    setErro("");
    setAviso("");
    try {
      await apiFetch(`/api/chamados/${chamadoSelecionado.id}/historico`, {
        method: "POST",
        body: {
          descricao: descricaoServico.trim(),
          pecas_trocadas: pecasTrocadas.trim(),
          custo: Number(custoServico),
        },
      });
      setDescricaoServico("");
      setPecasTrocadas("");
      setCustoServico("0");
      setAviso("Serviço registrado no histórico.");
      await carregarHistorico();
    } catch (error) {
      setErro(error.message || "Não foi possível registrar o serviço.");
    } finally {
      setSalvandoRegistro(false);
    }
  }

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return chamados;
    return chamados.filter((chamado) =>
      [chamado.id, chamado.titulo, chamado.descricao, chamado.equipamento_id, chamado.tipo]
        .some((valor) => String(valor ?? "").toLocaleLowerCase("pt-BR").includes(termo)),
    );
  }, [busca, chamados]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.sobretitulo}>Atendimento técnico</p>
          <h1 className={styles.titulo}>Ordens de Serviço</h1>
          <p className={styles.descricao}>Consulte as ordens de serviços atribuídos a você e acompanhe suas prioridades.</p>
        </div>
        <button type="button" className={styles.atualizar} onClick={carregar} disabled={carregando}>
          <span className={`material-symbols-outlined ${carregando ? styles.girando : ""}`}>sync</span>
          {carregando ? "Atualizando" : "Atualizar"}
        </button>
      </header>

      <section className={styles.filtros} aria-label="Filtros dos chamados">
        <label className={styles.busca}>
          <span className="material-symbols-outlined" aria-hidden="true">search</span>
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar chamado, equipamento ou descrição" />
        </label>
        <label className={styles.filtro}>
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos</option>
            {STATUS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className={styles.filtro}>
          <span>Prioridade</span>
          <select value={severidade} onChange={(e) => setSeveridade(e.target.value)}>
            <option value="">Todas</option>
            {SEVERIDADES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </section>

      {erro && !chamadoSelecionado && <p className={styles.erro} role="alert">{erro}</p>}
      {aviso && !chamadoSelecionado && <p className={styles.aviso} role="status">{aviso}</p>}
      <p className={styles.contagem}>{carregando ? "Carregando chamados…" : `${filtrados.length} chamados encontrados`}</p>

      {!carregando && !erro && filtrados.length === 0 && (
        <EmptyState
          icone="inbox"
          titulo={chamados.length ? "Nenhum resultado para esses filtros" : "Nenhuma OS recebida"}
          mensagem={chamados.length ? "Tente alterar a busca ou os filtros." : "Ordens de serviço emitidas pelo administrador para seus chamados aparecerão aqui."}
        />
      )}

      <section className={styles.lista} aria-label="Lista de chamados">
        {filtrados.map((chamado) => {
          const prioridade = String(chamado.severidade || "").toUpperCase();
          const statusAtual = String(chamado.status || "").toUpperCase();
          return (
            <article className={styles.cartao} key={chamado.os_id}>
              <div className={styles.cartaoTopo}>
                <span className={`${styles.prioridade} ${styles[`prioridade_${prioridade.toLowerCase()}`] || ""}`}>
                  {ROTULO_SEVERIDADE[prioridade] || "Prioridade não informada"}
                </span>
                <span className={`${styles.status} ${styles[`status_${statusAtual.toLowerCase()}`] || ""}`}>
                  {chamado.os_numero || `OS #${chamado.os_id}`} · {chamado.os_status}
                </span>
              </div>
              <h2 className={styles.tituloChamado}>{chamado.titulo || `Chamado #${chamado.id}`}</h2>
              <p className={styles.resumo}>{chamado.descricao || "Sem descrição informada."}</p>
              <div className={styles.detalhes}>
                <span><strong>Chamado</strong> #{String(chamado.id).padStart(4, "0")}</span>
                <span><strong>Equipamento</strong> {chamado.equipamento_nome || (chamado.equipamento_id ? `#${chamado.equipamento_id}` : "Não informado")}</span>
                <span><strong>Aberto em</strong> {formatarData(chamado.aberto_em)}</span>
              </div>
              <button type="button" className={styles.botaoDetalhes} onClick={() => abrirDetalhes(chamado)}>
                Ver detalhes
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </button>
            </article>
          );
        })}
      </section>

      {chamadoSelecionado && (
        <div
          className={styles.modalFundo}
          role="presentation"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) setChamadoSelecionado(null);
          }}
        >
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-detalhes-chamado">
            <header className={styles.modalCabecalho}>
              <div>
                <p className={styles.sobretitulo}>{chamadoSelecionado.os_numero || `OS #${chamadoSelecionado.os_id}`} · Chamado #{String(chamadoSelecionado.id).padStart(4, "0")}</p>
                <h2 className={styles.modalTitulo} id="titulo-detalhes-chamado">
                  {chamadoSelecionado.titulo || `Chamado #${chamadoSelecionado.id}`}
                </h2>
              </div>
              <button type="button" className={styles.fecharModal} onClick={() => setChamadoSelecionado(null)} aria-label="Fechar detalhes">
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </header>
            {erro && <p className={styles.erro} role="alert">{erro}</p>}
            {aviso && <p className={styles.aviso} role="status">{aviso}</p>}
            <div className={styles.modalEtiquetas}>
              <span className={`${styles.prioridade} ${styles[`prioridade_${String(chamadoSelecionado.severidade || "").toLowerCase()}`] || ""}`}>
                {ROTULO_SEVERIDADE[chamadoSelecionado.severidade] || "Prioridade não informada"}
              </span>
              <span className={`${styles.status} ${styles[`status_${String(chamadoSelecionado.status || "").toLowerCase()}`] || ""}`}>
                {ROTULO_STATUS[chamadoSelecionado.status] || chamadoSelecionado.status}
              </span>
            </div>
            <dl className={styles.modalDados}>
              <div>
                <dt>Ordem de serviço</dt>
                <dd>{chamadoSelecionado.os_numero || `OS #${chamadoSelecionado.os_id}`} · {chamadoSelecionado.os_status}</dd>
              </div>
              <div>
                <dt>Equipamento</dt>
                <dd>{chamadoSelecionado.equipamento_nome || `Equipamento #${chamadoSelecionado.equipamento_id}`}</dd>
              </div>
              <div>
                <dt>Tipo de manutenção</dt>
                <dd>{chamadoSelecionado.tipo === "PREVENTIVO" ? "Preventiva" : "Corretiva"}</dd>
              </div>
              <div>
                <dt>Aberto em</dt>
                <dd>{formatarData(chamadoSelecionado.aberto_em)}</dd>
              </div>
            </dl>
            <div className={styles.modalDescricao}>
              <h3>Descrição</h3>
              <p>{chamadoSelecionado.descricao || "Sem descrição informada."}</p>
            </div>
            <section className={styles.secaoHistorico}>
              <div className={styles.tituloSecaoHistorico}>
                <h3>Histórico de manutenção</h3>
                <button type="button" className={styles.botaoSecundario} onClick={carregarHistorico} disabled={carregandoHistorico}>
                  {carregandoHistorico ? "Carregando..." : mostrarHistorico ? "Atualizar histórico" : "Ver histórico"}
                </button>
              </div>
              {mostrarHistorico && (
                <div className={styles.listaHistorico}>
                  {historico.length ? historico.map((registro) => (
                    <article className={styles.itemHistorico} key={registro.id}>
                      <p>{registro.descricao}</p>
                      <span>{registro.registrado_em ? new Date(registro.registrado_em).toLocaleString("pt-BR") : "Data não informada"}</span>
                      {registro.pecas_trocadas && <small>Peças: {registro.pecas_trocadas}</small>}
                      {Number(registro.custo) > 0 && <small>Custo: {Number(registro.custo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</small>}
                    </article>
                  )) : <p className={styles.historicoVazio}>Ainda não há serviços registrados.</p>}
                </div>
              )}
              <form className={styles.formularioServico} onSubmit={registrarServico}>
                <h4>Registrar serviço realizado</h4>
                <label>
                  Descrição do serviço
                  <textarea value={descricaoServico} onChange={(evento) => setDescricaoServico(evento.target.value)} required rows={3} />
                </label>
                <label>
                  Peças trocadas (opcional)
                  <input value={pecasTrocadas} onChange={(evento) => setPecasTrocadas(evento.target.value)} />
                </label>
                <label>
                  Custo (R$)
                  <input type="number" min="0" step="0.01" value={custoServico} onChange={(evento) => setCustoServico(evento.target.value)} />
                </label>
                <button type="submit" className={styles.botaoAcao} disabled={salvandoRegistro || !descricaoServico.trim()}>
                  {salvandoRegistro ? "Salvando..." : "Salvar registro"}
                </button>
              </form>
            </section>
            {chamadoSelecionado.status === "ABERTO" && (
              <div className={styles.modalAcoes}>
                <button type="button" className={styles.botaoAcao} onClick={() => atualizarStatus("EM_ATENDIMENTO")} disabled={atualizandoStatus}>
                  {atualizandoStatus ? "Atualizando..." : "Iniciar atendimento"}
                </button>
              </div>
            )}
            {chamadoSelecionado.status === "EM_ATENDIMENTO" && (
              <div className={styles.modalAcoes}>
                <button type="button" className={styles.botaoAcao} onClick={() => atualizarStatus("AGUARDANDO_PECAS")} disabled={atualizandoStatus}>
                  {atualizandoStatus ? "Atualizando..." : "Aguardar peças"}
                </button>
              </div>
            )}
            {chamadoSelecionado.status === "AGUARDANDO_PECAS" && (
              <div className={styles.modalAcoes}>
                <button type="button" className={styles.botaoAcao} onClick={() => atualizarStatus("EM_ATENDIMENTO")} disabled={atualizandoStatus}>
                  {atualizandoStatus ? "Atualizando..." : "Retomar atendimento"}
                </button>
              </div>
            )}
            {chamadoSelecionado.status === "EM_ATENDIMENTO" && mostrarHistorico && historico.length > 0 && (
              <div className={styles.modalAcoes}>
                <button type="button" className={styles.botaoAcao} onClick={() => atualizarStatus("CONCLUIDO")} disabled={atualizandoStatus}>
                  {atualizandoStatus ? "Concluindo..." : "Concluir chamado"}
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
