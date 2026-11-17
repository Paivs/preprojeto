"use client";

import { useEffect, useState } from "react";
import Icone from "@/components/dispositivos/Icone";
import "@/components/dispositivos/modal.css";
import "@/components/dispositivos/botoes.css";

export default function ModalNovoSetor({ onSalvar, onFechar }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    function fecharComEscape(evento) {
      if (evento.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", fecharComEscape);
    return () => window.removeEventListener("keydown", fecharComEscape);
  }, [onFechar]);

  function enviar(evento) {
    evento.preventDefault();
    if (!nome.trim()) {
      setErro("Informe o nome do setor.");
      return;
    }
    onSalvar({
      id: Date.now(),
      nome: nome.trim(),
      descricao: descricao.trim() || "—",
      consumo: 0,
      custo: 0,
      usuario: "0042",
    });
  }

  return (
    <div className="modal-fundo" onClick={onFechar}>
      <div
        className="modal modal-entrada-esquerda"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-novo-setor-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="modal-topo">
          <h2 id="modal-novo-setor-titulo">Adicionar setor</h2>
          <button type="button" className="botao-fechar" onClick={onFechar} aria-label="Fechar">
            <Icone nome="x" />
          </button>
        </div>

        <form className="modal-formulario" onSubmit={enviar}>
          <label>
            Nome do setor
            <input
              type="text"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              placeholder="Ex.: Escritórios"
              maxLength={100}
              autoFocus
              required
            />
          </label>

          <label>
            Descrição
            <input
              type="text"
              value={descricao}
              onChange={(evento) => setDescricao(evento.target.value)}
              placeholder="Ex.: Salas e áreas administrativas"
            />
          </label>

          {erro && <p className="modal-erro" role="alert">{erro}</p>}

          <div className="modal-botoes">
            <button type="button" className="botao-secundario" onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" className="botao-adicionar">
              Adicionar setor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
