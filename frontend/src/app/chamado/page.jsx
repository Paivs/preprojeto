'use client';
/* ============================================================
   ABRIR CHAMADO (funcionário)  ( /chamado )
   ============================================================ */
import { useRef, useState } from 'react';
import Link from 'next/link';
import AreaFuncionario from '@/components/AreaFuncionario';
import { Badge, Carga, Chips, Modal, useLoad, useToast } from '@/components/ui';
import { api } from '@/lib/api';

const PROBLEMAS = ['Ruído anormal', 'Vazamento', 'Superaquecimento', 'Parada', 'Outro'];
const URGENCIAS = ['Baixa', 'Média', 'Alta', 'Máquina parada'];

/** Modal para digitar o código da etiqueta da máquina. */
function CodigoDaMaquina({ maquinas, onEscolher, onClose }) {
  const toast = useToast();
  const [codigo, setCodigo] = useState('');

  function usar() {
    const v = codigo.trim().toUpperCase();
    if (!maquinas.some(m => m.id === v)) {
      toast(`Não achei a máquina ${v}. Confira a etiqueta.`, 'warning');
      return;
    }
    onEscolher(v);
  }

  return (
    <Modal titulo="Código da máquina" onClose={onClose} footer={<button className="btn btn-primary" onClick={usar}>Usar este código</button>}>
      <p>A leitura pela câmera entra numa próxima versão. Por enquanto, digite o código que está na etiqueta da máquina.</p>
      <input className="form-control" placeholder="Ex.: PH-03" value={codigo} onChange={e => setCodigo(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') usar(); }} />
    </Modal>
  );
}

function Formulario({ usuario }) {
  const toast = useToast();
  const maquinas = useLoad(() => api.maquinas({ ordem: 'codigo' }));
  const alertas = useLoad(() => api.alertas({ setor: usuario.setor }), [usuario.setor]);

  const [maquinaEscolhida, setMaquinaEscolhida] = useState('');
  const [problema, setProblema] = useState('Ruído anormal');
  const [urgencia, setUrgencia] = useState('Média');
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(null);       // chamado criado
  const [digitarCodigo, setDigitarCodigo] = useState(false);
  const arquivoRef = useRef(null);

  const lista = maquinas.data || [];
  // Por padrão, sugere a primeira máquina do setor do funcionário
  const maquina = maquinaEscolhida || (lista.find(m => m.setor === usuario.setor) || lista[0])?.id || '';

  async function enviar(e) {
    e.preventDefault();
    const dados = { maquina, problema, urgencia, descricao: descricao.trim() };
    if (dados.descricao.length < 5) {
      toast('Conte em poucas palavras o que você viu, ouviu ou sentiu.', 'warning');
      return;
    }
    setEnviando(true);
    try {
      // Com foto, envia como multipart: campo "dados" (JSON) + campo "foto"
      let corpo = dados;
      if (foto) {
        corpo = new FormData();
        corpo.append('dados', JSON.stringify(dados));
        corpo.append('foto', foto);
      }
      setEnviado(await api.criarChamado(corpo));
    } catch (er) {
      toast(er.message, 'danger');
    } finally {
      setEnviando(false);
    }
  }

  function abrirOutro() {
    setEnviado(null);
    setDescricao('');
    setFoto(null);
  }

  return (
    <>
      <h1 className="h2 mb-1">Abrir chamado de manutenção</h1>
      <p className="text-secondary mb-4">Viu algo errado em uma máquina? Conte para a equipe de manutenção.</p>

      <div className="row g-3">
        <div className="col-lg-8">
          <section className="pm-card">
            {enviado ? (
              <div className="pm-empty">
                <strong>Chamado {enviado.id} enviado.</strong>
                O gestor já pode ver o chamado e vai definir prioridade e equipe.
                <div className="d-flex gap-2 justify-content-center mt-3">
                  <Link className="btn btn-primary" href="/meus-chamados">Acompanhar chamado</Link>
                  <button className="btn btn-outline-dark" onClick={abrirOutro}>Abrir outro</button>
                </div>
              </div>
            ) : (
              <form onSubmit={enviar} noValidate>
                <div className="row g-2 mb-3 align-items-end">
                  <div className="col">
                    <label className="form-label" htmlFor="c-m">Máquina</label>
                    <select id="c-m" className="form-select" value={maquina} onChange={e => setMaquinaEscolhida(e.target.value)}>
                      {lista.map(m => <option key={m.id} value={m.id}>{m.id} · {m.nome}</option>)}
                    </select>
                  </div>
                  <div className="col-auto">
                    <button type="button" className="btn btn-outline-dark" onClick={() => setDigitarCodigo(true)}>Escanear QR da máquina</button>
                  </div>
                </div>

                <fieldset className="mb-3">
                  <legend className="form-label">O que está acontecendo?</legend>
                  <Chips nome="prob" opcoes={PROBLEMAS} valor={problema} onChange={setProblema} />
                </fieldset>

                <fieldset className="mb-3">
                  <legend className="form-label">Urgência</legend>
                  <Chips nome="urg" opcoes={URGENCIAS} valor={urgencia} onChange={setUrgencia} />
                </fieldset>

                <div className="mb-3">
                  <label className="form-label" htmlFor="c-d">Descrição</label>
                  <textarea id="c-d" className="form-control" rows={5} placeholder="Descreva o que você viu, ouviu ou sentiu"
                    value={descricao} onChange={e => setDescricao(e.target.value)} />
                </div>

                <div className="d-flex flex-wrap gap-2 justify-content-between">
                  <div>
                    <input ref={arquivoRef} type="file" accept="image/*" capture="environment" hidden onChange={e => setFoto(e.target.files[0] || null)} />
                    <button type="button" className="btn btn-outline-dark" onClick={() => arquivoRef.current.click()}>Anexar foto</button>{' '}
                    {foto && <span className="text-secondary small">{foto.name} <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setFoto(null)}>remover</button></span>}
                  </div>
                  <div className="d-flex gap-2">
                    <Link className="btn btn-outline-dark" href="/meus-chamados">Cancelar</Link>
                    <button className="btn btn-primary px-4" disabled={enviando || !maquina}>{enviando ? 'Enviando…' : 'Enviar chamado'}</button>
                  </div>
                </div>
              </form>
            )}
          </section>
        </div>

        <div className="col-lg-4">
          <section className="pm-card mb-3">
            <h2>Como funciona</h2>
            <ol className="pm-tl">
              <li><b>1. Você registra</b><small>Leva menos de 1 minuto</small></li>
              <li className="atual"><b>2. O gestor analisa</b><small>Prioridade e equipe são definidas</small></li>
              <li className="pendente"><b>3. O técnico atende</b><small>Você acompanha cada etapa</small></li>
            </ol>
          </section>
          <section className="pm-card">
            <h2>Alertas no seu setor</h2>
            <Carga l={alertas}>
              {lista => lista.length ? lista.map(a => (
                <div className="pm-alert-i" key={a.id}>
                  <Badge k={a.nivel} />
                  <div><strong>{a.ativo}</strong><small>{a.titulo}</small></div>
                </div>
              )) : <p className="text-secondary mb-0">Nada fora do normal no seu setor agora.</p>}
            </Carga>
          </section>
        </div>
      </div>

      {digitarCodigo && (
        <CodigoDaMaquina maquinas={lista} onClose={() => setDigitarCodigo(false)}
          onEscolher={codigo => { setMaquinaEscolhida(codigo); setDigitarCodigo(false); }} />
      )}
    </>
  );
}

export default function Chamado() {
  return <AreaFuncionario>{usuario => <Formulario usuario={usuario} />}</AreaFuncionario>;
}
