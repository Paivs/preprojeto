'use client';
/* ============================================================
   MÁQUINAS E ATIVOS  ( /maquinas )
   Lista com filtros, detalhe em modal e cadastro de nova máquina.
   ============================================================ */
import { useEffect, useState } from 'react';
import Painel from '@/components/Painel';
import AtivoModal from '@/components/AtivoModal';
import { Badge, Carga, CartaoKpi, Modal, SaudeBar, Vazio, useLoad, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { param } from '@/lib/util';

const VAZIA = { id: '', nome: '', setor: '', prox: '', custoParada: '' };

/** Formulário "Nova máquina". */
function NovaMaquina({ setores, onClose, onSalvo }) {
  const toast = useToast();
  const [form, setForm] = useState(VAZIA);
  const [salvando, setSalvando] = useState(false);
  const campo = nome => e => setForm({ ...form, [nome]: e.target.value });

  async function salvar() {
    setSalvando(true);
    try {
      await api.criarMaquina(form);
      toast('Máquina cadastrada. Já aparece na lista e na planta.');
      onSalvo();
    } catch (e) {
      toast(e.message, 'danger');
      setSalvando(false);
    }
  }

  return (
    <Modal titulo="Nova máquina" onClose={onClose}
      footer={<button className="btn btn-primary" disabled={salvando} onClick={salvar}>Cadastrar máquina</button>}>
      <div className="row g-3">
        <div className="col-sm-4">
          <label className="form-label" htmlFor="nm-id">Código</label>
          <input className="form-control" id="nm-id" placeholder="Ex.: PH-06" value={form.id} onChange={campo('id')} />
        </div>
        <div className="col-sm-8">
          <label className="form-label" htmlFor="nm-n">Nome</label>
          <input className="form-control" id="nm-n" placeholder="Ex.: Prensa Hidráulica" value={form.nome} onChange={campo('nome')} />
        </div>
        <div className="col-sm-6">
          <label className="form-label" htmlFor="nm-s">Setor</label>
          <input className="form-control" id="nm-s" list="setores" placeholder="Ex.: Estamparia" value={form.setor} onChange={campo('setor')} />
          <datalist id="setores">{setores.map(s => <option key={s} value={s} />)}</datalist>
        </div>
        <div className="col-sm-6">
          <label className="form-label" htmlFor="nm-p">Próxima manutenção</label>
          <input className="form-control" id="nm-p" type="date" value={form.prox} onChange={campo('prox')} />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="nm-c">Custo de cada hora parada (R$)</label>
          <input className="form-control" id="nm-c" type="number" min="0" step="50" placeholder="Usado no orçamento manutenciário"
            value={form.custoParada} onChange={campo('custoParada')} />
        </div>
      </div>
    </Modal>
  );
}

export default function Maquinas() {
  const [setor, setSetor] = useState('');
  const [status, setStatus] = useState('');
  const [ordem, setOrdem] = useState('saude');
  const [detalhe, setDetalhe] = useState(null);
  const [nova, setNova] = useState(false);

  const todas = useLoad(() => api.maquinas());                                  // para os contadores
  const lista = useLoad(() => api.maquinas({ setor, status, ordem }), [setor, status, ordem]); // tabela filtrada

  // Abre o detalhe direto quando vem da busca (/maquinas?id=PH-03)
  useEffect(() => {
    const id = param('id');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) setDetalhe(id);
  }, []);

  const T = todas.data || [];
  const setores = [...new Set(T.map(m => m.setor))].sort();
  const contar = s => T.filter(m => m.status === s).length;

  function limparFiltros() {
    setSetor('');
    setStatus('');
    setOrdem('saude');
  }

  return (
    <Painel titulo="Máquinas e ativos" acao={{ label: 'Nova máquina', onClick: () => setNova(true) }}>
      <div className="row g-3 mb-3">
        <div className="col-6 col-xl-3"><CartaoKpi rotulo="Ativos monitorados" valor={T.length} sub={`Em ${setores.length} setores`} /></div>
        <div className="col-6 col-xl-3"><CartaoKpi rotulo="Normais" valor={contar('normal')} sub="Índice de saúde a partir de 75%" /></div>
        <div className="col-6 col-xl-3"><CartaoKpi rotulo="Em atenção" valor={contar('atencao')} sub="Acompanhar tendência" /></div>
        <div className="col-6 col-xl-3"><CartaoKpi rotulo="Críticos" valor={contar('critico')} sub="Ação imediata" /></div>
      </div>

      <div className="pm-card mb-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label" htmlFor="f-s">Setor</label>
            <select id="f-s" className="form-select" value={setor} onChange={e => setSetor(e.target.value)}>
              <option value="">Todos os setores</option>
              {setores.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="f-t">Status</label>
            <select id="f-t" className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="critico">Crítico</option>
              <option value="atencao">Atenção</option>
              <option value="normal">Normal</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="f-o">Ordenar por</label>
            <select id="f-o" className="form-select" value={ordem} onChange={e => setOrdem(e.target.value)}>
              <option value="saude">Menor índice de saúde</option>
              <option value="codigo">Código</option>
              <option value="setor">Setor</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-dark w-100" onClick={limparFiltros}>Limpar filtros</button>
          </div>
        </div>
      </div>

      <div className="pm-card">
        <Carga l={lista}>
          {maquinas => (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr><th>CÓDIGO</th><th>MÁQUINA</th><th>SETOR</th><th>SAÚDE</th><th>STATUS</th><th>ÚLTIMA MEDIÇÃO</th><th>PRÓX. MANUTENÇÃO</th><th /></tr>
                </thead>
                <tbody>
                  {maquinas.length ? maquinas.map(m => (
                    <tr key={m.id}>
                      <td>{m.id}</td>
                      <td><b>{m.nome}</b></td>
                      <td>{m.setor}</td>
                      <td style={{ minWidth: 170 }}><SaudeBar v={m.saude} /></td>
                      <td><Badge k={m.status} /></td>
                      <td>{m.ultima}</td>
                      <td>{m.prox}</td>
                      <td><button className="btn btn-outline-dark btn-sm" onClick={() => setDetalhe(m.id)}>Detalhes</button></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={8}><Vazio titulo="Nenhuma máquina com esses filtros" sub="Limpe os filtros para ver todas." /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Carga>
      </div>

      {detalhe && <AtivoModal id={detalhe} onClose={() => setDetalhe(null)} />}
      {nova && (
        <NovaMaquina setores={setores} onClose={() => setNova(false)}
          onSalvo={() => { setNova(false); lista.recarregar(); todas.recarregar(); }} />
      )}
    </Painel>
  );
}
