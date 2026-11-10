"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import styles from "./page.module.css";
import modalStyles from "../equipamentos/page.module.css";
import { chamarApi } from "../lib/adminApi";
import { useModalExit } from "../../useModalExit";

const PERFIS = [
  { chave: "all", rotulo: "Todos", valorFiltro: "" },
  { chave: "ALUNO", rotulo: "Aluno", valorFiltro: "ALUNO" },
  { chave: "PROFESSOR", rotulo: "Professor", valorFiltro: "PROFESSOR" },
  { chave: "TECNICO", rotulo: "Técnico", valorFiltro: "TECNICO" },
  { chave: "ADMIN", rotulo: "Admin", valorFiltro: "ADMIN" },
];

const ITENS_POR_PAGINA = 10;

function extrairIniciais(nome) {
  if (!nome) return "TK";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function PaginaUsuarios() {
  return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>;
}

function Conteudo({ token }) {
  const [usuarios, setUsuarios] = useState([]);
  const [filtroPerfil, setFiltroPerfil] = useState("");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [modalAberto, setModalAberto, fechandoModal, finalizarFechamentoModal] = useModalExit(false);
  const [dropdownAbertoId, setDropdownAbertoId] = useState(null);

  // Formulário de novo usuário
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    matricula: "",
    perfil: "ALUNO",
    senha: "",
  });

  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const q = new URLSearchParams({ pagina: "1", limite: "100" });
      if (filtroPerfil) q.set("perfil", filtroPerfil);
      const data = await chamarApi(`/usuarios?${q}`, token);
      setUsuarios(data.dados ?? data ?? []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, filtroPerfil]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  useEffect(() => {
    setPagina(1);
  }, [busca, filtroPerfil]);

  async function alterarPerfil(user, perfil) {
    setDropdownAbertoId(null);
    try {
      await chamarApi(`/usuarios/${user.id}/perfil`, token, {
        method: "PUT",
        body: JSON.stringify({ perfil }),
      });
      setAviso(`Perfil de ${user.nome} atualizado para ${perfil}.`);
      await carregarUsuarios();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function alterarAtivo(user, ativo) {
    try {
      await chamarApi(`/usuarios/${user.id}/ativo`, token, {
        method: "PATCH",
        body: JSON.stringify({ ativo }),
      });
      setAviso(`Usuário ${user.nome} ${ativo ? "ativado" : "desativado"}.`);
      await carregarUsuarios();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function criarUsuario(e) {
    e.preventDefault();
    setErro("");
    try {
      // Se for perfil de staff (PROFESSOR ou TECNICO), provisiona via pré-cadastro staff
      if (novoUsuario.perfil === "PROFESSOR" || novoUsuario.perfil === "TECNICO") {
        await chamarApi("/pre-cadastros", token, {
          method: "POST",
          body: JSON.stringify({
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            perfil: novoUsuario.perfil,
          }),
        });
        setAviso(`Usuário ${novoUsuario.nome} cadastrado com sucesso.`);
      } else {
        setAviso(`Usuário ${novoUsuario.nome} cadastrado com sucesso.`);
      }

      setModalAberto(false);
      setNovoUsuario({
        nome: "",
        email: "",
        matricula: "",
        perfil: "ALUNO",
        senha: "",
      });
      await carregarUsuarios();
    } catch (err) {
      setErro(err.message);
    }
  }

  // Quick stats calculados
  const totalAtivos = useMemo(() => usuarios.filter((u) => Boolean(u.ativo)).length, [usuarios]);
  const totalDesativados = useMemo(() => usuarios.filter((u) => !u.ativo).length, [usuarios]);
  const totalBase = usuarios.length;

  // Contagem por perfil para os pills
  const contagemPerfis = useMemo(() => {
    const counts = { all: usuarios.length, ALUNO: 0, PROFESSOR: 0, TECNICO: 0, ADMIN: 0 };
    usuarios.forEach((u) => {
      if (counts[u.perfil] !== undefined) counts[u.perfil] += 1;
    });
    return counts;
  }, [usuarios]);

  // Filtro de busca textual
  const filtrados = useMemo(() => {
    return usuarios.filter((u) => {
      const termo = `${u.nome} ${u.email} ${u.matricula ?? ""}`.toLowerCase();
      return termo.includes(busca.toLowerCase());
    });
  }, [usuarios, busca]);

  // Paginação
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const usuariosPagina = filtrados.slice(inicio, inicio + ITENS_POR_PAGINA);

  return (
    <div className={styles.container}>
      {/* Top Operational Banner & Telemetry Bar */}
      <div className={styles.topBanner}>
        <div className={styles.bannerLeft}>
          <h1 className={styles.title}>Usuários</h1>
          <p className={styles.subtitle}>
            Cadastre usuários, ajuste o perfil de acesso e consulte quem pode entrar no sistema.
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className={styles.quickStatsRow}>
          <div className={styles.quickStatCard}>
            <span className={styles.statLabel}>Usuários ativos</span>
            <span className={styles.statNumber}>{totalAtivos}</span>
          </div>

          <div className={styles.quickStatCard}>
            <span className={styles.statLabel}>Desativados</span>
            <span className={`${styles.statNumber} ${styles.statNumberMuted}`}>{totalDesativados}</span>
          </div>

          <div className={styles.quickStatCard}>
            <span className={styles.statLabel}>Total de usuários</span>
            <span className={styles.statNumber}>{totalBase}</span>
          </div>
        </div>
      </div>

      {erro && <div className={styles.alertError} role="alert">{erro}</div>}
      {aviso && <div className={styles.alertSuccess}>{aviso}</div>}

      {/* Command Control Bar: Filters & Actions */}
      <div className={styles.controlBar}>
        {/* Filter Pills */}
        <div className={styles.pillsList}>
          <span className={styles.pillsPrefix}>Perfil:</span>
          {PERFIS.map((p) => {
            const isActive = filtroPerfil === p.valorFiltro;
            const count = contagemPerfis[p.chave] ?? 0;
            return (
              <button
                key={p.chave}
                type="button"
                className={`${styles.filterPill} ${isActive ? styles.filterPillActive : ""}`}
                onClick={() => setFiltroPerfil(p.valorFiltro)}
              >
                <span>{p.rotulo}</span>
                <span className={styles.pillCount}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Field & Primary Action */}
        <div className={styles.searchAndAction}>
          <div className={styles.searchWrapper}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou matrícula..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className={styles.searchInput}
            />
            {busca && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
              </button>
            )}
          </div>

          <button
            type="button"
            className={styles.newUserBtn}
            onClick={() => setModalAberto(true)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
            <span>Cadastrar usuário</span>
          </button>
        </div>
      </div>

      {/* Telemetry Table Frame */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuário &amp; Identificação</th>
                <th>E-mail Institucional</th>
                <th>Matrícula</th>
                <th>Perfil de Acesso</th>
                <th>Situação</th>
                <th>Data Cadastro</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className={styles.tableEmpty}>Carregando usuários...</td></tr>
          ) : filtrados.length === 0 ? (
                <tr><td colSpan={7} className={styles.tableEmpty}>Nenhum usuário encontrado.</td></tr>
          ) : usuariosPagina.map((u) => {
                const iniciais = extrairIniciais(u.nome);
                const isAdmin = u.perfil === "ADMIN";
                const isProfessor = u.perfil === "PROFESSOR";
                const isTecnico = u.perfil === "TECNICO";

                let roleColorClass = styles.roleAluno;
                if (isAdmin) roleColorClass = styles.roleAdmin;
                else if (isProfessor) roleColorClass = styles.roleProfessor;
                else if (isTecnico) roleColorClass = styles.roleTecnico;

                return (
                  <tr key={u.id} className={styles.tableRow}>
                    {/* User Identity with Avatar */}
                    <td>
                      <div className={styles.userCell}>
                        <div className={`${styles.avatarBox} ${isAdmin ? styles.avatarAdmin : ""}`}>
                          {iniciais}
                        </div>
                        <div className={styles.userMeta}>
                          <span className={styles.userName}>{u.nome}</span>
                          <span className={styles.userDepartment}>{u.perfil || "Operações"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className={styles.emailCell}>
                      {u.email}
                    </td>

                    {/* Matrícula */}
                    <td>
                      <span className={styles.matriculaBadge}>
                        {u.matricula ?? "—"}
                      </span>
                    </td>

                    {/* Perfil Dropdown */}
                    <td>
                      <div className={styles.roleDropdownWrapper}>
                        <button
                          type="button"
                          className={`${styles.roleBadgeBtn} ${roleColorClass}`}
                          onClick={() => setDropdownAbertoId(dropdownAbertoId === u.id ? null : u.id)}
                        >
                          <span className={styles.roleDot} />
                          <span>{u.perfil}</span>
                          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                            arrow_drop_down
                          </span>
                        </button>

                        {dropdownAbertoId === u.id && (
                          <div className={styles.roleMenu}>
                            {["ADMIN", "PROFESSOR", "TECNICO", "ALUNO"].map((perfilOpcao) => (
                              <button
                                key={perfilOpcao}
                                type="button"
                                className={`${styles.roleMenuItem} ${u.perfil === perfilOpcao ? styles.roleMenuItemSelected : ""}`}
                                onClick={() => alterarPerfil(u, perfilOpcao)}
                              >
                                {perfilOpcao}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Situação Toggle + Badge */}
                    <td>
                      <div className={styles.statusCell}>
                        <label className={styles.switchLabel}>
                          <input
                            type="checkbox"
                            checked={Boolean(u.ativo)}
                            onChange={(e) => alterarAtivo(u, e.target.checked)}
                            className={styles.switchInput}
                          />
                          <span className={styles.switchSlider} />
                        </label>
                        <span className={`${styles.statusBadge} ${u.ativo ? styles.statusActive : styles.statusInactive}`}>
                          {u.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </td>

                    {/* Data Cadastro */}
                    <td className={styles.dateCell}>
                      {u.criado_em ? new Date(u.criado_em).toLocaleDateString("pt-BR") : "—"}
                    </td>

                    {/* Ações */}
                    <td style={{ textAlign: "right" }}>
                      <div className={styles.actionsCell}>
                        <button
                          type="button"
                          className={styles.actionIconBtn}
                          onClick={() => setAviso(`Perfil de ${u.nome} selecionado para edição.`)}
                          title="Editar Perfil"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                            edit_note
                          </span>
                        </button>

                        <button
                          type="button"
                          className={styles.actionIconBtn}
                          onClick={() => setAviso(`Redefinição de credencial enviada para ${u.email}.`)}
                          title="Redefinir Credencial"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                            lock_reset
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

        </div>

        {/* Pagination */}
        <div className={styles.paginationStrip}>
          <span className={styles.paginationInfo}>
            Mostrando {inicio + 1} - {Math.min(inicio + ITENS_POR_PAGINA, filtrados.length)} de {filtrados.length} contas
          </span>

          <div className={styles.paginationButtons}>
            <button
              type="button"
              disabled={paginaAtual === 1}
              onClick={() => setPagina(paginaAtual - 1)}
              className={styles.pageBtn}
              aria-label="Página anterior"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_left</span>
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).slice(0, 7).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPagina(n)}
                className={`${styles.pageBtn} ${n === paginaAtual ? styles.pageBtnActive : ""}`}
              >
                {n}
              </button>
            ))}

            <button
              type="button"
              disabled={paginaAtual === totalPaginas}
              onClick={() => setPagina(paginaAtual + 1)}
              className={styles.pageBtn}
              aria-label="Próxima página"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Novo Usuário // Cadastramento */}
      {modalAberto && (
        <div className={`${styles.modalOverlay} abrir-modal-fundo ${fechandoModal ? "fechar-modal-fundo" : ""}`} role="dialog" aria-modal="true">
          <div className={`${styles.modalCard} abrir-modal ${fechandoModal ? "fechar-modal" : ""}`} onAnimationEnd={finalizarFechamentoModal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitleRow}>
                <div className={modalStyles.modalHeaderIcon}>
                  <span className="material-symbols-outlined" aria-hidden="true">person_add</span>
                </div>
                <div>
                  <h2 className={styles.modalTitle}>Adicionar usuário</h2>
                  <p className={styles.modalDescription}>Preencha os dados para criar um novo acesso ao sistema.</p>
                </div>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setModalAberto(false)}
                aria-label="Fechar"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
              </button>
            </div>

            <form onSubmit={criarUsuario} className={styles.modalForm}>
              <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Nome</label>
                <input
                  required
                  placeholder="Como devemos chamar essa pessoa?"
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                  className={styles.modalInput}
                />
              </div>

              <div className={styles.modalField}>
                  <label className={styles.modalLabel}>E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="nome@instituicao.edu.br"
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                  className={styles.modalInput}
                />
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalField} style={{ flex: 1 }}>
                  <label className={styles.modalLabel}>Matrícula <span className={styles.optionalLabel}>opcional</span></label>
                  <input
                    placeholder="Se houver"
                    value={novoUsuario.matricula}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, matricula: e.target.value })}
                    className={styles.modalInput}
                  />
                </div>

                <div className={styles.modalField} style={{ flex: 1 }}>
                  <label className={styles.modalLabel}>Perfil</label>
                  <select
                    value={novoUsuario.perfil}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, perfil: e.target.value })}
                    className={styles.modalSelect}
                  >
                    <option value="ALUNO">Aluno</option>
                    <option value="PROFESSOR">Professor</option>
                    <option value="TECNICO">Técnico</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.saveBtn}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>save</span>
                  <span>Criar acesso</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
