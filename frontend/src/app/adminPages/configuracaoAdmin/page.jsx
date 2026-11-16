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
                    <div className="dados-config">
                      <label htmlFor="telefone">Telefone de contato</label>
                      <input
                        type="text"
                        id="telefone"
                        name="telefone"
                        value="(11) 93056-9806"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group-config">
              <div className="cabecalho-dados">
                <i className="bi bi-lightning"></i>
                <div className="tema-dados">
                  <h4>Parâmetros de energia</h4>
                  <span>
                    Configurações que afetam o monitoramento energético.
                  </span>
                </div>
              </div>
              <div className="main-dados">
                <div className="card-config">
                  <div className="group-value-limite">
                    <div className="dados-config">
                      <label>Limite padrão de consumo (kWh)</label>
                      <input
                        type="number"
                        placeholder="Ex:. 1234"
                        name="limite"
                        value="1253"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group-config">
              <div className="cabecalho-dados">
                <i className="bi bi-shield-lock"></i>
                <div className="tema-dados">
                  <h4>Segurança e sistema</h4>
                  <span>Proteção, backups e manutenção.</span>
                </div>
              </div>
              <div className="main-dados">
                <div className="card-config">
                  <div className="group-value">
                    <div className="dados-config">
                      <label>Alterar senha administrativa</label>
                      <input
                        type="password"
                        placeholder="Altere sua senha"
                        name="alteracao"
                        value="123456"
                      />
                    </div>

                    <div className="dados-config">
                      <label>Confirmar alteração de senha</label>
                      <input
                        type="password"
                        placeholder="Altere sua senha"
                        name="alteracao"
                        value="123456"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
