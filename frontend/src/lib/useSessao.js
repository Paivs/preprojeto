'use client';
/* ============================================================
   GUARDA DE ROTA
   Sem login -> volta para "/".
   Funcionário só entra na área do funcionário; gestor/técnico só no painel.
   ============================================================ */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { encerrarSessao, lerUsuario } from './sessao';

/**
 * area = 'painel' (gestor e técnico) ou 'funcionario'.
 * Devolve o usuário logado, ou null enquanto confere / redireciona.
 */
export function useSessao(area) {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const u = lerUsuario();
    if (!u) {
      router.replace('/');
      return;
    }
    const ehFuncionario = u.perfil === 'funcionario';
    if (area === 'funcionario' && !ehFuncionario) { router.replace('/dashboard'); return; }
    if (area === 'painel' && ehFuncionario) { router.replace('/chamado'); return; }
    // A sessão só existe no navegador, então ela é lida depois da montagem.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsuario(u);
  }, [area, router]);

  return usuario;
}

/** Botão "Sair". */
export function sair(router) {
  encerrarSessao();
  router.push('/');
}
