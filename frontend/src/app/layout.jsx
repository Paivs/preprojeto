/* ============================================================
   LAYOUT RAIZ (vale para todas as páginas)
   Carrega o CSS do Bootstrap, o CSS do projeto e o provedor de avisos.
   ============================================================ */
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { ToastProvider } from '@/components/ui';

export const metadata = {
  title: 'PredictMaint · Mantech Solutions',
  description: 'Manutenção preditiva de máquinas, alertas e ordens de serviço.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Fonte Barlow via Google Fonts. No App Router o <head> do layout vale para todas as páginas. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
