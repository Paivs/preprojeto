"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import TabelaSetores from "@/components/tabelaSetor";
import PainelNovoSetor from "@/components/setores/PainelNovoSetor";
import "./setores.css";

export default function Setores() {
  const [painelAberto, setPainelAberto] = useState(false);

  return (
    <div className="pagina">
      <Sidebar />
      <div className="conteudo-principal">
        <Header />
        <main className="conteudo-pagina">
          <div className="cabecalho-pagina">
            <div className="left-cabecalho">
              <span className="cabecalho-etiqueta">SETORES</span>
              <h1>Uma visão de cada ambiente.</h1>
              <p>
                Consulte os dados e equipamentos de cada setor da sua unidade.
              </p>
            </div>
            <button
              type="button"
              className="setores-botao-adicionar"
              onClick={() => setPainelAberto(true)}
            >
              <i className="bi bi-plus-lg" aria-hidden="true" /> Adicionar setor
            </button>
          </div>
          <div className="container-table">
            <TabelaSetores setoresAdicionais={setoresAdicionais} />
          </div>
        </main>
      </div>
      {painelAberto && (
        <PainelNovoSetor
          onFechar={() => setPainelAberto(false)}
          onCriado={() => {
            window.dispatchEvent(new Event("setores:atualizar"));
            setPainelAberto(false);
          }}
        />
      )}
    </div>
  );
}
