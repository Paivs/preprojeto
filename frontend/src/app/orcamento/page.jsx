'use client';
/* ============================================================
   ORÇAMENTO MANUTENCIÁRIO  ( /orcamento )
   Compara o custo de cuidar da máquina agora (preventiva)
   com o de esperar ela quebrar (corretiva).
   ============================================================ */
import { useState } from 'react';
import Link from 'next/link';
import Painel from '@/components/Painel';
import { Badge, Carga, Vazio, useLoad, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { calcOrcamento, normalizarOrcamento } from '@/lib/calc';
import { brl, capitalizar, param } from '@/lib/util';

// Cores e nomes das parcelas do custo
const PARCELAS = [
  ['mo', 'Mão de obra', '#1b1f27'],
  ['pecas', 'Peças e materiais', '#ffcc14'],
  ['terceiros', 'Serviços de terceiros', '#8a93a3'],
  ['parada', 'Produção parada', '#c0392b'],
  ['contingencia', 'Margem de segurança', '#bfc5d2']
];

/**
 * Formulário + resultado de uma máquina.
 * Recebe a base de custos da API e guarda as edições do usuário.
 * (A página usa key={máquina}, então trocar de máquina recomeça do zero.)
 */
function MontarOrcamento({ base, maquinas, idMaquina, onTrocarMaquina, onSalvo }) {
  const toast = useToast();
  const [e, setE] = useState(base);
  const [tipo, setTipo] = useState('preventiva');

  const n = normalizarOrcamento(e);
  const agora = calcOrcamento(n);
  const quebra = calcOrcamento(n, true);
  const r = tipo === 'corretiva' ? quebra : agora;
  const diferenca = quebra.total - agora.total;
  const percentual = agora.total ? Math.round(diferenca / agora.total * 100) : 0;

  const mudar = campo => ev => setE({ ...e, [campo]: ev.target.value });
  const mudarPeca = (i, campo, valor) => setE({ ...e, pecas: e.pecas.map((p, j) => (j === i ? { ...p, [campo]: valor } : p)) });
  const removerPeca = i => setE({ ...e, pecas: e.pecas.filter((_, j) => j !== i) });
  const adicionarPeca = () => setE({ ...e, pecas: [...e.pecas, { nome: '', qtd: 1, valor: 0 }] });

  async function salvar() {
    try {
      const o = await api.salvarOrcamento({ maquina: e.maquina, tipo, detalhes: n });
      toast(`${o.id} salvo para a ${e.maquina}.`);
      onSalvo();
    } catch (er) {
      toast(er.message, 'danger');
    }
  }

  async function gerarOS() {
    try {
      const os = await api.criarOS({
        ativo: e.maquina,
        titulo: `Manutenção ${tipo} · ${e.nome}`,
        prioridade: 'media',
        descricao: `Orçado em ${brl(r.total)} no PredictMaint.`,
        origem: 'orcamento'
      });
      toast(<>{os.id} criada. <Link className="text-warning fw-bold" href={`/ordens?os=${os.id}`}>Ver no quadro</Link></>);
    } catch (er) {
      toast(er.message, 'danger');
    }
  }

  /** Campo numérico do formulário (chamado como função para não perder o foco ao digitar). */
  const campoNumerico = ({ nome, rotulo, passo, coluna = 'col-6' }) => (
    <div className={coluna}>
      <label className="form-label" htmlFor={'o-' + nome}>{rotulo}</label>
      <input id={'o-' + nome} className="form-control" type="number" min="0" step={passo} value={e[nome]} onChange={mudar(nome)} />
    </div>
  );

  return (
    <>
      {/* Formulário */}
      <div className="col-xl-6">
        <section className="pm-card h-100">
          <h2>Montar orçamento</h2>
          <div className="row g-3 mb-3">
            <div className="col-sm-7">
              <label className="form-label" htmlFor="o-m">Máquina</label>
              <select id="o-m" className="form-select" value={idMaquina} onChange={ev => onTrocarMaquina(ev.target.value)}>
                {maquinas.map(m => <option key={m.id} value={m.id}>{m.id} · {m.nome}</option>)}
              </select>
            </div>
            <div className="col-sm-5">
              <span className="form-label d-block">Tipo de intervenção</span>
              <div className="btn-group w-100">
                {['preventiva', 'corretiva'].map(t => (
                  <span key={t} className="d-contents">
                    <input type="radio" className="btn-check" name="tp" id={'tp-' + t} checked={tipo === t} onChange={() => setTipo(t)} />
                    <label className="btn btn-outline-dark" htmlFor={'tp-' + t}>{capitalizar(t)}</label>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <h3 className="h6">Mão de obra</h3>
          <div className="row g-2 mb-3">
            {campoNumerico({ nome: 'tecnicos', rotulo: 'Técnicos', passo: 1, coluna: 'col-4' })}
            {campoNumerico({ nome: 'horas', rotulo: 'Horas de trabalho', passo: 0.5, coluna: 'col-4' })}
            {campoNumerico({ nome: 'valorHora', rotulo: 'Valor da hora (R$)', passo: 5, coluna: 'col-4' })}
          </div>

          <h3 className="h6">Peças e materiais</h3>
          {e.pecas.map((p, i) => (
            <div className="row g-2 mb-2" key={i}>
              <div className="col-6">
                <input className="form-control" placeholder="Peça ou material" aria-label="Nome da peça" value={p.nome} onChange={ev => mudarPeca(i, 'nome', ev.target.value)} />
              </div>
              <div className="col-2">
                <input className="form-control" type="number" min="0" aria-label="Quantidade" value={p.qtd} onChange={ev => mudarPeca(i, 'qtd', ev.target.value)} />
              </div>
              <div className="col-3">
                <input className="form-control" type="number" min="0" step="0.01" aria-label="Valor unitário em reais" value={p.valor} onChange={ev => mudarPeca(i, 'valor', ev.target.value)} />
              </div>
              <div className="col-1">
                <button className="btn btn-outline-dark w-100 px-0" aria-label="Remover peça" onClick={() => removerPeca(i)}>×</button>
              </div>
            </div>
          ))}
          <button className="btn btn-outline-dark btn-sm mb-3" onClick={adicionarPeca}>+ Adicionar peça</button>

          <h3 className="h6">Parada e extras</h3>
          <div className="row g-2">
            {campoNumerico({ nome: 'horasParada', rotulo: 'Horas de máquina parada', passo: 1 })}
            {campoNumerico({ nome: 'custoParadaHora', rotulo: 'Custo da hora parada (R$)', passo: 50 })}
            {campoNumerico({ nome: 'terceiros', rotulo: 'Terceiros (R$)', passo: 100 })}
            {campoNumerico({ nome: 'contingencia', rotulo: 'Margem de segurança (%)', passo: 1 })}
          </div>
        </section>
      </div>

      {/* Resultado */}
      <div className="col-xl-6">
        <section className="pm-card h-100" aria-live="polite">
          <h2>{e.maquina} · {e.nome}</h2>
          <p className="pm-lbl mb-0">Total estimado, manutenção {tipo}</p>
          <p className="pm-total mb-3">{brl(r.total)}</p>

          <div className="pm-stack mb-3" role="img" aria-label="Composição do custo">
            {PARCELAS.map(([k, , cor]) => <i key={k} style={{ width: (r.total ? r[k] / r.total * 100 : 0) + '%', background: cor }} />)}
          </div>
          {PARCELAS.map(([k, rotulo, cor]) => (
            <div className="pm-row" key={k}>
              <span><span className="sw" style={{ background: cor }} />{rotulo}</span>
              <span>{brl(r[k])}</span>
            </div>
          ))}

          <div className="row g-2 mt-3">
            <div className="col-6"><div className="pm-cmp ok"><span className="pm-lbl">Cuidar agora</span><b>{brl(agora.total)}</b></div></div>
            <div className="col-6"><div className="pm-cmp bad"><span className="pm-lbl">Esperar quebrar</span><b>{brl(quebra.total)}</b></div></div>
          </div>

          <p className="mt-3">
            {diferenca > 0
              ? <>Se a {e.maquina} parar antes da manutenção, a conta sobe <b>{brl(diferenca)}</b> ({percentual}% a mais). Boa parte vem de hora extra, peça urgente e produção parada por mais tempo.</>
              : 'Preencha os valores para comparar.'}
          </p>

          <div className="d-flex flex-wrap gap-2 mt-3">
            <button className="btn btn-primary" onClick={salvar}>Salvar orçamento</button>
            <button className="btn btn-outline-dark" onClick={gerarOS}>Gerar OS com este orçamento</button>
          </div>
        </section>
      </div>
    </>
  );
}

export default function Orcamento() {
  const maquinas = useLoad(() => api.maquinas({ ordem: 'codigo' }));
  const resumo = useLoad(() => api.orcamentoResumo());
  const salvos = useLoad(() => api.orcamentos());
  const [escolhida, setEscolhida] = useState(() => param('maquina'));

  // Sem escolha, começa pela primeira máquina crítica
  const id = escolhida || (resumo.data && (resumo.data.find(m => m.status === 'critico') || resumo.data[0])?.maquina) || '';
  const base = useLoad(() => (id ? api.orcamentoBase(id) : Promise.resolve(null)), [id]);

  function escolherDaTabela(codigo) {
    setEscolhida(codigo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <Painel titulo="Orçamento manutenciário" acao={{ label: 'Imprimir', onClick: () => window.print() }}>
      <p className="pm-hello">Escolha a máquina e ajuste os números. A conta mostra quanto custa cuidar dela agora e quanto custaria esperar ela quebrar.</p>

      <div className="row g-3">
        {base.data && maquinas.data && base.data.maquina === id ? (
          <MontarOrcamento key={id} base={base.data} maquinas={maquinas.data} idMaquina={id}
            onTrocarMaquina={setEscolhida} onSalvo={salvos.recarregar} />
        ) : (
          <div className="col-12"><section className="pm-card"><Carga l={base}>{() => <p className="text-secondary m-0">Carregando a base de custos…</p>}</Carga></section></div>
        )}

        {/* Todas as máquinas */}
        <div className="col-12">
          <section className="pm-card">
            <h2>Todas as máquinas, lado a lado</h2>
            <p className="text-secondary">“Risco” é o custo de uma quebra ponderado pela saúde da máquina: quanto pior a saúde, mais perto o risco chega do custo corretivo. Clique numa linha para orçar.</p>
            <Carga l={resumo}>
              {R => {
                const soma = campo => R.reduce((total, m) => total + m[campo], 0);
                return (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead><tr><th>MÁQUINA</th><th>SETOR</th><th>SAÚDE</th><th className="text-end">PREVENTIVA</th><th className="text-end">SE QUEBRAR</th><th className="text-end">RISCO ESTIMADO</th></tr></thead>
                      <tbody>
                        {R.map(m => (
                          <tr key={m.maquina} className="pm-linha-clicavel" onClick={() => escolherDaTabela(m.maquina)}>
                            <td><b>{m.maquina}</b> {m.nome}</td>
                            <td>{m.setor}</td>
                            <td><Badge k={m.status}>{m.saude}%</Badge></td>
                            <td className="text-end">{brl(m.preventivo)}</td>
                            <td className="text-end">{brl(m.corretivo)}</td>
                            <td className="text-end"><b>{brl(m.risco)}</b></td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3}><b>Planta inteira</b></td>
                          <td className="text-end"><b>{brl(soma('preventivo'))}</b></td>
                          <td className="text-end"><b>{brl(soma('corretivo'))}</b></td>
                          <td className="text-end"><b>{brl(soma('risco'))}</b></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              }}
            </Carga>
          </section>
        </div>

        {/* Salvos */}
        <div className="col-12">
          <section className="pm-card">
            <h2>Orçamentos salvos</h2>
            <Carga l={salvos}>
              {lista => lista.length ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead><tr><th>CÓDIGO</th><th>DATA</th><th>MÁQUINA</th><th>TIPO</th><th className="text-end">TOTAL</th></tr></thead>
                    <tbody>
                      {lista.slice(0, 6).map(o => (
                        <tr key={o.id}><td><b>{o.id}</b></td><td>{o.data}</td><td>{o.maquina}</td><td>{capitalizar(o.tipo)}</td><td className="text-end">{brl(o.total)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <Vazio titulo="Nenhum orçamento salvo ainda" sub="Monte um acima e clique em “Salvar orçamento”." />}
            </Carga>
          </section>
        </div>
      </div>
    </Painel>
  );
}
