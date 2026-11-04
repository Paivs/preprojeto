'use client';
/* ============================================================
   PLANTA AO VIVO · MAPA DE CALOR  ( /planta )
   Atualiza sozinha a cada 15 s. O controle deslizante faz o
   "replay" das últimas 24 h (estimado pela tendência de cada máquina).
   ============================================================ */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Painel from '@/components/Painel';
import AtivoModal from '@/components/AtivoModal';
import { Gauge } from '@/components/graficos';
import { Badge, Carga, Vazio, useLoad, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { NOMES } from '@/lib/util';

const INTERVALO_SEGUNDOS = 15;
const PRIORIDADE_DO_STATUS = { critico: 'alta', atencao: 'media', normal: 'baixa' };

/** Painel lateral com a análise preditiva da máquina escolhida. */
function PainelAtivo({ id, onHistorico }) {
  const toast = useToast();
  const analise = useLoad(() => api.ativoPreditivo(id), [id]);
  const [gerando, setGerando] = useState(false);

  async function gerarOS(p) {
    setGerando(true);
    try {
      const os = await api.criarOS({
        ativo: p.id,
        titulo: 'Inspeção preditiva · ' + p.nome,
        prioridade: PRIORIDADE_DO_STATUS[p.status],
        origem: 'planta'
      });
      toast(<>{os.id} criada para a {p.id}. <Link className="text-warning fw-bold" href={`/ordens?os=${os.id}`}>Ver no quadro</Link></>);
    } catch (err) {
      toast(err.message, 'danger');
    } finally {
      setGerando(false);
    }
  }

  return (
    <Carga l={analise}>
      {p => (
        <>
          <h2>{p.id} · {p.nome}</h2>
          <Gauge dias={p.rulDias} />
          <p className="text-center text-secondary mb-3">Confiança do modelo: <b className="text-body">{p.confianca}%</b></p>

          <h3 className="h6">{p.status === 'normal' ? 'Fatores de risco acompanhados' : 'O que está causando o alerta'}</h3>
          {p.causas.length ? p.causas.map(c => (
            <div className="mb-2" key={c.nome}>
              <div className="pm-row"><span>{c.nome}</span><span>{c.pct}%</span></div>
              <div className="pm-bar y"><i style={{ width: c.pct + '%' }} /></div>
            </div>
          )) : <p className="text-secondary">Sem medições para analisar.</p>}

          <div className="d-grid gap-2 mt-4">
            <button className="btn btn-primary py-2" disabled={gerando} onClick={() => gerarOS(p)}>Gerar ordem de serviço</button>
            <button className="btn btn-outline-dark py-2" onClick={onHistorico}>Ver histórico do ativo</button>
          </div>
        </>
      )}
    </Carga>
  );
}

export default function Planta() {
  const [horas, setHoras] = useState(0);              // posição do controle deslizante
  const [horasAplicadas, setHorasAplicadas] = useState(0); // valor enviado à API (ao soltar)
  const [segundos, setSegundos] = useState(0);
  const [selecionada, setSelecionada] = useState(null);
  const [historico, setHistorico] = useState(null);

  const planta = useLoad(() => api.planta({ horas: horasAplicadas }), [horasAplicadas]);
  const todas = planta.data ? planta.data.zonas.flatMap(z => z.maquinas) : [];
  // Sem escolha do usuário, mostra a máquina mais crítica
  const idAtivo = selecionada || (todas.find(m => m.status === 'critico') || todas[0])?.id;

  // Guarda valores atuais para o relógio (que roda fora do ciclo de render)
  const atual = useRef({});
  useEffect(() => {
    atual.current = { horasAplicadas, recarregar: planta.recarregar };
  });

  // Relógio "atualizado há N s": recarrega a cada 15 s quando está ao vivo
  useEffect(() => {
    const relogio = setInterval(() => {
      if (atual.current.horasAplicadas !== 0) return;
      setSegundos(s => {
        if (s + 1 >= INTERVALO_SEGUNDOS) {
          atual.current.recarregar();
          return 0;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(relogio);
  }, []);

  function aplicarReplay() {
    setHorasAplicadas(horas);
    setSegundos(0);
  }

  /** Baixa um CSV com a situação atual (abre direto no Excel). */
  function exportar() {
    if (!planta.data) return;
    const linhas = [
      'Setor;Máquina;Nome;Saúde (%);Status',
      ...planta.data.zonas.flatMap(z => z.maquinas.map(m => [z.nome, m.id, m.nome, m.saude, NOMES[m.status]].join(';')))
    ];
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob(['﻿' + linhas.join('\n')], { type: 'text/csv' }));
    link.download = 'planta-' + new Date().toISOString().slice(0, 10) + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <Painel titulo="Planta ao vivo · mapa de calor" acao={{ label: 'Exportar relatório', onClick: exportar }}>
      <Carga l={planta}>
        {d => (
          <div className="row g-3">
            <div className="col-xl-8">
              <section className="pm-card h-100">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                  <span role="status">
                    {horasAplicadas === 0
                      ? <><span className="live-dot" /><b>Ao vivo</b> · atualizado há {segundos} s</>
                      : <><b>Replay</b> · a planta como estava há {-horasAplicadas} h</>}
                  </span>
                  <span className="d-flex gap-2"><Badge k="normal" /><Badge k="atencao" /><Badge k="critico" /></span>
                </div>

                <div className="row g-3">
                  {d.zonas.map(z => (
                    <div className="col-md-6" key={z.nome}>
                      <div className="pm-zone">
                        <h3>{z.nome}</h3>
                        <div className="pm-nodes">
                          {z.maquinas.map(m => (
                            <button key={m.id} className={`pm-node n-${m.status}${m.id === idAtivo ? ' sel' : ''}`}
                              title={`${m.nome} · saúde ${m.saude}%`}
                              aria-label={`${m.id}, ${m.nome}, ${NOMES[m.status]}, saúde ${m.saude}%`}
                              onClick={() => setSelecionada(m.id)}>
                              {m.id}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="form-label" htmlFor="rep">Voltar no tempo: replay das últimas 24 h</label>
                  <div className="d-flex align-items-center gap-3">
                    <span className="text-nowrap">-24 h</span>
                    <input id="rep" className="pm-replay" type="range" min="-24" max="0" step="1" value={horas}
                      onChange={e => setHoras(Number(e.target.value))}
                      onMouseUp={aplicarReplay} onTouchEnd={aplicarReplay} onKeyUp={aplicarReplay} />
                    <strong className="text-nowrap">{horas === 0 ? 'Agora' : horas + ' h'}</strong>
                  </div>
                </div>
              </section>
            </div>

            <div className="col-xl-4">
              <section className="pm-card h-100" aria-live="polite">
                {idAtivo ? <PainelAtivo id={idAtivo} onHistorico={() => setHistorico(idAtivo)} /> : <Vazio titulo="Escolha uma máquina" />}
              </section>
            </div>
          </div>
        )}
      </Carga>
      {historico && <AtivoModal id={historico} onClose={() => setHistorico(null)} />}
    </Painel>
  );
}
