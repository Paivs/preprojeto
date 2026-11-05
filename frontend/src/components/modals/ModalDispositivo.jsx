"use client";

import { useState } from "react";
import Modal from "./Modal";
import { categorias } from "../data/dispositivos";

// Serve para adicionar (sem dispositivo) e para editar (com dispositivo).
export default function ModalDispositivo({ dispositivo, onSalvar, onFechar }) {
  const [nome, setNome] = useState(dispositivo ? dispositivo.nome : "");
  const [categoria, setCategoria] = useState(dispositivo ? dispositivo.categoria : categorias[0]);
  const [local, setLocal] = useState(dispositivo ? dispositivo.local : "");
  const [erro, setErro] = useState("");

  function enviar(evento) {
    evento.preventDefault();
    if (!nome.trim() || !local.trim()) {
      setErro("Preencha o nome e o local do equipamento.");
      return;
    }
    onSalvar({ nome: nome.trim(), categoria, local: local.trim() });
  }

  return (
    <Modal titulo={dispositivo ? "Editar dispositivo" : "Adicionar dispositivo"} onFechar={onFechar}>
      <form className="modal-formulario" onSubmit={enviar}>
        <label>
          Nome
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Ar-condicionado Recepção" />
        </label>

        <label>
          Categoria
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          Local
          <input type="text" value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Ex.: Bloco administrativo · 1º andar" />
        </label>

        {erro && <p className="modal-erro">{erro}</p>}

        <div className="modal-botoes">
          <button type="button" className="botao-secundario" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className="botao-adicionar">
            {dispositivo ? "Salvar alterações" : "Adicionar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
