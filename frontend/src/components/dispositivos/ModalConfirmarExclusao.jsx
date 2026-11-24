"use client";

import { useEffect } from "react";
import "./modalConfirmarExclusao.css";

export default function ModalConfirmarExclusao({
  dispositivo,
  carregando = false,
  erro = "",
  onCancelar,
  onConfirmar,
}) {
  useEffect(() => {
    function aoPressionarTecla(evento) {
      if (evento.key === "Escape" && !carregando) onCancelar();
    }
    window.addEventListener("keydown", aoPressionarTecla);
    return () => window.removeEventListener("keydown", aoPressionarTecla);
  }, [carregando, onCancelar]);

  return (
    <div
      className="confirmacao-exclusao-fundo"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !carregando) onCancelar();
      }}
    >
      <section
        className="confirmacao-exclusao-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmacao-exclusao-titulo"
        aria-describedby="confirmacao-exclusao-descricao"
      >
        <div className="confirmacao-exclusao-cabecalho">
          <span className="confirmacao-exclusao-icone" aria-hidden="true">
            <i className="bi bi-trash3" />
          </span>
          <span className="confirmacao-exclusao-etiqueta">REMOVER EQUIPAMENTO</span>
          <h2 id="confirmacao-exclusao-titulo">Excluir equipamento?</h2>
          <p id="confirmacao-exclusao-descricao">
            Confirme a remoção deste equipamento da sua unidade.
          </p>
        </div>
        <div className="confirmacao-exclusao-dispositivo">
          <span className="confirmacao-exclusao-dispositivo-icone" aria-hidden="true">
            <i className="bi bi-lightning-charge" />
          </span>
          <div>
            <strong>{dispositivo.nome}</strong>
            <small>{dispositivo.local}</small>
          </div>
        </div>
        <p className="confirmacao-exclusao-aviso">
          Esta ação não pode ser desfeita.
        </p>
        {erro && (
          <p className="confirmacao-exclusao-erro" role="alert">
            <i className="bi bi-exclamation-circle" aria-hidden="true" /> {erro}
          </p>
        )}
        <div className="confirmacao-exclusao-acoes">
          <button
            type="button"
            className="confirmacao-exclusao-cancelar"
            onClick={onCancelar}
            disabled={carregando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="confirmacao-exclusao-confirmar"
            onClick={onConfirmar}
            disabled={carregando}
          >
            <i className={`bi ${carregando ? "bi-hourglass-split" : "bi-trash3"}`} aria-hidden="true" />
            {carregando ? "Excluindo..." : "Excluir equipamento"}
          </button>
        </div>
      </section>
    </div>
  );
}
