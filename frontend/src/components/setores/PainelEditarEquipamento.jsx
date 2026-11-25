"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { normalizarStatus } from "@/components/dispositivos/dados";
import { useToast } from "@/components/toast/ToastProvider";
import "./painelNovoSetor.css";

export default function PainelEditarEquipamento({ equipamento, idSetor, onFechar, onSalvo }) {
  const toast = useToast();
  const [nome, setNome] = useState(equipamento.nome_equipamento || "");
  const [tipo, setTipo] = useState(equipamento.tipo || "");
  const [consumoMinimo, setConsumoMinimo] = useState(equipamento.consumo_minimo ?? "0");
  const [consumoMaximo, setConsumoMaximo] = useState(equipamento.consumo_maximo ?? "");
  const [status, setStatus] = useState(normalizarStatus(equipamento.status));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    function tecla(evento) { if (evento.key === "Escape" && !salvando) onFechar(); }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
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
    const token = sessionStorage.getItem("token");
    if (!token) { setErro("Sua sessão não foi encontrada. Entre novamente."); return; }

    setSalvando(true);
    try {
      const resposta = await fetch(`${API_BASE_URL}/equipamentos/${equipamento.id_equipamento}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nome_equipamento: nome.trim(),
          tipo: tipo.trim() || null,
          consumo_minimo: minimo,
          consumo_maximo: maximo,
          status,
          id_setor: Number(idSetor),
        }),
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(resultado.erro || "Não foi possível salvar as alterações.");
      toast.success("Alterações do equipamento salvas com sucesso.");
      onSalvo(resultado.dados);
    } catch (falha) {
      toast.error(falha.message || "Não foi possível salvar as alterações do equipamento.");
      setErro(falha.message || "Não foi possível conectar à API.");
    } finally { setSalvando(false); }
  }

  return (
    <div className="setor-painel-fundo" onMouseDown={(evento) => evento.target === evento.currentTarget && !salvando && onFechar()}>
      <aside className="setor-painel" role="dialog" aria-modal="true" aria-labelledby="editar-equipamento-titulo">
        <header className="setor-painel-cabecalho">
          <div><span>EQUIPAMENTOS</span><h2 id="editar-equipamento-titulo">Editar equipamento</h2><p>Atualize os dados cadastrados para este item.</p></div>
          <button type="button" className="setor-painel-fechar" onClick={onFechar} disabled={salvando} aria-label="Fechar painel"><i className="bi bi-x-lg" /></button>
        </header>
        <form className="setor-painel-formulario" onSubmit={enviar}>
          <label>Nome do equipamento<input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Ar-condicionado" maxLength={100} autoFocus required /></label>
          <label>Tipo<input value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Ex.: Climatização" maxLength={50} /></label>
          <div className="setor-painel-campos-duplos">
            <label>Consumo mínimo (kWh)<input type="number" min="0" max="99999999.99" step="0.01" value={consumoMinimo} onChange={(e) => setConsumoMinimo(e.target.value)} /></label>
            <label>Consumo máximo (kWh)<input type="number" min="0" max="99999999.99" step="0.01" value={consumoMaximo} onChange={(e) => setConsumoMaximo(e.target.value)} placeholder="Opcional" /></label>
          </div>
          <label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option></select></label>
          <p className="setor-painel-ajuda">Os valores de consumo são a faixa cadastrada do equipamento, não uma medição em tempo real.</p>
          {erro && <p className="setor-painel-erro" role="alert">{erro}</p>}
          <footer className="setor-painel-acoes">
            <button type="button" className="setor-painel-cancelar" onClick={onFechar} disabled={salvando}>Cancelar</button>
            <button type="submit" className="setor-painel-salvar" disabled={salvando}>{salvando ? "Salvando..." : "Salvar alterações"}</button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
