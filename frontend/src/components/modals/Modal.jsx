import { X } from "lucide-react";

export default function Modal({ titulo, onFechar, children }) {
  return (
    <div className="modal-fundo" onClick={onFechar}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="modal-topo">
          <h2>{titulo}</h2>
          <button type="button" className="botao-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
