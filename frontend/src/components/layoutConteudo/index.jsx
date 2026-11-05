
"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";

export default function LayoutConteudo({ children }) {
    const pathname = usePathname();

    const esconderHeaderFooter =
        pathname === "/adminPages" ||
        pathname.startsWith("/adminPages/");

    return (
        <>
            {!esconderHeaderFooter && <Header />}

            <main>
                {children}
            </main>

            {/* {!esconderHeaderFooter && <Footer />} */}
        </>
    );
}
