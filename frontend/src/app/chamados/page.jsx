'use client';
/* ============================================================
   CHAMADOS · TRIAGEM DO GESTOR  ( /chamados )
   Tela nova: antes os chamados do chão de fábrica não chegavam a
   ninguém. Aqui o gestor define prioridade e equipe e gera a OS.
   O técnico pode ver e comentar, mas a triagem é do gestor.
   ============================================================ */
import { useState } from 'react';
import Link from 'next/link';
import Painel from '@/components/Painel';
import DetalheChamado from '@/components/DetalheChamado';
import { Badge, Carga, CartaoKpi, Vazio, useLoad, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { COR_SITUACAO } from '@/lib/util';

const SITUACOES = ['Registrado', 'Triado', 'Técnico designado', 'Em reparo', 'Concluído'];
const PRIORIDADE_DA_URGENCIA = { 'Baixa': 'baixa', 'Média': 'media', 'Alta': 'alta', 'Máquina parada': 'alta' };

/** Caixa de triagem: prioridade, equipe e geração da OS. */
function Triagem({ chamado, equipes, onAtualizado }) {
  const toast = useToast();
  const [prioridade, setPrioridade] = useState(chamado.prioridade || PRIORIDADE_DA_URGENCIA[chamado.urgencia]);
  const [equipe, setEquipe] = useState(chamado.equipe || '');
  const [ocupado, setOcupado] = useState(false);

  async function executar(acao, mensagem) {
    setOcupado(true);
    try {
      const atualizado = await acao();
      onAtualizado(atualizado);
      toast(mensagem(atualizado));
    } catch (e) {
      toast(e.message, 'danger');
    } finally {
      setOcupado(false);
    }
  }

  const triar = () => {
    if (!equipe) return toast('Escolha a equipe.', 'warning');
    executar(() => api.triarChamado(chamado.id, { prioridade, equipe }), c => `${c.id} triado. O funcionário já vê a mudança.`);
  };
  const gerarOS = () => executar(
    () => api.gerarOSDoChamado(chamado.id, { prioridade, equipe: equipe || undefined }),
    c => `${c.ordem} criada para o ${c.id}.`
  );

  if (chamado.ordem) {
    return (
      <div className="pm-mini mb-3">
        <span className="pm-lbl d-block">Ordem de serviço</span>
        <Link href={`/ordens?os=${chamado.ordem}`} className="fw-bold">{chamado.ordem} · ver no quadro</Link>
      </div>
    );
  }
  if (chamado.situacao === 'Concluído') return null;

  return (
    <div className="pm-mini mb-3">
      <p className="pm-lbl mb-2">Triagem</p>
      <div className="row g-2 mb-2">
        <div className="col-6">
          <label className="form-label" htmlFor="t-p">Prioridade</label>
          <select id="t-p" className="form-select form-select-sm" value={prioridade} onChange={e => setPrioridade(e.target.value)}>
            <option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option>
          </select>
        </div>
        <div className="col-6">
          <label className="form-label" htmlFor="t-e">Equipe</label>
          <select id="t-e" className="form-select form-select-sm" value={equipe} onChange={e => setEquipe(e.target.value)}>
            <option value="">Padrão do setor</option>
            {equipes.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
      </div>
      <div className="d-flex flex-wrap gap-2">
        <button className="btn btn-outline-dark btn-sm" disabled={ocupado} onClick={triar}>Salvar triagem</button>
        <button className="btn btn-primary btn-sm" disabled={ocupado} onClick={gerarOS}>Gerar OS e designar equipe</button>
      </div>
    </div>
  );
}

export default function Chamados() {
  const [situacao, setSituacao] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const chamados = useLoad(() => api.chamados({ situacao }), [situacao]);
  const todos = useLoad(() => api.chamados()); // contadores
  const equipes = useLoad(() => api.equipes());

  function atualizar(novo) {
    chamados.setData(lista => lista.map(x => (x.id === novo.id ? novo : x)));
    todos.recarregar();
  }

  const T = todos.data || [];
  const contar = s => T.filter(c => s.includes(c.situacao)).length;

  return (
    <Painel titulo="Chamados do chão de fábrica">
      {usuario => (
        <>
          <div className="row g-3 mb-3">
            <div className="col-6 col-xl-3"><CartaoKpi rotulo="Aguardando triagem" valor={contar(['Registrado'])} sub="Recém-abertos" /></div>
            <div className="col-6 col-xl-3"><CartaoKpi rotulo="Triados sem OS" valor={contar(['Triado'])} sub="Falta designar a equipe" /></div>
            <div className="col-6 col-xl-3"><CartaoKpi rotulo="Em atendimento" valor={contar(['Técnico designado', 'Em reparo'])} sub="Com OS em andamento" /></div>
            <div className="col-6 col-xl-3"><CartaoKpi rotulo="Concluídos" valor={contar(['Concluído'])} sub="Reparo finalizado" /></div>
          </div>

          <div className="row g-3">
            <div className="col-xl-7">
              <section className="pm-card h-100">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                  <h2 className="m-0">Chamados</h2>
                  <select className="form-select form-select-sm w-auto" aria-label="Filtrar por situação" value={situacao} onChange={e => setSituacao(e.target.value)}>
                    <option value="">Todas as situações</option>
                    {SITUACOES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <Carga l={chamados}>
                  {lista => (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead><tr><th>PROTOCOLO</th><th>MÁQUINA</th><th>PROBLEMA</th><th>URGÊNCIA</th><th>SITUAÇÃO</th><th className="text-nowrap">ABERTO EM</th></tr></thead>
                        <tbody>
                          {lista.length ? lista.map(x => {
                            const ativo = x.id === (selecionado || lista[0]?.id);
                            return (
                              <tr key={x.id} className={`pm-linha-clicavel${ativo ? ' table-warning' : ''}`} onClick={() => setSelecionado(x.id)}>
                                <td><b>{x.id}</b></td>
                                <td className="text-nowrap">{x.maquina}</td>
                                <td>{x.problema}</td>
                                <td>{x.urgencia === 'Máquina parada' ? <Badge k="critico">Parada</Badge> : x.urgencia}</td>
                                <td><Badge k={COR_SITUACAO[x.situacao] || 'neutro'}>{x.situacao}</Badge></td>
                                <td className="text-nowrap">{x.aberto}</td>
                              </tr>
                            );
                          }) : <tr><td colSpan={6}><Vazio titulo="Nenhum chamado nesta situação" /></td></tr>}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Carga>
              </section>
            </div>

            <div className="col-xl-5">
              <section className="pm-card h-100" aria-live="polite">
                {(() => {
                  const lista = chamados.data || [];
                  const c = lista.find(x => x.id === selecionado) || lista[0];
                  if (!c) return <Vazio titulo="Escolha um chamado" />;
                  return (
                    <DetalheChamado key={c.id} chamado={c} onAtualizado={atualizar} mostrarAutor>
                      {usuario.perfil === 'gestor'
                        ? <Triagem key={c.id + c.situacao} chamado={c} equipes={equipes.data || []} onAtualizado={atualizar} />
                        : !c.ordem && c.situacao !== 'Concluído' && <p className="small text-secondary">A triagem é feita pelo gestor.</p>}
                    </DetalheChamado>
                  );
                })()}
              </section>
            </div>
          </div>
        </>
      )}
    </Painel>
  );
}
