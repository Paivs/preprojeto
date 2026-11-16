import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
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
                        <div className="card-topo">
                            <div className="top">
                                <div className="flex-top">
                                    <strong>Total Faturado</strong>
                                    <h2>R$ 29.000</h2>
                                </div>

                                <i className="bi bi-cash-stack"></i>
                            </div>

                            <div className="bottom">
                                <strong>01</strong>
                                <hr/>
                            </div>
                        </div>

                        <div className="card-topo">
                            
                        </div>

                        <div className="card-topo">
                            
                        </div>

                        <div className="card-topo">
                            
                        </div>
                    </div>

                    <div className="baixo-pag">
                        <div className="card">
                            <h2>Resumo Financeiro</h2>

                            <div className="info">
                                 <h3>R$ 55.000 <span className="simple-text">Lucro Líquido</span></h3>

                                 <strong><span style={{color: "var(--verde)"}}>+18% </span> em relação ao último mês</strong>
                            </div>

                            <div className="flex-p">
                                <p><i className="bi bi-person-workspace"></i> 67 Clientes </p>

                                <p><i className="bi bi-info-circle-fill"></i> 2 Pagamentos pendentes</p>
                            </div>
                           
                        </div>

                        <div className="card"></div>
                    </div>
                </div>
            </div>
            
        </main>
    )
}