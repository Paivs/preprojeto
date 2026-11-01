"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./loading.css";

const TEMPO_CARREGAMENTO = 1000;
const TEMPO_SAIDA = 350;

// alternando 点 e 検 (ten ken)
const SIMBOLOS = ["点", "検", "点", "検", "点", "検", "点", "検"];

export default function InitialLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    setVisible(true);
    const temporizador = window.setTimeout(() => {
      window.dispatchEvent(new Event("tenken:loader-complete"));
      setExiting(true);
    }, TEMPO_CARREGAMENTO);
    const saida = window.setTimeout(() => setVisible(false), TEMPO_CARREGAMENTO + TEMPO_SAIDA);

    return () => {
      window.clearTimeout(temporizador);
      window.clearTimeout(saida);
    };
  }, []);

  if (pathname !== "/" || !visible) return null;

  return (
    <div className={`overlay${exiting ? " overlay--saindo" : ""}`} role="status" aria-label="Carregando o sistema Tenken">
      <div className="content">
        <div className="kanji-spinner" aria-hidden="true">
          {SIMBOLOS.map((simbolo, indice) => (
            <div key={indice} className="kanji-spinner__item">
              <span>{simbolo}</span>
            </div>
          ))}
        </div>
        <span className="loader-subtitle">CARREGANDO</span>
      </div>
    </div>
  );
}
