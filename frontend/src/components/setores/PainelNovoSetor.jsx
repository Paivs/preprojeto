"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { requisicaoAutenticada } from "@/lib/session";
import "./painelNovoSetor.css";

export default function PainelNovoSetor({ onFechar, onCriado }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [consumo, setConsumo] = useState("0");
  const [tarifaEnergia, setTarifaEnergia] = useState("0");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    function tecla(evento) {
      if (evento.key === "Escape" && !salvando) onFechar();
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar, salvando]);

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const resposta = await requisicaoAutenticada(`${API_BASE_URL}/setores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_setor: nome.trim(),
          descricao: descricao.trim() || null,
          consumo_geral: Number(consumo || 0),
          tarifa_energia: Number(tarifaEnergia || 0),
        }),
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok)
        throw new Error(
          resultado.erro || resultado.message || "Não foi possível adicionar o setor."
        );
      onCriado();
    } catch (falha) {
      setErro(falha.message || "Não foi possível conectar à API.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="setor-painel-fundo"
      onMouseDown={(evento) =>
        evento.target === evento.currentTarget && !salvando && onFechar()
      }
    >
      <aside
        className="setor-painel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="novo-setor-titulo"
      >
        <header className="setor-painel-cabecalho">
          <div>
            <span>SETORES</span>
            <h2 id="novo-setor-titulo">Adicionar setor</h2>
            <p>Cadastre um novo ambiente da sua unidade.</p>
          </div>
          <button
            type="button"
            className="setor-painel-fechar"
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar painel"
          >
            <i className="bi bi-x-lg" />
          </button>
        </header>
        <form className="setor-painel-formulario" onSubmit={enviar}>
          <label>
            Nome do setor{" "}
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Escritório"
              maxLength={100}
              autoFocus
              required
            />
          </label>
          <label>
            Descrição{" "}
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o ambiente (opcional)"
              rows={4}
            />
          </label>
          <div className="setor-painel-campos-duplos">
            <label>
              Consumo global (kWh)
              <input
                type="number"
                min="0"
                max="99999999.99"
                step="0.01"
                value={consumo}
                onChange={(e) => setConsumo(e.target.value)}
              />
            </label>
            <label>
              Tarifa de energia (R$/kWh)
              <input
                type="number"
                min="0"
                max="99999999.99"
                step="0.000001"
                value={tarifaEnergia}
                onChange={(e) => setTarifaEnergia(e.target.value)}
              />
            </label>
          </div>
          <p className="setor-painel-ajuda">
            Custo calculado: {(Number(consumo || 0) * Number(tarifaEnergia || 0)).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}. Use consumo × tarifa por kWh.
          </p>
          {erro && (
            <p className="setor-painel-erro" role="alert">
              {erro}
            </p>
          )}
          <footer className="setor-painel-acoes">
            <button
              type="button"
              className="setor-painel-cancelar"
              onClick={onFechar}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="setor-painel-salvar"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar setor"}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
