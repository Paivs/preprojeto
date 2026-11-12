
"use client";

import { useMemo, useState } from "react";
import "./tabelaSetor.css";

const setoresIniciais = [
  {
    id: 1,
    nome: "Administrativo",
    descricao: "Escritórios e salas de reunião",
    consumo: 4992,
    custo: 3744,
    usuario: "0042",
  },
  {
    id: 2,
    nome: "Operacional",
    descricao: "Produção e infraestrutura",
    consumo: 3744,
    custo: 2808,
    usuario: "0042",
  },
  {
    id: 3,
    nome: "Tecnologia",
    descricao: "Servidores e equipamentos de TI",
    consumo: 2496,
    custo: 1872,
    usuario: "0042",
  },
  {
    id: 4,
    nome: "Áreas comuns",
    descricao: "Circulação e espaços coletivos",
    consumo: 1248,
    custo: 936,
    usuario: "0042",
  },
];

const formatarMoeda = (valor) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatarConsumo = (valor) =>
  `${valor.toLocaleString("pt-BR")} kWh`;

export default function TabelaSetores({
  setores = setoresIniciais,
  idUsuario = "0042",
  onEditar,
}) {
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const itensPorPagina = 7;

  const setoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return setores.filter(
      (setor) =>
        setor.nome.toLowerCase().includes(termo) ||
        setor.descricao.toLowerCase().includes(termo) ||
        setor.usuario.toLowerCase().includes(termo)
    );
  }, [setores, busca]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(setoresFiltrados.length / itensPorPagina)
  );

  const setoresExibidos = setoresFiltrados.slice(
    (pagina - 1) * itensPorPagina,
    pagina * itensPorPagina
  );

  function atualizarBusca(valor) {
    setBusca(valor);
    setPagina(1);
  }

  return (
    <section className="tabela-setores">
      <header className="tabela-setores__topo">
        <div className="tabela-setores__titulo">
          <h2>Seus setores</h2>
          <p>
            {setores.length} setores vinculados ao id_usuario: {idUsuario}
          </p>
        </div>

        <div className="tabela-setores__busca">
          <input
            type="search"
            placeholder="Buscar setor..."
            aria-label="Buscar setor"
            value={busca}
            onChange={(e) => atualizarBusca(e.target.value)}
          />
        </div>
      </header>

      <div className="tabela-setores__rolagem">
        <table>
          <thead>
            <tr>
              <th>Nome do setor</th>
              <th>Descrição</th>
              <th>Consumo global</th>
              <th>Custo energia</th>
              <th>Usuário</th>
              <th className="coluna-acoes">Ações</th>
            </tr>
          </thead>

          <tbody>
            {setoresExibidos.length > 0 ? (
              setoresExibidos.map((setor) => (
                <tr key={setor.id}>
                  <td className="setor-nome">{setor.nome}</td>
                  <td className="setor-descricao">{setor.descricao}</td>
                  <td>{formatarConsumo(setor.consumo)}</td>
                  <td>{formatarMoeda(setor.custo)}</td>
                  <td>{setor.usuario}</td>
                  <td className="coluna-acoes">
                    <button
                      type="button"
                      className="setor-botao-editar"
                      onClick={() => onEditar?.(setor)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="setor-vazio">
                  Nenhum setor encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="tabela-setores__rodape">
        <span>
          Mostrando {setoresExibidos.length} de {setoresFiltrados.length} setores
        </span>

        <nav className="setor-paginacao" aria-label="Paginação dos setores">
          <button
            type="button"
            aria-label="Página anterior"
            disabled={pagina === 1}
            onClick={() => setPagina((atual) => atual - 1)}
          >
            ‹
          </button>

          <span>{pagina}</span>

          <button
            type="button"
            aria-label="Próxima página"
            disabled={pagina >= totalPaginas}
            onClick={() => setPagina((atual) => atual + 1)}
          >
            ›
          </button>
        </nav>
      </footer>
    </section>
  );
}
