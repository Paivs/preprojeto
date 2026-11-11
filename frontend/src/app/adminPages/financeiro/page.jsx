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
                    <div className="topo">
                        <div className="card-topo">
                            <div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}>
                                <strong>Total Faturado</strong>
                                <h2>R$ 29.000</h2>
                            </div>

                            

                            <i class="bi bi-cash-stack"></i>
                        </div>

                        <div className="card-topo">
                            
                        </div>

                        <div className="card-topo">
                            
                        </div>

                        <div className="card-topo">
                            
                        </div>
                    </div>
                </div>
            </div>
            
        </main>
    )
}