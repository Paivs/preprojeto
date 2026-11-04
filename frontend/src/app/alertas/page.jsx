'use client';
/* ============================================================
   CENTRAL DE ALERTAS  ( /alertas )
   Lista de alertas ativos + detalhe + limites de alarme (só gestor).
   Um alerta some da lista quando a OS ligada a ele é concluída.
   ============================================================ */
import { useState } from 'react';
import Link from 'next/link';
import Painel from '@/components/Painel';
import { Badge, Carga, CartaoKpi, Modal, Vazio, useLoad, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { capitalizar, param } from '@/lib/util';

const PRIORIDADE_DO_NIVEL = { critico: 'alta', atencao: 'media', info: 'baixa' };

/** Modal para editar os limites de atenção e de alarme. */
function Limites({ onClose }) {
  const toast = useToast();
  const limites = useLoad(() => api.limites());
  const [editados, setEditados] = useState({}); // só o que o usuário mudou

  // Valor exibido: o editado ou o que veio da API
  const valor = (codigo, campo) => editados[codigo]?.[campo] ?? limites.data[codigo][campo];
  const mudar = (codigo, campo, v) => setEditados(e => ({ ...e, [codigo]: { ...e[codigo], [campo]: v } }));

  async function salvar() {
    const corpo = Object.fromEntries(Object.keys(limites.data).map(k => [k, {
      atencao: Number(valor(k, 'atencao')),
      limite: Number(valor(k, 'limite'))
    }]));
    if (Object.values(corpo).some(x => x.atencao >= x.limite)) {
      toast('O limite de atenção precisa ser menor que o de alarme.', 'warning');
      return;
    }
    try {
      await api.salvarLimites(corpo);
      onClose();
      toast('Limites atualizados. Valem para as próximas medições.');
    } catch (e) {
      toast(e.message, 'danger');
    }
  }

  return (
    <Modal titulo="Limites de alarme" onClose={onClose} footer={<button className="btn btn-primary" onClick={salvar}>Salvar limites</button>}>
      <p className="text-secondary">Acima do limite de atenção o alerta fica amarelo; acima do limite de alarme, vermelho.</p>
      <Carga l={limites}>
        {dados => Object.entries(dados).map(([codigo, g]) => (
          <div className="row g-2 mb-3 align-items-end" key={codigo}>
            <div className="col-4"><b>{g.nome}</b><div className="text-secondary small">{g.un}</div></div>
            {[['atencao', 'Atenção'], ['limite', 'Alarme']].map(([campo, rotulo]) => (
              <div className="col-4" key={campo}>
                <label className="form-label" htmlFor={campo + codigo}>{rotulo}</label>
                <input id={campo + codigo} className="form-control" type="number" step="0.1" min="0"
                  value={valor(codigo, campo)} onChange={e => mudar(codigo, campo, e.target.value)} />
              </div>
            ))}
          </div>
        ))}
      </Carga>
    </Modal>
  );
}

export default function Alertas() {
  const toast = useToast();
  const alertas = useLoad(() => api.alertas());
  const [selecionado, setSelecionado] = useState(() => Number(param('id')) || null);
  const [editarLimites, setEditarLimites] = useState(false);
  const [gerando, setGerando] = useState(null);

  async function gerarOS(a, e) {
    e.stopPropagation(); // não seleciona a linha ao clicar no botão
    setGerando(a.id);
    try {
      const os = await api.criarOS({
        ativo: a.ativo,
        titulo: `${a.titulo} · ${a.ativo}`,
        prioridade: PRIORIDADE_DO_NIVEL[a.nivel],
        alertaId: a.id,
        descricao: a.acao,
        origem: 'alerta'
      });
      alertas.setData(lista => lista.map(x => x.id === a.id ? { ...x, temOS: true, estado: x.estado === 'novo' ? 'reconhecido' : x.estado } : x));
      toast(<>{os.id} criada a partir do alerta da {a.ativo}. <Link className="text-warning fw-bold" href={`/ordens?os=${os.id}`}>Ver no quadro</Link></>);
    } catch (err) {
      toast(err.message, 'danger');
    } finally {
      setGerando(null);
    }
  }

  async function reconhecer(a) {
    try {
      await api.reconhecerAlerta(a.id);
      alertas.setData(lista => lista.map(x => (x.id === a.id ? { ...x, estado: 'reconhecido' } : x)));
      toast('Alerta reconhecido. A equipe vê que alguém já está de olho.');
    } catch (e) {
      toast(e.message, 'danger');
    }
  }

  return (
    <Painel titulo="Central de alertas" acao={{ label: 'Configurar limites', onClick: () => setEditarLimites(true) }}>
      {usuario => (
        <Carga l={alertas}>
          {lista => {
            const contar = nivel => lista.filter(a => a.nivel === nivel).length;
            const a = lista.find(x => x.id === selecionado) || lista[0];
            return (
              <>
                <div className="row g-3 mb-3">
                  <div className="col-md-4"><CartaoKpi rotulo="Críticos" valor={contar('critico')} sub="Exigem ação imediata" /></div>
                  <div className="col-md-4"><CartaoKpi rotulo="Atenção" valor={contar('atencao')} sub="Tendência de piora" /></div>
                  <div className="col-md-4"><CartaoKpi rotulo="Informativos" valor={contar('info')} sub="Sem risco imediato" /></div>
                </div>

                <div className="row g-3">
                  {/* Lista */}
                  <div className="col-xl-8">
                    <section className="pm-card h-100">
                      <h2>Alertas ativos</h2>
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead><tr><th>NÍVEL</th><th>ALERTA</th><th>ATIVO</th><th>HÁ</th><th>ESTADO</th><th /></tr></thead>
                          <tbody>
                            {lista.length ? lista.map(x => (
                              <tr key={x.id} className={`pm-linha-clicavel${x.id === a?.id ? ' table-warning' : ''}`} onClick={() => setSelecionado(x.id)}>
                                <td><Badge k={x.nivel} /></td>
                                <td><b>{x.titulo}</b></td>
                                <td>{x.ativo}</td>
                                <td>{x.ha}</td>
                                <td>{capitalizar(x.estado)}</td>
                                <td>
                                  {x.temOS
                                    ? <span className="small text-secondary">OS aberta</span>
                                    : <button className="btn btn-outline-dark btn-sm" disabled={gerando === x.id} onClick={e => gerarOS(x, e)}>Gerar OS</button>}
                                </td>
                              </tr>
                            )) : (
                              <tr><td colSpan={6}><Vazio titulo="Nenhum alerta ativo" sub="A planta está quieta. Aproveite." /></td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>

                  {/* Detalhe */}
                  <div className="col-xl-4">
                    <section className="pm-card h-100" aria-live="polite">
                      <h2>Detalhe do alerta</h2>
                      {a ? (
                        <>
                          <Badge k={a.nivel} />
                          <h3 className="h5 mt-2 mb-0">{a.titulo}</h3>
                          <p className="text-secondary">{a.maquina} {a.ativo}{a.setor ? ' · ' + a.setor : ''}</p>
                          <table className="table table-sm">
                            <tbody>
                              <tr><td>Medido</td><td className="text-end"><b>{a.medido}</b></td></tr>
                              <tr><td>Limite</td><td className="text-end"><b>{a.limite}</b></td></tr>
                              <tr><td>Previsão de falha</td><td className="text-end"><b>{a.previsao}</b></td></tr>
                            </tbody>
                          </table>
                          <p><b>Ação recomendada:</b> {a.acao}</p>
                          <div className="d-grid gap-2">
                            <button className="btn btn-primary py-2" disabled={a.temOS || gerando === a.id} onClick={e => gerarOS(a, e)}>
                              {a.temOS ? 'Já existe OS para este alerta' : 'Gerar ordem de serviço'}
                            </button>
                            <button className="btn btn-outline-dark py-2" disabled={a.estado !== 'novo'} onClick={() => reconhecer(a)}>
                              {a.estado === 'novo' ? 'Reconhecer alerta' : 'Alerta já reconhecido'}
                            </button>
                          </div>
                        </>
                      ) : (
                        <Vazio titulo="Escolha um alerta" sub="Clique em uma linha para ver os detalhes." />
                      )}
                    </section>
                  </div>
                </div>

                {editarLimites && (usuario.perfil === 'gestor'
                  ? <Limites onClose={() => setEditarLimites(false)} />
                  : <Modal titulo="Limites de alarme" onClose={() => setEditarLimites(false)}>
                      <p className="mb-0">Somente o gestor pode alterar os limites de alarme.</p>
                    </Modal>)}
              </>
            );
          }}
        </Carga>
      )}
    </Painel>
  );
}
