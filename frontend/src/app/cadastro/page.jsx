"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import "@/app/cadastro/cadastro.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function Cadastro() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [idMunicipio, setIdMunicipio] = useState("");

  const [municipios, setMunicipios] = useState([]);
  const [carregandoMunicipios, setCarregandoMunicipios] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Carregar municípios do banco
  useEffect(() => {
    async function buscarMunicipios() {
      try {
        const resposta = await fetch(`${API_URL}/auth/municipios`);

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.mensagem || "Não foi possível carregar os municípios.",
          );
        }

        setMunicipios(dados.municipios || []);
      } catch (erro) {
        setMensagem(erro.message);
        setTipoMensagem("erro");
      } finally {
        setCarregandoMunicipios(false);
      }
    }

    buscarMunicipios();
  }, []);

  async function handleCadastro(e) {
    e.preventDefault();

    setMensagem("");
    setTipoMensagem("");

    if (
      !nome.trim() ||
      !email.trim() ||
      !senha ||
      !confirmarSenha ||
      !idMunicipio
    ) {
      setMensagem("Preencha todos os campos.");
      setTipoMensagem("erro");
      return;
    }

    if (nome.trim().length < 3) {
      setMensagem("Informe seu nome completo.");
      setTipoMensagem("erro");
      return;
    }

    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(email.trim())) {
      setMensagem("Informe um e-mail válido.");
      setTipoMensagem("erro");
      return;
    }

    if (senha.length < 8) {
      setMensagem("A senha deve ter pelo menos 8 caracteres.");
      setTipoMensagem("erro");
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagem("As senhas não coincidem.");
      setTipoMensagem("erro");
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch(`${API_URL}/auth/registrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha,
          confirmarSenha,
          id_municipio: Number(idMunicipio),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Não foi possível realizar o cadastro.",
        );
      }

      setMensagem("Conta criada com sucesso! Redirecionando para o login...");
      setTipoMensagem("sucesso");

      setNome("");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");
      setIdMunicipio("");

      setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (erro) {
      console.error("Erro ao realizar cadastro:", erro);

      setMensagem(erro.message || "Erro ao conectar com o servidor.");

      setTipoMensagem("erro");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="page-login">
      {/* <div className="lado-esquerdo">

      <div className="container-text-lado-esquerdo">
        <div className="img-lado-esquerdo">
          <img
            className="img-logo"
            src="/imagens/logo.png"
            alt="Logo AlertABC"
          />
        </div>

          <div className="text-lado-esquerdo">
            <h1>
              Faça parte de uma{" "}
              <span className="quebra-linha">comunidade mais segura.</span>
            </h1>

            <p>
              Registre e acompanhe relatos de ocorrências
              <span className="quebra-linha">
                por região, contribuindo para uma cidade
              </span>
              <span> mais informada e segura.</span>
            </p>
          </div>
        </div>

        <div className="icon-lado-esquerdo">
          <div className="icon">
            <i className="bi bi-geo-alt"></i>
            <h3>Mapa interativo</h3>
            <p>
              Visualize relatos por
              <span className="quebra-linha">localização.</span>
            </p>
          </div>

          <div className="icon">
            <i className="bi bi-file-earmark-plus"></i>
            <h3>Registre relatos</h3>
            <p>
              Compartilhe informações
              <span className="quebra-linha">com a comunidade.</span>
            </p>
          </div>

          <div className="icon">
            <i className="bi bi-shield-check"></i>
            <h3>Mais segurança</h3>
            <p>
              Contribua para uma cidade
              <span className="quebra-linha">mais informada.</span>
            </p>
          </div>
        </div>
      </div> */}

<div className="lado-esquerdo">
  <div className="container-text-lado-esquerdo">
    <div className="img-lado-esquerdo">
      <img
        className="img-logo"
        src="/imagens/logo.png"
        alt="Logo AlertABC"
      />
    </div>

    <div className="text-lado-esquerdo">
      <h1>
        Faça parte de uma{" "}
        <span className="quebra-linha">comunidade mais segura.</span>
      </h1>

      <p>
        Registre e acompanhe relatos de ocorrências por região, contribuindo
        para uma cidade mais informada e segura.
      </p>
    </div>

    <div className="icon-lado-esquerdo">
      <div className="icon">
        <i className="bi bi-geo-alt"></i>
        <div>
          <h3>Mapa interativo</h3>
          <p>Visualize relatos por localização.</p>
        </div>
      </div>

      <div className="icon">
        <i className="bi bi-file-earmark-plus"></i>
        <div>
          <h3>Registre relatos</h3>
          <p>Compartilhe informações com a comunidade.</p>
        </div>
      </div>

      <div className="icon">
        <i className="bi bi-shield-check"></i>
        <div>
          <h3>Mais segurança</h3>
          <p>Contribua para uma cidade mais informada.</p>
        </div>
      </div>
    </div>
  </div>
</div>

      <div className="lado-direito">
        <div className="container-info-lado-direito">
          <div className="text-lado-direito">
            <h2>Crie sua conta</h2>

            <p>
              Preencha os dados abaixo para começar
              <span className="quebra-linha">a usar a AlertABC.</span>
            </p>
          </div>

          <div className="forms-login">
            <form onSubmit={handleCadastro}>
              <div className="inputs">
                <p>Nome completo</p>

                <input
                  className="input-person"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="name"
                  disabled={carregando}
                />
              </div>

              <div className="inputs">
                <p>E-mail</p>

                <input
                  className="input-person"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={carregando}
                />
              </div>

              <div className="inputs">
                <p>Município</p>

                <select
                  className="input-person select-municipio"
                  value={idMunicipio}
                  onChange={(e) => setIdMunicipio(e.target.value)}
                  disabled={carregando || carregandoMunicipios}
                >
                  <option value="">
                    {carregandoMunicipios
                      ? "Carregando municípios..."
                      : "Selecione seu município"}
                  </option>

                  {municipios.map((municipio) => (
                    <option
                      key={municipio.id_municipio}
                      value={municipio.id_municipio}
                    >
                      {municipio.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inputs">
                <p>Senha</p>

                <input
                  className="input-person"
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete="new-password"
                  disabled={carregando}
                />
              </div>

              <div className="inputs">
                <p>Confirmar senha</p>

                <input
                  className="input-person"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  autoComplete="new-password"
                  disabled={carregando}
                />
              </div>

              {mensagem && (
                <div
                  className={`mensagem-cadastro ${tipoMensagem}`}
                  role="alert"
                >
                  <i
                    className={
                      tipoMensagem === "sucesso"
                        ? "bi bi-check-circle"
                        : "bi bi-exclamation-circle"
                    }
                  ></i>

                  {mensagem}
                </div>
              )}

              <div className="botao-acao-container">
                <div className="botao-acao">
                  <button
                    type="submit"
                    disabled={carregando || carregandoMunicipios}
                  >
                    {carregando ? "Criando conta..." : "Criar uma conta"}

                    {!carregando && <i className="bi bi-arrow-right"></i>}
                  </button>
                </div>
              </div>

              <div className="link-login-cadastro">
                <p>
                  Já possui uma conta? <a href="/login">Entrar</a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
