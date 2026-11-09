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

          <div className="grid-group-config">
            <div className="group-config">
              <div className="cabecalho-dados">
                <i className="bi bi-database"></i>
                <div className="tema-dados">
                  <h4>Dados da plataforma</h4>
                  <span>
                    Indetificação exibida no painel e nas comunicações
                  </span>
                </div>
              </div>
              <div className="main-dados">
                <div className="card-config">
                  <div className="group-value">
                    <div className="dados-config">
                      <label>Nome da plataforma</label>
                      <input
                        type="text"
                        placeholder="Nome da plataforma"
                        name="nome"
                        value="Volt House"
                      />
                    </div>

                    <div className="dados-config">
                      <label>E-mail de suporte</label>
                      <input
                        type="email"
                        name="email"
                        value="admin@volthouse.com.br"
                        placeholder="Ex:. suport@volthouse.com.br"
                      />
                    </div>
                  </div>

                  <div className="group-value">
                    <div className="dados-config">
                      <label htmlFor="cnpj">CNPJ</label>
                      <input
                        id="cnpj"
                        type="text"
                        name="cnpj"
                        value="12.345.678/0001-95"
                      />
                    </div>
                  </div>
                </div>

                <div className="card-config">
                  <div className="group-value"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
