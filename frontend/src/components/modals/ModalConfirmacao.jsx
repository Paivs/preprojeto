import Modal from "./Modal";

export default function ModalConfirmacao({ titulo, mensagem, textoConfirmar, onConfirmar, onFechar }) {
  return (
    <Modal titulo={titulo} onFechar={onFechar}>
      <div className="modal-formulario">
        <p className="modal-mensagem">{mensagem}</p>
        <div className="modal-botoes">
          <button type="button" className="botao-secundario" onClick={onFechar}>
            Cancelar
          </button>
          <button type="button" className="botao-perigo" onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </Modal>
  );
}
