
"use client";

import { usePathname } from "next/navigation";

import Header from "./Header/Header";
import Footer from "./Footer/Footer";

export default function LayoutContent({ children }) {
    const pathname = usePathname();

    const paginaSemLayoutPublico =
        pathname.startsWith("/admin-municipio") ||
        pathname.startsWith("/admin-geral") ||
        pathname.startsWith("/usuarios");

    return (
        <>
            {!paginaSemLayoutPublico && <Header />}

            {children}

            {!paginaSemLayoutPublico && <Footer />}
        </>
    );
}
