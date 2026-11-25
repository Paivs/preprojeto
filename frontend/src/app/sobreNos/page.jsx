import Link from "next/link";
import "./sobreNos.css";

const valores = [
  {
    numero: "01",
    icone: "bi-lightbulb",
    titulo: "Inovação",
    descricao:
      "Usamos tecnologia inteligente para transformar dados de energia em decisões mais claras.",
  },
  {
    numero: "02",
    icone: "bi-globe-americas",
    titulo: "Sustentabilidade",
    descricao:
      "Incentivamos um consumo consciente, com menos desperdício e mais eficiência.",
  },
  {
    numero: "03",
    icone: "bi-speedometer2",
    titulo: "Eficiência",
    descricao:
      "Ajudamos empresas a entender seu consumo e encontrar oportunidades de economia.",
  },
];

export default function SobreNos() {
  return (
    <main className="sobre-nos-page">
      <section className="sobre-hero" aria-labelledby="sobre-titulo">
        <div className="sobre-hero-inner">
          <div className="sobre-hero-copy">
            <h1 id="sobre-titulo">
              Energia sob controle.
              <span>Futuro em evolução.</span>
            </h1>
            <p>
              A VoltHouse oferece soluções inteligentes para monitorar e
              controlar o consumo de energia. Ajudamos empresas a enxergar
              oportunidades, reduzir desperdícios e tomar decisões com mais
              confiança.
            </p>
            <div className="sobre-hero-actions">
              <Link className="sobre-cta" href="/contato">
                Fale com a VoltHouse{" "}
                <i className="bi bi-arrow-up-right" aria-hidden="true" />
              </Link>
              <a className="sobre-text-link" href="#valores">
                Conheça nossos valores{" "}
                <i className="bi bi-arrow-down" aria-hidden="true" />
              </a>
            </div>

          </div>

          <div className="sobre-hero-visual">
            <div className="sobre-image-frame">
              <img
                src="/images/escritorio.png"
                alt="Ambiente de trabalho da equipe VoltHouse"
              />
              <div className="sobre-image-caption">
                <span className="sobre-live-dot" />
                <span>Inteligência que move negócios</span>
              </div>
            </div>
            <div className="sobre-visual-orbit sobre-orbit-one" />
            <div className="sobre-visual-orbit sobre-orbit-two" />
          </div>
        </div>
      </section>

      <section
        className="sobre-valores"
        id="valores"
        aria-labelledby="valores-titulo"
      >
        <div className="sobre-section-inner">
          <header className="sobre-section-heading">
            <span className="sobre-kicker">O que nos guia</span>
            <h2 id="valores-titulo">Tecnologia com propósito.</h2>
            <p>Princípios que orientam cada solução que criamos.</p>
          </header>

          <div className="sobre-values-grid">
            {valores.map((valor) => (
              <article className="sobre-value-card" key={valor.numero}>
                <div className="sobre-value-top">
                  <span className="sobre-value-icon">
                    <i className={`bi ${valor.icone}`} aria-hidden="true" />
                  </span>
                  <span className="sobre-value-number">{valor.numero}</span>
                </div>
                <h3>{valor.titulo}</h3>
                <p>{valor.descricao}</p>
                <span className="sobre-value-line" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sobre-impacto" aria-labelledby="impacto-titulo">
        <div className="sobre-impacto-inner">
          <div className="sobre-quote-card">
            <span className="sobre-quote-mark" aria-hidden="true">
              “
            </span>
            <p>
              Nosso compromisso é tornar o consumo de energia mais fácil de
              entender, para que cada empresa possa encontrar oportunidades
              reais de melhoria.
            </p>
            <div className="sobre-quote-author">
              <span className="sobre-avatar">
                <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
              </span>
              <span>
                <strong>Nosso compromisso</strong>
                <small>VoltHouse</small>
              </span>
            </div>
          </div>

          <div className="sobre-impacto-copy">
            <span className="sobre-kicker">Energia bem utilizada</span>
            <h2 id="impacto-titulo">
              Decisões melhores começam com informação.
            </h2>
            <p>
              Reunimos tecnologia e acompanhamento para transformar dados em uma
              visão simples do consumo. Assim, sua empresa pode agir com mais
              controle hoje e planejar com mais segurança amanhã.
            </p>
            <Link href="/contato" className="sobre-impacto-link">
              Vamos conversar{" "}
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
