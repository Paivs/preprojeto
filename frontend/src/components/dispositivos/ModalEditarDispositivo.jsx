"use client";

import { useEffect, useState } from "react";
import Icone from "./Icone";

export default function ModalEditarDispositivo({
  dispositivo,
  setores = [],
  erroSetores = "",
  salvando = false,
  onSalvar,
  onFechar,
}) {
  const [nome, setNome] = useState(dispositivo.nome || "");
  const [tipo, setTipo] = useState(dispositivo.categoria || "");
  const [consumoMinimo, setConsumoMinimo] = useState(String(dispositivo.consumoMinimo ?? 0));
  const [consumoMaximo, setConsumoMaximo] = useState(String(dispositivo.consumoMaximo ?? ""));
  const [status, setStatus] = useState(dispositivo.status || "Ativo");
  const [idSetor, setIdSetor] = useState(String(dispositivo.idSetor ?? ""));
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
      setErro("O consumo máximo não pode ser menor que o mínimo.");
      return;
    }
    if (!idSetor) {
      setErro(erroSetores || "Selecione um setor para o equipamento.");
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
    } catch (falha) {
      setErro(falha.message || "Não foi possível salvar as alterações.");
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
        aria-labelledby="editar-dispositivo-titulo"
      >
        <header className="setor-painel-cabecalho">
          <div>
            <span>DISPOSITIVOS</span>
            <h2 id="editar-dispositivo-titulo">Editar dispositivo</h2>
            <p>Atualize os dados cadastrados deste equipamento.</p>
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
            <input value={nome} onChange={(evento) => setNome(evento.target.value)} maxLength={100} required autoFocus />
          </label>
          <label>
            Tipo
            <input value={tipo} onChange={(evento) => setTipo(evento.target.value)} maxLength={50} />
          </label>
          <label>
            Setor
            <select value={idSetor} onChange={(evento) => setIdSetor(evento.target.value)} required disabled={!setores.length}>
              <option value="">Selecione um setor</option>
              {setores.map((setor) => (
                <option key={setor.id_setor} value={setor.id_setor}>{setor.nome_setor}</option>
              ))}
            </select>
          </label>
          <div className="setor-painel-campos-duplos">
            <label>
              Consumo mínimo (kWh)
              <input type="number" min="0" step="0.01" value={consumoMinimo} onChange={(evento) => setConsumoMinimo(evento.target.value)} />
            </label>
            <label>
              Consumo máximo (kWh)
              <input type="number" min="0" step="0.01" value={consumoMaximo} onChange={(evento) => setConsumoMaximo(evento.target.value)} placeholder="Opcional" />
            </label>
          </div>
          <label>
            Status
            <select value={status} onChange={(evento) => setStatus(evento.target.value)}>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </label>
          {erroSetores && <p className="setor-painel-erro" role="alert">{erroSetores}</p>}
          {erro && <p className="setor-painel-erro" role="alert">{erro}</p>}
          <footer className="setor-painel-acoes">
            <button type="button" className="setor-painel-cancelar" onClick={onFechar} disabled={salvando}>Cancelar</button>
            <button type="submit" className="setor-painel-salvar" disabled={salvando || !setores.length}>
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
