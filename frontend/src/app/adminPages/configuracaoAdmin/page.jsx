import Sidebar from "@/components/sidebar/Sidebar.jsx";
import Header from "@/components/headerAdmin/HeaderAdmin.jsx";
import "./configuracaoAdmin.css";

export default function ConfiguracaoAdmin() {
  return (
    <div className="pagina">
      <Sidebar />

      <div className="conteudo-principal">
        <Header />

        <main className="conteudo-pagina">
          <div className="cabecalho-pagina">
            <div>
              <span className="cabecalho-etiqueta">PAINEL CONFIGURAÇÕES</span>

              <h1>Configurações</h1>

              <p>
                Gerencie seu perfil e personalize sua experiência na Volt House.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
