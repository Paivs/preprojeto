
import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";

import LayoutContent from "./Components/LayoutContent";

import "bootstrap-icons/font/bootstrap-icons.css";

export const metadata = {
    title: 'AlertABC',
    description: 'Plataforma de registro e consulta de relatos.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body>
                <LayoutContent>
                    {children}
                </LayoutContent>
            </body>
        </html>
    );
}
