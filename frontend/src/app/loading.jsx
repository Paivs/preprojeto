import "./loading.css";

export default function Loading() {
    return (
        <main className="global-loading">
            <div className="global-loading-content">
                <div className="global-loading-logo">
                    <i className="bi bi-shield-check"></i>
                </div>

                <h1>AlertABC</h1>
                <p>Conectando informações. Facilitando o acesso.</p>

                <div className="global-loading-spinner"></div>

                <span>Carregando plataforma...</span>
            </div>
        </main>
    );
}