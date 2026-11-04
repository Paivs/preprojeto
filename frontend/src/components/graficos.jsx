'use client';
/* ============================================================
   GRÁFICOS EM SVG (sem biblioteca externa)
   - LineChart: linha de tendência com limite e dica ao passar o mouse
   - Gauge: medidor de vida útil restante
   ============================================================ */
import { useEffect, useRef, useState } from 'react';
import { num } from '@/lib/util';

/**
 * Gráfico de linha.
 * pts: [{ x: '22/10', y: 6.4 }, ...]   limite: linha tracejada vermelha (opcional)
 * big: versão ampliada (mais rótulos e eixo Y)
 */
export function LineChart({
  pts, limite, limiteLabel = 'Limite de alarme', unit = '', h = 220, big = false,
  min = 0, dec = 1, label = 'Gráfico de tendência'
}) {
  const caixaRef = useRef(null);
  const svgRef = useRef(null);
  const [largura, setLargura] = useState(600);
  const [dica, setDica] = useState(null); // { indice, left, top } enquanto o mouse está em cima

  // O SVG acompanha a largura do cartão
  useEffect(() => {
    const el = caixaRef.current;
    const medir = () => setLargura(Math.max(el.clientWidth, 280));
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  if (!pts || !pts.length) {
    return <div className="pm-chart pm-chart-vazio" ref={caixaRef}><p className="text-secondary m-0">Sem leituras neste período.</p></div>;
  }

  // ----- Escalas -----
  const margem = { t: 18, r: 20, b: 30, l: big ? 48 : 14 };
  const max = Math.max(...pts.map(p => p.y), limite ?? 0) * 1.1 || 1;
  const larguraUtil = largura - margem.l - margem.r;
  const X = i => margem.l + larguraUtil * (pts.length < 2 ? 0.5 : i / (pts.length - 1));
  const Y = v => h - margem.b - (h - margem.t - margem.b) * ((v - min) / (max - min || 1));

  // ----- Rótulos do eixo X (sem amontoar) -----
  let indicesX;
  if (big) {
    const passo = Math.max(1, Math.ceil(pts.length / 8));
    indicesX = pts.map((_, i) => i).filter(i => i % passo === 0 || i === pts.length - 1);
    // tira o penúltimo se ele ficar colado no último
    if (indicesX.length > 1 && indicesX.at(-1) - indicesX.at(-2) < passo / 2) indicesX.splice(-2, 1);
  } else {
    indicesX = [0, Math.floor((pts.length - 1) / 2), pts.length - 1];
  }
  indicesX = [...new Set(indicesX)];

  const sufixo = unit ? (unit.startsWith(' ') || unit === '%' ? unit : ' ' + unit) : '';
  const indiceAtivo = dica ? dica.indice : pts.length - 1; // sem mouse, destaca o último ponto
  const ponto = pts[indiceAtivo];

  // Converte a posição do mouse no índice do ponto mais próximo
  function aoMoverMouse(e) {
    const r = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) * (largura / r.width);
    const indice = Math.max(0, Math.min(pts.length - 1, Math.round((x - margem.l) / (larguraUtil / (pts.length - 1 || 1)))));
    setDica({
      indice,
      left: X(indice) * r.width / largura,
      top: Y(pts[indice].y) * r.height / h
    });
  }

  const caminho = pts.map((p, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p.y).toFixed(1)).join('');

  return (
    <div className="pm-chart" ref={caixaRef}>
      <svg ref={svgRef} viewBox={`0 0 ${largura} ${h}`} role="img" aria-label={label}
        onPointerMove={aoMoverMouse} onPointerLeave={() => setDica(null)}>
        {/* linhas de grade e eixo Y */}
        {[0, 1, 2, 3, 4].map(k => {
          const v = min + (max - min) * k / 4;
          return (
            <g key={k}>
              <line className="grid" x1={margem.l} x2={largura - margem.r} y1={Y(v)} y2={Y(v)} />
              {big && <text className="tick" x={margem.l - 8} y={Y(v) + 4} textAnchor="end">{num(v, dec)}</text>}
            </g>
          );
        })}

        {/* rótulos do eixo X */}
        {indicesX.map(i => (
          <text key={i} className="tick" x={X(i)} y={h - 8}
            textAnchor={i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}>
            {pts[i].x}
          </text>
        ))}

        {/* limite de alarme / meta */}
        {limite != null && (
          <g>
            <line className="limit" x1={margem.l} x2={largura - margem.r} y1={Y(limite)} y2={Y(limite)} />
            <text className="limit-t" x={largura - margem.r} y={Y(limite) - 6} textAnchor="end">{limiteLabel}</text>
          </g>
        )}

        <path className="line" d={caminho} />
        {dica && <line className="cross" x1={X(indiceAtivo)} x2={X(indiceAtivo)} y1={margem.t} y2={h - margem.b} />}
        <circle className="dot" cx={X(indiceAtivo)} cy={Y(ponto.y)} r="6" />
      </svg>

      {dica && (
        <div className="pm-tip" style={{ left: dica.left, top: dica.top }}>
          {ponto.x} · {num(ponto.y, dec)}{sufixo}
        </div>
      )}
    </div>
  );
}

/** Medidor em arco: verde (> 21 dias), amarelo (8 a 21) e vermelho (até 7). */
export function Gauge({ dias, max = 30 }) {
  const raio = 70, cx = 90, cy = 90, inicio = 150, abertura = 240;
  const pontoDoArco = angulo => [cx + raio * Math.cos(angulo * Math.PI / 180), cy + raio * Math.sin(angulo * Math.PI / 180)];
  const arco = (a, b) => {
    const [x1, y1] = pontoDoArco(a);
    const [x2, y2] = pontoDoArco(b);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${raio} ${raio} 0 ${b - a > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };

  const fracao = Math.max(0.03, Math.min(dias / max, 1));
  const cor = dias <= 7 ? 'var(--pm-red)' : dias <= 21 ? 'var(--pm-yellow)' : 'var(--pm-green)';

  return (
    <svg className="gauge" viewBox="0 0 180 150" role="img" aria-label={`${dias} dias de vida útil restante`}>
      <path className="g-bg" d={arco(inicio, inicio + abertura)} />
      <path d={arco(inicio, inicio + abertura * fracao)} style={{ stroke: cor }} />
      <text className="g-num" x="90" y="92" textAnchor="middle">{dias} {dias === 1 ? 'dia' : 'dias'}</text>
      <text className="g-t" x="90" y="110" textAnchor="middle">vida útil restante</text>
    </svg>
  );
}
