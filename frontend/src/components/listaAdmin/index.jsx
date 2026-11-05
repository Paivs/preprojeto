import './lista.css'

export default function ListaDispositivos() {
  return (
    <section>
      <div className="lista-topo">
        <h2>
          Todos os dispositivos <small>6 encontrados</small>
        </h2>

      </div>

      <div className="lista-dispositivos">
        <article className="card-dispositivo">
          <div className="card-topo">
            <span className="status-dispositivo status-normal">
              <span className="status-ponto" />
              Normal
            </span>
          </div>
          <h3 className="card-nome">Luz da sala</h3>
          <p className="card-local">Sala de estar</p>
          <div className="card-divisor" />
          <div className="consumo-dispositivo">
            <span className="consumo-rotulo">Consumo em tempo real</span>
            <div className="consumo-linha">
              <p className="consumo-valor">0,45 <small>kWh</small></p>
            </div>
          </div>
          <div className="card-divisor" />
          <div className="card-rodape">
            <span className="card-conexao"> Conectado</span>
            <span className="interruptor-visual">
              <span className="interruptor-ponto interruptor-ligado" />
            </span>
          </div>
        </article>

        <article className="card-dispositivo">
          <div className="card-topo">
            <span className="status-dispositivo status-atencao">
              <span className="status-ponto" />
              Atenção
            </span>
          </div>
          <h3 className="card-nome">Ar-condicionado</h3>
          <p className="card-local">⌖ Quarto principal</p>
          <div className="card-divisor" />
          <div className="consumo-dispositivo">
            <span className="consumo-rotulo">Consumo em tempo real</span>
            <div className="consumo-linha">
              <p className="consumo-valor">1,85 <small>kWh</small></p>
              <span className="alerta-consumo">Consumo elevado</span>
            </div>
          </div>
          <div className="card-divisor" />
          <div className="card-rodape">
            <span className="card-conexao"> Conectado</span>
            <span className="interruptor-visual">
              <span className="interruptor-ponto interruptor-ligado" />
            </span>
          </div>
        </article>

        <article className="card-dispositivo">
          <div className="card-topo">
            <span className="status-dispositivo status-normal">
              <span className="status-ponto" />
              Normal
            </span>
          </div>
          <h3 className="card-nome">Smart TV</h3>
          <p className="card-local">⌖ Sala de estar</p>
          <div className="card-divisor" />
          <div className="consumo-dispositivo">
            <span className="consumo-rotulo">Consumo em tempo real</span>
            <div className="consumo-linha">
              <p className="consumo-valor">0,30 <small>kWh</small></p>
            </div>
          </div>
          <div className="card-divisor" />
          <div className="card-rodape">
            <span className="card-conexao"> Conectado</span>
            <span className="interruptor-visual">
              <span className="interruptor-ponto" />
            </span>
          </div>
        </article>

        <article className="card-dispositivo">
          <div className="card-topo">
            <span className="status-dispositivo status-normal">
              <span className="status-ponto" />
              Normal
            </span>
          </div>
          <h3 className="card-nome">Geladeira</h3>
          <p className="card-local">⌖ Cozinha</p>
          <div className="card-divisor" />
          <div className="consumo-dispositivo">
            <span className="consumo-rotulo">Consumo em tempo real</span>
            <div className="consumo-linha">
              <p className="consumo-valor">1,20 <small>kWh</small></p>
            </div>
          </div>
          <div className="card-divisor" />
          <div className="card-rodape">
            <span className="interruptor-visual">
              <span className="interruptor-ponto interruptor-ligado" />
            </span>
          </div>
        </article>

        <article className="card-dispositivo">
          <div className="card-topo">
            <span className="status-dispositivo status-normal">
              <span className="status-ponto" />
              Normal
            </span>
          </div>
          <h3 className="card-nome">Ventilador</h3>
          <p className="card-local">⌖ Quarto secundário</p>
          <div className="card-divisor" />
          <div className="consumo-dispositivo">
            <span className="consumo-rotulo">Consumo em tempo real</span>
            <div className="consumo-linha">
              <p className="consumo-valor">0,15 <small>kWh</small></p>
            </div>
          </div>
          <div className="card-divisor" />
          <div className="card-rodape">
            <span className="card-conexao">Conectado</span>
            <span className="interruptor-visual">
              <span className="interruptor-ponto interruptor-ligado" />
            </span>
          </div>
        </article>

        <article className="card-dispositivo">
          <div className="card-topo">
            <span className="status-dispositivo status-desligado">
              <span className="status-ponto" />
              Desligado
            </span>
          </div>
          <h3 className="card-nome">Máquina de lavar</h3>
          <p className="card-local">⌖ Lavanderia</p>
          <div className="card-divisor" />
          <div className="consumo-dispositivo">
            <span className="consumo-rotulo">Consumo em tempo real</span>
            <div className="consumo-linha">
              <p className="consumo-valor">0,00 <small>kWh</small></p>
            </div>
          </div>
          <div className="card-divisor" />
          <div className="card-rodape">
            <span className="card-conexao"> Conectado</span>
            <span className="interruptor-visual">
              <span className="interruptor-ponto" />
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}