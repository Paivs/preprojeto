"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function NovoRelatoPage() {
    const router = useRouter();

    const [formulario, setFormulario] = useState({
        categoria: "",
        data: "",
        local: "",
        descricao: "",
    });

    const [mensagem, setMensagem] = useState("");

    function atualizarCampo(e) {
        const { name, value } = e.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value,
        }));
    }

    function enviarRelato(e) {
        e.preventDefault();

        if (
            !formulario.categoria ||
            !formulario.data ||
            !formulario.local.trim() ||
            !formulario.descricao.trim()
        ) {
            setMensagem("Preencha todos os campos obrigatórios.");
            return;
        }

        // Demonstração visual: ainda não salva no banco de dados.
        setMensagem(
            "Relato preenchido com sucesso! A integração com o banco de dados ainda precisa ser realizada."
        );
    }

    return (
        <div className="user-page">
            <div className="user-page-heading">
                <div>
                    <span>REGISTRO DE INFORMAÇÕES</span>
                    <h1>Registrar novo relato</h1>
                    <p>
                        Compartilhe informações sobre uma possível
                        ocorrência na sua região.
                    </p>
                </div>
            </div>

            <section className="user-panel">
                <div className="user-panel-header">
                    <div>
                        <h2>Informações do relato</h2>
                        <p>
                            Preencha os dados com clareza e responsabilidade.
                        </p>
                    </div>
                </div>

                <form className="user-form" onSubmit={enviarRelato}>
                    <div className="user-form-grid">
                        <div className="user-form-group">
                            <label htmlFor="categoria">
                                Categoria da ocorrência *
                            </label>

                            <select
                                id="categoria"
                                name="categoria"
                                value={formulario.categoria}
                                onChange={atualizarCampo}
                                required
                            >
                                <option value="">
                                    Selecione uma categoria
                                </option>
                                <option value="Furto">Furto</option>
                                <option value="Roubo">Roubo</option>
                                <option value="Vandalismo">Vandalismo</option>
                                <option value="Ameaça">Ameaça</option>
                                <option value="Violência">
                                    Possível ocorrência de violência
                                </option>
                                <option value="Tráfico de drogas">
                                    Suspeita de atividade relacionada a drogas
                                </option>
                                <option value="Outra ocorrência">
                                    Outra ocorrência
                                </option>
                            </select>
                        </div>

                        <div className="user-form-group">
                            <label htmlFor="data">
                                Data da ocorrência *
                            </label>

                            <input
                                type="date"
                                id="data"
                                name="data"
                                value={formulario.data}
                                onChange={atualizarCampo}
                                max={new Date().toISOString().split("T")[0]}
                                required
                            />
                        </div>

                        <div className="user-form-group">
                            <label htmlFor="local">
                                Localidade *
                            </label>

                            <input
                                type="text"
                                id="local"
                                name="local"
                                placeholder="Ex.: Centro, Vila Nova..."
                                value={formulario.local}
                                onChange={atualizarCampo}
                                maxLength={150}
                                required
                            />
                        </div>

                        <div className="user-form-group">
                            <label htmlFor="descricao">
                                Descrição do relato *
                            </label>

                            <textarea
                                id="descricao"
                                name="descricao"
                                placeholder="Descreva o que foi observado, incluindo informações relevantes sobre o local e a situação."
                                value={formulario.descricao}
                                onChange={atualizarCampo}
                                rows={6}
                                maxLength={2000}
                                required
                            />

                            <small>
                                {formulario.descricao.length}/2000 caracteres
                            </small>
                        </div>
                    </div>

                    <div className="user-alert">
                        <i className="bi bi-exclamation-triangle"></i>
                        <div>
                            <strong>Antes de enviar</strong>
                            <p>
                                O AlertABC recebe relatos não oficiais
                                enviados por usuários. Não inclua acusações
                                sem fundamento, dados pessoais de terceiros
                                ou informações que possam colocar alguém
                                em risco. O registro não substitui uma
                                comunicação às autoridades competentes.
                            </p>
                        </div>
                    </div>

                    {mensagem && (
                        <div className="user-alert" role="status">
                            <i className="bi bi-info-circle"></i>
                            <p>{mensagem}</p>
                        </div>
                    )}

                    <div className="user-form-actions">
                        <button
                            type="button"
                            className="user-btn-secondary"
                            onClick={() => router.push("/usuarios")}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="user-btn-primary"
                        >
                            <i className="bi bi-send"></i>
                            Enviar relato
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}