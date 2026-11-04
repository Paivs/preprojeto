import "./sobreNos.css";

export default function SobreNos() {
    return(
        <main>
            <div className="container">
                <div className="text">
                    <strong>Inovação Controle Automação</strong>

                    <h1>
                        Energia sob controle.
                        Economia em <span style={{color: "var(--purple-light)"}}>evolução</span>
                    </h1>

                    <p>
                        A Volt House oferece soluções inteligentes para monitorar e controlar o consumo de energia elétrica, ajudando empresas a reduzir custos, evitar desperdícios e alcançar maior eficiência energética
                    </p>

                    <a href="#">Saiba Mais <i className="bi bi-arrow-right"></i></a>
                </div>

                <img src="/images/escritorio.png"/>

                <div className="background-glow">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                </div>
            </div>

            <div className="container">
                <div className="title">
                    <strong>Nossos Valores</strong>

                    <h2>Conectando eficiência e economia</h2>
                </div>

                <div className="container-cardValor">
                    
                </div>
            </div>
        </main>
    )
}