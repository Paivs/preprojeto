import "./interruptor.css";

export default function Interruptor({
  ligado,
  onAlternar,
  rotulo = "Ligar ou desligar",
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      className={`interruptor ${ligado ? "interruptor-ativo" : ""}`}
      onClick={(evento) => {
        evento.stopPropagation();
        onAlternar();
      }}
    >
      <span className="interruptor-bolinha" />
    </button>
  );
}
