'use client';
/* ============================================================
   REGISTRO DE MEDIÇÕES  ( /medicoes )
   Ao salvar, a API recalcula a saúde da máquina e abre um alerta
   se a leitura passar do limite.
   ============================================================ */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Painel from '@/components/Painel';
import { LineChart } from '@/components/graficos';
import { Badge, Carga, Vazio, useLoad, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { GRANDEZAS, num, param } from '@/lib/util';

/** Data/hora local no formato do <input type="datetime-local">. */
function agora() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function Medicoes() {
  const toast = useToast();
  const campoValor = useRef(null);
  const [maquinaEscolhida, setMaquinaEscolhida] = useState('');
  const [grandeza, setGrandeza] = useState('vibracao');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [obs, setObs] = useState('');
  const [enviando, setEnviando] = useState(false);

  const maquinas = useLoad(() => api.maquinas({ ordem: 'codigo' }));
  // Máquina do formulário: a escolhida, a da URL (?maquina=PH-03) ou a primeira da lista
  const maquina = maquinaEscolhida || param('maquina') || maquinas.data?.[0]?.id || '';
  const unidade = GRANDEZAS.find(g => g.codigo === grandeza).unidade;

  const serie = useLoad(() => (maquina ? api.serie(maquina, grandeza) : Promise.resolve(null)), [maquina, grandeza]);
  const ultimas = useLoad(() => api.medicoes({ limite: 8 }));

  // Preenche a data/hora só no navegador (evita diferença entre servidor e cliente)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setData(agora()); }, []);

  async function salvar(e) {
    e.preventDefault();
    if (valor === '') {
      toast('Digite o valor lido no equipamento.', 'warning');
      return;
    }
    setEnviando(true);
    try {
      const r = await api.criarMedicao({ maquina, grandeza, valor: Number(valor), data, obs });
      const m = r.medicao;
      if (r.situacao === 'critico') {
        toast(<>{num(m.valor)} {m.unidade} passou do limite da {m.maquina}.{r.alertaCriado ? ' Abri um alerta crítico.' : ''}{' '}
          <Link className="text-warning fw-bold" href="/alertas">Ver alertas</Link></>, 'danger');
      } else if (r.situacao === 'atencao') {
        toast(`Medição salva. ${m.maquina} está chegando perto do limite, vale acompanhar.`, 'warning');
      } else {
        toast(`Medição salva. ${m.maquina} dentro do esperado.`);
      }
      setValor('');
      setObs('');
      setData(agora());
      serie.recarregar();
      ultimas.recarregar();
    } catch (err) {
      toast(err.message, 'danger');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Painel titulo="Registro de medições" acao={{ label: 'Registrar medição', onClick: () => campoValor.current?.focus() }}>
      <div className="row g-3">
        {/* Formulário */}
        <div className="col-lg-4">
          <section className="pm-card h-100">
            <h2>Nova medição</h2>
            <form onSubmit={salvar} noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="m-m">Máquina</label>
                <select id="m-m" className="form-select" value={maquina} onChange={e => setMaquinaEscolhida(e.target.value)}>
                  {(maquinas.data || []).map(m => <option key={m.id} value={m.id}>{m.id} · {m.nome}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="m-g">Grandeza</label>
                <select id="m-g" className="form-select" value={grandeza} onChange={e => setGrandeza(e.target.value)}>
                  {GRANDEZAS.map(g => <option key={g.codigo} value={g.codigo}>{g.nome}</option>)}
                </select>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-7">
                  <label className="form-label" htmlFor="m-v">Valor</label>
                  <input id="m-v" ref={campoValor} className="form-control" type="number" step="0.1" min="0" inputMode="decimal"
                    value={valor} onChange={e => setValor(e.target.value)} />
                </div>
                <div className="col-5">
                  {/* A unidade depende da grandeza: só leitura */}
                  <label className="form-label" htmlFor="m-u">Unidade</label>
                  <input id="m-u" className="form-control" value={unidade} readOnly tabIndex={-1} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="m-d">Data e hora</label>
                <input id="m-d" className="form-control" type="datetime-local" value={data} max={agora()} onChange={e => setData(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="m-o">Observações</label>
                <textarea id="m-o" className="form-control" rows={3} placeholder="Ex.: ruído anormal no mancal" value={obs} onChange={e => setObs(e.target.value)} />
              </div>
              <button className="btn btn-primary w-100 py-2" disabled={enviando || !maquina}>Salvar medição</button>
            </form>
          </section>
        </div>

        {/* Tendência e histórico */}
        <div className="col-lg-8">
          <section className="pm-card mb-3">
            <h2>{serie.data ? `Tendência · ${serie.data.maquina} · ${serie.data.nome}` : 'Tendência'}</h2>
            {serie.data && (
              <LineChart pts={serie.data.pontos} limite={serie.data.limite} unit={serie.data.unidade} h={240}
                label={`Tendência de ${serie.data.nome} da ${serie.data.maquina}`} />
            )}
          </section>

          <section className="pm-card">
            <h2>Últimas medições</h2>
            <Carga l={ultimas}>
              {lista => (
                <div className="table-responsive">
                  <table className="table">
                    <thead><tr><th>DATA</th><th>MÁQUINA</th><th>GRANDEZA</th><th>VALOR</th><th>SITUAÇÃO</th></tr></thead>
                    <tbody>
                      {lista.length ? lista.map(x => (
                        <tr key={x.id}>
                          <td>{x.data}</td>
                          <td>{x.maquina}</td>
                          <td>{x.nome}</td>
                          <td><b>{num(x.valor, 1)} {x.unidade}</b></td>
                          <td><Badge k={x.situacao}>{x.situacao === 'critico' ? 'Acima do limite' : undefined}</Badge></td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5}><Vazio titulo="Nenhuma medição ainda" sub="Registre a primeira ao lado." /></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Carga>
          </section>
        </div>
      </div>
    </Painel>
  );
}
