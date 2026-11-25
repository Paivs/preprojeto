import "./cardIndicador.css";

export default function CardIndicador({titulo, valor, icone, numero}) {
    return (
        <div className="card-topo">
            <div className="top">
                <div className="flex-top">
                    <strong>{titulo}</strong>
                    <h2>{valor}</h2>
                </div>

                <i className={icone}></i>
            </div>

            <div className="bottom">
                <strong>{numero}</strong>
                <hr/>
            </div>
        </div>
    )
}