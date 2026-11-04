'use client';
/* ============================================================
   MEUS CHAMADOS (funcionário)  ( /meus-chamados )
   A API devolve só os chamados abertos pelo usuário logado.
   ============================================================ */
import { useState } from 'react';
import AreaFuncionario from '@/components/AreaFuncionario';
import DetalheChamado from '@/components/DetalheChamado';
import { Badge, Carga, CartaoKpi, Vazio, useLoad } from '@/components/ui';
import { api } from '@/lib/api';
import { COR_SITUACAO } from '@/lib/util';

function Lista() {
  const chamados = useLoad(() => api.chamados());
  const [selecionado, setSelecionado] = useState(null);

  // Troca o chamado alterado (ex.: depois de comentar) na lista
  const atualizar = novo => chamados.setData(lista => lista.map(x => (x.id === novo.id ? novo : x)));

  return (
    <Carga l={chamados}>
      {lista => {
        const contar = situacoes => lista.filter(c => situacoes.includes(c.situacao)).length;
        const c = lista.find(x => x.id === selecionado) || lista[0];
        return (
          <>
            <div className="row g-3 mb-3">
              <div className="col-md-4"><CartaoKpi rotulo="Em aberto" valor={contar(['Registrado', 'Triado'])} sub="Aguardando atendimento" /></div>
              <div className="col-md-4"><CartaoKpi rotulo="Em atendimento" valor={contar(['Técnico designado', 'Em reparo'])} sub="Técnico designado" /></div>
              <div className="col-md-4"><CartaoKpi rotulo="Concluídos" valor={contar(['Concluído'])} sub="Desde o primeiro chamado" /></div>
            </div>

            <div className="row g-3">
              <div className="col-lg-7">
                <section className="pm-card h-100">
                  <h2>Histórico de chamados</h2>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead><tr><th>PROTOCOLO</th><th>MÁQUINA</th><th>PROBLEMA</th><th>SITUAÇÃO</th><th>ABERTO EM</th></tr></thead>
                      <tbody>
                        {lista.length ? lista.map(x => (
                          <tr key={x.id} className={`pm-linha-clicavel${x.id === c?.id ? ' table-warning' : ''}`} onClick={() => setSelecionado(x.id)}>
                            <td><b>{x.id}</b></td>
                            <td>{x.maquina}</td>
                            <td>{x.problema}</td>
                            <td><Badge k={COR_SITUACAO[x.situacao] || 'neutro'}>{x.situacao}</Badge></td>
                            <td>{x.aberto}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5}><Vazio titulo="Você ainda não abriu chamados" sub="Viu algo estranho? Abra o primeiro em “Abrir chamado”." /></td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
              <div className="col-lg-5">
                <section className="pm-card h-100" aria-live="polite">
                  {c ? <DetalheChamado key={c.id} chamado={c}onAtualizado={atualizar} /> : <h2>Detalhe</h2>}
                </section>
              </div>
            </div>
          </>
        );
      }}
    </Carga>
  );
}

export default function MeusChamados() {
  return (
    <AreaFuncionario>
      <h1 className="h2 mb-1">Meus chamados</h1>
      <p className="text-secondary mb-4">Acompanhe o andamento do que você registrou.</p>
      <Lista />
    </AreaFuncionario>
  );
}
