'use client';
/* ============================================================
   COMPONENTES BÁSICOS DE INTERFACE
   Selos, barras, estados vazios, carregamento de dados,
   avisos (toast) e janela modal — tudo com classes do Bootstrap.
   ============================================================ */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NOMES } from '@/lib/util';

/* ---------- Pecinhas visuais ---------- */

/** Selo colorido. k = critico | atencao | normal | info | alta | media | baixa | neutro */
export function Badge({ k, children }) {
  return <span className={`pm-b pm-b-${k}`}>{children ?? NOMES[k] ?? k}</span>;
}

/** Barra horizontal com o índice de saúde (0 a 100). */
export function SaudeBar({ v }) {
  return (
    <div className="pm-health">
      <div className="pm-bar"><i style={{ width: v + '%' }} /></div>
      <span>{v}%</span>
    </div>
  );
}

/** Mensagem para listas vazias. */
export function Vazio({ titulo, sub, children }) {
  return (
    <div className="pm-empty">
      <strong>{titulo}</strong>
      {sub}
      {children}
    </div>
  );
}

/** Caixinha cinza com rótulo e valor. */
export function Mini({ rotulo, valor }) {
  return (
    <div className="pm-mini">
      <span className="pm-lbl">{rotulo}</span>
      <b>{valor}</b>
    </div>
  );
}

/** Cartão de indicador (rótulo, número grande e explicação). */
export function CartaoKpi({ rotulo, valor, sub }) {
  return (
    <div className="pm-card h-100">
      <p className="pm-lbl">{rotulo}</p>
      <p className="pm-kpi">{valor}</p>
      <p className="pm-sub">{sub}</p>
    </div>
  );
}

/** Grupo de botões de rádio com cara de "chip". */
export function Chips({ nome, opcoes, valor, onChange }) {
  return (
    <div className="d-flex flex-wrap gap-2">
      {opcoes.map(opcao => {
        const [v, texto] = Array.isArray(opcao) ? opcao : [opcao, opcao];
        const id = `${nome}-${String(v).replace(/\s+/g, '-')}`; // id não pode ter espaço
        return (
          <span key={v} className="d-contents">
            <input type="radio" className="btn-check" name={nome} id={id} checked={valor === v} onChange={() => onChange(v)} />
            <label className="btn btn-outline-dark chip" htmlFor={id}>{texto}</label>
          </span>
        );
      })}
    </div>
  );
}

/* ---------- Carregamento de dados ---------- */

/**
 * Busca dados da API e controla os estados de carregamento e erro.
 * Uso: const lista = useLoad(() => api.maquinas({ setor }), [setor]);
 *      lista.data, lista.erro, lista.carregando, lista.recarregar(), lista.setData(...)
 */
export function useLoad(buscar, dependencias = []) {
  const [estado, setEstado] = useState({ data: null, erro: null, carregando: true });
  const buscarRef = useRef(buscar);     // sempre a versão mais nova da função de busca
  const ultimaBusca = useRef(0);        // ignora respostas antigas que chegarem atrasadas
  const chave = JSON.stringify(dependencias);

  useEffect(() => {
    buscarRef.current = buscar;
  });

  const recarregar = useCallback(async () => {
    const numero = ++ultimaBusca.current;
    setEstado(atual => ({ ...atual, erro: null, carregando: true }));
    try {
      const data = await buscarRef.current();
      if (numero === ultimaBusca.current) setEstado({ data, erro: null, carregando: false });
    } catch (e) {
      if (numero === ultimaBusca.current) setEstado({ data: null, erro: e.message, carregando: false });
    }
  }, []);

  // Busca ao montar e de novo sempre que as dependências mudarem
  // (buscar dados da API é exatamente o uso previsto de um efeito)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recarregar();
  }, [chave, recarregar]);

  const setData = useCallback(novo => {
    setEstado(atual => ({ ...atual, data: typeof novo === 'function' ? novo(atual.data) : novo }));
  }, []);

  return { ...estado, recarregar, setData };
}

/**
 * Mostra "carregando" ou o erro; quando os dados chegam, chama children(dados).
 * Uso: <Carga l={lista}>{dados => <Tabela dados={dados} />}</Carga>
 */
export function Carga({ l, children }) {
  if (l.erro) {
    return (
      <div className="pm-empty">
        <strong>Não consegui carregar esta tela.</strong>
        {l.erro}
        <div className="mt-3">
          <button className="btn btn-primary" onClick={l.recarregar}>Tentar de novo</button>
        </div>
      </div>
    );
  }
  if (l.carregando && !l.data) {
    return <p className="text-secondary" role="status">Buscando os dados da planta…</p>;
  }
  return children(l.data);
}

/* ---------- Avisos (toast) ---------- */

const ToastContexto = createContext(() => {});

/** Uso: const toast = useToast(); toast('Salvo!'); toast('Erro', 'danger'); */
export const useToast = () => useContext(ToastContexto);

export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([]);

  const remover = useCallback(id => setAvisos(lista => lista.filter(a => a.id !== id)), []);

  const mostrar = useCallback((mensagem, tipo = 'dark') => {
    const id = Date.now() + Math.random();
    setAvisos(lista => [...lista, { id, mensagem, tipo }]);
    setTimeout(() => remover(id), 5500);
  }, [remover]);

  return (
    <ToastContexto.Provider value={mostrar}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2000 }}>
        {avisos.map(a => (
          <div key={a.id} className={`toast show align-items-center border-0 text-bg-${a.tipo}`} role="status">
            <div className="d-flex">
              <div className="toast-body">{a.mensagem}</div>
              <button
                className={`btn-close ${a.tipo === 'warning' ? '' : 'btn-close-white'} me-2 m-auto`}
                aria-label="Fechar"
                onClick={() => remover(a.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContexto.Provider>
  );
}

/* ---------- Janela modal ---------- */

/**
 * Modal do Bootstrap controlada pelo React (sem o JavaScript do Bootstrap).
 * Fecha com Esc, com o X ou clicando fora.
 */
export function Modal({ titulo, onClose, size = '', footer, children }) {
  useEffect(() => {
    document.body.classList.add('modal-open');
    const aoTeclar = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [onClose]);

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className={`modal-dialog modal-dialog-scrollable modal-dialog-centered ${size}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title h5">{titulo}</h2>
              <button className="btn-close" aria-label="Fechar" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
