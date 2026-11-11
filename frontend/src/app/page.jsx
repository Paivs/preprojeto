import Link from "next/link";
import "./home.css";
import DashboardHero from "@/components/dashboardHero";

export default function Home() {
  return (
    <>
      <main id="home">
        <section id="hero">
          <div className="container-hero">
            <div className="hero-left">
              <h3>
                Reduza até <strong>30%</strong> da sua fatura de energia com
                controle em tempo real
              </h3>
              <p>
                Transforme dados em decisões. Monitore o consumo, antecipe
                desperdícios e economize com uma operação mais inteligente e
                sustentável.
              </p>
              <div className="btn-hero">
                <Link href="/sobreNos">Sobre Nós</Link>
              </div>
              <span>
                Sem cartão de crédito • Dados claros, decisões melhores
              </span>
            </div>
            <div className="hero-right">
              <DashboardHero />
            </div>
          </div>
        </section>
        <section id="patrocinador">
          <div className="patrocinador-container">
            <div className="grid-patrocinador">
              <div className="img-pat">
                <img src="/images/enelBranca.png" />
              </div>
              <div className="img-pat">
                <img src="/images/comercio.png" />
              </div>
              <div className="img-pat">
                <img src="/images/energisa.png" />
              </div>
              <div className="img-pat">
                <img src="/images/wegBranco.png" />
              </div>
              <div className="img-pat">
                <img src="/images/cpflBranco.png" style={{ width: "10vw" }} />
              </div>
            </div>
          </div>
        </section>
        <section id="controle-inteligente">
          <div className="container-controle">
            <div className="controle-left">
              <div className="top-left-controle">
                <h3>Quanto custa não ter controle?</h3>
                <p>
                  Descubra o que até 30% de redução pode apresentar para o seu
                  negócio
                </p>
              </div>
              <div className="main-left-controle">
                <div className="box-simulador">
                  <div className="top-box">
                    <span>Sua renda mensal</span>
                    <h3>R$10.000</h3>
                  </div>
                  <div className="barra-medicao">
                    <input
                      type="range"
                      min="1000"
                      max="15000"
                      defaultValue="10000"
                      className="w-full h-1 bg-[#1a1738] rounded-lg appearance-none cursor-pointer accent-[#ffc72c]
                      [&::-webkit-slider-runnable-track]:bg-gradient-to-r 
                      [&::-webkit-slider-runnable-track]:from-[#5b21b6] 
                      [&::-webkit-slider-runnable-track]:to-[#1a1738] 
                      [&::-webkit-slider-thumb]:appearance-none 
                      [&::-webkit-slider-thumb]:h-4 
                      [&::-webkit-slider-thumb]:w-4 
                      [&::-webkit-slider-thumb]:rounded-full 
                      [&::-webkit-slider-thumb]:bg-[#ffc72c]"
                    />
                  </div>
                  <div className="coodernada">
                    <span>R$1.000</span>
                    <span>R$30.000+</span>
                  </div>
                </div>
                <div className="footer-left-controle">
                  <span>
                    Simulação ilustrativa, não uma garantida. A economia real
                    depende do perfil de consumo, das tarifas e das
                    oportunidades identificadas no diagnóstico.
                  </span>
                </div>
              </div>
            </div>
            <div className="controle-right">
              <div className="box-results">
                <div className="top-box-result">
                  <div className="details-top">
                    <span>Seu potencial em 12 meses</span>
                    <p>ATÉ 30%</p>
                  </div>
                  <h2>R$36.000</h2>
                  <span>de economia por ano</span>
                </div>

                <div className="main-box-results">
                  <div className="chart-wrapper">
                    <div className="chart-column">
                      <div className="label-value-default">R$ 10.000 / mês</div>
                      <div className="bar-default" />
                      <div className="label-footer">Sem otimização</div>
                    </div>

                    <div className="chart-column">
                      <div className="label-value-highlight">
                        R$ 7.000 / mês
                      </div>
                      <div className="bar-highlight" />
                      <div className="label-footer">Com Volt House</div>
                    </div>
                  </div>
                </div>
                <div className="footer-box-results">
                  <div className="top-footer-box">
                    <i className="bi bi-leaf"></i>
                    <div className="txtfooter-box">
                      <h3>1,44 t de CO₂ evitado / ano</h3>
                      <p>
                        Cenário independente ilustrativo: 24.000 kWh/ano
                        evitados × fator hipotético de 0,06 kg CO₂/kWh. Não
                        calculado a partir da fatura.
                      </p>
                    </div>
                  </div>
                  <div className="btn-diagnostico">
                    Quero esse diagnóstico{" "}
                    <i className="bi bi-arrow-up-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="funcionamento">
          <div className="container-funcionamento">
            <div className="top-funcionamento">
              <h3>Da tomada à decisão. Sem compilação.</h3>
              <span>
                Três etapas para transformar a forma como sua empresa usa
                energia.
              </span>
            </div>

            <div className="main-funcionamento">
              <div className="grid-main-funcionamento">
                <div className="group-main-funcionamento">
                  <div className="cabecalho-funcionamento">
                    <div className="icon-cabecalho">
                      <i className="bi bi-lightning-charge"></i>
                    </div>
                    <div className="linha-home"></div>
                    <span>CONECTAR</span>
                  </div>
                  <h3>1. Instalação</h3>
                  <p>
                    Conectamos sensores e medidores compatíveis à sua operação,
                    com acompanhamento técnico.
                  </p>
                </div>
                <div className="group-main-funcionamento">
                  <div className="cabecalho-funcionamento">
                    <div className="icon-cabecalho">
                      <i className="bi bi-fullscreen"></i>
                    </div>
                    <div className="linha-home"></div>
                    <span>ENTENDER</span>
                  </div>
                  <h3>2. Mapeamento</h3>
                  <p>
                    Traduzimos o consumo de cada área em um mapa claro de
                    hábitos, picos e oportunidades.
                  </p>
                </div>
                <div className="group-main-funcionamento">
                  <div className="cabecalho-funcionamento">
                    <div className="icon-cabecalho">
                      <i
                        class="bi bi-graph-up"
                        style={{
                          background: "var(--roxo)",
                          color: "var(--branco)",
                        }}
                      ></i>
                    </div>
                    <div className="linha-home"></div>
                    <span>EVOLUIR</span>
                  </div>
                  <h3>3. Otimização e Economia</h3>
                  <p>
                    Você age com recomendações inteligentes e acompanha os
                    resultados, mês após mês.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="eficiencia">
          <div className="container-eficiencia">
            <div className="top-eficiencia">
              <h3>O impacto aparece na operação. E na fatura.</h3>
              <span>
                Cenários que ilustram o potencial de uma gestão de energia
                orientada por dados.
              </span>
            </div>
            <div className="main-eficiencia">
              <div className="grid-card-eficiencia">
                <div className="card-group">
                  <div className="cabecalho-card-eficiencia">
                    <div className="left-card-eficiencia">
                      <h3>-28%</h3>
                      <span>na fatura de energia</span>
                    </div>
                  </div>
                  <div className="main-card-eficiencia">
                    <p>
                      “Finalmente conseguimos entender onde a energia era
                      desperdiçada. O que antes era uma surpresa virou uma
                      decisão de gestão.”
                    </p>
                  </div>
                  <div className="divisoria-eficiencia"></div>
                  <div className="footer-card">
                    <p>Mariana Costa</p>
                    <span>Diretora de Operações • Nexora</span>
                  </div>
                </div>

                <div className="card-group">
                  <div className="cabecalho-card-eficiencia">
                    <div className="left-card-eficiencia">
                      <h3>-30%</h3>
                      <span>na fatura de energia</span>
                    </div>
                  </div>
                  <div className="main-card-eficiencia">
                    <p>
                      “Ter uma projeção de custos trouxe previsibilidade ao
                      orçamento. Hoje, eficiência energética faz parte da nossa
                      estratégia.”
                    </p>
                  </div>
                  <div className="divisoria-eficiencia"></div>
                  <div className="footer-card">
                    <p>Camila Rocha</p>
                    <span>Diretora Financeira • Arborê</span>
                  </div>
                </div>

                <div className="card-group">
                  <div className="cabecalho-card-eficiencia">
                    <div className="left-card-eficiencia">
                      <h3>-24%</h3>
                      <span>na fatura de energia</span>
                    </div>
                  </div>
                  <div className="main-card-eficiencia">
                    <p>
                      “Os alertas mudaram nossa rotina. A equipe passou a agir
                      antes do pico, sem depender de planilhas para descobrir o
                      problema.”
                    </p>
                  </div>
                  <div className="divisoria-eficiencia"></div>
                  <div className="footer-card">
                    <p>Rafael Nunes</p>
                    <span>Gerente de Facilities • Prisma</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-eficiencia">
              Depoimentos, pessoas, imagens e empresas fictícios, criados para
              demonstrar a experiência. Percentuais ilustrativos; não
              representam resultados de clientes reais.
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
