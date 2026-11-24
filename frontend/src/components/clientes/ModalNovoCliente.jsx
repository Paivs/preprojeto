"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import "./modalNovoCliente.css";

export default function ModalNovoCliente({ onFechar, onSucesso, contato = null }) {
  const [empresa, setEmpresa] = useState(contato?.nome || "");
  const [cnpj, setCnpj] = useState(contato?.cnpj || "");
  const [email, setEmail] = useState(contato?.email || "");
  const [telefone, setTelefone] = useState(contato?.telefone || "");
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
      const token = sessionStorage.getItem("token");
      if (!token) {
        setErro("Sua sessão não foi encontrada. Entre novamente como administrador.");
        return;
      }

      const resposta = await fetch(`${API_BASE_URL}/usuarios`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome: empresa, cnpj, email, telefone, senha }),
      });
      const resultado = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        setErro(resultado.erro || "Não foi possível cadastrar o cliente.");
        return;
      }

      await onSucesso({
        empresa: empresa.trim(),
        email: email.trim(),
        contato,
        emailEnviado: resultado.email_enviado !== false,
        avisoEmail: resultado.aviso || null,
      });
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
            Telefone
            <input
              type="tel"
              name="telefone"
              value={telefone}
              onChange={(evento) => setTelefone(evento.target.value)}
              placeholder="(00) 00000-0000"
              autoComplete="tel"
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
              autoComplete="off"
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
