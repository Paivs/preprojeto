"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/headerAdmin/HeaderAdmin";
import FiltrosDispositivos from "@/components/dispositivos/FiltrosDispositivos";
import ListaDispositivos from "@/components/dispositivos/ListaDispositivos";
import PainelDispositivo from "@/components/dispositivos/PainelDispositivo";
import ModalNovoDispositivo from "@/components/dispositivos/ModalNovoDispositivo";
import { adaptarEquipamentoApi, obterEstado } from "@/components/dispositivos/dados";
import "@/components/dispositivos/botoes.css";
import "./dispositivos.css";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api").replace(/\/$/, "");

export default function PaginaDispositivos() {
  const [dispositivos, setDispositivos] = useState([]);
  const [selecionadoId, setSelecionadoId] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [setores, setSetores] = useState([]);
  const [erroSetores, setErroSetores] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const carregarDispositivos = useCallback(async (mostrarCarregamento = true) => {
    if (mostrarCarregamento) {
      setCarregando(true);
      setErro("");
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      setDispositivos([]);
      setErro("Sua sessão não foi encontrada. Entre novamente para ver seus equipamentos.");
      setCarregando(false);
      return;
    }

    try {
      const resposta = await fetch(`${API_URL}/equipamentos`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const resultado = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        if (resposta.status === 401 || resposta.status === 403) {
          throw new Error("Acesso não autorizado. Entre novamente na sua conta.");
        }
        throw new Error(resultado.erro || "Não foi possível carregar seus equipamentos.");
      }

      const dados = Array.isArray(resultado.dados) ? resultado.dados : [];
      setDispositivos(dados.map(adaptarEquipamentoApi));
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message || "Não foi possível conectar à API.");
    } finally {
      setCarregando(false);
    }
  }, []);

  const carregarSetores = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const resposta = await fetch(`${API_URL}/setores`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(resultado.erro || "Não foi possível carregar seus setores.");
      setSetores(Array.isArray(resultado.dados) ? resultado.dados : []);
      setErroSetores("");
    } catch (erroRequisicao) {
      setErroSetores(erroRequisicao.message || "Não foi possível carregar seus setores.");
    }
  }, []);

  useEffect(() => {
    carregarDispositivos();
    carregarSetores();
    const intervalo = window.setInterval(() => carregarDispositivos(false), 3000);
    return () => window.clearInterval(intervalo);
  }, [carregarDispositivos, carregarSetores]);

  async function adicionarEquipamento(dados) {
    const token = sessionStorage.getItem("token");
    if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

    setSalvando(true);
    try {
      const resposta = await fetch(`${API_URL}/equipamentos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dados),
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(resultado.erro || "Não foi possível adicionar o equipamento.");

      if (resultado.dados) {
        setDispositivos((atuais) => [adaptarEquipamentoApi(resultado.dados), ...atuais]);
      } else {
        await carregarDispositivos();
      }
      setModalAberto(false);
    } finally {
      setSalvando(false);
    }
  }

  const selecionado = dispositivos.find((dispositivo) => dispositivo.id === selecionadoId) || null;
  const categorias = [...new Set(dispositivos.map((dispositivo) => dispositivo.categoria))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "pt-BR"));

  const termoBusca = busca.trim().toLocaleLowerCase("pt-BR");
  const visiveis = dispositivos.filter((dispositivo) => {
    const texto = `${dispositivo.nome} ${dispositivo.local} ${dispositivo.categoria}`
      .toLocaleLowerCase("pt-BR");
    return (
      texto.includes(termoBusca) &&
      (filtroEstado === "todos" || obterEstado(dispositivo) === filtroEstado) &&
      (filtroCategoria === "todas" || dispositivo.categoria === filtroCategoria)
    );
  });

  return (
    <div className="pagina">
      <Sidebar />

      <div className="conteudo-principal">
        <Header />

        <main className="conteudo-pagina">
          <div className="cabecalho-pagina">
            <div>
              <span className="cabecalho-etiqueta">DISPOSITIVOS</span>
              <h1>Meus dispositivos</h1>
              <p>Equipamentos vinculados à sua conta, organizados por setor.</p>
            </div>
          </div>

          <FiltrosDispositivos
            busca={busca}
            onBusca={setBusca}
            estado={filtroEstado}
            onEstado={setFiltroEstado}
            categoria={filtroCategoria}
            onCategoria={setFiltroCategoria}
            categorias={categorias}
            onAdicionar={() => setModalAberto(true)}
          />

          <ListaDispositivos
            dispositivos={visiveis}
            selecionadoId={selecionadoId}
            onSelecionar={setSelecionadoId}
            carregando={carregando}
            erro={erro}
          />
        </main>
      </div>

      {selecionado && (
        <PainelDispositivo
          key={selecionado.id}
          dispositivo={selecionado}
          onFechar={() => setSelecionadoId(null)}
        />
      )}

      {modalAberto && (
        <ModalNovoDispositivo
          setores={setores}
          erroSetores={erroSetores}
          salvando={salvando}
          onSalvar={adicionarEquipamento}
          onFechar={() => !salvando && setModalAberto(false)}
        />
      )}
    </div>
  );
}
