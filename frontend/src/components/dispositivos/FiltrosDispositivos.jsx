import Icone from "./Icone";
import { CATEGORIAS } from "./dados";
import "./filtros.css";

export default function FiltrosDispositivos({
  busca,
  onBusca,
  estado,
  onEstado,
  categoria,
  onCategoria,
  onAdicionar,
}) {
  return (
    <div className="barra-filtros">
      <div className="campo-busca">
        <Icone nome="busca" />
        <input
          type="text"
          placeholder="Buscar equipamento ou local..."
          value={busca}
          onChange={(e) => onBusca(e.target.value)}
        />
      </div>

      <div className="filtros-grupo">
        <span className="filtros-rotulo">
          <Icone nome="ajustes" tamanho={14} /> Filtros
        </span>

        <select
          className="seletor"
          value={estado}
          onChange={(e) => onEstado(e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="todos">Todos</option>
          <option value="normal">Normal</option>
          <option value="atencao">Atenção</option>
          <option value="desligado">Desligado</option>
        </select>

        <select
          className="seletor"
          value={categoria}
          onChange={(e) => onCategoria(e.target.value)}
          aria-label="Filtrar por categoria"
        >
          <option value="todas">Todas as categorias</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button type="button" className="botao-adicionar" onClick={onAdicionar}>
          <Icone nome="mais" /> Adicionar dispositivo
        </button>
      </div>
    </div>
  );
}
