import './sidebar.css';
import Link from 'next/link';

export default function Sidebar({ tipoUsuario = "usuario" }) {

  const isAdmin = tipoUsuario === "admin";

  return (
    <aside className="sidebar">

      <div className="logo">
        <img
          src="/images/logo.png"
          alt="Volt House"
          className="logo-imagem"
        />
      </div>

      <p className="menu-titulo">MENU PRINCIPAL</p>

      <nav className="menu-principal">

        {isAdmin ? (
          // MENU DO ADMINISTRADOR
          <>
            <button type="button" className="menu-item menu-item-ativo">
              <span>▦</span>
              <span>Visão Geral</span>
            </button>

            <button type="button" className="menu-item">
              <span>♙</span>
              <span>Clientes</span>
            </button>

            <button type="button" className="menu-item">
              <span>⚙</span>
              <span>Configurações</span>
            </button>
          </>
        ) : (
          // MENU DO USUÁRIO COMUM
          <>
            <Link href="/userPages/dashboard" className="menu-item menu-item-ativo">
              <span>▦</span>
              <span>Visão Geral</span>
            </Link>

            <Link href="/userPages/dispositivos" className="menu-item">
              <span>▣</span>
              <span>Dispositivos</span>
            </Link>

            <Link href="/userPages/relatorios" className="menu-item">
              <span>▥</span>
              <span>Relatórios de Consumo</span>
            </Link>

            <Link href="/userPages/faturas" className="menu-item">
              <span>▤</span>
              <span>Faturas</span>
            </Link>

            <Link href="/userPages/configuracoes" className="menu-item">
              <span>⚙</span>
              <span>Configurações</span>
            </Link>
          </>
        )}

      </nav>

      <div className="sidebar-rodape">

        {!isAdmin && (
          <div className="painel-sistema">
            <div className="painel-sistema-topo">
              <span className="ponto-verde" />
              <span>Sistema operacional</span>
              <strong>98%</strong>
            </div>

            <div className="barra-progresso">
              <div
                className="barra-progresso-preenchida"
                style={{ width: "98%" }}
              />
            </div>

            <p>6 de 6 dispositivos respondendo</p>
          </div>
        )}

        <button type="button" className="menu-item menu-sair">
          <span>⇥</span>
          <span>Sair</span>
        </button>

      </div>

    </aside>
  );
}
