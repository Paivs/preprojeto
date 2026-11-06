"use client";

import { useEffect, useRef, useState } from "react";
import "./headerAdmin.css";

const notificacoesIniciais = [
  {
    id: 1,
    icone: "bi-lightning-charge",
    cor: "aviso",
    titulo: "Consumo acima da média",
    descricao: "O ar-condicionado da sala está consumindo mais energia que o habitual.",
    horario: "Há 10 minutos",
    lida: false,
  },
  {
    id: 2,
    icone: "bi-receipt",
    cor: "info",
    titulo: "Nova fatura disponível",
    descricao: "A fatura de novembro já pode ser consultada.",
    horario: "Há 2 horas",
    lida: false,
  },
  {
    id: 3,
    icone: "bi-check-circle",
    cor: "sucesso",
    titulo: "Meta de economia atualizada",
    descricao: "Você atingiu 72% da sua meta de economia mensal.",
    horario: "Ontem, às 18:42",
    lida: true,
  },
];

const notificacoesAdmin = [
  {
    id: 1,
    icone: "bi-person-plus",
    cor: "info",
    titulo: "Novo cliente cadastrado",
    descricao: "Um novo cliente concluiu o cadastro na plataforma.",
    horario: "Há 10 minutos",
    lida: false,
  },
  {
    id: 2,
    icone: "bi-wifi-off",
    cor: "aviso",
    titulo: "Dispositivo sem comunicação",
    descricao: "Um dispositivo está aguardando reconexão.",
    horario: "Há 2 horas",
    lida: false,
  },
  {
    id: 3,
    icone: "bi-check-circle",
    cor: "sucesso",
    titulo: "Sincronização concluída",
    descricao: "Os dados da plataforma foram atualizados.",
    horario: "Ontem, às 18:42",
    lida: true,
  },
];

export default function Header({ tipoUsuario = "usuario" }) {
  const eAdmin = tipoUsuario === "admin";
  const nomePerfil = "Marina Vieira";
  const cargoPerfil = eAdmin ? "Administradora" : "Cliente";
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [notificacoes, setNotificacoes] = useState(() => eAdmin ? notificacoesAdmin : notificacoesIniciais);
  const notificacoesRef = useRef(null);
  const quantidadeNaoLidas = notificacoes.filter((item) => !item.lida).length;

  useEffect(() => {
    if (!perfilAberto && !notificacoesAbertas) return undefined;

    function fecharComEscape(evento) {
      if (evento.key === "Escape") {
        setPerfilAberto(false);
        setNotificacoesAbertas(false);
      }
    }

    function fecharAoClicarFora(evento) {
      if (notificacoesRef.current && !notificacoesRef.current.contains(evento.target)) {
        setNotificacoesAbertas(false);
      }
    }

    window.addEventListener("keydown", fecharComEscape);
    document.addEventListener("pointerdown", fecharAoClicarFora);
    return () => {
      window.removeEventListener("keydown", fecharComEscape);
      document.removeEventListener("pointerdown", fecharAoClicarFora);
    };
  }, [perfilAberto, notificacoesAbertas]);

  function alternarNotificacoes() {
    setNotificacoesAbertas((abertas) => !abertas);
    setPerfilAberto(false);
  }

  function marcarTodasComoLidas() {
    setNotificacoes((atuais) => atuais.map((item) => ({ ...item, lida: true })));
  }

  function marcarComoLida(id) {
    setNotificacoes((atuais) => atuais.map((item) => item.id === id ? { ...item, lida: true } : item));
  }

  return (
    <>
      <header className="topo">
        <button type="button" className="botao-menu-mobile" aria-label="Abrir menu">
          <i className="bi bi-list" />
        </button>

        <div className="barra-pesquisa">
          <i className="bi bi-search" aria-hidden="true" />
          <input type="search" placeholder="Buscar no sistema..." aria-label="Buscar no sistema" />
          <kbd className="atalho">Ctrl K</kbd>
        </div>

        <div className="topo-acoes">
          <button type="button" className="botao-icone botao-tema" aria-label="Tema">
            <i className="bi bi-sun" />
          </button>

          <div className="topo-menu-area topo-notificacoes" ref={notificacoesRef}>
            <button
              type="button"
              className="botao-icone botao-notificacoes"
              aria-label={`Notificações${quantidadeNaoLidas ? `, ${quantidadeNaoLidas} não lidas` : ""}`}
              aria-expanded={notificacoesAbertas}
              aria-controls="painel-notificacoes"
              onClick={alternarNotificacoes}
            >
              <i className="bi bi-bell" />
              {quantidadeNaoLidas > 0 && <span className="botao-icone-ponto" />}
            </button>

            {notificacoesAbertas && (
              <section className="painel-notificacoes" id="painel-notificacoes" aria-label="Notificações">
                <div className="painel-notificacoes-topo">
                  <div>
                    <h2>Notificações</h2>
                    <p>{quantidadeNaoLidas ? `${quantidadeNaoLidas} avisos não lidos` : "Tudo em dia"}</p>
                  </div>
                  {quantidadeNaoLidas > 0 && (
                    <button type="button" className="notificacoes-marcar-lidas" onClick={marcarTodasComoLidas}>
                      Marcar como lidas
                    </button>
                  )}
                </div>

                <div className="notificacoes-lista">
                  {notificacoes.map((notificacao) => (
                    <button
                      type="button"
                      key={notificacao.id}
                      className={`notificacao-item ${notificacao.lida ? "notificacao-lida" : ""}`}
                      onClick={() => marcarComoLida(notificacao.id)}
                    >
                      <span className={`notificacao-icone notificacao-${notificacao.cor}`}>
                        <i className={`bi ${notificacao.icone}`} />
                      </span>
                      <span className="notificacao-conteudo">
                        <strong>{notificacao.titulo}</strong>
                        <span>{notificacao.descricao}</span>
                        <small>{notificacao.horario}</small>
                      </span>
                      {!notificacao.lida && <span className="notificacao-nao-lida" aria-label="Não lida" />}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          <button
            type="button"
            className="perfil"
            aria-label={`Abrir informações da conta de ${nomePerfil}`}
            aria-haspopup="dialog"
            aria-expanded={perfilAberto}
            aria-controls="painel-perfil"
            onClick={() => {
              setPerfilAberto(true);
              setNotificacoesAbertas(false);
            }}
          >
            <span className="avatar">MV</span>
            <span className="perfil-dados">
              <strong>{nomePerfil}</strong>
              <small>{cargoPerfil}</small>
            </span>
            <i className="bi bi-chevron-down perfil-seta" aria-hidden="true" />
          </button>
        </div>
      </header>

      {perfilAberto && (
        <div className="perfil-modal-fundo" onMouseDown={(evento) => {
          if (evento.target === evento.currentTarget) setPerfilAberto(false);
        }}>
          <aside
            className="perfil-painel"
            id="painel-perfil"
            role="dialog"
            aria-modal="true"
            aria-labelledby="perfil-painel-titulo"
          >
            <div className="perfil-painel-topo">
              <div>
                <span className="perfil-painel-etiqueta">MINHA CONTA</span>
                <h2 id="perfil-painel-titulo">Informações do perfil</h2>
              </div>
              <button type="button" className="perfil-painel-fechar" aria-label="Fechar perfil" onClick={() => setPerfilAberto(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="perfil-painel-identidade">
              <span className="perfil-painel-avatar">MV</span>
              <div>
                <h3>{nomePerfil}</h3>
                <p>{cargoPerfil}</p>
              </div>
              <span className="perfil-status-conta"><i /> Ativa</span>
            </div>

            <section className="perfil-detalhes">
              <h3>Dados da conta</h3>
              <div className="perfil-detalhe-linha">
                <span><i className="bi bi-envelope" /> E-mail</span>
                <strong>{eAdmin ? "marina.vieira@volthouse.com" : "marina.vieira@email.com"}</strong>
              </div>
              <div className="perfil-detalhe-linha">
                <span><i className="bi bi-telephone" /> Telefone</span>
                <strong>(11) 99999-0000</strong>
              </div>
              <div className="perfil-detalhe-linha">
                <span><i className="bi bi-geo-alt" /> Unidade</span>
                <strong>{eAdmin ? "VoltHouse" : "São Paulo, SP"}</strong>
              </div>
              <div className="perfil-detalhe-linha">
                <span><i className="bi bi-lightning" /> Plano</span>
                <strong>{eAdmin ? "Acesso administrativo" : "Residencial"}</strong>
              </div>
            </section>

            <div className="perfil-painel-rodape">
              <span><i className="bi bi-shield-check" /> Seus dados estão protegidos</span>
              <button type="button" onClick={() => setPerfilAberto(false)}>
                <i className="bi bi-box-arrow-right" /> Fechar painel
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
