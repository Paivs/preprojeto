import Link from 'next/link';
import "./notFound.css"

export default function NotFound() {
    return (
        <main className="not-found">
            <div className="img-notFound">
                <i className="bi bi-lightning-fill"></i>
            </div>

            <div className="info-notFound">
                <h1>Erro 404</h1>

                <h2>Página não encontrada!</h2>

                <p>
                    Desculpe, a página que você está procurando
                    não existe ou foi removida.
                </p>

                <Link href="/">
                    Voltar para o início
                </Link>
            </div>
        </main>
    )
}