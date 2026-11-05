export default function Interruptor({ ligado, onAlternar, rotulo = "Ligar ou desligar" }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      className={`botao-ligar ${ligado ? "botao-ligar-ativo" : ""}`}
      onClick={(evento) => {
        evento.stopPropagation();
        onAlternar();
      }}
    >
      <span className="botao-ligar-bolinha" />
    </button>
  );
}
