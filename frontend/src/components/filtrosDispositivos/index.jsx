import './filtros.css';

export default function FiltrosDispositivos() {
  return (
    <div className="barra-filtros">
      <div className="campo-busca">
        <span>⌕</span>
        <input
          type="text"
          placeholder="Buscar equipamento ou local..."
        />
      </div>

      <div className="filtros-grupo">
        <span className="filtros-rotulo">
          ⚙ Filtros
        </span>

        <div className="seletor">
          <select defaultValue="todos" aria-label="Filtrar por estado">
            <option value="todos">Todos</option>
            <option value="normal">Normal</option>
            <option value="atencao">Atenção</option>
            <option value="desligado">Desligado</option>
          </select>
          <span>⌄</span>
        </div>

        <div className="seletor">
          <select defaultValue="todos" aria-label="Filtrar por categoria">
            <option value="todos">Todas as categorias</option>
            <option value="iluminacao">Iluminação</option>
            <option value="climatizacao">Climatização</option>
            <option value="eletrodomesticos">Eletrodomésticos</option>
            <option value="outros">Outros</option>
          </select>
          <span>⌄</span>
        </div>

        <button type="button" className="botao-adicionar">
          <span>＋</span> Adicionar dispositivo
        </button>
      </div>
    </div>
  );
}