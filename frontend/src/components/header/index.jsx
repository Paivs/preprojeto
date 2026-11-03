import Link from "next/link";
import "./header.css";

export default function Header() {
  return (
    <header>
      <nav className="navbar navbar-expand-lg">
        <div className="container-navbar">
          <Link className="navbar-brand" href="/">
            <img src="/images/logo-txt.png" />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle nav
            igation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" href="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="#">
                  Sobre nós
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="nav-login">
        <Link href="/">Login</Link>
      </div>
    </header>
  );
}
