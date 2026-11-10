"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./sobreNos.css";

export default function SobreNos() {
    return (
        <main>
            <section className="hero">
                <div className="container">
                    <div className="text">
                        <strong>Inovação Controle Automação</strong>

                        <h1>
                            Energia sob controle.
                            Economia em <span style={{ color: "var(--roxo-claro)" }}>evolução</span>
                        </h1>

                        <p>
                            A Volt House oferece soluções inteligentes para monitorar e controlar o consumo de energia elétrica, ajudando empresas a reduzir custos, evitar desperdícios e alcançar maior eficiência energética
                        </p>

                        <Link href="#valores">Saiba Mais <i className="bi bi-arrow-right"></i></Link>
                    </div>

                    <img src="/images/escritorio.png" />

                    <div className="background-glow">
                        <div className="blob blob-1"></div>
                        <div className="blob blob-2"></div>
                    </div>
                </div>
            </section>

            <section className="valores" id="valores">

                <div className="container">
                    <div className="title">
                        <strong>Nossos Valores</strong>

                        <h2>Conectando eficiência e economia</h2>
                    </div>

                    <div className="container-cardValor">
                        <div className="cardValor">
                            <h2>Inovação <strong>01</strong></h2>

                            <h2><span></span></h2>

                            <p>Utilizamos tecnologia inteligente para transformar dados em soluções eficientes</p>
                        </div>

                        <div className="cardValor">
                            <h2>Sustentabilidade <strong>02</strong></h2>

                            <h2><span></span></h2>

                            <p>Promovemos o consumo consciente de energia, reduzindo desperdícios e impactos ambientais.</p>
                        </div>

                        <div className="cardValor">
                            <h2>Eficiência <strong>03</strong></h2>

                            <h2><span></span></h2>

                            <p>Otimizamos o uso de energia para gerar economia e melhores resultados para sua empresa.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="resultados">
                <div className="container-resultados">
                    <div className="card-avaliacao">
                        <h2>Título Exemplo</h2>

                        <strong>Cliente da VoltHouse</strong>

                        <hr />

                        <p>
                            "Este é um texto exemplo de cliente que obteve resultados positivos com a Volt House como: Economia, controle de gastos, inovação"
                        </p>
                    </div>

                    <div className="text">
                        <h1>Preço justo, resultado garantido</h1>

                        <p>
                            Na Volt House, transformamos dados em resultados concretos, gerando economia, eficiência e mais controle energético para sua empresa.
                        </p>

                        <div className="card-info">
                            <h2 style={{ color: "var(--roxo-claro)" }}>+2 mil clientes atendidos</h2>

                            <span></span>

                            <h2 style={{ color: "var(--verde)" }}>R$ 10.000,00 de retorno médio</h2>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}