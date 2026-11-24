"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { API_BASE_URL } from "@/lib/api";
import "./modalEditarSetor.css";

export default function ModalEditarSetor({ setor, onFechar, onSalvo }) {
  const [nome, setNome] = useState(setor.nome_setor || "");
  const [descricao, setDescricao] = useState(setor.descricao || "");
  const [tarifa, setTarifa] = useState(String(setor.tarifa_energia ?? 0));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function fecharComEscape(evento) {
      if (evento.key === "Escape" && !salvando) onFechar();
    }

    window.addEventListener("keydown", fecharComEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", fecharComEscape);
    };
  }, [onFechar, salvando]);

  async function salvar(evento) {
    evento.preventDefault();
    setErro("");

    const token = sessionStorage.getItem("token");
    if (!token) {
      setErro("Sua sessão expirou. Entre novamente.");
      return;
    }

    const dados = {
      nome_setor: nome.trim(),
      descricao: descricao.trim() || null,
      tarifa_energia: Number(tarifa || 0),
    };

    setSalvando(true);
    try {
      const resposta = await fetch(`${API_BASE_URL}/setores/${setor.id_setor}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dados),
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok || !resultado.sucesso) {
        throw new Error(resultado.erro || "Não foi possível atualizar o setor.");
      }
      onSalvo(resultado.dados);
    } catch (falha) {
      setErro(falha.message || "Não foi possível conectar à API.");
    } finally {
      setSalvando(false);
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="modal-editar-setor-fundo"
      onMouseDown={(evento) =>
        evento.target === evento.currentTarget && !salvando && onFechar()
      }
    >
      <section
        className="modal-editar-setor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-editar-setor-titulo"
      >
        <header className="modal-editar-setor-cabecalho">
          <div>
            <span>SETOR</span>
            <h2 id="modal-editar-setor-titulo">Editar setor</h2>
            <p>Atualize os dados e a tarifa de energia.</p>
          </div>
          <button
            type="button"
            className="modal-editar-setor-fechar"
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar modal"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </header>

        <form className="modal-editar-setor-formulario" onSubmit={salvar}>
          <label>
            Nome do setor
            <input
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              maxLength={100}
              autoFocus
              required
            />
          </label>
          <label>
            Descrição
            <textarea
              value={descricao}
              onChange={(evento) => setDescricao(evento.target.value)}
              rows={3}
            />
          </label>
          <div className="modal-editar-setor-campos modal-editar-setor-campo-unico">
            <label>
              Tarifa (R$/kWh)
              <input
                type="number"
                min="0"
                max="99999999.99"
                step="0.000001"
                value={tarifa}
                onChange={(evento) => setTarifa(evento.target.value)}
              />
            </label>
          </div>
          {erro && <p className="modal-editar-setor-erro" role="alert">{erro}</p>}
          <footer className="modal-editar-setor-acoes">
            <button
              type="button"
              className="modal-editar-setor-cancelar"
              onClick={onFechar}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button type="submit" className="modal-editar-setor-salvar" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body
  );
}
