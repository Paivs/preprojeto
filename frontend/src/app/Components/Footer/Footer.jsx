import Link from "next/link";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">

                <div className="footer-main">

                    <div className="footer-brand">
                        <Link href="/" className="footer-logo">
                            <i className="bi bi-shield-check"></i>
                            Alert<span>ABC</span>
                        </Link>

                        <p>
                            Informação e participação cidadã para contribuir
                            com uma sociedade mais consciente e colaborativa.
                        </p>
                    </div>

                    <div className="footer-links">
                        <h3>Navegação</h3>

                        <Link href="/">Início</Link>
                        <Link href="/sobre">Sobre nós</Link>
                        <Link href="/relatos">Relatos</Link>
                    </div>

                    <div className="footer-links">
                        <h3>Conta</h3>

                        <Link href="/login">Entrar</Link>
                        <Link href="/cadastro">Criar conta</Link>
                    </div>

                    <div className="footer-information">
                        <h3>AlertABC</h3>

                        <p>
                            Plataforma digital para registro e consulta
                            de relatos enviados por usuários.
                        </p>
                    </div>

                </div>

                <div className="footer-bottom">
                    <p>
                        © {new Date().getFullYear()} AlertABC. Todos os direitos reservados.
                    </p>

                    <span>Informação, transparência e participação.</span>
                </div>

            </div>
        </footer>
    );
}