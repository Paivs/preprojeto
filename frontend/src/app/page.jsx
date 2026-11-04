'use client';
/* ============================================================
   TELA DE LOGIN  ( / )
   ============================================================ */
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { lerUsuario, paginaInicial, salvarSessao } from '@/lib/sessao';
import { Chips, Modal, useToast } from '@/components/ui';

// Acessos de demonstração: aparecem só com NEXT_PUBLIC_MOSTRAR_DEMO=true no .env.local
const MOSTRAR_DEMO = process.env.NEXT_PUBLIC_MOSTRAR_DEMO === 'true';
const DEMO = [
  { rotulo: 'Gestor (admin)', email: 'admin@mantech.com.br', senha: 'Mantech@2026', perfil: 'gestor' },
  { rotulo: 'Técnico', email: 'tecnico@mantech.com.br', senha: 'Tec@2026', perfil: 'tecnico' },
  { rotulo: 'Funcionário', email: 'funcionario@mantech.com.br', senha: 'Func@2026', perfil: 'funcionario' }
];

const OPCOES_PERFIL = [['gestor', 'Gestor'], ['tecnico', 'Técnico'], ['funcionario', 'Funcionário']];

/** Modal "Esqueci a senha". */
function RecuperarSenha({ onClose }) {
  const toast = useToast();
  const [usuario, setUsuario] = useState('');

  async function enviar() {
    try {
      await api.recuperarSenha({ usuario });
      onClose();
      toast('Pedido enviado ao administrador.');
    } catch (e) {
      toast(e.message, 'danger');
    }
  }

  return (
    <Modal titulo="Recuperar acesso" onClose={onClose}
      footer={<button className="btn btn-primary" onClick={enviar}>Pedir nova senha</button>}>
      <p>Informe seu e-mail ou matrícula. Se ele existir, o administrador recebe o pedido de nova senha.</p>
      <input className="form-control" placeholder="nome@empresa.com.br" value={usuario} onChange={e => setUsuario(e.target.value)} />
    </Modal>
  );
}

export default function Login() {
  const router = useRouter();
  const [perfil, setPerfil] = useState('gestor');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [manter, setManter] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [esqueci, setEsqueci] = useState(false);

  // Quem já está logado vai direto para a sua área
  useEffect(() => {
    const u = lerUsuario();
    if (u) router.replace(paginaInicial(u.perfil));
  }, [router]);

  async function entrar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const r = await api.login({ perfil, usuario: usuario.trim(), senha, manter });
      salvarSessao(r.usuario, r.token, manter);
      router.push(paginaInicial(r.usuario.perfil));
    } catch (err) {
      setErro(err.message);
      setEnviando(false);
    }
  }

  function usarDemo(d) {
    setPerfil(d.perfil);
    setUsuario(d.email);
    setSenha(d.senha);
    setErro('');
  }

  return (
    <div className="pm-login">
      {/* Lado esquerdo: apresentação */}
      <section className="pm-login-l">
        <Image src="/mantech-logo.png" alt="Mantech" width={585} height={100} priority />
        <h1>Antecipe a falha.<br />Proteja a produção.</h1>
        <p className="lead">Monitoramento preditivo de máquinas, alertas e ordens de serviço em um só lugar.</p>
        <svg className="pm-beat" viewBox="0 0 420 60" aria-hidden="true">
          <path d="M0 34H150L166 6L186 54L200 34H290L304 12L320 48L332 34H420" />
        </svg>
        <ul>
          <li>Alertas por tendência, antes da parada</li>
          <li>Ordens de serviço integradas aos alertas</li>
          <li>Chamados abertos direto do chão de fábrica</li>
        </ul>
      </section>

      {/* Lado direito: formulário */}
      <section className="pm-login-r">
        <div className="pm-card pm-login-card p-4">
          <h2 className="h3 mb-1">Entrar no PredictMaint</h2>
          <p className="text-secondary">Use seu e-mail corporativo ou matrícula.</p>

          <form onSubmit={entrar} noValidate>
            <fieldset className="mb-3">
              <legend className="form-label">Perfil de acesso</legend>
              <Chips nome="perfil" opcoes={OPCOES_PERFIL} valor={perfil} onChange={setPerfil} />
            </fieldset>

            <div className="mb-3">
              <label className="form-label" htmlFor="usuario">E-mail ou matrícula</label>
              <input className="form-control" id="usuario" placeholder="nome@empresa.com.br" autoComplete="username"
                value={usuario} onChange={e => setUsuario(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="senha">Senha</label>
              <input className="form-control" id="senha" type="password" autoComplete="current-password"
                value={senha} onChange={e => setSenha(e.target.value)} />
            </div>

            <div className="d-flex justify-content-between mb-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="manter" checked={manter} onChange={e => setManter(e.target.checked)} />
                <label className="form-check-label" htmlFor="manter">Manter conectado</label>
              </div>
              <button type="button" className="btn btn-link p-0 fw-semibold" onClick={() => setEsqueci(true)}>Esqueci a senha</button>
            </div>

            {erro && <div className="alert alert-danger py-2" role="alert">{erro}</div>}
            <button className="btn btn-primary w-100 py-2" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
          </form>

          <p className="text-secondary text-center small mt-3 mb-0">Problemas de acesso? Fale com o administrador do sistema.</p>

          {MOSTRAR_DEMO && (
            <div className="pm-mini mt-3">
              <p className="pm-lbl mb-2">Acessos de demonstração</p>
              {DEMO.map(d => (
                <div key={d.email} className="d-flex justify-content-between align-items-center gap-2 mb-2">
                  <span className="small"><b>{d.rotulo}</b><br />{d.email} · {d.senha}</span>
                  <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => usarDemo(d)}>Usar</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {esqueci && <RecuperarSenha onClose={() => setEsqueci(false)} />}
    </div>
  );
}
