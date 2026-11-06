import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import "./clientes.css";

export default function Clientes() {
  return (
    <div className="pagina">
      <Sidebar />

      <div className="conteudo-principal">
        <Header tipoUsuario="admin" />

        <main className="conteudo-pagina">
          <div className="cabecalho-pagina">
            <div>
              <span className="cabecalho-etiqueta">CONTROLE DE ATIVOS</span>

              <h1>Contatos</h1>

              <p>Gerencie sua base, planos e consumo em um só lugar</p>
            </div>
            <div className="btn-adicionar">
              <button type="button">
                <i className="bi bi-plus"></i>
                Adicionar cliente
              </button>
            </div>
          </div>

          <div className="grid-kpi">
            <div className="kpi-group">
              <div className="cabecalho-kpi">
                <span>Total de clientes</span>
                <i className="bi bi-people"></i>
              </div>
              <div className="main-kpi">
                <h3>1.284</h3>
              </div>
              <div className="footer-kpi">
                <span>
                  <i className="bi bi-chevron-compact-up"></i>48 novos este mês
                </span>
              </div>
            </div>

            <div className="kpi-group">
              <div className="cabecalho-kpi">
                <span>Novas adesões</span>
                <i className="bi bi-people"></i>
              </div>
              <div className="main-kpi">
                <h3>124</h3>
              </div>
              <div className="footer-kpi">
                <span>
                  <i className="bi bi-chevron-compact-up"></i>18,2% vs. mês
                  anterio
                </span>
              </div>
            </div>
          </div>

          <section id="table" className="container-tabela">
            <div className="cabecalho-table">
              <div className="cabecalho-left">
                <h2>Base de clientes</h2>
                <span>Todos os contratos ativos e recentes</span>
              </div>
              <div className="cabecalho-right">
                <div className="barra-pesquisa">
                  <span className="icone-busca">⌕</span>
                  <input type="text" placeholder="Buscar empresa..." />
                </div>
              </div>
            </div>

            <div className="tabela-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>EMPRESA</th>
                    <th>PLANO</th>
                    <th>DISPOSITIVOS</th>
                    <th>CONSUMO</th>
                    <th>STATUS</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="info-empresa">
                        <div className="avatar-sigla">LT</div>
                        <div>
                          <strong>Lumina Tech</strong>
                          <p>financeiro@lumina.com</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-plano enterprise">Enterprise</span>
                    </td>
                    <td>84</td>
                    <td>
                      <strong>12.840 kWh</strong>
                    </td>
                    <td>
                      <span className="badge-status ativo">● Ativo</span>
                    </td>
                    <td>
                      <button type="button" className="btn-opcoes">
                        •••
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="info-empresa">
                        <div className="avatar-sigla">OE</div>
                        <div>
                          <strong>Orbe Energia</strong>
                          <p>contato@orbe.com</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-plano pro">Pro</span>
                    </td>
                    <td>42</td>
                    <td>
                      <strong>8.290 kWh</strong>
                    </td>
                    <td>
                      <span class="badge-status ativo">● Ativo</span>
                    </td>
                    <td>
                      <button type="button" className="btn-opcoes">
                        •••
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="info-empresa">
                        <div className="avatar-sigla">NL</div>
                        <div>
                          <strong>Norte Logística</strong>
                          <p>admin@nortelog.com</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-plano enterprise">Enterprise</span>
                    </td>
                    <td>126</td>
                    <td>
                      <strong>21.560 kWh</strong>
                    </td>
                    <td>
                      <span class="badge-status pendente">● Pendente</span>
                    </td>
                    <td>
                      <button type="button" className="btn-opcoes">
                        •••
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="info-empresa">
                        <div className="avatar-sigla">SA</div>
                        <div>
                          <strong>Studio Alba</strong>
                          <p>ola@studioalba.com</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-plano essencial">Essencial</span>
                    </td>
                    <td>12</td>
                    <td>
                      <strong>2.130 kWh</strong>
                    </td>
                    <td>
                      <span class="badge-status inativo">● Inativo</span>
                    </td>
                    <td>
                      <button type="button" className="btn-opcoes">
                        •••
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="info-empresa">
                        <div className="avatar-sigla">VC</div>
                        <div>
                          <strong>Verde Campo</strong>
                          <p>energia@verdecampo.com</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-plano pro">Pro</span>
                    </td>
                    <td>38</td>
                    <td>
                      <strong>7.480 kWh</strong>
                    </td>
                    <td>
                      <span class="badge-status ativo">● Ativo</span>
                    </td>
                    <td>
                      <button type="button" className="btn-opcoes">
                        •••
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rodape-tabela">
              <p>Exibindo 5 de 1.284 clientes</p>
              <div className="paginacao">
                <button type="button" className="btn-paginacao">
                  Anterior
                </button>
                <button type="button" className="btn-paginacao ativo">
                  Próxima
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
