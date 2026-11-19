"use client";

import { useEffect, useState } from "react";
import Icone from "./Icone";
import "@/components/setores/painelNovoSetor.css";

export default function ModalNovoDispositivo({
  onSalvar,
  onFechar,
  setores = [],
  erroSetores = "",
  salvando = false,
}) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [consumoMinimo, setConsumoMinimo] = useState("0");
  const [consumoMaximo, setConsumoMaximo] = useState("");
  const [status, setStatus] = useState("Ativo");
  const [idSetor, setIdSetor] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    function aoPressionarTecla(evento) {
      if (evento.key === "Escape" && !salvando) onFechar();
    }
    window.addEventListener("keydown", aoPressionarTecla);
    return () => window.removeEventListener("keydown", aoPressionarTecla);
  }, [onFechar, salvando]);

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");

    const minimo = Number(consumoMinimo || 0);
    const maximo = consumoMaximo === "" ? null : Number(consumoMaximo);
    if (maximo !== null && maximo < minimo) {
      setErro("Consumo máximo não pode ser menor que o mínimo.");
      return;
    }
    if (!setores.length) {
      setErro(erroSetores || "Cadastre um setor antes de adicionar equipamento.");
      return;
    }

    try {
      await onSalvar({
        nome_equipamento: nome.trim(),
        tipo: tipo.trim() || null,
        consumo_minimo: minimo,
        consumo_maximo: maximo,
        status,
        id_setor: Number(idSetor),
      });
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message || "Não foi possível adicionar o equipamento.");
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
        aria-labelledby="novo-dispositivo-titulo"
      >
        <header className="setor-painel-cabecalho">
          <div>
            <span>DISPOSITIVOS</span>
            <h2 id="novo-dispositivo-titulo">Adicionar equipamento</h2>
            <p>Cadastre um equipamento e associe-o a um setor.</p>
          </div>
          <button
            type="button"
            className="setor-painel-fechar"
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar painel"
          >
            <Icone nome="x" />
          </button>
        </header>

        <form className="setor-painel-formulario" onSubmit={enviar}>
          <label>
            Nome do equipamento
            <input
              type="text"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              placeholder="Ex.: Ar-condicionado da sala"
              maxLength={100}
              required
              autoFocus
            />
          </label>

          <label>
            Tipo
            <input
              type="text"
              value={tipo}
              onChange={(evento) => setTipo(evento.target.value)}
              placeholder="Ex.: Climatização"
              maxLength={50}
            />
          </label>

          <label>
            Setor
            <select value={idSetor} onChange={(evento) => setIdSetor(evento.target.value)} required disabled={!setores.length}>
              <option value="">Selecione um setor</option>
              {setores.map((setor) => (
                <option key={setor.id_setor} value={setor.id_setor}>
                  {setor.nome_setor}
                </option>
              ))}
            </select>
          </label>

          <label>
            Consumo mínimo (kWh)
            <input type="number" min="0" step="0.01" value={consumoMinimo} onChange={(evento) => setConsumoMinimo(evento.target.value)} />
          </label>

          <label>
            Consumo máximo (kWh)
            <input type="number" min="0" step="0.01" value={consumoMaximo} onChange={(evento) => setConsumoMaximo(evento.target.value)} />
          </label>

          <label>
            Status
            <select value={status} onChange={(evento) => setStatus(evento.target.value)}>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </label>

          {!setores.length && <p className="setor-painel-erro">{erroSetores || "Cadastre um setor antes de adicionar equipamento."}</p>}
          {erro && <p className="setor-painel-erro">{erro}</p>}

          <footer className="setor-painel-acoes">
            <button type="button" className="setor-painel-cancelar" onClick={onFechar} disabled={salvando}>
              Cancelar
            </button>
            <button type="submit" className="setor-painel-salvar" disabled={salvando || !setores.length}>
              {salvando ? "Salvando..." : "Adicionar"}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
