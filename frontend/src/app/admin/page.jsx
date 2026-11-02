"use client";

import { useCallback, useEffect, useState } from "react";
import BarraLateral from "./components/BarraLateral";
import BarraSuperior from "./components/BarraSuperior";
import FormularioLogin from "./components/FormularioLogin";
import VisaoDashboard from "./components/VisaoDashboard";
import { buscarDashboard, carregarSessao, entrarComoAdmin, limparSessao, salvarSessao, verificarSaude } from "./lib/adminApi";
import { API_URL } from "./lib/constantes";
import styles from "./page.module.css";

export default function PaginaAdmin() {
  const [token, setToken] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [statusApi, setStatusApi] = useState("checking");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [atualizadoEm, setAtualizadoEm] = useState(null);

  const carregar = useCallback(async (tokenAtivo) => {
    setCarregando(true);
    setErro("");
    try {
      setDashboard(await buscarDashboard(tokenAtivo));
      setAtualizadoEm(new Date());
    } catch (err) {
      setErro(err.message);
      if (/401|403|inválido|autorizado/i.test(err.message)) {
        limparSessao();
        setToken("");
        setUsuario(null);
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    verificarSaude().then(setStatusApi);
    const sessao = carregarSessao();
    if (sessao.token) {
      setToken(sessao.token);
      setUsuario(sessao.usuario);
      carregar(sessao.token);
    }
  }, [carregar]);

  async function entrar(matricula, senha) {
    setCarregando(true);
    setErro("");
    try {
      const resultado = await entrarComoAdmin(matricula, senha);
      salvarSessao(resultado.token, resultado.usuario);
      setToken(resultado.token);
      setUsuario(resultado.usuario);
      await carregar(resultado.token);
      return true;
    } catch (err) {
      setErro(err.message);
      setCarregando(false);
      return false;
    }
  }

  function sair() {
    limparSessao();
    setToken("");
    setUsuario(null);
    setDashboard(null);
    setErro("");
  }

  return (
    <main className={styles.pagina}>
      <BarraLateral statusApi={statusApi} />
      <section className={styles.principal}>
        <BarraSuperior usuario={usuario} logado={Boolean(token)} onSair={sair} />
        {!token ? (
          <FormularioLogin loading={carregando} error={erro} statusApi={statusApi} apiUrl={API_URL} onEntrar={entrar} />
        ) : (
          <VisaoDashboard dashboard={dashboard} loading={carregando} error={erro} updatedAt={atualizadoEm} onRefresh={() => carregar(token)} />
        )}
      </section>
    </main>
  );
}
