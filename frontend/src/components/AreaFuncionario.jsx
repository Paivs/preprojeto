'use client';
/* ============================================================
   CASCA DA ÁREA DO FUNCIONÁRIO (chão de fábrica)
   Barra superior simples + ajuda em perguntas frequentes.
   ============================================================ */
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Modal } from '@/components/ui';
import { sair, useSessao } from '@/lib/useSessao';

const LINKS = [['/chamado', 'Abrir chamado'], ['/meus-chamados', 'Meus chamados']];

const PERGUNTAS = [
  ['Como abro um chamado?', 'Em “Abrir chamado”, escolha a máquina, marque o que está acontecendo e a urgência, e escreva em poucas palavras o que viu, ouviu ou sentiu. Foto ajuda muito.'],
  ['E se a máquina parou de vez?', 'Marque a urgência “Máquina parada”. O gestor vê o chamado no topo da lista e a equipe de manutenção é chamada em seguida.'],
  ['Como sei em que pé está meu chamado?', 'Em “Meus chamados” você acompanha cada etapa: registrado, triado, técnico designado, em reparo e concluído. Se algo mudar, deixe um comentário por lá.']
];

function Ajuda({ onClose }) {
  const [aberta, setAberta] = useState(0);
  return (
    <Modal titulo="Ajuda" onClose={onClose}>
      <div className="accordion">
        {PERGUNTAS.map(([pergunta, resposta], i) => (
          <div key={i} className="accordion-item">
            <h3 className="accordion-header">
              <button className={`accordion-button${aberta === i ? '' : ' collapsed'}`} onClick={() => setAberta(aberta === i ? -1 : i)}>
                {pergunta}
              </button>
            </h3>
            {aberta === i && (
              <div className="accordion-collapse collapse show"><div className="accordion-body">{resposta}</div></div>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default function AreaFuncionario({ children }) {
  const usuario = useSessao('funcionario');
  const caminho = usePathname();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);
  const [ajuda, setAjuda] = useState(false);

  if (!usuario) return null;

  return (
    <>
      <nav className="navbar navbar-expand-md pm-topnav" data-bs-theme="dark">
        <div className="container-xl">
          <Link className="navbar-brand" href="/chamado">
            <Image src="/mantech-logo.png" alt="Mantech" width={176} height={30} priority />
          </Link>
          <button className="navbar-toggler" aria-label="Abrir menu" onClick={() => setMenuAberto(!menuAberto)}>
            <span className="navbar-toggler-icon" />
          </button>

          <div className={`collapse navbar-collapse${menuAberto ? ' show' : ''}`}>
            <ul className="navbar-nav me-auto gap-1">
              {LINKS.map(([href, texto]) => (
                <li key={href} className="nav-item">
                  <Link className={`nav-link${caminho === href ? ' active' : ''}`} href={href}>{texto}</Link>
                </li>
              ))}
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => setAjuda(true)}>Ajuda</button>
              </li>
            </ul>

            <div className="dropdown">
              <button className="btn btn-outline-light rounded-pill" onClick={() => setContaAberta(!contaAberta)}>
                Funcionário · {usuario.setor}
              </button>
              <ul className={`dropdown-menu dropdown-menu-end${contaAberta ? ' show' : ''}`}>
                <li><span className="dropdown-item-text">{usuario.nome}</span></li>
                <li><button className="dropdown-item" onClick={() => sair(router)}>Sair</button></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <main className="pm-wrap">{typeof children === 'function' ? children(usuario) : children}</main>
      {ajuda && <Ajuda onClose={() => setAjuda(false)} />}
    </>
  );
}
