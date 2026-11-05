"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";

export default function LayoutConteudo({ children }) {
  const pathname = usePathname();

  const rotasSemHeaderFooter = ["/usuariosPages", "/adminPages"];

  const esconderHeaderFooter = rotasSemHeaderFooter.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );

  return (
    <>
      {!esconderHeaderFooter && <Header />}

      <main>{children}</main>
    </>
  );
}
