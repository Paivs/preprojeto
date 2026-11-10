import "./kpi.Setores.css";

export default function KpiSetores() {
  return (
    <>
      <div className="kpi-group">
        <span className="ponto-1">•</span>
        SETOR 01
        <h4>Administrativo</h4>
        <p>Escritórios e salas de reunião</p>
        <div className="main-kpi">
          <h3>4.992</h3>
          <p>kWh</p>
        </div>
        <p className="preco">R$ 3.744,00</p>
        <div className="barra-progresso-1"></div>
      </div>

      <div className="kpi-group">
        <span className="ponto-2">•</span>
        SETOR 02
        <h4>Operacional</h4>
        <p>Produção e infraestrutura</p>
        <div className="main-kpi">
          <h3>4.992</h3>
          <p>kWh</p>
        </div>
        <p className="preco">R$ 3.744,00</p>
        <div className="barra-progresso-2"></div>
      </div>

      <div className="kpi-group">
        <span className="ponto-3">•</span>
        SETOR 03
        <h4>Tecnologia</h4>
        <p>Servidores e equipamentos de TI</p>
        <div className="main-kpi">
          <h3>4.992</h3>
          <p>kWh</p>
        </div>
        <p className="preco">R$ 3.744,00</p>
        <div className="barra-progresso-3"></div>
      </div>

      <div className="kpi-group">
        <span className="ponto-4">•</span>
        SETOR 04
        <h4>Áreas comuns</h4>
        <p>Circulação e espaços coletivos</p>
        <div className="main-kpi">
          <h3>4.992</h3>
          <p>kWh</p>
        </div>
        <p className="preco">R$ 3.744,00</p>
        <div className="barra-progresso-4"></div>
      </div>
    </>
  );
}
