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
                <Link href="/">Sobre Nós</Link>
              </div>
              <span>Sem cartão de crédito  •  Dados claros, decisões melhores</span>
            </div>
            <div className="hero-right">
              <DashboardHero/>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
