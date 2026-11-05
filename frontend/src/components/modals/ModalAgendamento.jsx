"use client";

import { useState } from "react";
import Modal from "./Modal";
import { diasSemana } from "../data/dispositivos";

export default function ModalAgendamento({ agendamento, onSalvar, onFechar }) {
  const [dias, setDias] = useState(agendamento.dias);
  const [inicio, setInicio] = useState(agendamento.inicio);
  const [fim, setFim] = useState(agendamento.fim);

  function alternarDia(indice) {
    setDias(dias.includes(indice) ? dias.filter((d) => d !== indice) : [...dias, indice]);
  }

  return (
    <Modal titulo="Editar agendamento" onFechar={onFechar}>
      <div className="modal-formulario">
        <span className="modal-subtitulo">Dias da semana</span>
        <div className="dias-semana">
          {diasSemana.map((nome, indice) => (
            <button
              key={nome}
              type="button"
              className={`dia-semana ${dias.includes(indice) ? "dia-semana-ativo" : ""}`}
              onClick={() => alternarDia(indice)}
            >
              {nome}
            </button>
          ))}
        </div>

        <div className="modal-linha">
          <label>
            Início
            <input type="time" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </label>
          <label>
            Término
            <input type="time" value={fim} onChange={(e) => setFim(e.target.value)} />
          </label>
        </div>

        <div className="modal-botoes">
          <button type="button" className="botao-secundario" onClick={onFechar}>
            Cancelar
          </button>
          <button type="button" className="botao-adicionar" onClick={() => onSalvar({ ...agendamento, dias, inicio, fim })}>
            Salvar agendamento
          </button>
        </div>
      </div>
    </Modal>
  );
}
