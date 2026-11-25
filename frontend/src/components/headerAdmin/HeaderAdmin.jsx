"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import "./headerAdmin.css";

function formatarConsumo(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatarHorario(valor) {
  const data = new Date(valor);
  if (!Number.isFinite(data.getTime())) return "Leitura mais recente";
  return `Leitura em ${data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  })}`;
}

function obterIdsLidos(chave) {
  try {
    const ids = JSON.parse(localStorage.getItem(chave) || "[]");
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

export default function Header({ tipoUsuario = "usuario" }) {
  const [conta, setConta] = useState({
    nome_empresa: "",
    email: "",
    cnpj: "",
    id_usuario: null,
    perfil: tipoUsuario,
  });
  const eAdmin = conta.perfil === "admin" || tipoUsuario === "admin";
  const nomePerfil = conta.nome_empresa || "Minha conta";
  const cargoPerfil = eAdmin ? "Administradora" : "Cliente";
  const iniciaisPerfil =
    nomePerfil
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0].toLocaleUpperCase("pt-BR"))
      .join("") || "V";
  const linkConfiguracoes = eAdmin
    ? "/adminPages/configuracaoAdmin"
    : "/userPages/configuracoes";
  const [temaClaro, setTemaClaro] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregandoNotificacoes, setCarregandoNotificacoes] = useState(true);
  const [erroNotificacoes, setErroNotificacoes] = useState("");
  const chaveLidas = `volthouse-alertas-consumo-lidas:${conta.id_usuario || "sessao"}`;
  const notificacoesRef = useRef(null);
  const quantidadeNaoLidas = notificacoes.filter((item) => !item.lida).length;
  const semAlertas =
    !carregandoNotificacoes && !erroNotificacoes && notificacoes.length === 0;

  const carregarNotificacoes = useCallback(async (silencioso = false) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setNotificacoes([]);
      setErroNotificacoes("Entre na sua conta para ver os alertas.");
      setCarregandoNotificacoes(false);
      return;
    }

    if (!silencioso) {
      setCarregandoNotificacoes(true);
      setErroNotificacoes("");
    }
    try {
      const resposta = await fetch(
        `${API_BASE_URL}/equipamentos/alertas-consumo`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok || !resultado.sucesso) {
        throw new Error(resultado.erro || "Falha ao carregar os alertas.");
      }

      setErroNotificacoes("");
      const idsLidos = obterIdsLidos(chaveLidas);
      const alertas = Array.isArray(resultado.dados) ? resultado.dados : [];
      setNotificacoes(
        alertas.map((alerta) => {
          const alertaConta = alerta.tipo_alerta === "conta";
          const id = alerta.id_alerta || `${alerta.id_equipamento}:${alerta.mes_referencia}`;
          const notificacao = {
            id,
            icone: "bi-lightning-charge",
            cor: "aviso",
            titulo: "Limite de consumo excedido",
            descricao: `${alerta.nome_equipamento} (${alerta.nome_setor}): ${formatarConsumo(
              alerta.consumo_mes
            )} kWh neste mês; limite ${formatarConsumo(
              alerta.consumo_maximo
            )} kWh.`,
            horario: alertaConta ? "Consumo mensal da unidade" : formatarHorario(alerta.ultima_leitura),
            lida: idsLidos.has(id),
          };
          if (alertaConta) {
            notificacao.titulo = "Limite mensal da unidade excedido";
            notificacao.descricao = `Consumo total da unidade: ${formatarConsumo(alerta.consumo_mes)} kWh neste mês; limite ${formatarConsumo(alerta.consumo_maximo)} kWh.`;
          }
          return notificacao;
        })
      );
    } catch {
      setErroNotificacoes("Não foi possível atualizar os alertas de consumo.");
    } finally {
      if (!silencioso) setCarregandoNotificacoes(false);
    }
  }, [chaveLidas]);

  useEffect(() => {
    carregarNotificacoes();
    const intervalo = window.setInterval(() => carregarNotificacoes(true), 3_000);
    return () => window.clearInterval(intervalo);
  }, [carregarNotificacoes]);

  useEffect(() => {
    let ativo = true;
    async function carregarConta() {
      await Promise.resolve();
      let usuarioSessao = {};
      try {
        usuarioSessao = JSON.parse(sessionStorage.getItem("usuario") || "{}");
      } catch {
        sessionStorage.removeItem("usuario");
      }
      const dadosSessao = {
        nome_empresa: usuarioSessao.nome || usuarioSessao.nome_empresa || "",
        email: usuarioSessao.email || "",
        id_usuario: usuarioSessao.id || usuarioSessao.id_usuario || null,
        perfil: usuarioSessao.perfil || tipoUsuario,
      };
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          const resposta = await fetch(
            `${API_BASE_URL}/configuracoes/usuario`,
            {
              headers: { Authorization: `Bearer ${token}` },
              cache: "no-store",
            }
          );
          const resultado = await resposta.json().catch(() => ({}));
          if (resposta.ok && resultado.dados && ativo) {
            setConta({ ...dadosSessao, ...resultado.dados });
            return;
          }
        } catch {
          // Os dados da sessÃ£o servem de alternativa se a API estiver indisponÃ­vel.
        }
      }
      if (ativo) setConta(dadosSessao);
    }
    carregarConta();
    window.addEventListener("volthouse:perfil-atualizado", carregarConta);
    return () => {
      ativo = false;
      window.removeEventListener("volthouse:perfil-atualizado", carregarConta);
    };
  }, [tipoUsuario]);

  useEffect(() => {
    let temaSalvo = "escuro";

    try {
      temaSalvo = localStorage.getItem("volthouse-tema") || "escuro";
    } catch {
      // O tema continua funcionando durante a sessão se o armazenamento estiver indisponível.
    }

    const temaAplicado = temaSalvo === "claro" ? "claro" : "escuro";
    if (temaAplicado === "claro") {
      document.documentElement.dataset.tema = "claro";
    } else {
      delete document.documentElement.dataset.tema;
    }
    const agendamentoTema = window.setTimeout(
      () => setTemaClaro(temaAplicado === "claro"),
      0
    );
    return () => window.clearTimeout(agendamentoTema);
  }, []);

  function alternarTema() {
    const novoTema = temaClaro ? "escuro" : "claro";

    if (novoTema === "claro") {
      document.documentElement.dataset.tema = "claro";
    } else {
      delete document.documentElement.dataset.tema;
    }

    try {
      localStorage.setItem("volthouse-tema", novoTema);
    } catch {
      // A troca visual não depende do armazenamento local.
    }

    setTemaClaro(novoTema === "claro");
  }

  useEffect(() => {
    if (!perfilAberto && !notificacoesAbertas) return undefined;

    function fecharComEscape(evento) {
      if (evento.key === "Escape") {
        setPerfilAberto(false);
        setNotificacoesAbertas(false);
      }
    }

    function fecharAoClicarFora(evento) {
      if (
        notificacoesRef.current &&
        !notificacoesRef.current.contains(evento.target)
      ) {
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
    if (!notificacoesAbertas) carregarNotificacoes();
    setNotificacoesAbertas(!notificacoesAbertas);
    setPerfilAberto(false);
  }

  function salvarIdsLidos(idsNovos) {
    try {
      const ids = obterIdsLidos(chaveLidas);
      idsNovos.forEach((id) => ids.add(id));
      localStorage.setItem(chaveLidas, JSON.stringify([...ids]));
    } catch {
      // A leitura continua funcionando se o armazenamento local estiver indisponível.
    }
  }

  function marcarTodasComoLidas() {
    salvarIdsLidos(notificacoes.map((item) => item.id));
    setNotificacoes((atuais) =>
      atuais.map((item) => ({ ...item, lida: true }))
    );
  }

  function marcarComoLida(id) {
    salvarIdsLidos([id]);
    setNotificacoes((atuais) =>
      atuais.map((item) => (item.id === id ? { ...item, lida: true } : item))
    );
  }

  return (
    <>
      <header className="topo">
        <button
          type="button"
          className="botao-menu-mobile"
          aria-label="Abrir menu"
        >
          <i className="bi bi-list" />
        </button>

        <div className="topo-acoes">
          <button
            type="button"
            className="botao-icone botao-tema"
            aria-label={`Ativar tema ${temaClaro ? "escuro" : "claro"}`}
            aria-pressed={temaClaro}
            title={`Ativar tema ${temaClaro ? "escuro" : "claro"}`}
            onClick={alternarTema}
          >
            <i className={`bi ${temaClaro ? "bi-moon-stars" : "bi-sun"}`} />
          </button>

          {!eAdmin && (
            <div
              className="topo-menu-area topo-notificacoes"
              ref={notificacoesRef}
            >
            <button
              type="button"
              className="botao-icone botao-notificacoes"
              aria-label={`Notificações${
                quantidadeNaoLidas ? `, ${quantidadeNaoLidas} não lidas` : ""
              }`}
              aria-expanded={notificacoesAbertas}
              aria-controls="painel-notificacoes"
              onClick={alternarNotificacoes}
            >
              <i className="bi bi-bell" />
              {quantidadeNaoLidas > 0 && <span className="botao-icone-ponto" />}
            </button>

            {notificacoesAbertas && (
              <section
                className="painel-notificacoes"
                id="painel-notificacoes"
                aria-label="Notificações"
              >
                <div className="painel-notificacoes-topo">
                  <div>
                    <h2>Notificações</h2>
                    <p>
                      {carregandoNotificacoes
                        ? "Verificando limites..."
                        : erroNotificacoes
                          ? "Alertas indisponíveis"
                          : quantidadeNaoLidas
                        ? `${quantidadeNaoLidas} avisos não lidos`
                        : "Tudo em dia"}
                    </p>
                  </div>
                  {quantidadeNaoLidas > 0 && (
                    <button
                      type="button"
                      className="notificacoes-marcar-lidas"
                      onClick={marcarTodasComoLidas}
                    >
                      Marcar como lidas
                    </button>
                  )}
                </div>

                <div className="notificacoes-lista">
                  {carregandoNotificacoes && notificacoes.length === 0 && (
                    <p className="notificacoes-vazio">Buscando leituras de consumo...</p>
                  )}
                  {erroNotificacoes && notificacoes.length === 0 && (
                    <p className="notificacoes-erro" role="alert">{erroNotificacoes}</p>
                  )}
                  {semAlertas && (
                    <p className="notificacoes-vazio">
                      Nenhum dispositivo ultrapassou o limite mensal.
                    </p>
                  )}
                  {notificacoes.map((notificacao) => (
                    <button
                      type="button"
                      key={notificacao.id}
                      className={`notificacao-item ${
                        notificacao.lida ? "notificacao-lida" : ""
                      }`}
                      onClick={() => marcarComoLida(notificacao.id)}
                    >
                      <span
                        className={`notificacao-icone notificacao-${notificacao.cor}`}
                      >
                        <i className={`bi ${notificacao.icone}`} />
                      </span>
                      <span className="notificacao-conteudo">
                        <strong>{notificacao.titulo}</strong>
                        <span>{notificacao.descricao}</span>
                        <small>{notificacao.horario}</small>
                      </span>
                      {!notificacao.lida && (
                        <span
                          className="notificacao-nao-lida"
                          aria-label="Não lida"
                        />
                      )}
                    </button>
                  ))}
                  {erroNotificacoes && notificacoes.length > 0 && (
                    <p className="notificacoes-erro" role="alert">
                      Os alertas podem estar desatualizados.
                    </p>
                  )}
                </div>
              </section>
            )}
            </div>
          )}

          <button
            type="button"
            className="perfil"
            aria-label={`Abrir informações da conta de ${nomePerfil}`}
            aria-haspopup="dialog"
            aria-expanded={perfilAberto}
            aria-controls="painel-perfil"
            onClick={() => {
              setPerfilAberto((aberto) => !aberto);
              setNotificacoesAbertas(false);
            }}
          >
            <span className="avatar">{iniciaisPerfil}</span>
            <span className="perfil-dados">
              <strong>{nomePerfil}</strong>
              <small>{cargoPerfil}</small>
            </span>
            <i className="bi bi-chevron-down perfil-seta" aria-hidden="true" />
          </button>
        </div>
      </header>

      {perfilAberto && (
        <div
          className="perfil-modal-fundo"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) setPerfilAberto(false);
          }}
        >
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
              <button
                type="button"
                className="perfil-painel-fechar"
                aria-label="Fechar perfil"
                onClick={() => setPerfilAberto(false)}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="perfil-painel-identidade">
              <span className="perfil-painel-avatar">{iniciaisPerfil}</span>
              <div>
                <h3>{nomePerfil}</h3>
                <p>{cargoPerfil}</p>
              </div>
              <span className="perfil-status-conta">
                <i /> Ativa
              </span>
            </div>

            <section className="perfil-detalhes">
              <h3>Dados da conta</h3>
              {[
                {
                  rotulo: "E-mail",
                  icone: "bi-envelope",
                  valor: conta.email || "Não informado",
                },
                {
                  rotulo: "CNPJ",
                  icone: "bi-upc",
                  valor: conta.cnpj || "Não informado",
                },
                {
                  rotulo: "ID da conta",
                  icone: "bi-person-badge",
                  valor: conta.id_usuario ?? "Não informado",
                },
                {
                  rotulo: "Acesso",
                  icone: "bi-shield-check",
                  valor: cargoPerfil,
                },
              ].map((item) => (
                <div className="perfil-detalhe-linha" key={item.rotulo}>
                  <span>
                    <i className={`bi ${item.icone}`} /> {item.rotulo}
                  </span>
                  <strong>{item.valor}</strong>
                </div>
              ))}
            </section>

            <div className="perfil-painel-rodape">
              <span>
                <i className="bi bi-shield-check" /> Seus dados estão protegidos
              </span>
              <Link
                className="perfil-link-configuracoes"
                href={linkConfiguracoes}
                onClick={() => setPerfilAberto(false)}
              >
                <i className="bi bi-gear" /> Configurações da conta
              </Link>
              <button
                type="button"
                className="perfil-botao-sair"
                onClick={() => {
                  sessionStorage.removeItem("token");
                  sessionStorage.removeItem("usuario");
                  window.location.replace("/login");
                }}
              >
                <i className="bi bi-box-arrow-right" /> Sair da conta
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
