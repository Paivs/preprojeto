"use client";

import AuthGuard from "@/components/auth/AuthGuard";

export default function PaginaAluno() {
  return (
    <AuthGuard>
      <main>
        <h1>Página do aluno</h1>
      </main>
    </AuthGuard>
  );
}
