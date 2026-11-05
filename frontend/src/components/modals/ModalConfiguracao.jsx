"use client";

import { useState } from "react";
import Modal from "./Modal";

// Opções fictícias: servem apenas para demonstrar a interface.
export default function ModalConfiguracao({ nome, onFechar }) {
  const [alertas, setAlertas] = useState(true);
  const [economia, setEconomia] = useState(false);
  const [limite, setLimite] = useState("20");

  return (
    <Modal titulo={`Configurar ${nome}`} onFechar={onFechar}>
      <div className="modal-formulario">
        <label className="opcao-linha">
          <input type="checkbox" checked={alertas} onChange={(e) => setAlertas(e.target.checked)} />
          Receber alertas de consumo acima da média
        </label>
        <label className="opcao-linha">
          <input type="checkbox" checked={economia} onChange={(e) => setEconomia(e.target.checked)} />
          Ativar modo economia
        </label>
        <label>
          Limite de consumo (kWh)
          <input type="number" min="0" value={limite} onChange={(e) => setLimite(e.target.value)} />
        </label>

        <div className="modal-botoes">
          <button type="button" className="botao-secundario" onClick={onFechar}>
            Cancelar
          </button>
          <button type="button" className="botao-adicionar" onClick={onFechar}>
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  );
}
