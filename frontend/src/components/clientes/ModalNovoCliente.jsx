"use client";

import { useEffect, useState } from "react";
import "./modalNovoCliente.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ModalNovoCliente({ onFechar, onSucesso }) {
  const [empresa, setEmpresa] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    function fecharComEscape(evento) {
      if (evento.key === "Escape" && !enviando) onFechar();
    }

    window.addEventListener("keydown", fecharComEscape);
    return () => window.removeEventListener("keydown", fecharComEscape);
  }, [enviando, onFechar]);

  async function cadastrar(evento) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      const resposta = await fetch(`${apiUrl}/api/auth/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: empresa, cnpj, email, senha }),
      });
      const resultado = await resposta.json();

      if (!resposta.ok) {
        setErro(resultado.erro || "Não foi possível cadastrar o cliente.");
        return;
      }

      onSucesso({ empresa: empresa.trim(), email: email.trim() });
      onFechar();
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="cliente-modal-fundo"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !enviando) onFechar();
      }}
    >
      <section
        className="cliente-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cliente-modal-titulo"
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        <header className="cliente-modal-topo">
          <h2 id="cliente-modal-titulo">Adicionar cliente</h2>
          <button
            type="button"
            className="cliente-modal-fechar"
            onClick={onFechar}
            aria-label="Fechar"
            disabled={enviando}
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </header>

        <form className="cliente-modal-formulario" onSubmit={cadastrar}>
          <label>
            Nome da empresa
            <input
              type="text"
              name="empresa"
              value={empresa}
              onChange={(evento) => setEmpresa(evento.target.value)}
              placeholder="Ex.: Volt House"
              minLength={3}
              autoComplete="organization"
              required
              autoFocus
            />
          </label>

          <label>
            CNPJ
            <input
              type="text"
              name="cnpj"
              value={cnpj}
              onChange={(evento) => setCnpj(evento.target.value)}
              placeholder="00.000.000/0000-00"
              autoComplete="off"
              required
            />
          </label>

          <label>
            E-mail
            <input
              type="email"
              name="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              placeholder="contato@empresa.com.br"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              name="senha"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              placeholder="Crie uma senha segura"
              autoComplete="new-password"
              minLength={8}
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}"
              title="Use ao menos 8 caracteres, com maiúscula, minúscula, número e símbolo."
              required
            />
            <small>Use maiúscula, minúscula, número e símbolo.</small>
          </label>

          {erro && <p className="cliente-modal-erro" role="alert">{erro}</p>}

          <div className="cliente-modal-botoes">
            <button
              type="button"
              className="cliente-modal-cancelar"
              onClick={onFechar}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="cliente-modal-enviar"
              disabled={enviando}
            >
              {enviando ? "Cadastrando..." : "Adicionar cliente"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
