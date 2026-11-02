"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "../components/AdminLayout";
import styles from "../components/TabelaAdmin.module.css";
import { chamarApi } from "../lib/adminApi";

const perfis = ["ALUNO", "PROFESSOR", "TECNICO", "ADMIN"];
const ITENS_POR_PAGINA = 10;

export default function PaginaUsuarios() {
  return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>;
}

function Conteudo({ token }) {
  const [usuarios, setUsuarios] = useState([]);
  const [filtroPerfil, setFiltroPerfil] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(1);

  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const q = new URLSearchParams({ pagina: "1", limite: "100" });
      if (filtroPerfil) q.set("perfil", filtroPerfil);
      const data = await chamarApi(`/usuarios?${q}`, token);
      setUsuarios(data.dados ?? data ?? []);
      setPagina(1);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, filtroPerfil]);

  useEffect(() => { carregarUsuarios(); }, [carregarUsuarios]);

  async function alterarPerfil(user, perfil) {
    try {
      await chamarApi(`/usuarios/${user.id}/perfil`, token, { method: "PUT", body: JSON.stringify({ perfil }) });
      await carregarUsuarios();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function alterarAtivo(user, ativo) {
    try {
      await chamarApi(`/usuarios/${user.id}/ativo`, token, { method: "PATCH", body: JSON.stringify({ ativo }) });
      await carregarUsuarios();
    } catch (e) {
      setErro(e.message);
    }
  }

  const totalAtivos = useMemo(() => usuarios.filter((u) => Boolean(u.ativo)).length, [usuarios]);
  const totalDesativados = useMemo(() => usuarios.filter((u) => !u.ativo).length, [usuarios]);
  const totalBase = usuarios.length;

  const totalPaginas = Math.max(1, Math.ceil(usuarios.length / ITENS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const inicio = (paginaSegura - 1) * ITENS_POR_PAGINA;
  const usuariosPagina = usuarios.slice(inicio, inicio + ITENS_POR_PAGINA);

  return (
    <>
      <header className={styles.cabecalhoPagina}>
        <div>
          <h2>Gestão de Usuários</h2>
          <p>Contas de alunos, professores, técnicos e administradores.</p>
        </div>
        <div className={styles.acoes}>
          <button className={styles.botaoSecundario} onClick={carregarUsuarios}>Atualizar</button>
          <Link className={styles.botao} href="/admin/gestao">Novo Usuário</Link>
        </div>
      </header>

      {erro && <p className={styles.erro} role="alert">{erro}</p>}

      <div className={styles.metricas}>
        <div className={styles.metricaCard}>
          <span className={styles.metricaRotulo}>Total Ativos</span>
          <strong className={styles.metricaValor}>{totalAtivos}</strong>
        </div>
        <div className={styles.metricaCard}>
          <span className={styles.metricaRotulo}>Desativados</span>
          <strong className={styles.metricaValor}>{totalDesativados}</strong>
        </div>
        <div className={styles.metricaCard}>
          <span className={styles.metricaRotulo}>Base Registrada</span>
          <strong className={styles.metricaValor}>{totalBase}</strong>
        </div>
      </div>

      <div className={styles.barraFerramentas}>
        <label className={styles.chip}>
          Perfil:
          <select className={styles.seletor} value={filtroPerfil} onChange={(e) => setFiltroPerfil(e.target.value)}>
            <option value="">Todos</option>
            {perfis.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
      </div>

      <section className={styles.painel}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Usuário &amp; Identificação</th>
              <th>E-mail Institucional</th>
              <th>Matrícula</th>
              <th>Perfil de Acesso</th>
              <th>Situação</th>
              <th>Data Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosPagina.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.nome}</strong>
                  <br />
                  <small className={styles.subtexto}>{u.perfil}</small>
                </td>
                <td>{u.email}</td>
                <td>{u.matricula ?? "—"}</td>
                <td>
                  <select className={styles.seletor} value={u.perfil} onChange={(e) => alterarPerfil(u, e.target.value)}>
                    {perfis.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </td>
                <td>
                  <span className={`${styles.status} ${u.ativo ? styles.statusAtivo : ""}`}>
                    {u.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td>{u.criado_em ? new Date(u.criado_em).toLocaleDateString("pt-BR") : "—"}</td>
                <td>
                  <button className={styles.botaoSecundario} onClick={() => alterarAtivo(u, !Boolean(u.ativo))}>
                    {u.ativo ? "Desativar" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className={styles.estado}>Carregando usuários…</p>}
        {!loading && usuarios.length === 0 && <p className={styles.estado}>Nenhum registro encontrado.</p>}
      </section>

      {usuarios.length > 0 && (
        <div className={styles.paginacao}>
          <span>
            Mostrando {inicio + 1}-{Math.min(inicio + ITENS_POR_PAGINA, usuarios.length)} de {usuarios.length} usuários
          </span>
          <div className={styles.paginacaoBotoes}>
            <button className={styles.botaoSecundario} disabled={paginaSegura === 1} onClick={() => setPagina(1)}>«</button>
            <button className={styles.botaoSecundario} disabled={paginaSegura === 1} onClick={() => setPagina((p) => p - 1)}>‹</button>
            <span className={styles.paginaAtual}>{paginaSegura} / {totalPaginas}</span>
            <button className={styles.botaoSecundario} disabled={paginaSegura === totalPaginas} onClick={() => setPagina((p) => p + 1)}>›</button>
            <button className={styles.botaoSecundario} disabled={paginaSegura === totalPaginas} onClick={() => setPagina(totalPaginas)}>»</button>
          </div>
        </div>
      )}
    </>
  );
}
