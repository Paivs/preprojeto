import "./kpiSetores.css";

export default function KpiSetores() {
  return (
    <>
      <div className="kpi-group">
        <div className="cabecalho-kpi">
          <span className="ponto" style={{ color: "var(--azul)" }}>
            •
          </span>
          SETOR 01
        </div>
        <h4>Administrativo</h4>
        <p>Escritórios e salas de reunião</p>
        <div className="main-kpi">
          <h3>4.992</h3>
          <p>kWh</p>
        </div>
        <p className="preco">R$ 3.744,00</p>
        <div className="barra-container">
          <div className="barra-preenchimento-1">
          </div>
        </div>
      </div>

      <div className="kpi-group">
        <div className="cabecalho-kpi">
          <span className="ponto" style={{ color: "var(--roxo)" }}>
            •
          </span>
          SETOR 02
        </div>
        <h4>Operacional</h4>
        <p>Produção e infraestrutura</p>
        <div className="main-kpi">
          <h3>4.992</h3>
          <p>kWh</p>
        </div>
        <p className="preco">R$ 3.744,00</p>
        <div className="barra-container">
          <div className="barra-preenchimento-2">
          </div>
        </div>
      </div>

      <div className="kpi-group">
        <div className="cabecalho-kpi">
          <span className="ponto" style={{ color: "var(--verde)" }}>
            •
          </span>
          SETOR 03
        </div>
        <h4>Tecnologia</h4>
        <p>Servidores e equipamentos de TI</p>
        <div className="main-kpi">
          <h3>4.992</h3>
          <p>kWh</p>
        </div>
        <p className="preco">R$ 3.744,00</p>
        <div className="barra-container">
          <div className="barra-preenchimento-3">
          </div>
        </div>
      </div>

      <div className="kpi-group">
        <div className="cabecalho-kpi">
          <span className="ponto" style={{ color: "var(--amarelo)" }}>
            •
          </span>
          SETOR 04
        </div>
        <h4>Áreas comuns</h4>
        <p>Circulação e espaços coletivos</p>
        <div className="main-kpi">
          <h3>4.992</h3>
          <p>kWh</p>
        </div>
        <p className="preco">R$ 3.744,00</p>
        <div className="barra-container">
          <div className="barra-preenchimento-4">
          </div>
        </div>
      </div>
    </>
  );
}
