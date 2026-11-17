"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import PainelEditarEquipamento from "@/components/setores/PainelEditarEquipamento";
import { API_BASE_URL } from "@/lib/api";
import "./setorDetalhe.css";

const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
const formatarConsumo = (valor) =>
  `${Number(valor || 0).toLocaleString("pt-BR")} kWh`;

export default function DetalheSetor() {
  const { id } = useParams();
  const [setor, setSetor] = useState(null);
  const [equipamentos, setEquipamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [equipamentoEmEdicao, setEquipamentoEmEdicao] = useState(null);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    async function carregar() {
      const token = sessionStorage.getItem("token");
      if (!token) {
        if (ativo) {
          setErro(
            "Sua sessão não foi encontrada. Entre novamente para ver este setor."
          );
          setCarregando(false);
        }
        return;
      }
      const opcoes = {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      };
      try {
        const [respostaSetor, respostaEquipamentos] = await Promise.all([
          fetch(`${API_BASE_URL}/setores/${id}`, opcoes),
          fetch(`${API_BASE_URL}/setores/${id}/equipamentos`, opcoes),
        ]);
        const [resultadoSetor, resultadoEquipamentos] = await Promise.all([
          respostaSetor.json().catch(() => ({})),
          respostaEquipamentos.json().catch(() => ({})),
        ]);
        if (!respostaSetor.ok)
          throw new Error(
            resultadoSetor.erro || "Não foi possível encontrar este setor."
          );
        if (!respostaEquipamentos.ok)
          throw new Error(
            resultadoEquipamentos.erro ||
              "Não foi possível carregar os equipamentos do setor."
          );
        if (ativo) {
          setSetor(resultadoSetor.dados || null);
          setEquipamentos(
            Array.isArray(resultadoEquipamentos.dados)
              ? resultadoEquipamentos.dados
              : []
          );
        }
      } catch (falha) {
        if (ativo) setErro(falha.message || "Não foi possível conectar à API.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => {
      ativo = false;
    };
  }, [id]);

  return (
    <div className="pagina">
      <Sidebar />
      <div className="conteudo-principal">
        <Header />
        <main className="setor-detalhe conteudo-pagina">
          <Link href="/userPages/setores" className="setor-voltar">
            <i className="bi bi-arrow-left" /> <span>Todos os setores</span>
          </Link>
          {carregando ? (
            <div className="setor-estado">
              <span className="setor-spinner" />
              Carregando informações do setor...
            </div>
          ) : erro ? (
            <div className="setor-estado setor-detalhe-erro">
              <i className="bi bi-exclamation-circle" />
              {erro}
            </div>
          ) : (
            setor && (
              <>
                <header className="setor-detalhe-cabecalho">
                  <div className="setor-hero-icone">
                    <i className="bi bi-grid-1x2-fill" />
                  </div>
                  <div className="setor-hero-conteudo">
                    <span className="cabecalho-etiqueta">
                      VISÃO DO AMBIENTE{" "}
                      <span className="setor-id">ID {setor.id_setor}</span>
                    </span>
                    <h1>{setor.nome_setor}</h1>
                    <p>{setor.descricao || "Sem descrição cadastrada."}</p>
                  </div>
                </header>
                <section className="setor-resumo" aria-label="Resumo do setor">
                  <article className="resumo-consumo">
                    <div className="resumo-icone">
                      <i className="bi bi-lightning-charge-fill" />
                    </div>
                    <div>
                      <span>Consumo global</span>
                      <strong>{formatarConsumo(setor.consumo_geral)}</strong>
                      <small>Consumo registrado no setor</small>
                    </div>
                  </article>
                  <article className="resumo-custo">
                    <div className="resumo-icone">
                      <i className="bi bi-currency-dollar" />
                    </div>
                    <div>
                      <span>Custo de energia</span>
                      <strong>{formatarMoeda(setor.custo)}</strong>
                      <small>Custo registrado no setor</small>
                    </div>
                  </article>
                  <article className="resumo-equipamentos">
                    <div className="resumo-icone">
                      <i className="bi bi-plug-fill" />
                    </div>
                    <div>
                      <span>Equipamentos</span>
                      <strong>{equipamentos.length}</strong>
                      <small>Vinculados a este setor</small>
                    </div>
                  </article>
                </section>
                <section className="setor-equipamentos">
                  <div className="setor-equipamentos-cabecalho">
                    <div className="setor-equipamentos-titulo">
                      <span className="setor-equipamentos-icone">
                        <i className="bi bi-cpu" />
                      </span>
                      <div>
                        <h2>Equipamentos do setor</h2>
                        <p>Itens cadastrados e suas faixas de consumo.</p>
                      </div>
                    </div>
                    <span className="setor-contagem">
                      {equipamentos.length}{" "}
                      {equipamentos.length === 1 ? "item" : "itens"}
                    </span>
                  </div>
                  <div className="setor-equipamentos-rolagem">
                    <table>
                      <thead>
                        <tr>
                          <th>Equipamento</th>
                          <th>Tipo</th>
                          <th>Status</th>
                          <th>Faixa de consumo</th>
                          <th className="setor-coluna-acoes">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {equipamentos.length ? (
                          equipamentos.map((equipamento) => (
                            <tr key={equipamento.id_equipamento}>
                              <td className="equipamento-nome">
                                <span className="equipamento-linha-icone">
                                  <i className="bi bi-plug" />
                                </span>
                                {equipamento.nome_equipamento}
                              </td>
                              <td>{equipamento.tipo || "Não informado"}</td>
                              <td>
                                <span
                                  className={`equipamento-status ${
                                    String(equipamento.status || "")
                                      .toLowerCase()
                                      .includes("alerta")
                                      ? "status-alerta"
                                      : String(equipamento.status || "")
                                          .toLowerCase()
                                          .includes("inativo")
                                      ? "status-inativo"
                                      : "status-ativo"
                                  }`}
                                >
                                  <i />
                                  {equipamento.status || "Não informado"}
                                </span>
                              </td>
                              <td className="equipamento-faixa">
                                {equipamento.consumo_minimo == null &&
                                equipamento.consumo_maximo == null
                                  ? "Não informada"
                                  : `${equipamento.consumo_minimo ?? "—"} – ${
                                      equipamento.consumo_maximo ?? "—"
                                    } kWh`}
                              </td>
                              <td className="setor-coluna-acoes">
                                <button type="button" className="setor-botao-editar-equipamento" onClick={() => setEquipamentoEmEdicao(equipamento)} aria-label={`Editar ${equipamento.nome_equipamento}`}>
                                  <i className="bi bi-pencil" /> <span>Editar</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="setor-equipamentos-vazio"
                            >
                              Nenhum equipamento cadastrado neste setor.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <p className="setor-nota">
                    <i className="bi bi-info-circle" /> As faixas exibidas são
                    os valores cadastrados para cada equipamento; não
                    representam medições atuais ou histórico de consumo.
                  </p>
                </section>
              </>
            )
          )}
        </main>
      </div>
      {equipamentoEmEdicao && (
        <PainelEditarEquipamento
          equipamento={equipamentoEmEdicao}
          idSetor={setor?.id_setor || id}
          onFechar={() => setEquipamentoEmEdicao(null)}
          onSalvo={(atualizado) => {
            setEquipamentos((atuais) => atuais.map((item) => item.id_equipamento === atualizado.id_equipamento ? atualizado : item));
            setEquipamentoEmEdicao(null);
          }}
        />
      )}
    </div>
  );
}
