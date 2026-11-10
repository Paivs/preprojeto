"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function LayoutConteudo({ children }) {
  const pathname = usePathname();

  const rotasSemHeaderFooter = ["/userPages", "/adminPages", "/login"];

  const esconderHeaderFooter = rotasSemHeaderFooter.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );

  return (
    <>
      {!esconderHeaderFooter && <Header />}
      <div className="site-layout-content">{children}</div>
      {!esconderHeaderFooter && <Footer />}
    </>
  );
}
