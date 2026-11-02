"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import styles from "../components/TabelaAdmin.module.css";
import { chamarApi } from "../lib/adminApi";

export default function PaginaGestao() {
  return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>;
}

function Conteudo({ token }) {
  const [convites, setConvites] = useState([]);
  const [novo, setNovo] = useState({ nome: "", email: "", perfil: "PROFESSOR" });
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [loading, setLoading] = useState(false);

  const carregarConvites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await chamarApi("/pre-cadastros", token);
      setConvites(data.dados ?? data ?? []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { carregarConvites(); }, [carregarConvites]);

  async function criarConvite(e) {
    e.preventDefault();
    setErro("");
    try {
      const data = await chamarApi("/pre-cadastros", token, { method: "POST", body: JSON.stringify(novo) });
      setAviso(`Pré-cadastro criado. Código: ${data.codigo}`);
      setNovo({ nome: "", email: "", perfil: "PROFESSOR" });
      await carregarConvites();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function revogar(id) {
    if (!window.confirm("Revogar este pré-cadastro?")) return;
    try {
      await chamarApi(`/pre-cadastros/${id}`, token, { method: "DELETE" });
      await carregarConvites();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <>
      <header className={styles.cabecalhoPagina}>
        <div>
          <h2>Pré-cadastros</h2>
          <p>Gere códigos de convite para novos professores e técnicos.</p>
        </div>
        <button className={styles.botaoSecundario} onClick={carregarConvites}>Atualizar</button>
      </header>

      {erro && <p className={styles.erro} role="alert">{erro}</p>}
      {aviso && <p className={styles.estado}>{aviso}</p>}

      <section className={styles.painel} style={{ padding: 16, marginBottom: 14 }}>
        <h3 className={styles.subTitulo}>Criar pré-cadastro de staff</h3>
        <form onSubmit={criarConvite}>
          <div className={styles.formGrid}>
            <label className={styles.formField}>
              Nome
              <input required minLength="3" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
            </label>
            <label className={styles.formField}>
              E-mail
              <input required type="email" value={novo.email} onChange={(e) => setNovo({ ...novo, email: e.target.value })} />
            </label>
            <label className={styles.formField}>
              Perfil
              <select value={novo.perfil} onChange={(e) => setNovo({ ...novo, perfil: e.target.value })}>
                <option value="PROFESSOR">Professor</option>
                <option value="TECNICO">Técnico</option>
              </select>
            </label>
          </div>
          <div className={styles.modalAcoes}>
            <button className={styles.botao}>Gerar código</button>
          </div>
        </form>
      </section>

      <section className={styles.painel}>
        <table className={styles.tabela}>
          <thead>
            <tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Código</th><th>Status</th><th>Ação</th></tr>
          </thead>
          <tbody>
            {convites.map((c) => (
              <tr key={c.id}>
                <td>{c.nome}</td>
                <td>{c.email}</td>
                <td>{c.perfil}</td>
                <td><code>{c.codigo}</code></td>
                <td>{c.utilizada ? "Ativado" : "Pendente"}</td>
                <td>{!c.utilizada && <button className={styles.botaoSecundario} onClick={() => revogar(c.id)}>Revogar</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className={styles.estado}>Carregando pré-cadastros…</p>}
        {!loading && convites.length === 0 && <p className={styles.estado}>Nenhum pré-cadastro encontrado.</p>}
      </section>
    </>
  );
}
