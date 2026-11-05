import './sidebar.css'

export default function Sidebar() {
  return (
    <>
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
          <button type="button" className="menu-item">
            <span>▦</span>
            <span>Visão Geral</span>
          </button>

          <button
            type="button"
            className="menu-item menu-item-ativo"
          >
            <span>▣</span>
            <span>Dispositivos</span>
          </button>

          <button type="button" className="menu-item">
            <span>▥</span>
            <span>Relatórios de Consumo</span>
          </button>

          <button type="button" className="menu-item">
            <span>▤</span>
            <span>Faturas</span>
          </button>

          <button type="button" className="menu-item">
            <span>⚠</span>
            <span>Alertas</span>
            <span className="menu-aviso">3</span>
          </button>

          <button type="button" className="menu-item">
            <span>⚙</span>
            <span>Configurações</span>
          </button>
        </nav>

        <div className="sidebar-rodape">
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

          <button
            type="button"
            className="menu-item menu-sair"
          >
            <span>⇥</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}