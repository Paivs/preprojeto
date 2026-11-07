"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import FiltrosDispositivos from "@/components/dispositivos/FiltrosDispositivos";
import ListaDispositivos from "@/components/dispositivos/ListaDispositivos";
import PainelDispositivo from "@/components/dispositivos/PainelDispositivo";
import ModalNovoDispositivo from "@/components/dispositivos/ModalNovoDispositivo";
import {
  DISPOSITIVOS_EXEMPLO,
  novoDispositivo,
  obterEstado,
} from "@/components/dispositivos/dados";
import "@/components/dispositivos/botoes.css";
import "./dispositivos.css";

export default function PaginaDispositivos() {
  const [dispositivos, setDispositivos] = useState(DISPOSITIVOS_EXEMPLO);
  const [selecionadoId, setSelecionadoId] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const [busca, setBusca] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");

  const selecionado = dispositivos.find((d) => d.id === selecionadoId) || null;

  const visiveis = dispositivos.filter((d) => {
    const texto = `${d.nome} ${d.local}`.toLowerCase();
    return (
      texto.includes(busca.toLowerCase()) &&
      (filtroEstado === "todos" || obterEstado(d) === filtroEstado) &&
      (filtroCategoria === "todas" || d.categoria === filtroCategoria)
    );
  });

  function atualizar(id, mudancas) {
    setDispositivos((lista) =>
      lista.map((d) => (d.id === id ? { ...d, ...mudancas } : d)),
    );
  }

  function alternar(id) {
    const d = dispositivos.find((item) => item.id === id);
    if (!d || !d.conectado) return;
    atualizar(id, {
      ligado: !d.ligado,
      consumo: d.ligado ? 0 : d.historico[d.historico.length - 1],
    });
  }

  function adicionar(dados) {
    setDispositivos((lista) => [...lista, novoDispositivo(dados)]);
    setModalAberto(false);
  }

  return (
    <div className="pagina">
      <Sidebar />

      <div className="conteudo-principal">
        <Header />

        <main className="conteudo-pagina">
          <div className="cabecalho-pagina">
            <div>
              <span className="cabecalho-etiqueta">CONTROLE DE ATIVOS</span>
              <h1>Meus Dispositivos</h1>
              <p>
                Monitore, controle e automatize seus equipamentos em tempo real.
              </p>
            </div>
          </div>

          <FiltrosDispositivos
            busca={busca}
            onBusca={setBusca}
            estado={filtroEstado}
            onEstado={setFiltroEstado}
            categoria={filtroCategoria}
            onCategoria={setFiltroCategoria}
            onAdicionar={() => setModalAberto(true)}
          />

          <ListaDispositivos
            dispositivos={visiveis}
            selecionadoId={selecionadoId}
            onSelecionar={setSelecionadoId}
            onAlternar={alternar}
          />
        </main>
      </div>

      {selecionado && (
        <PainelDispositivo
          key={selecionado.id}
          dispositivo={selecionado}
          onFechar={() => setSelecionadoId(null)}
          onAlternar={alternar}
          onAtualizar={atualizar}
        />
      )}

      {modalAberto && (
        <ModalNovoDispositivo
          onSalvar={adicionar}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </div>
  );
}
