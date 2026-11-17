"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import "./tabelaSetor.css";

const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
const formatarConsumo = (valor) =>
  `${Number(valor || 0).toLocaleString("pt-BR")} kWh`;

export default function TabelaSetores() {
  const [setores, setSetores] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const token = sessionStorage.getItem("token");
      if (!token) {
        if (ativo) {
          setErro(
            "Sua sessão não foi encontrada. Entre novamente para ver seus setores."
          );
          setCarregando(false);
        }
        return;
      }
      try {
        const resposta = await fetch(`${API_BASE_URL}/setores`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const resultado = await resposta.json().catch(() => ({}));
        if (!resposta.ok)
          throw new Error(
            resultado.erro || "Não foi possível carregar seus setores."
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

  const setoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return setores.filter((setor) =>
      `${setor.nome_setor} ${setor.descricao || ""}`
        .toLocaleLowerCase("pt-BR")
        .includes(termo)
    );
  }, [setores, busca]);

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
            onChange={(e) => setBusca(e.target.value)}
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
              setoresFiltrados.map((setor) => (
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
                    <button type="button" className="btn-excluir">
                    <i className="bi bi-trash"></i>
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
          Mostrando {setoresFiltrados.length} de {setores.length} setores
        </span>
      </footer>
    </section>
  );
}
