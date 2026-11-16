import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Script from "next/script";
import "./globals.css";
import LayoutConteudo from "@/components/layoutConteudo";
export const metadata = {
  title: "Volt House",
  description: "Template base com Next.js, Express e MySQL",
  icons: {
    icon: "/images/logo-txt.png?v=2",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <Script id="tema-inicial" strategy="beforeInteractive">
          {`try {
            if (localStorage.getItem("volthouse-tema") === "claro") {
              document.documentElement.dataset.tema = "claro";
            }
          } catch {}`}
        </Script>
      </head>
      <body>
        <LayoutConteudo>{children}</LayoutConteudo>
        <script
          src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
          integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r"
          crossOrigin="anonymous"
        ></script>
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.min.js"
          integrity="sha384-G/EV+4j2dNv+tEPo3++6LCgdCROaejBqfUeNjuKAiuXbjrxilcCdDz6ZAVfHWe1Y"
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  );
}
