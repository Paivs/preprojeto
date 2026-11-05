import Link from "next/link";
import "./header.css";

export default function Header() {
  return (
    <header className="header">
      <nav className="navbar">
        <div className="container-navbar">
          <Link className="navbar-brand" href="/">
            <img src="/images/logo.png" alt="Logo da empresa" />
          </Link>

          <ul className="navbar-header">
            <li>
              <Link className="nav-link active" href="/">
                Home
              </Link>
            </li>

            <li>
              <Link className="nav-link" href="/sobreNos">
                Sobre nós
              </Link>
            </li>

            <li>
              <Link className="nav-link" href="/contato">
                Contato
              </Link>
            </li>
          </ul>

          <Link className="nav-login" href="/login">
            <span>Entrar</span>
            <i className="bi bi-arrow-up-right"></i>
          </Link>
        </div>
      </nav>
    </header>
  );
}
