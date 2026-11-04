import Link from "next/link";
import "./home.css";
import DashboardHero from "@/components/dashboardHero";

export default function Home() {
  return (
    <>
      <main id="home">
        <section id="hero">
          <div className="container-hero">
            <div className="hero-left">
              <h3>Reduza até <strong>30%</strong> da sua fatura de energia com controle em tempo real</h3>
              <p>Transforme dados em decisões. Monitore o consumo, antecipe desperdícios e economize com uma operação mais inteligente e sustentável.</p>
              <div className="btn-hero">
                <Link href="/sobreNos">Sobre Nós</Link>
              </div>
              <span>Sem cartão de crédito  •  Dados claros, decisões melhores</span>
            </div>
            <div className="hero-right">
              <DashboardHero/>
            </div>
          </div>
        </section>
        <section id="patrocinador">
          <div className="patrocinador-container">
            <div className="grid-patrocinador">
              <div className="img-pat">
                <img src="/images/enel.png"/>
              </div>
              <div className="img-pat">
                <img src="/images/comercio.png"/>
              </div>
              <div className="img-pat">
                <img src="/images/energisa.png"/>
              </div>
              <div className="img-pat">
                <img src="/images/weg.png"/>
              </div>
              <div className="img-pat">
                <img src="/images/cpfl.png" style={{width: "10vw"}}/>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
