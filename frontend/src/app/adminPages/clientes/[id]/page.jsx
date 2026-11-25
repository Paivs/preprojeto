"use client";

import "./clienteDetalhe.css";
import Header from "@/components/headerAdmin/HeaderAdmin";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/toast/ToastProvider";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api").replace(/\/$/, "");

export default function ClientePage() {
  const toast = useToast();
  const { id } = useParams();
  const router = useRouter();
  const [cliente, setCliente] = useState(null);
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    async function carregarCliente() {
      const token = sessionStorage.getItem("token");
      const resposta = await fetch(`${API_URL}/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resultado = await resposta.json();
      const dados = resultado.dados;

      setCliente(dados);
      setNome(dados.nome_empresa);
      setCnpj(dados.cnpj);
      setEmail(dados.email);
    }

    carregarCliente();
  }, [id]);

  async function editarCliente(evento) {
    evento.preventDefault();
    setSalvando(true);
    const token = sessionStorage.getItem("token");
    try {
      const resposta = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome_empresa: nome,
          cnpj,
          email,
          nivel_permissao: "cliente",
        }),
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(resultado.erro || "Não foi possível atualizar o cliente.");
      setCliente(resultado.dados);
      setMensagem("Cliente atualizado.");
      toast.success("Dados do cliente atualizados com sucesso.");
    } catch (falha) {
      toast.error(falha.message || "Não foi possível atualizar o cliente.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirCliente() {
    setExcluindo(true);
    const token = sessionStorage.getItem("token");
    try {
      const resposta = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(resultado.erro || "Não foi possível excluir o cliente.");
      toast.success("Cliente excluído com sucesso.");
      router.push("/adminPages/clientes");
    } catch (falha) {
      toast.error(falha.message || "Não foi possível excluir o cliente.");
      setExcluindo(false);
    }
  }

  if (!cliente) return <main><p>Carregando cliente...</p></main>;

  return (
    <main className="cliente-pagina">
       <Header/> 

        <div className="form-container">
            <Link href="/adminPages/clientes"><i className="bi bi-arrow-left"></i></Link>   
            <h1>{cliente.nome_empresa}</h1>
            <small>ID do cliente: {id}</small>

            <hr />

            <form onSubmit={editarCliente}>
                <div className="input">
                    <label>Nome da empresa</label>
                    <input value={nome} onChange={(evento) => setNome(evento.target.value)} />
                </div>
                
                <div className="input">
                    <label>CNPJ</label>
                    <input value={cnpj} onChange={(evento) => setCnpj(evento.target.value)} />
                </div>
                <div className="input">
                    <label>E-mail</label>
                    <input type="email" value={email} onChange={(evento) => setEmail(evento.target.value)} />
                </div>

                <div className="btn">
                    <button type="submit" className="salvar" disabled={salvando || excluindo} aria-busy={salvando}>
                      {salvando && <i className="bi bi-arrow-repeat" aria-hidden="true" />}
                      Salvar alterações
                    </button>
                    <button type="button" onClick={excluirCliente} className="excluir" disabled={salvando || excluindo} aria-busy={excluindo}>
                      {excluindo && <i className="bi bi-arrow-repeat" aria-hidden="true" />}
                      Excluir cliente
                    </button>
                </div>
                
            </form>

            <strong>{mensagem}</strong>
        </div>
    </main>
  );
}
