'use client';
/* ============================================================
   DETALHE DE UMA MÁQUINA (modal)
   Usado em Máquinas, Planta ao vivo e na busca.
   ============================================================ */
import Link from 'next/link';
import { api } from '@/lib/api';
import { num } from '@/lib/util';
import { Badge, Carga, Mini, Modal, useLoad } from '@/components/ui';

export default function AtivoModal({ id, onClose }) {
  const detalhe = useLoad(() => api.maquina(id), [id]);
  const m = detalhe.data;

  const titulo = m ? <>{m.id} · {m.nome} <Badge k={m.status} /></> : id;
  const rodape = m && (
    <>
      <Link className="btn btn-outline-dark" href={`/orcamento?maquina=${m.id}`}>Orçar manutenção</Link>
      <Link className="btn btn-primary" href={`/medicoes?maquina=${m.id}`}>Registrar medição</Link>
    </>
  );

  return (
    <Modal titulo={titulo} size="modal-lg" onClose={onClose} footer={rodape}>
      <Carga l={detalhe}>
        {maquina => (
          <>
            <div className="row g-3 mb-3">
              <div className="col-sm-4"><Mini rotulo="Saúde" valor={maquina.saude + '%'} /></div>
              <div className="col-sm-4"><Mini rotulo="Última medição" valor={maquina.ultima} /></div>
              <div className="col-sm-4"><Mini rotulo="Próx. manutenção" valor={maquina.prox} /></div>
            </div>
            <p className="text-secondary mb-3">Setor {maquina.setor}.</p>

            <h3 className="h6">Últimas medições</h3>
            {maquina.medicoes.length ? (
              <table className="table table-sm mb-4">
                <tbody>
                  {maquina.medicoes.map(x => (
                    <tr key={x.id}>
                      <td>{x.data}</td>
                      <td>{x.nome}</td>
                      <td><b>{num(x.valor, 1)} {x.unidade}</b></td>
                      <td><Badge k={x.situacao}>{x.situacao === 'critico' ? 'Acima do limite' : undefined}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-secondary">Ainda sem medições registradas.</p>
            )}

            <h3 className="h6">Ordens de serviço em aberto</h3>
            {maquina.ordens.length ? maquina.ordens.map(o => (
              <Link key={o.id} className="d-flex justify-content-between text-decoration-none py-1" href={`/ordens?os=${o.id}`}>
                <span><b>{o.id}</b> {o.titulo}</span>
                <Badge k={o.prioridade} />
              </Link>
            )) : (
              <p className="text-secondary mb-0">Nenhuma OS aberta para esta máquina.</p>
            )}
          </>
        )}
      </Carga>
    </Modal>
  );
}
