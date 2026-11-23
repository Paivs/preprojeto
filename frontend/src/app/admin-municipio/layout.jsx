
import Link from "next/link";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./admin-municipio.css";

const menu = [
    { titulo: "Visão geral", href: "/admin-municipio", icone: "bi-grid" },
    { titulo: "Relatos", href: "/admin-municipio/relatos", icone: "bi-file-earmark-text" },
    { titulo: "Boletins oficiais", href: "/admin-municipio/boletins", icone: "bi-file-earmark-lock" },
    { titulo: "Usuários", href: "/admin-municipio/usuarios", icone: "bi-people" },
    { titulo: "Configurações", href: "/admin-municipio/configuracoes", icone: "bi-gear" },
];

export default function AdminMunicipioLayout({ children }) {
    return (
        <div className="municipal-dashboard">

            <aside className="municipal-sidebar">

                <Link href="/admin-municipio" className="municipal-brand">
                    <div className="municipal-brand-icon">
                        <i className="bi bi-shield-check"></i>
                    </div>

                    <div>
                        <strong>AlertABC</strong>
                        <span>Gestão municipal</span>
                    </div>
                </Link>

                <div className="municipal-menu-label">
                    MENU PRINCIPAL
                </div>

                <nav className="municipal-navigation">
                    {menu.map((item) => (
                        <Link
                            href={item.href}
                            key={item.href}
                            className="municipal-nav-link"
                        >
                            <i className={`bi ${item.icone}`}></i>
                            <span>{item.titulo}</span>
                        </Link>
                    ))}
                </nav>

                <div className="municipal-sidebar-bottom">
                    <div className="municipal-help">
                        <i className="bi bi-info-circle"></i>

                        <strong>Acesso municipal</strong>

                        <p>
                            Esta área apresenta informações vinculadas ao
                            município associado à sua conta.
                        </p>
                    </div>

                    <Link href="/" className="municipal-back">
                        <i className="bi bi-box-arrow-left"></i>
                        Voltar ao início
                    </Link>
                </div>

            </aside>

            <main className="municipal-main">
                <div className="municipal-content">
                    {children}
                </div>
            </main>

        </div>
    );
}
