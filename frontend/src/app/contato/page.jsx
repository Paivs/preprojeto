import Link from "next/link";
import "./contato.css";

const canais = [
  {
    icone: "bi-envelope",
    titulo: "E-mail",
    descricao: "Fale com a nossa equipe",
    link: "mailto:contato@volthouse.com.br",
    rotulo: "contato@volthouse.com.br",
  },
  {
    icone: "bi-telephone",
    titulo: "Telefone",
    descricao: "Atendimento em horário comercial",
    link: "tel:+551140001234",
    rotulo: "+55 (11) 4000-1234",
  },
  {
    icone: "bi-geo-alt",
    titulo: "Onde estamos",
    descricao: "Atendemos empresas em todo o Brasil",
    link: null,
    rotulo: "Brasil",
  },
];

export default function Contato() {
  return (
    <div className="contato-page">
      <section className="contato-hero">
        <div className="container contato-container">
          <div className="contato-intro">
            <span className="contato-eyebrow">
              <i className="bi bi-chat-dots" aria-hidden="true" /> Estamos aqui para ajudar
            </span>
            <h1>Vamos conversar sobre <span>energia inteligente?</span></h1>
            <p>
              Conte um pouco sobre o seu negócio. Nossa equipe pode ajudar você
              a encontrar novas formas de acompanhar o consumo e economizar.
            </p>
            <div className="contato-promise">
              <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
              <span>Uma conversa simples pode ser o primeiro passo para uma operação mais eficiente.</span>
            </div>
          </div>

          <div className="contato-form-card">
            <div className="contato-form-heading">
              <span className="contato-form-icon"><i className="bi bi-send" aria-hidden="true" /></span>
              <div>
                <h2>Envie uma mensagem</h2>
                <p>Preencha seus dados e entraremos em contato.</p>
              </div>
            </div>
            <form className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="nome">Empresa</label>
                <input className="form-control" id="empresa" name="empresa" type="text" placeholder="Nome da empresa" autoComplete="name" required />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="cnpj">CNPJ</label>
                <input className="form-control" id="cnpj" name="cnpj" type="text" placeholder="00.000.000/0000-00" autoComplete="organization" />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="email">E-mail corporativo</label>
                <input className="form-control" id="email" name="email" type="email" placeholder="voce@empresa.com.br" autoComplete="email" required />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="telefone">Telefone</label>
                <input className="form-control" id="telefone" name="telefone" type="tel" placeholder="(00) 00000-0000" autoComplete="tel" />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="mensagem">Como podemos ajudar?</label>
                <textarea className="form-control" id="mensagem" name="mensagem" rows="4" placeholder="Conte um pouco sobre o que você precisa." required />
              </div>
              <div className="col-12 contato-submit-row">
                <button className="btn contato-submit" type="submit">
                  Enviar mensagem <i className="bi bi-arrow-right" aria-hidden="true" />
                </button>
                <small><i className="bi bi-lock" aria-hidden="true" /> Seus dados serão usados apenas para este contato.</small>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="contato-canais">
        <div className="container contato-container contato-canais-inner">
          <div className="contato-canais-title">
            <span>Outros canais</span>
            <h2>Prefere falar direto?</h2>
          </div>
          <div className="row g-3 contato-canais-grid">
            {canais.map((canal) => (
              <div className="col-md-4" key={canal.titulo}>
                <article className="contato-canal-card">
                  <span className="contato-canal-icon"><i className={`bi ${canal.icone}`} aria-hidden="true" /></span>
                  <div>
                    <h3>{canal.titulo}</h3>
                    <p>{canal.descricao}</p>
                    {canal.link ? <a href={canal.link}>{canal.rotulo}</a> : <span className="contato-canal-value">{canal.rotulo}</span>}
                  </div>
                </article>
              </div>
            ))}
          </div>
          <div className="contato-back-link">
            <Link href="/"><i className="bi bi-arrow-left" aria-hidden="true" /> Voltar para o início</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
