import Link from "next/link";
import "./footer.css";

const links = [
  { href: "/", label: "Início" },
  { href: "/sobreNos", label: "Sobre nós" },
  { href: "/contato", label: "Contato" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-container">
        <div className="site-footer-main row g-5">
          <div className="col-lg-5 col-md-12">
            <Link href="/" className="site-footer-brand" aria-label="VoltHouse, página inicial">
              <img src="/images/logo-txt.png" alt="VoltHouse" />
            </Link>
            <p className="site-footer-about">
              Mais clareza para acompanhar o consumo de energia e tomar decisões
              melhores para o seu negócio.
            </p>
          </div>

          <div className="col-6 col-lg-3 col-md-6">
            <h2 className="site-footer-title">Navegação</h2>
            <ul className="site-footer-links">
              {links.map((link) => (
                <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="col-6 col-lg-4 col-md-6">
            <h2 className="site-footer-title">Fale com a gente</h2>
            <p className="site-footer-contact-copy">Quer saber como a VoltHouse pode ajudar sua empresa?</p>
            <Link href="/contato" className="site-footer-cta">
              Entre em contato <i className="bi bi-arrow-up-right" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="site-footer-bottom">
          <span>© {new Date().getFullYear()} VoltHouse. Todos os direitos reservados.</span>
          <Link href="/login">Acessar minha conta <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
        </div>
      </div>
    </footer>
  );
}
