import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import CardIndicador from "@/components/CardIndicador";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./financeiro.css";

export default function Financeiro() {
    return(
        <main>
            <Sidebar/>

            <div className="conteudo">
                <Header tipoUsuario="admin" />

                <div className="container">
                    <div className="topo-pag">
                        <CardIndicador
                            titulo="Lucro Líquido"
                            valor="R$ 55.000"
                            icone="bi bi-cash-stack"
                            numero="01"
                        />

                        <CardIndicador
                            titulo="Total Faturado"
                            valor="R$ 91.320"
                            icone="bi bi-wallet2"
                            numero="02"
                        />

                        <CardIndicador
                            titulo="Qtd. Clientes"
                            valor="1284"
                            icone="bi bi-briefcase-fill"
                            numero="03"
                        />

                        <CardIndicador
                            titulo="Recebimentos"
                            valor="1282"
                            icone="bi bi-person-workspace"
                            numero="04"
                        />
                    </div>

                    <div className="baixo-pag">
                        <div className="card">
                            <h2>Resumo Financeiro</h2>

                            <div className="info">
                                 <h3>R$ 55.000 <span className="simple-text">Lucro Líquido</span></h3>

                                 <strong><span style={{color: "var(--verde)"}}>+18% </span> em relação ao último mês</strong>
                            </div>

                            <div className="flex-p">
                                <p className="box-pagamentos"><i className="bi bi-info-circle-fill"></i> 2 Pagamentos pendentes</p>

                                <p className="box-barra"><span className="flex-barra">Total Recebido <strong className="flex-end">99%</strong></span> <span className="barra"></span></p>
                            </div>
                           
                        </div>

                        <div className="card">
                            <h2>Insights da IA <i className="bi bi-robot"></i></h2>

                            <hr/>

                            <p className="insight">
                                O resumo financeiro da empresa nos últimos meses é positivo. Embora tenham duas pendências de pagamentos, a empresa teve crescimento no lucro em relação ao último mês
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
        </main>
    )
}