"use client";

import { useEffect } from "react";
import styles from "./ModalProfessor.module.css";
import modalStyles from "../../admin/equipamentos/page.module.css";

export default function ModalProfessor({ titulo, descricao, onClose, children, largura = "normal", icone }) {
  useEffect(() => {
    function fecharComEscape(evento) {
      if (evento.key === "Escape") onClose();
    }
    window.addEventListener("keydown", fecharComEscape);
    return () => window.removeEventListener("keydown", fecharComEscape);
  }, [onClose]);

  return (
    <div className={styles.fundo} onMouseDown={(evento) => evento.target === evento.currentTarget && onClose()}>
      <section className={`${styles.modal} ${largura === "larga" ? styles.modalLargo : ""}`} role="dialog" aria-modal="true" aria-labelledby="titulo-modal-professor">
        <header className={styles.cabecalho}>
          <div className={styles.cabecalhoEsquerdo}>
            {icone && (
              <div className={modalStyles.modalHeaderIcon}>
                <span className="material-symbols-outlined" aria-hidden="true">{icone}</span>
              </div>
            )}
            <div className={styles.titulos}>
              <h2 id="titulo-modal-professor">{titulo}</h2>
              {descricao && <p>{descricao}</p>}
            </div>
          </div>
          <button className={styles.fechar} type="button" onClick={onClose} aria-label="Fechar janela">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </header>
        <div className={styles.conteudo}>{children}</div>
      </section>
    </div>
  );
}
