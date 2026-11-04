'use client';
/* ============================================================
   DASHBOARD DE INDICADORES  ( /dashboard )
   Cada cartão pode ser clicado para abrir uma versão ampliada.
   ============================================================ */
import { useState } from 'react';
import Link from 'next/link';
import Painel from '@/components/Painel';
import { LineChart } from '@/components/graficos';
import { Badge, Carga, Mini, Modal, SaudeBar, Vazio, useLoad } from '@/components/ui';
import { api } from '@/lib/api';
import { GRANDEZAS, capitalizar, num, saudacao } from '@/lib/util';

const valorKpi = k => num(k.valor, k.casas) + k.unidade;
const PERIODOS = [[7, '7 dias'], [14, '14 dias'], [0, 'Tudo']];

/** Cartão clicável que abre o modo "em foco". */
function Foco({ chave, rotulo, onAbrir, children }) {
  const abrir = () => onAbrir(chave);
  return (
    <section className="pm-card pm-focus h-100" tabIndex={0} role="button" aria-label={`Ampliar: ${rotulo}`}
      onClick={abrir}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); } }}>
      {children}
    </section>
  );
}

/** Barras das ordens de serviço por status. */
function BarrasOS({ os, grande = false }) {
  const linhas = [
    ['Abertas', os.abertas, ''],
    ['Em andamento', os.andamento, 'y'],
    ['Aguardando peça', os.peca, 'gr'],
    ['Concluídas (30 dias)', os.concluidas, 'g']
  ];
  const maximo = Math.max(1, ...linhas.map(l => l[1])) * 1.15;
  return linhas.map(([texto, valor, cor]) => (
    <div className="mb-3" key={texto}>
      <div className="pm-row"><span>{texto}</span><span>{valor}</span></div>
      <div className={`pm-bar ${cor} ${grande ? 'lg' : ''}`}><i style={{ width: (valor / maximo * 100).toFixed(0) + '%' }} /></div>
    </div>
  ));
}

/** Gráfico ampliado: o usuário escolhe máquina, grandeza e período. */
function TendenciaEmFoco({ d }) {
  const [maquina, setMaquina] = useState(d.destaque.maquina);
  const [grandeza, setGrandeza] = useState(d.destaque.grandeza);
  const [dias, setDias] = useState(0);
  const serie = useLoad(() => api.serie(maquina, grandeza, dias), [maquina, grandeza, dias]);

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-sm-4">
          <label className="form-label" htmlFor="ex-m">Máquina</label>
          <select id="ex-m" className="form-select" value={maquina} onChange={e => setMaquina(e.target.value)}>
            {d.maquinas.map(m => <option key={m.id} value={m.id}>{m.id} · {m.nome}</option>)}
          </select>
        </div>
        <div className="col-sm-4">
          <label className="form-label" htmlFor="ex-g">Grandeza</label>
          <select id="ex-g" className="form-select" value={grandeza} onChange={e => setGrandeza(e.target.value)}>
            {GRANDEZAS.map(g => <option key={g.codigo} value={g.codigo}>{g.nome}</option>)}
          </select>
        </div>
        <div className="col-sm-4">
          <span className="form-label d-block">Período</span>
          <div className="btn-group w-100">
            {PERIODOS.map(([v, texto]) => (
              <span key={v} className="d-contents">
                <input type="radio" className="btn-check" name="per" id={'per' + v} checked={dias === v} onChange={() => setDias(v)} />
                <label className="btn btn-outline-dark" htmlFor={'per' + v}>{texto}</label>
              </span>
            ))}
          </div>
        </div>
      </div>

      <Carga l={serie}>
        {s => {
          if (!s.pontos.length) return <Vazio titulo="Sem leituras neste período" sub="Escolha um período maior." />;
          const ultima = s.pontos.at(-1).y;
          const maior = Math.max(...s.pontos.map(p => p.y));
          const folga = ultima - s.limite;
          const resumo = [
            ['Última leitura', `${num(ultima)} ${s.unidade}`],
            ['Maior valor', `${num(maior)} ${s.unidade}`],
            ['Limite de alarme', `${num(s.limite)} ${s.unidade}`],
            ['Folga', folga > 0 ? `${num(folga)} acima do limite` : `${num(-folga)} abaixo do limite`]
          ];
          return (
            <>
              <LineChart pts={s.pontos} limite={s.limite} unit={s.unidade} big h={340} label={`${s.nome} de ${s.maquina}`} />
              <div className="row g-3 mt-1">
                {resumo.map(([a, b]) => <div key={a} className="col-6 col-md-3"><Mini rotulo={a} valor={b} /></div>)}
              </div>
            </>
          );
        }}
      </Carga>
    </>
  );
}

/** Conteúdo principal do dashboard. */
function Conteudo({ d, usuario, onAbrir }) {
  const critico = d.alertas.find(a => a.nivel === 'critico');
  const t = d.destaque;

  return (
    <>
      <p className="pm-hello">
        {saudacao()}, {usuario.nome.split(' ')[0]}.{' '}
        {critico
          ? <>A <b>{critico.ativo}</b> está pedindo atenção: {critico.titulo.toLowerCase()}, há {critico.ha}. </>
          : 'A planta está tranquila agora. '}
        Clique em qualquer gráfico ou indicador para vê-lo em destaque.
      </p>

      <div className="row g-3">
        {d.kpis.map(k => (
          <div className="col-6 col-xl-3" key={k.k}>
            <Foco chave={'kpi:' + k.k} rotulo={k.rotulo} onAbrir={onAbrir}>
              <p className="pm-lbl">{k.rotulo}</p>
              <p className="pm-kpi">{valorKpi(k)}</p>
              <p className="pm-sub">{k.sub}</p>
            </Foco>
          </div>
        ))}

        <div className="col-xl-8">
          <Foco chave="tendencia" rotulo="tendência" onAbrir={onAbrir}>
            {t ? (
              <>
                <h2>{t.nome} · {t.maquinaNome} {t.maquina} ({t.unidade})</h2>
                <LineChart pts={t.pontos} limite={t.limite} unit={t.unidade} label={`${t.nome} da ${t.maquina}`} />
              </>
            ) : <Vazio titulo="Sem medições ainda" />}
          </Foco>
        </div>

        <div className="col-xl-4">
          <Foco chave="alertas" rotulo="alertas recentes" onAbrir={onAbrir}>
            <h2>Alertas recentes</h2>
            {d.alertas.length ? d.alertas.map(a => (
              <div className="pm-alert-i" key={a.id}>
                <Badge k={a.nivel} />
                <div><strong>{a.titulo}</strong><small>{a.ativo} · há {a.ha}</small></div>
              </div>
            )) : <Vazio titulo="Sem alertas novos" sub="Bom sinal." />}
          </Foco>
        </div>

        <div className="col-xl-7">
          <Foco chave="saude" rotulo="saúde dos ativos" onAbrir={onAbrir}>
            <h2>Saúde dos ativos</h2>
            <div className="table-responsive">
              <table className="table">
                <thead><tr><th>MÁQUINA</th><th>ÍNDICE DE SAÚDE</th><th>STATUS</th></tr></thead>
                <tbody>
                  {d.saude.slice(0, 4).map(m => (
                    <tr key={m.id}><td>{m.nome} {m.id}</td><td><SaudeBar v={m.saude} /></td><td><Badge k={m.status} /></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Foco>
        </div>

        <div className="col-xl-5">
          <Foco chave="os" rotulo="ordens de serviço por status" onAbrir={onAbrir}>
            <h2>Ordens de serviço por status</h2>
            <BarrasOS os={d.osPorStatus} />
          </Foco>
        </div>
      </div>
    </>
  );
}

/** Modal com a versão ampliada do cartão escolhido. */
function Ampliado({ chave, d, onClose }) {
  const [tipo, codigo] = chave.split(':');
  const kpi = tipo === 'kpi' ? d.kpis.find(x => x.k === codigo) : null;
  const os = d.osPorStatus;
  const TITULOS = { tendencia: 'Tendência em detalhe', alertas: 'Alertas ativos', saude: 'Saúde de todos os ativos', os: 'Ordens de serviço por status' };

  return (
    <Modal titulo={kpi ? kpi.rotulo : TITULOS[tipo]} size="modal-xl" onClose={onClose}>
      {kpi && (
        <div className="row g-4 align-items-center">
          <div className="col-lg-4">
            <p className="pm-lbl">{kpi.rotulo}</p>
            <p className="pm-kpi pm-kpi-xl">{valorKpi(kpi)}</p>
            <p className="mb-3">{kpi.sub}</p>
            <p className="text-secondary">{kpi.explica}</p>
          </div>
          <div className="col-lg-8">
            <h3 className="h6">Últimas 8 semanas</h3>
            <LineChart pts={kpi.historico} big h={320} limite={kpi.meta} limiteLabel="Meta" unit={kpi.unidade}
              dec={kpi.casas} min={kpi.escalaMin} label={'Histórico de ' + kpi.rotulo} />
          </div>
        </div>
      )}

      {tipo === 'tendencia' && d.destaque && <TendenciaEmFoco d={d} />}

      {tipo === 'alertas' && (
        <div className="row g-4">
          <div className="col-lg-7">
            {d.todosAlertas.map(a => (
              <div className="pm-alert-i" key={a.id}>
                <Badge k={a.nivel} />
                <div>
                  <strong>{a.titulo}</strong>
                  <small>{a.ativo} · há {a.ha} · {capitalizar(a.estado)}</small>
                  <small>{a.acao}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="col-lg-5">
            <div className="mb-3"><Mini rotulo="Críticos" valor={d.todosAlertas.filter(a => a.nivel === 'critico').length} /></div>
            <div className="mb-3"><Mini rotulo="Em atenção" valor={d.todosAlertas.filter(a => a.nivel === 'atencao').length} /></div>
            <Link className="btn btn-primary" href="/alertas">Abrir a central de alertas</Link>
          </div>
        </div>
      )}

      {tipo === 'saude' && (
        <div className="table-responsive">
          <table className="table">
            <thead><tr><th>CÓDIGO</th><th>MÁQUINA</th><th>SETOR</th><th>ÍNDICE DE SAÚDE</th><th>STATUS</th></tr></thead>
            <tbody>
              {d.saude.map(m => (
                <tr key={m.id}>
                  <td><b>{m.id}</b></td><td>{m.nome}</td><td>{m.setor}</td>
                  <td style={{ minWidth: 200 }}><SaudeBar v={m.saude} /></td><td><Badge k={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tipo === 'os' && (
        <div className="row g-4">
          <div className="col-lg-7"><BarrasOS os={os} grande /></div>
          <div className="col-lg-5">
            <div className="mb-3"><Mini rotulo="Com prazo vencido" valor={os.vencidas} /></div>
            <h3 className="h6">Próximos prazos</h3>
            {os.proximas.map(o => (
              <Link key={o.id} href={`/ordens?os=${o.id}`} className="d-flex justify-content-between text-decoration-none py-1">
                <span><b>{o.id}</b> {o.titulo}</span>
                <span className={o.vencida ? 'text-danger fw-bold' : ''}>{o.prazo}</span>
              </Link>
            ))}
            <Link className="btn btn-primary mt-3" href="/ordens">Ver o quadro de ordens</Link>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function Dashboard() {
  const dados = useLoad(() => api.dashboard());
  const [foco, setFoco] = useState(null);

  return (
    <Painel titulo="Dashboard de indicadores" acao={{ label: 'Registrar medição', href: '/medicoes' }}>
      {usuario => (
        <Carga l={dados}>
          {d => (
            <>
              <Conteudo d={d} usuario={usuario} onAbrir={setFoco} />
              {foco && <Ampliado chave={foco} d={d} onClose={() => setFoco(null)} />}
            </>
          )}
        </Carga>
      )}
    </Painel>
  );
}
