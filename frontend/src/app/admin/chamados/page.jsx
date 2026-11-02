"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import styles from "../components/TabelaAdmin.module.css";
import { chamarApi } from "../lib/adminApi";

const STATUS = [
  "ABERTO",
  "EM_ATENDIMENTO",
  "AGUARDANDO_PECAS",
  "CONCLUIDO",
  "CANCELADO",
];
const SEVERIDADES = ["BAIXA", "MEDIA", "ALTA", "CRITICA"];

export default function PaginaChamados() {
  return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>;
}

function Conteudo({ token }) {
  const [itens, setItens] = useState([]);
  const [status, setStatus] = useState("");
  const [severidade, setSeveridade] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [historico, setHistorico] = useState({});
  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const q = new URLSearchParams({ pagina: "1", limite: "100" });
      if (status) q.set("status", status);
      if (severidade) q.set("severidade", severidade);
      const data = await chamarApi(`/chamados?${q}`, token);
      setItens(data.dados ?? data ?? []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, status, severidade]);
  useEffect(() => {
    carregar();
  }, [carregar]);
  async function atualizarStatus(item, value) {
    try {
      await chamarApi(`/chamados/${item.id}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({ status: value }),
      });
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }
  async function encaminhar(item) {
    const id = window.prompt("ID do usuário com perfil TECNICO:");
    if (!id) return;
    try {
      await chamarApi(`/chamados/${item.id}/tecnico`, token, {
        method: "PATCH",
        body: JSON.stringify({ tecnico_id: Number(id) }),
      });
      setAviso("Chamado encaminhado ao técnico.");
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }
  async function emitirOS(item) {
    try {
      const os = await chamarApi(`/chamados/${item.id}/ordem-servico`, token, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setAviso(`Ordem de serviço ${os.numero} emitida.`);
    } catch (e) {
      setErro(e.message);
    }
  }
  async function verHistorico(id) {
    try {
      const data = await chamarApi(`/chamados/${id}/historico`, token);
      setHistorico((atual) => ({ ...atual, [id]: data.dados ?? data ?? [] }));
    } catch (e) {
      setErro(e.message);
    }
  }
  async function adicionarHistorico(id) {
    const descricao = window.prompt("Descrição do registro de manutenção:");
    if (!descricao) return;
    try {
      await chamarApi(`/chamados/${id}/historico`, token, {
        method: "POST",
        body: JSON.stringify({ descricao }),
      });
      await verHistorico(id);
    } catch (e) {
      setErro(e.message);
    }
  }
  return (
    <>
      <header className={styles.cabecalhoPagina}>
        <div>
          <h2>Chamados e ordens de serviço</h2>
          <p>Acompanhe manutenção, status, técnico responsável e histórico.</p>
        </div>
        <button className={styles.botaoSecundario} onClick={carregar}>
          Atualizar
        </button>
      </header>
      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}
      {aviso && <p className={styles.estado}>{aviso}</p>}
      <div className={styles.barraFerramentas}>
        <select
          className={styles.seletor}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          {STATUS.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          className={styles.seletor}
          value={severidade}
          onChange={(e) => setSeveridade(e.target.value)}
        >
          <option value="">Todas as severidades</option>
          {SEVERIDADES.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <section className={styles.painel}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Chamado</th>
              <th>Equipamento</th>
              <th>Tipo / severidade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.titulo}</strong>
                  <br />
                  <small>
                    #{item.id} ·{" "}
                    {item.aberto_em
                      ? new Date(item.aberto_em).toLocaleDateString("pt-BR")
                      : "Data não informada"}
                  </small>
                </td>
                <td>{item.equipamento_nome || item.equipamento_id}</td>
                <td>
                  {item.tipo}
                  <br />
                  <span className={styles.status}>{item.severidade}</span>
                </td>
                <td>
                  <select
                    aria-label={`Status do chamado ${item.id}`}
                    className={styles.seletor}
                    value={item.status}
                    onChange={(e) => atualizarStatus(item, e.target.value)}
                  >
                    {STATUS.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className={styles.acoes}>
                    <button
                      className={styles.botaoSecundario}
                      onClick={() => encaminhar(item)}
                    >
                      Técnico
                    </button>
                    <button
                      className={styles.botaoSecundario}
                      onClick={() => emitirOS(item)}
                    >
                      Emitir OS
                    </button>
                    <button
                      className={styles.botaoSecundario}
                      onClick={() => verHistorico(item.id)}
                    >
                      Histórico
                    </button>
                    <button
                      className={styles.botaoSecundario}
                      onClick={() => adicionarHistorico(item.id)}
                    >
                      Registrar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading ? (
          <p className={styles.estado}>Carregando chamados…</p>
        ) : itens.length === 0 ? (
          <p className={styles.estado}>Nenhum chamado encontrado.</p>
        ) : null}
        <div className={styles.paginacao}>
          <span>{itens.length} chamado(s) retornado(s)</span>
          <span>GET /chamados</span>
        </div>
      </section>
      {Object.entries(historico).map(([id, registros]) => (
        <section
          className={styles.painel}
          style={{ marginTop: 12, padding: 14 }}
          key={id}
        >
          <strong>Histórico do chamado #{id}</strong>
          {registros.length ? (
            registros.map((r, i) => (
              <p key={r.id ?? i}>
                {r.descricao || r.acao || JSON.stringify(r)}{" "}
                <small>
                  {r.criado_em
                    ? new Date(r.criado_em).toLocaleString("pt-BR")
                    : ""}
                </small>
              </p>
            ))
          ) : (
            <p className={styles.estado}>Sem registros de histórico.</p>
          )}
        </section>
      ))}
    </>
  );
}
