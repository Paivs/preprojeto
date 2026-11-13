"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import BarraLateral from "@/components/aluno/BarraLateral";
import styles from "@/components/aluno/BarraLateral.module.css";

export default function LayoutAluno({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [rotaVerificada, setRotaVerificada] = useState(null);

  useEffect(() => {
    if (pathname === "/aluno") {
      window.sessionStorage.removeItem("tenken-aluno-bancada-liberada");
      setRotaVerificada(pathname);
      return;
    }

    if (window.sessionStorage.getItem("tenken-aluno-bancada-liberada") !== "true") {
      router.replace("/aluno");
      return;
    }

    setRotaVerificada(pathname);
  }, [pathname, router]);

  return (
    <AuthGuard>
      {rotaVerificada !== pathname ? null : pathname === "/aluno" ? children : (
        <div className={styles.layout}>
          <BarraLateral itemAtivo="bem-vindo" />
          <main className={styles.conteudo}>{children}</main>
        </div>
      )}
    </AuthGuard>
  );
}
