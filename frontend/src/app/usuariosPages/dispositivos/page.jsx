import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import FiltrosDispositivos from "@/components/filtrosDispositivos"
import ListaDispositivos from "@/components/listaAdmin";
// import PainelDispositivo from "@/components/painelAdmin";
import "./dispositivos.css";

export default function PaginaDispositivos() {

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

          <FiltrosDispositivos />

          <ListaDispositivos/>
        </main>
      </div>

      {/* {dispositivoSelecionado && (
        <PainelDispositivo
          dispositivo={dispositivoSelecionado}
          onFechar={() => setDispositivoSelecionado(null)}
        /> */}
      {/* )} */}
    </div>
  );
}
