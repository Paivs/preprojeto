"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { API_BASE_URL } from "@/lib/api";
import { requisicaoAutenticada } from "@/lib/session";
import "./tabelaSetor.css";

const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
const formatarConsumo = (valor) =>
  `${Number(valor || 0).toLocaleString("pt-BR")} kWh`;
const ITENS_POR_PAGINA = 10;

export default function TabelaSetores() {
  const [setores, setSetores] = useState([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroExclusao, setErroExclusao] = useState("");
  const [excluindoId, setExcluindoId] = useState(null);
  const [setorPendenteExclusao, setSetorPendenteExclusao] = useState(null);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        const resposta = await requisicaoAutenticada(`${API_BASE_URL}/setores`, {
          cache: "no-store",
        });
        const resultado = await resposta.json().catch(() => ({}));
        if (!resposta.ok)
          throw new Error(
            resultado.erro || resultado.message || "Não foi possível carregar seus setores."
          );
        if (ativo)
          setSetores(Array.isArray(resultado.dados) ? resultado.dados : []);
      } catch (falha) {
        if (ativo) setErro(falha.message || "Não foi possível conectar à API.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    function atualizar() {
      setCarregando(true);
      setErro("");
      carregar();
    }
    carregar();
    window.addEventListener("setores:atualizar", atualizar);
    return () => {
      ativo = false;
      window.removeEventListener("setores:atualizar", atualizar);
    };
  }, []);

  useEffect(() => {
    if (!setorPendenteExclusao) return undefined;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function fecharComEscape(evento) {
      if (evento.key === "Escape" && excluindoId === null) {
        setSetorPendenteExclusao(null);
        setErroExclusao("");
      }
    }

    window.addEventListener("keydown", fecharComEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", fecharComEscape);
    };
  }, [excluindoId, setorPendenteExclusao]);

  async function excluirSetor() {
    const setor = setorPendenteExclusao;
    if (!setor) return;

    setExcluindoId(setor.id_setor);
    setErroExclusao("");
    try {
      const resposta = await requisicaoAutenticada(`${API_BASE_URL}/setores/${setor.id_setor}`, {
        method: "DELETE",
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok || !resultado.sucesso) {
        throw new Error(resultado.erro || resultado.message || "Não foi possível excluir o setor.");
      }

      setSetores((atuais) => atuais.filter((item) => item.id_setor !== setor.id_setor));
      setSetorPendenteExclusao(null);
    } catch (falha) {
      setErroExclusao(falha.message || "Não foi possível conectar à API.");
    } finally {
      setExcluindoId(null);
    }
  }

  const setoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return setores.filter((setor) =>
      `${setor.nome_setor} ${setor.descricao || ""}`
        .toLocaleLowerCase("pt-BR")
        .includes(termo)
    );
  }, [setores, busca]);

  const totalPaginas = Math.ceil(setoresFiltrados.length / ITENS_POR_PAGINA);
  const paginaAtual = Math.min(pagina, Math.max(totalPaginas, 1));
  const inicioPagina = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const fimPagina = Math.min(inicioPagina + ITENS_POR_PAGINA, setoresFiltrados.length);
  const setoresPaginados = setoresFiltrados.slice(
    inicioPagina,
    inicioPagina + ITENS_POR_PAGINA
  );

  return (
    <section className="tabela-setores">
      <header className="tabela-setores__topo">
        <div className="tabela-setores__titulo">
          <h2>Seus setores</h2>
          <p>
            {setores.length}{" "}
            {setores.length === 1 ? "setor cadastrado" : "setores cadastrados"}
          </p>
        </div>
        <div className="tabela-setores__busca">
          <input
            type="search"
            placeholder="Buscar setor..."
            aria-label="Buscar setor"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />
        </div>
      </header>
      <div className="tabela-setores__rolagem">
        <table>
          <thead>
            <tr>
              <th>Nome do setor</th>
              <th>Descrição</th>
              <th>Consumo global</th>
              <th>Custo energia</th>
              <th className="coluna-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan={5} className="setor-vazio">
                  Carregando setores...
                </td>
              </tr>
            ) : erro ? (
              <tr>
                <td colSpan={5} className="setor-vazio setor-erro">
                  {erro}
                </td>
              </tr>
            ) : setoresFiltrados.length ? (
              setoresPaginados.map((setor) => (
                <tr key={setor.id_setor}>
                  <td className="setor-nome">{setor.nome_setor}</td>
                  <td className="setor-descricao">
                    {setor.descricao || "Sem descrição"}
                  </td>
                  <td>{formatarConsumo(setor.consumo_geral)}</td>
                  <td>{formatarMoeda(setor.custo)}</td>
                  <td className="coluna-acoes">
                    <Link
                      className="setor-botao-visualizar"
                      href={`/userPages/setores/${setor.id_setor}`}
                    >
                      Visualizar{" "}
                      <i className="bi bi-arrow-right" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      className="btn-excluir"
                      onClick={() => {
                        setErroExclusao("");
                        setSetorPendenteExclusao(setor);
                      }}
                      disabled={excluindoId !== null}
                      aria-label={`Excluir setor ${setor.nome_setor}`}
                      title="Excluir setor"
                    >
                      <i
                        className={`bi ${excluindoId === setor.id_setor ? "bi-arrow-repeat" : "bi-trash"}`}
                        aria-hidden="true"
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="setor-vazio">
                  {setores.length
                    ? "Nenhum setor corresponde à busca."
                    : "Você ainda não cadastrou setores."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="tabela-setores__rodape">
        <span>
          Mostrando {setoresFiltrados.length ? inicioPagina + 1 : 0}–{fimPagina} de {setoresFiltrados.length} setores
        </span>
        {totalPaginas > 1 && (
          <nav className="setor-paginacao" aria-label="Paginação dos setores">
            <button
              type="button"
              aria-label="Página anterior"
              onClick={() => setPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
            >
              <i className="bi bi-chevron-left" aria-hidden="true" />
            </button>
            <span aria-live="polite">Página {paginaAtual} de {totalPaginas}</span>
            <button
              type="button"
              aria-label="Próxima página"
              onClick={() => setPagina(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
            >
              <i className="bi bi-chevron-right" aria-hidden="true" />
            </button>
          </nav>
        )}
      </footer>
      {setorPendenteExclusao && typeof document !== "undefined" && createPortal(
        <div
          className="setor-exclusao-fundo"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget && excluindoId === null) {
              setSetorPendenteExclusao(null);
              setErroExclusao("");
            }
          }}
        >
          <section
            className="setor-exclusao-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="setor-exclusao-titulo"
            aria-describedby="setor-exclusao-descricao"
          >
            <div className="setor-exclusao-cabecalho">
              <span className="setor-exclusao-icone" aria-hidden="true">
                <i className="bi bi-trash" />
              </span>
              <div>
                <h2 id="setor-exclusao-titulo">Excluir setor?</h2>
              </div>
            </div>
            <div className="setor-exclusao-aviso" id="setor-exclusao-descricao">
              <i className="bi bi-exclamation-triangle" aria-hidden="true" />
              <p>
                <strong>{setorPendenteExclusao.nome_setor}</strong> e seus equipamentos vinculados serão removidos.
              </p>
            </div>
            {erroExclusao && <p className="setor-erro-exclusao" role="alert">{erroExclusao}</p>}
            <div className="setor-exclusao-acoes">
              <button
                type="button"
                className="setor-exclusao-cancelar"
                autoFocus
                onClick={() => {
                  setSetorPendenteExclusao(null);
                  setErroExclusao("");
                }}
                disabled={excluindoId !== null}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="setor-exclusao-confirmar"
                onClick={excluirSetor}
                disabled={excluindoId !== null}
              >
                {excluindoId !== null ? "Excluindo..." : "Excluir setor"}
              </button>
            </div>
          </section>
        </div>,
        document.body
      )}
    </section>
  );
}
