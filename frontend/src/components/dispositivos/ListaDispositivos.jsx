import CardDispositivo from "./CardDispositivo";
import "./lista.css";

export default function ListaDispositivos({
  dispositivos,
  selecionadoId,
  onSelecionar,
  carregando = false,
  erro = "",
}) {
  return (
    <section>
      <div className="lista-topo">
        <h2>
          Todos os dispositivos <small>{dispositivos.length} encontrados</small>
        </h2>
      </div>

      {erro && <p className="lista-erro" role="alert">{erro}</p>}

      {carregando ? (
        <p className="lista-vazia">Carregando seus equipamentos...</p>
      ) : dispositivos.length === 0 && !erro ? (
        <p className="lista-vazia">Nenhum dispositivo encontrado.</p>
      ) : dispositivos.length > 0 ? (
        <div className="lista-dispositivos">
          {dispositivos.map((d) => (
            <CardDispositivo
              key={d.id}
              dispositivo={d}
              selecionado={d.id === selecionadoId}
              onSelecionar={() => onSelecionar(d.id)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
