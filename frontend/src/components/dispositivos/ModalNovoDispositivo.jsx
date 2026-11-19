"use client";

import { useEffect, useState } from "react";
import Icone from "./Icone";
import "./modal.css";

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
    <div className="modal-fundo" onClick={() => !salvando && onFechar()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Adicionar dispositivo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="modal-topo">
          <h2>Adicionar equipamento</h2>
          <button type="button" className="botao-fechar" onClick={onFechar} aria-label="Fechar" disabled={salvando}>
            <Icone nome="x" />
          </button>
        </div>

        <form className="modal-formulario" onSubmit={enviar}>
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
              <option value="Alerta">Alerta</option>
              <option value="Inativo">Inativo</option>
            </select>
          </label>

          {!setores.length && <p className="modal-erro">{erroSetores || "Cadastre um setor antes de adicionar equipamento."}</p>}
          {erro && <p className="modal-erro">{erro}</p>}

          <div className="modal-botoes">
            <button type="button" className="botao-secundario" onClick={onFechar} disabled={salvando}>
              Cancelar
            </button>
            <button type="submit" className="botao-adicionar" disabled={salvando || !setores.length}>
              {salvando ? "Salvando..." : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
