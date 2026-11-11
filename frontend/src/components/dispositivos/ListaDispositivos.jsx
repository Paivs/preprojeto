import CardDispositivo from "./CardDispositivo";
import "./lista.css";

export default function ListaDispositivos({
  dispositivos,
  selecionadoId,
  onSelecionar,
  onAlternar,
}) {
  return (
    <section>
      <div className="lista-topo">
        <h2>
          Todos os dispositivos <small>{dispositivos.length} encontrados</small>
        </h2>
      </div>

      {dispositivos.length === 0 ? (
        <p className="lista-vazia">Nenhum dispositivo encontrado.</p>
      ) : (
        <div className="lista-dispositivos">
          {dispositivos.map((d) => (
            <CardDispositivo
              key={d.id}
              dispositivo={d}
              selecionado={d.id === selecionadoId}
              onSelecionar={() => onSelecionar(d.id)}
              onAlternar={() => onAlternar(d.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
