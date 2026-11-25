"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import "./toast.css";

const ToastContext = createContext(null);
const DURACAO_PADRAO = 4500;
const TEMPO_SAIDA = 180;

const TIPOS = {
  success: { titulo: "Sucesso", icone: "bi-check-circle-fill" },
  error: { titulo: "Erro", icone: "bi-x-circle-fill" },
  warning: { titulo: "Atenção", icone: "bi-exclamation-triangle-fill" },
  info: { titulo: "Informação", icone: "bi-info-circle-fill" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const proximoId = useRef(0);
  const chavesAtivas = useRef(new Set());
  const temporizadores = useRef(new Map());
  const fechando = useRef(new Set());

  const fechar = useCallback((id) => {
    if (fechando.current.has(id)) return;
    fechando.current.add(id);

    const temporizador = temporizadores.current.get(id);
    if (temporizador) window.clearTimeout(temporizador);

    setToasts((atuais) => atuais.map((toast) => (
      toast.id === id ? { ...toast, saindo: true } : toast
    )));

    const temporizadorSaida = window.setTimeout(() => {
      setToasts((atuais) => atuais.filter((toast) => toast.id !== id));
      const toast = toastsRef.current.get(id);
      if (toast) chavesAtivas.current.delete(toast.chave);
      toastsRef.current.delete(id);
      temporizadores.current.delete(id);
      fechando.current.delete(id);
    }, TEMPO_SAIDA);

    temporizadores.current.set(id, temporizadorSaida);
  }, []);

  const toastsRef = useRef(new Map());

  const mostrar = useCallback((tipo, mensagem, opcoes = {}) => {
    const configuracao = TIPOS[tipo] ? tipo : "info";
    const texto = String(mensagem || "").trim();
    if (!texto) return;

    const chave = `${configuracao}:${texto}`;
    if (chavesAtivas.current.has(chave)) return;

    const id = ++proximoId.current;
    const toast = { id, chave, tipo: configuracao, mensagem: texto, saindo: false };
    chavesAtivas.current.add(chave);
    toastsRef.current.set(id, toast);
    setToasts((atuais) => [...atuais, toast]);

    const duracao = Number.isFinite(opcoes.duracao)
      ? Math.max(1000, opcoes.duracao)
      : DURACAO_PADRAO;
    temporizadores.current.set(id, window.setTimeout(() => fechar(id), duracao));
  }, [fechar]);

  useEffect(() => () => {
    temporizadores.current.forEach((temporizador) => window.clearTimeout(temporizador));
    temporizadores.current.clear();
  }, []);

  const toast = useMemo(() => ({
    success: (mensagem, opcoes) => mostrar("success", mensagem, opcoes),
    error: (mensagem, opcoes) => mostrar("error", mensagem, opcoes),
    warning: (mensagem, opcoes) => mostrar("warning", mensagem, opcoes),
    info: (mensagem, opcoes) => mostrar("info", mensagem, opcoes),
  }), [mostrar]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-regiao" role="region" aria-label="Notificações">
        {toasts.map((item) => {
          const configuracao = TIPOS[item.tipo];
          return (
            <section
              className={`toast-item toast-${item.tipo}${item.saindo ? " toast-saindo" : ""}`}
              key={item.id}
              role={item.tipo === "error" ? "alert" : "status"}
              aria-atomic="true"
            >
              <i className={`bi ${configuracao.icone} toast-icone`} aria-hidden="true" />
              <div className="toast-conteudo">
                <strong>{configuracao.titulo}</strong>
                <p>{item.mensagem}</p>
              </div>
              <button
                type="button"
                className="toast-fechar"
                aria-label="Fechar notificação"
                onClick={() => fechar(item.id)}
              >
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </section>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error("useToast precisa estar dentro de ToastProvider.");
  return contexto;
}
