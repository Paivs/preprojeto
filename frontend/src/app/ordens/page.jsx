'use client';
/* ============================================================
   ORDENS DE SERVIÇO · QUADRO KANBAN  ( /ordens )
   Arraste um cartão para outra coluna para mudar o status.
   Concluir uma OS resolve o alerta e o chamado ligados a ela.
   ============================================================ */
import { useState } from 'react';
import Painel from '@/components/Painel';
import { Badge, Carga, Modal, useLoad, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { STATUS_OS, param } from '@/lib/util';

const COLUNAS = ['aberta', 'andamento', 'peca', 'concluida'];
const PRIORIDADES = [['alta', 'Alta'], ['media', 'Média'], ['baixa', 'Baixa']];

/** Formulário "Nova OS". */
function NovaOS({ maquinas, equipes, onClose, onCriada }) {
  const toast = useToast();
  const [form, setForm] = useState({ titulo: '', ativo: maquinas[0]?.id || '', equipe: '', prioridade: 'media', prazo: '', descricao: '' });
  const campo = nome => e => setForm({ ...form, [nome]: e.target.value });

  async function criar() {
    try {
      const os = await api.criarOS({ ...form, titulo: form.titulo.trim() });
      toast(`${os.id} criada e já está na coluna “abertas”.`);
      onCriada();
    } catch (e) {
      toast(e.message, 'danger');
    }
  }

  return (
    <Modal titulo="Nova ordem de serviço" onClose={onClose} footer={<button className="btn btn-primary" onClick={criar}>Criar OS</button>}>
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label" htmlFor="n-t">O que precisa ser feito?</label>
          <input className="form-control" id="n-t" placeholder="Ex.: Trocar rolamento do mancal" value={form.titulo} onChange={campo('titulo')} />
        </div>
        <div className="col-sm-6">
          <label className="form-label" htmlFor="n-a">Máquina</label>
          <select className="form-select" id="n-a" value={form.ativo} onChange={campo('ativo')}>
            {maquinas.map(m => <option key={m.id} value={m.id}>{m.id} · {m.nome}</option>)}
          </select>
        </div>
        <div className="col-sm-6">
          <label className="form-label" htmlFor="n-e">Equipe</label>
          <select className="form-select" id="n-e" value={form.equipe} onChange={campo('equipe')}>
            <option value="">Padrão do setor</option>
            {equipes.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div className="col-sm-6">
          <label className="form-label" htmlFor="n-p">Prioridade</label>
          <select className="form-select" id="n-p" value={form.prioridade} onChange={campo('prioridade')}>
            {PRIORIDADES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        </div>
        <div className="col-sm-6">
          <label className="form-label" htmlFor="n-d">Prazo</label>
          <input className="form-control" id="n-d" type="date" value={form.prazo} onChange={campo('prazo')} />
          <div className="form-text">Em branco = daqui a 7 dias.</div>
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="n-x">Detalhes</label>
          <textarea className="form-control" id="n-x" rows={3} value={form.descricao} onChange={campo('descricao')} />
        </div>
      </div>
    </Modal>
  );
}

/** Modal com o detalhe da OS e troca de status. */
function DetalheOS({ os, onClose, onMover }) {
  const [status, setStatus] = useState(os.status);
  return (
    <Modal titulo={<>{os.id} <Badge k={os.prioridade} /></>} onClose={onClose}
      footer={<button className="btn btn-primary" onClick={async () => { await onMover(os.id, status); onClose(); }}>Atualizar status</button>}>
      <h3 className="h5">{os.titulo}</h3>
      <p className="text-secondary">
        {os.ativo} · Equipe {os.equipe} · Prazo {os.prazo}
        {os.vencida && <b className="text-danger"> (vencido)</b>}
      </p>
      {os.chamado && <p className="small">Aberta a partir do chamado <b>{os.chamado}</b>. Ao concluir, o funcionário é avisado na linha do tempo.</p>}
      {os.descricao && <p>{os.descricao}</p>}
      <label className="form-label" htmlFor="o-s">Status</label>
      <select id="o-s" className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
        {COLUNAS.map(s => <option key={s} value={s}>{STATUS_OS[s]}</option>)}
      </select>
    </Modal>
  );
}

export default function Ordens() {
  const toast = useToast();
  const [equipe, setEquipe] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [periodo, setPeriodo] = useState('30');
  const [detalhe, setDetalhe] = useState(() => param('os')); // vem da busca: /ordens?os=OS-0241
  const [nova, setNova] = useState(false);
  const [colunaSobre, setColunaSobre] = useState(null);       // coluna sob o cartão arrastado

  const ordens = useLoad(() => api.ordens({ equipe, prioridade, periodo }), [equipe, prioridade, periodo]);
  const maquinas = useLoad(() => api.maquinas({ ordem: 'codigo' }));
  const equipes = useLoad(() => api.equipes());

  async function mover(id, status) {
    const os = (ordens.data || []).find(x => x.id === id);
    if (!os || os.status === status) return;
    try {
      const atualizada = await api.atualizarOS(id, { status });
      ordens.setData(lista => lista.map(x => (x.id === id ? atualizada : x)));
      toast(`${id} agora está em “${STATUS_OS[status].toLowerCase()}”.`);
    } catch (e) {
      toast(e.message, 'danger');
    }
  }

  function limparFiltros() {
    setEquipe('');
    setPrioridade('');
    setPeriodo('30');
  }

  const osAberta = detalhe && (ordens.data || []).find(x => x.id === detalhe);

  return (
    <Painel titulo="Ordens de serviço" acao={{ label: 'Nova OS', onClick: () => setNova(true) }}>
      <div className="pm-card mb-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label" htmlFor="f-e">Responsável</label>
            <select id="f-e" className="form-select" value={equipe} onChange={e => setEquipe(e.target.value)}>
              <option value="">Todas as equipes</option>
              {(equipes.data || []).map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="f-p">Prioridade</label>
            <select id="f-p" className="form-select" value={prioridade} onChange={e => setPrioridade(e.target.value)}>
              <option value="">Todas</option>
              {PRIORIDADES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="f-d">Concluídas no período</label>
            <select id="f-d" className="form-select" value={periodo} onChange={e => setPeriodo(e.target.value)}>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-dark w-100" onClick={limparFiltros}>Limpar filtros</button>
          </div>
        </div>
      </div>

      <p className="text-secondary small mb-2">Dica: arraste um cartão para outra coluna para mudar o status da OS.</p>

      <Carga l={ordens}>
        {lista => (
          <div className="row g-3">
            {COLUNAS.map(status => {
              const itens = lista.filter(x => x.status === status);
              return (
                <div className="col-md-6 col-xl-3" key={status}>
                  <div className={`pm-col${colunaSobre === status ? ' over' : ''}`}
                    onDragOver={e => { e.preventDefault(); setColunaSobre(status); }}
                    onDragLeave={() => setColunaSobre(null)}
                    onDrop={e => { e.preventDefault(); setColunaSobre(null); mover(e.dataTransfer.getData('text/plain'), status); }}>
                    <h2>{STATUS_OS[status]} · {itens.length}</h2>
                    <div className="scroll">
                      {itens.length ? itens.map(x => (
                        <article key={x.id} className={`pm-os${x.vencida ? ' late' : ''}`} draggable tabIndex={0}
                          onDragStart={e => e.dataTransfer.setData('text/plain', x.id)}
                          onClick={() => setDetalhe(x.id)}
                          onKeyDown={e => { if (e.key === 'Enter') setDetalhe(x.id); }}>
                          <div className="d-flex justify-content-between align-items-start">
                            <strong>{x.id}</strong>
                            <Badge k={x.prioridade} />
                          </div>
                          <p>{x.titulo}</p>
                          <small>{x.ativo} · Equipe {x.equipe}</small>
                          <small className="pz">Prazo: {x.prazo}{x.vencida ? ' (vencido)' : ''}</small>
                        </article>
                      )) : <p className="text-secondary small px-1">Nada por aqui.</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Carga>

      {osAberta && <DetalheOS key={osAberta.id} os={osAberta} onClose={() => setDetalhe(null)} onMover={mover} />}
      {nova && maquinas.data && (
        <NovaOS maquinas={maquinas.data} equipes={equipes.data || []} onClose={() => setNova(false)}
          onCriada={() => { setNova(false); ordens.recarregar(); }} />
      )}
    </Painel>
  );
}
