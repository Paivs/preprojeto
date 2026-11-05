import './headerAdmin.css';

export default function Header() {
  return (
    <header className="topo">
      <button
        type="button"
        className="botao-menu-mobile"
        aria-label="Abrir menu"
      >
        ☰
      </button>

      <div className="barra-pesquisa">
        <span>⌕</span>

        <input
          type="text"
          placeholder="Buscar no sistema..."
        />

        <kbd className="atalho">⌘ K</kbd>
      </div>

      <div className="topo-acoes">
        <button
          type="button"
          className="botao-icone botao-tema"
          aria-label="Tema"
        >
          ☼
        </button>

        <div className="topo-menu-area">
          <button
            type="button"
            className="botao-icone"
            aria-label="Notificações"
          >
            ♧
            <span className="botao-icone-ponto" />
          </button>
        </div>

        <div className="topo-menu-area">
          <div
            type="button"
            className="perfil"
          >
            <span className="avatar">MV</span>

            <span className="perfil-dados">
              <strong>Marina Vieira</strong>
              <small>Administradora</small>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}