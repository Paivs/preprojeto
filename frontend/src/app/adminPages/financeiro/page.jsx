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
                            <h2>
                                R$ 29.000
                            </h2>

                            <i class="bi bi-cash-coin"></i>
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