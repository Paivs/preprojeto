'use client';
/* ============================================================
   DETALHE DE UM CHAMADO
   Linha do tempo, foto, comentários e campo para comentar.
   Usado em "Meus chamados" (funcionário) e "Chamados" (gestor).
   ============================================================ */
import { useState } from 'react';
import { api, urlArquivo } from '@/lib/api';
import { Badge, useToast } from '@/components/ui';

export default function DetalheChamado({ chamado: c, onAtualizado, mostrarAutor = false, children }) {
  const toast = useToast();
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function comentar() {
    if (!texto.trim()) {
      toast('Escreva o comentário antes de enviar.', 'warning');
      return;
    }
    setEnviando(true);
    try {
      onAtualizado(await api.comentarChamado(c.id, texto.trim()));
      setTexto('');
      toast('Comentário enviado.');
    } catch (e) {
      toast(e.message, 'danger');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <h2>{c.id} · {c.maquina} · {c.problema}</h2>
      <p className="text-secondary small mb-3">
        Urgência: <Badge k={c.urgencia === 'Máquina parada' || c.urgencia === 'Alta' ? 'alta' : c.urgencia === 'Média' ? 'media' : 'baixa'}>{c.urgencia}</Badge>
        {mostrarAutor && <> · aberto por <b>{c.autor}</b> ({c.setor})</>}
        {c.ordem && <> · {c.ordem}</>}
      </p>

      {c.descricao && <p>{c.descricao}</p>}
      {c.foto && (
        // Foto vinda da API (outro endereço): <img> comum, sem otimização do Next
        // eslint-disable-next-line @next/next/no-img-element
        <a href={urlArquivo(c.foto)} target="_blank" rel="noreferrer"><img className="pm-foto mb-3" src={urlArquivo(c.foto)} alt={`Foto do chamado ${c.id}`} /></a>
      )}

      <ol className="pm-tl">
        {c.timeline.map(t => (
          <li key={t.nome} className={t.estado === 'feito' ? '' : t.estado}>
            <b>{t.nome}</b>
            {(t.quando || t.detalhe) && <small>{[t.quando, t.detalhe].filter(Boolean).join(' · ')}</small>}
          </li>
        ))}
      </ol>

      {children}

      {c.comentarios.length > 0 && (
        <>
          <h3 className="h6">Comentários</h3>
          {c.comentarios.map((k, i) => (
            <p className="mb-2" key={i}>
              <small className="text-secondary">{k.quando} · {k.autor}</small><br />
              {k.texto}
            </p>
          ))}
        </>
      )}

      {c.situacao !== 'Concluído' && (
        <>
          <label className="form-label mt-2" htmlFor="cm">Adicionar informação</label>
          <textarea id="cm" className="form-control mb-2" rows={2} placeholder="Algo mudou? Escreva aqui" value={texto} onChange={e => setTexto(e.target.value)} />
          <button className="btn btn-outline-dark" disabled={enviando} onClick={comentar}>Enviar comentário</button>
        </>
      )}
    </>
  );
}
