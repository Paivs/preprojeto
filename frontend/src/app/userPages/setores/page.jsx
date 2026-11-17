"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import "./setores.css";
import KpiSetores from "@/components/kpis";
import TabelaSetores from "@/components/tabelaSetor";
import ModalNovoSetor from "@/components/tabelaSetor/ModalNovoSetor";

export default function Setores() {
  const [modalAberto, setModalAberto] = useState(false);
  const [setoresAdicionais, setSetoresAdicionais] = useState([]);

  return (
    <div className="pagina">
      <Sidebar />

      <div className="conteudo-principal">
        <Header />

        <main className="conteudo-pagina">
          <div className="cabecalho-pagina">
            <div className="left-cabecalho">
              <span className="cabecalho-etiqueta"> SETORES</span>
              <h1>Uma visão de cada ambiente.</h1>
              <p>
                Organize sua unidade e identifique oportunidades de economia.
              </p>
            </div>
            <div className="right-cabecalho">
              <button
                type="button"
                className="botao-adicionar"
                onClick={() => setModalAberto(true)}
              >
                <i className="bi bi-plus"></i>
                Adicionar setor
              </button>
            </div>
          </div>

          <div className="grid-kpi">
            <KpiSetores />
          </div>

          <div className="container-table">
            <TabelaSetores setoresAdicionais={setoresAdicionais} />
          </div>

          <div className="container-total">
            <div className="card-total">
              <div className="cabecalho-total">
                <p>TOTAL CONSOLIDADO - SETEMBRO 2026</p>
              </div>
              <div className="main-total">
                <div className="left-total">
                  <div className="kWh-total">
                    <h2>12.480 kWh</h2>
                    <span>Consumo geral de unidade</span>
                  </div>
                  <div className="custo-total">
                    <h2>R$ 9.360,00</h2>
                    <span>Custo de energia estimado</span>
                  </div>
                </div>
                <div className="divisoria"></div>
                <div className="right-total">
                  <p>Todos os ambientes, uma só visão</p>
                  <span>Dados agrupados por setor e usuário.</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {modalAberto && (
        <ModalNovoSetor
          onFechar={() => setModalAberto(false)}
          onSalvar={(setor) => {
            setSetoresAdicionais((atuais) => [...atuais, setor]);
            setModalAberto(false);
          }}
        />
      )}
    </div>
  );
}
