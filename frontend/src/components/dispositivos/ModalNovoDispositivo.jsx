"use client";

import { useEffect, useState } from "react";
import Icone from "./Icone";
import { CATEGORIAS } from "./dados";
import "./modal.css";

export default function ModalNovoDispositivo({ onSalvar, onFechar }) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [local, setLocal] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    function aoPressionarTecla(evento) {
      if (evento.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", aoPressionarTecla);
    return () => window.removeEventListener("keydown", aoPressionarTecla);
  }, [onFechar]);

  function enviar(evento) {
    evento.preventDefault();
    if (!nome.trim() || !local.trim()) {
      setErro("Preencha o nome e o local do equipamento.");
      return;
    }
    onSalvar({ nome: nome.trim(), categoria, local: local.trim() });
  }

  return (
    <div className="modal-fundo" onClick={onFechar}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Adicionar dispositivo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-topo">
          <h2>Adicionar dispositivo</h2>
          <button
            type="button"
            className="botao-fechar"
            onClick={onFechar}
            aria-label="Fechar"
          >
            <Icone nome="x" />
          </button>
        </div>

        <form className="modal-formulario" onSubmit={enviar}>
          <label>
            Nome
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Ar-condicionado da sala"
              autoFocus
            />
          </label>

          <label>
            Categoria
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label>
            Local
            <input
              type="text"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Ex.: Sala de estar"
            />
          </label>

          {erro && <p className="modal-erro">{erro}</p>}

          <div className="modal-botoes">
            <button
              type="button"
              className="botao-secundario"
              onClick={onFechar}
            >
              Cancelar
            </button>
            <button type="submit" className="botao-adicionar">
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
