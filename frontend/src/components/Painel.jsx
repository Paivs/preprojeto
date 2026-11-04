'use client';
/* ============================================================
   CASCA DO PAINEL (gestor e técnico)
   Menu lateral + barra superior com título, busca e botão de ação.
   Uso:
     <Painel titulo="Máquinas" acao={{ label: 'Nova', onClick }}>
       {usuario => <Conteudo usuario={usuario} />}
     </Painel>
   ============================================================ */
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { PERFIS, saudacao } from '@/lib/util';
import { sair, useSessao } from '@/lib/useSessao';

const MENU = [
  ['/dashboard', 'Dashboard'],
  ['/planta', 'Planta ao vivo'],
  ['/maquinas', 'Máquinas'],
  ['/medicoes', 'Medições'],
  ['/alertas', 'Alertas'],
  ['/ordens', 'Ordens de Serviço'],
  ['/chamados', 'Chamados'],
  ['/orcamento', 'Orçamento manutenciário']
];

/* ---------- Busca da barra superior ---------- */
function Busca() {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState(null);

  // Espera o usuário parar de digitar (250 ms) antes de chamar a API
  useEffect(() => {
    const texto = termo.trim();
    if (texto.length < 2) return;
    const espera = setTimeout(() => {
      api.busca(texto).then(setResultados).catch(() => setResultados(null));
    }, 250);
    return () => clearTimeout(espera);
  }, [termo]);

  function aoDigitar(e) {
    setTermo(e.target.value);
    if (e.target.value.trim().length < 2) setResultados(null);
  }

  return (
    <div className="pm-search d-none d-md-block">
      <input
        className="form-control" type="search" autoComplete="off"
        placeholder="Buscar máquina, OS ou alerta" aria-label="Buscar máquina, OS ou alerta"
        value={termo} onChange={aoDigitar}
        onBlur={() => setTimeout(() => setResultados(null), 200)}
      />
      {resultados && (
        <div className="pm-results">
          {resultados.length ? resultados.map((r, i) => (
            <Link key={i} className="d-block px-3 py-2 text-decoration-none border-bottom" href={r.href}>
              <strong>{r.titulo}</strong>
              <small className="d-block text-secondary">{r.tipo} em {r.sub || '—'}</small>
            </Link>
          )) : (
            <p className="p-3 m-0 text-secondary">Nada com esse nome. Tente o código da máquina, como PH-03.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- "Pulso" da planta no rodapé do menu ---------- */
function Pulso() {
  const [resumo, setResumo] = useState(null); // null = carregando, false = erro

  useEffect(() => {
    api.resumoPlanta().then(setResumo).catch(() => setResumo(false));
  }, []);

  let titulo = 'Lendo a planta…';
  if (resumo === false) titulo = 'Planta sem resposta';
  else if (resumo?.criticos) titulo = `${resumo.criticos} máquina${resumo.criticos > 1 ? 's' : ''} em estado crítico`;
  else if (resumo) titulo = 'Planta sem criticidade';

  return (
    <div className="pm-pulse">
      <svg viewBox="0 0 200 30" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 16H62L70 4L80 27L88 13H118L126 6L134 22L140 16H200" />
      </svg>
      <strong>{titulo}</strong>
      <span>{resumo ? `${resumo.atencao} em atenção · ${resumo.normais} tranquilas` : saudacao() + '.'}</span>
    </div>
  );
}

/* ---------- Casca ---------- */
export default function Painel({ titulo, acao, children }) {
  const usuario = useSessao('painel');
  const caminho = usePathname();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);

  if (!usuario) return null;

  return (
    <div className="pm-shell">
      {menuAberto && <div className="pm-scrim" onClick={() => setMenuAberto(false)} />}

      <aside className={`pm-side${menuAberto ? ' aberto' : ''}`} aria-label="Menu principal">
        <Link href="/dashboard">
          <Image className="pm-logo" src="/mantech-logo.png" alt="Mantech" width={585} height={100} priority />
        </Link>
        <nav className="pm-nav" aria-label="Seções">
          {MENU.map(([href, texto]) => (
            <Link key={href} href={href} className={caminho === href ? 'active' : ''}
              aria-current={caminho === href ? 'page' : undefined} onClick={() => setMenuAberto(false)}>
              {texto}
            </Link>
          ))}
        </nav>
        <Pulso />
        <div className="pm-me">
          <div>
            <strong>{usuario.nome}</strong>
            <small>{PERFIS[usuario.perfil] || usuario.perfil}</small>
          </div>
          <button className="btn btn-sm btn-outline-light" onClick={() => sair(router)}>Sair</button>
        </div>
      </aside>

      <div className="pm-main">
        <header className="pm-top">
          <button className="btn btn-outline-dark d-lg-none" aria-label="Abrir menu" onClick={() => setMenuAberto(true)}>☰</button>
          <h1>{titulo}</h1>
          <Busca />
          {acao && !acao.oculto && (acao.href
            ? <Link className="btn btn-primary" href={acao.href}>{acao.label}</Link>
            : <button className="btn btn-primary" onClick={acao.onClick}>{acao.label}</button>)}
        </header>
        <main className="pm-content">
          {typeof children === 'function' ? children(usuario) : children}
        </main>
      </div>
    </div>
  );
}
