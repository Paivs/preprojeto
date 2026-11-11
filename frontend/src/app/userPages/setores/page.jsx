import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import "./setores.css";
import KpiSetores from "@/components/kpis";

export default function Setores() {
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
              >
                <i className="bi bi-plus"></i>
                Adicionar dispositivo
              </button>
            </div>
          </div>

          <div className="grid-kpi">
            <KpiSetores/>
          </div>
        </main>
      </div>
    </div>
  );
}
