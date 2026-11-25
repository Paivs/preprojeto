"use client";

import { useState } from "react";
import "./addCliente.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useRouter } from "next/navigation";

export default function AdicionarCliente() {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const router = useRouter();

    return (
        <main>
            <div className="bg-volt">
                <div className="container">
                    <div className="card">
                        <a href="" onClick={() => router.back()}><i className="bi bi-arrow-left"></i></a>
                        <h2>Adicionar Cliente</h2>
                        <p>Preencha o formulário para adicionar novos clientes ao nosso sistema</p>

                        <form action="" autoComplete="off">

                            <div className="form-input">
                                <label htmlFor="nome">Nome da Empresa</label>
                                <input type="text" id="nome" placeholder="Ex: VoltHouse" />
                            </div>

                            <div className="form-input">
                                <label htmlFor="cnpj">CNPJ</label>
                                <input type="text" id="cnpj" placeholder="Ex: 37.235.564/0001-13" />
                            </div>

                            <div className="form-input">
                                <label htmlFor="email">E-Mail</label>
                                <input type="email" id="email" placeholder="Ex: contato@gmail.com" />
                            </div>

                            <div className="form-input">
                                <label htmlFor="senha">Senha</label>
                                <div className="input-senha">
                                    <input
                                        type={mostrarSenha ? "text" : "password"}
                                        id="senha"
                                        placeholder="Digite sua senha"
                                    />
                                    <button
                                        type="button"
                                        className="toggle-senha"
                                        onClick={() => setMostrarSenha(!mostrarSenha)}
                                        aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        <i className={mostrarSenha ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                                    </button>
                                </div>
                            </div>

                            <button>Cadastrar</button>
                        </form>
                    </div>
                </div>
            </div>

        </main>
    )
}