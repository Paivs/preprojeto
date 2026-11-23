import { pool } from "../config/database.js";

const STATUS_VALIDOS = ["Pendente", "Aprovado", "Rejeitado"];

function validarId(valor) {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function validarData(valor) {
    if (!valor) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;

    const data = new Date(`${valor}T00:00:00Z`);
    return !Number.isNaN(data.getTime()) &&
        data.toISOString().slice(0, 10) === valor;
}

function tratarErro(error, next) {
    next(error);
}

function validarFiltros(request, response) {
    const { status, categoria, data_inicio, data_fim } = request.query;

    if (status && !STATUS_VALIDOS.includes(status)) {
        response.status(400).json({ mensagem: "Situação inválida." });
        return false;
    }

    if (categoria && !validarId(categoria)) {
        response.status(400).json({ mensagem: "Categoria inválida." });
        return false;
    }

    if (!validarData(data_inicio) || !validarData(data_fim)) {
        response.status(400).json({
            mensagem: "Informe datas válidas no formato AAAA-MM-DD."
        });
        return false;
    }

    if (data_inicio && data_fim && data_inicio > data_fim) {
        response.status(400).json({
            mensagem: "A data inicial não pode ser posterior à data final."
        });
        return false;
    }

    return true;
}

function montarFiltros(request) {
    const filtros = ["r.fk_id_municipio = ?"];
    const parametros = [request.municipioId];
    const { status, categoria, data_inicio, data_fim, busca } = request.query;

    if (status) {
        filtros.push("r.situacao = ?");
        parametros.push(status);
    }

    if (categoria) {
        filtros.push("r.fk_id_categoria = ?");
        parametros.push(Number(categoria));
    }

    if (data_inicio) {
        filtros.push("r.data_fato >= ?");
        parametros.push(data_inicio);
    }

    if (data_fim) {
        filtros.push("r.data_fato <= ?");
        parametros.push(data_fim);
    }

    if (busca && String(busca).trim()) {
        const termo = `%${String(busca).trim()}%`;
        filtros.push(`(
            r.descricao LIKE ?
            OR r.referencia_local LIKE ?
            OR c.nome LIKE ?
            OR cat.nome LIKE ?
        )`);
        parametros.push(termo, termo, termo, termo);
    }

    return {
        where: filtros.join(" AND "),
        parametros
    };
}

// LISTAR RELATOS DO MUNICÍPIO
export async function listarRelatosMunicipais(request, response, next) {
    try {
        if (!validarFiltros(request, response)) return;

        const page = Math.max(1, parseInt(request.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(request.query.limit, 10) || 100));
        const offset = (page - 1) * limit;
        const { where, parametros } = montarFiltros(request);

        const [totalResultado] = await pool.execute(
            `SELECT COUNT(*) AS total
             FROM relatos r
             INNER JOIN contas c ON c.id_conta = r.fk_id_conta_autor
             INNER JOIN categorias cat ON cat.id_categoria = r.fk_id_categoria
             WHERE ${where}`,
            parametros
        );

        const [relatos] = await pool.execute(
            `SELECT
                r.id_relato,
                r.descricao,
                r.data_fato,
                r.hora_fato,
                r.latitude,
                r.longitude,
                r.referencia_local,
                r.enviado_em,
                r.situacao,
                c.id_conta AS id_cidadao,
                c.nome AS nome_cidadao,
                cat.id_categoria,
                cat.nome AS categoria,
                m.nome AS municipio
             FROM relatos r
             INNER JOIN contas c ON c.id_conta = r.fk_id_conta_autor
             INNER JOIN categorias cat ON cat.id_categoria = r.fk_id_categoria
             INNER JOIN municipios m ON m.id_municipio = r.fk_id_municipio
             WHERE ${where}
             ORDER BY r.enviado_em DESC
             LIMIT ${limit} OFFSET ${offset}`,
            parametros
        );

        const total = Number(totalResultado[0].total);

        return response.json({
            relatos,
            paginacao: {
                pagina: page,
                limite: limit,
                total,
                totalPaginas: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        tratarErro(error, next);
    }
}

// RELATOS COM COORDENADAS PARA O MAPA DO MUNICÍPIO
export async function obterRelatosMapaMunicipal(request, response, next) {
    try {
        if (!validarFiltros(request, response)) return;

        const { where, parametros } = montarFiltros(request);

        const [relatos] = await pool.execute(
            `SELECT
                r.id_relato,
                r.descricao,
                r.latitude,
                r.longitude,
                r.data_fato,
                r.hora_fato,
                r.referencia_local,
                r.situacao,
                cat.nome AS categoria,
                m.nome AS municipio
             FROM relatos r
             INNER JOIN contas c ON c.id_conta = r.fk_id_conta_autor
             INNER JOIN categorias cat ON cat.id_categoria = r.fk_id_categoria
             INNER JOIN municipios m ON m.id_municipio = r.fk_id_municipio
             WHERE ${where}
               AND r.latitude IS NOT NULL
               AND r.longitude IS NOT NULL
             ORDER BY r.enviado_em DESC`,
            parametros
        );

        return response.json({ relatos });
    } catch (error) {
        tratarErro(error, next);
    }
}

// CONSULTAR DETALHES E REGISTRO DA DECISÃO
export async function obterRelatoMunicipal(request, response, next) {
    try {
        const id = validarId(request.params.id);

        if (!id) {
            return response.status(400).json({ mensagem: "ID do relato inválido." });
        }

        const [relatos] = await pool.execute(
            `SELECT
                r.*,
                c.nome AS nome_cidadao,
                c.email AS email_cidadao,
                cat.nome AS categoria,
                m.nome AS municipio
             FROM relatos r
             INNER JOIN contas c ON c.id_conta = r.fk_id_conta_autor
             INNER JOIN categorias cat ON cat.id_categoria = r.fk_id_categoria
             INNER JOIN municipios m ON m.id_municipio = r.fk_id_municipio
             WHERE r.id_relato = ?
               AND r.fk_id_municipio = ?
             LIMIT 1`,
            [id, request.municipioId]
        );

        if (!relatos.length) {
            return response.status(404).json({ mensagem: "Relato não encontrado." });
        }

        const [decisoes] = await pool.execute(
            `SELECT
                d.id_decisao,
                d.resultado,
                d.motivo_rejeicao,
                a.id_acao,
                a.tipo AS tipo_acao,
                a.realizada_em,
                a.detalhes,
                responsavel.nome AS administrador
             FROM decisoes d
             INNER JOIN acoes_administrativas a ON a.id_acao = d.fk_id_acao
             INNER JOIN contas responsavel ON responsavel.id_conta = a.fk_id_conta_responsavel
             INNER JOIN relatos r ON r.id_relato = d.fk_id_relato
             WHERE d.fk_id_relato = ?
               AND r.fk_id_municipio = ?
             LIMIT 1`,
            [id, request.municipioId]
        );

        return response.json({
            relato: relatos[0],
            decisao: decisoes[0] || null,
            anexos: []
        });
    } catch (error) {
        tratarErro(error, next);
    }
}

// APROVAR RELATO
export async function aprovarRelato(request, response, next) {
    let connection;
    let transacaoIniciada = false;

    try {
        const id = validarId(request.params.id);

        if (!id) {
            return response.status(400).json({ mensagem: "ID do relato inválido." });
        }

        const observacao = typeof request.body?.observacao === "string"
            ? request.body.observacao.trim()
            : "";

        if (observacao.length > 2000) {
            return response.status(400).json({
                mensagem: "A observação deve ter no máximo 2000 caracteres."
            });
        }

        const tipoObservacao = request.body?.tipo_observacao || "Interna";
        if (!["Interna", "Publica"].includes(tipoObservacao)) {
            return response.status(400).json({ mensagem: "Tipo de observação inválido." });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();
        transacaoIniciada = true;

        const [relatos] = await connection.execute(
            `SELECT id_relato, situacao
             FROM relatos
             WHERE id_relato = ? AND fk_id_municipio = ?
             FOR UPDATE`,
            [id, request.municipioId]
        );

        if (!relatos.length) {
            await connection.rollback();
            transacaoIniciada = false;
            return response.status(404).json({ mensagem: "Relato não encontrado." });
        }

        if (relatos[0].situacao !== "Pendente") {
            await connection.rollback();
            transacaoIniciada = false;
            return response.status(409).json({
                mensagem: "Somente relatos pendentes podem ser aprovados."
            });
        }

        const detalhes = observacao
            ? JSON.stringify({ observacao, tipo_observacao: tipoObservacao })
            : null;

        const [acao] = await connection.execute(
            `INSERT INTO acoes_administrativas (
                tipo, detalhes, fk_id_conta_responsavel,
                fk_id_conta_afetada, fk_id_importacao
             ) VALUES ('Aprovar relato', ?, ?, NULL, NULL)`,
            [detalhes, request.usuario.id]
        );

        await connection.execute(
            `INSERT INTO decisoes (
                resultado, motivo_rejeicao, fk_id_acao, fk_id_relato
             ) VALUES ('Aprovado', NULL, ?, ?)`,
            [acao.insertId, id]
        );

        await connection.execute(
            `UPDATE relatos
             SET situacao = 'Aprovado'
             WHERE id_relato = ? AND fk_id_municipio = ?`,
            [id, request.municipioId]
        );

        await connection.commit();
        transacaoIniciada = false;

        return response.json({
            mensagem: "Relato aprovado com sucesso.",
            situacao: "Aprovado"
        });
    } catch (error) {
        if (connection && transacaoIniciada) await connection.rollback();
        tratarErro(error, next);
    } finally {
        if (connection) connection.release();
    }
}

// REJEITAR RELATO
export async function rejeitarRelato(request, response, next) {
    let connection;
    let transacaoIniciada = false;

    try {
        const id = validarId(request.params.id);

        if (!id) {
            return response.status(400).json({ mensagem: "ID do relato inválido." });
        }

        const motivo = typeof request.body?.motivo_rejeicao === "string"
            ? request.body.motivo_rejeicao.trim()
            : "";

        if (motivo.length < 3 || motivo.length > 2000) {
            return response.status(400).json({
                mensagem: "Informe um motivo de rejeição entre 3 e 2000 caracteres."
            });
        }

        const observacao = typeof request.body?.observacao === "string"
            ? request.body.observacao.trim()
            : "";

        if (observacao.length > 2000) {
            return response.status(400).json({
                mensagem: "A observação deve ter no máximo 2000 caracteres."
            });
        }

        const tipoObservacao = request.body?.tipo_observacao || "Interna";
        if (!["Interna", "Publica"].includes(tipoObservacao)) {
            return response.status(400).json({ mensagem: "Tipo de observação inválido." });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();
        transacaoIniciada = true;

        const [relatos] = await connection.execute(
            `SELECT id_relato, situacao
             FROM relatos
             WHERE id_relato = ? AND fk_id_municipio = ?
             FOR UPDATE`,
            [id, request.municipioId]
        );

        if (!relatos.length) {
            await connection.rollback();
            transacaoIniciada = false;
            return response.status(404).json({ mensagem: "Relato não encontrado." });
        }

        if (relatos[0].situacao !== "Pendente") {
            await connection.rollback();
            transacaoIniciada = false;
            return response.status(409).json({
                mensagem: "Somente relatos pendentes podem ser rejeitados."
            });
        }

        const detalhes = JSON.stringify({
            observacao,
            tipo_observacao: tipoObservacao
        });

        const [acao] = await connection.execute(
            `INSERT INTO acoes_administrativas (
                tipo, detalhes, fk_id_conta_responsavel,
                fk_id_conta_afetada, fk_id_importacao
             ) VALUES ('Rejeitar relato', ?, ?, NULL, NULL)`,
            [detalhes, request.usuario.id]
        );

        await connection.execute(
            `INSERT INTO decisoes (
                resultado, motivo_rejeicao, fk_id_acao, fk_id_relato
             ) VALUES ('Rejeitado', ?, ?, ?)`,
            [motivo, acao.insertId, id]
        );

        await connection.execute(
            `UPDATE relatos
             SET situacao = 'Rejeitado'
             WHERE id_relato = ? AND fk_id_municipio = ?`,
            [id, request.municipioId]
        );

        await connection.commit();
        transacaoIniciada = false;

        return response.json({
            mensagem: "Relato rejeitado com sucesso.",
            situacao: "Rejeitado"
        });
    } catch (error) {
        if (connection && transacaoIniciada) await connection.rollback();
        tratarErro(error, next);
    } finally {
        if (connection) connection.release();
    }
}

// DASHBOARD MUNICIPAL

// DASHBOARD MUNICIPAL
export async function obterDashboardMunicipal(request, response, next) {
    try {
        // Indicadores do município
        const [contadores] = await pool.execute(
            `SELECT
                COUNT(*) AS total,
                SUM(situacao = 'Pendente') AS pendentes,
                SUM(situacao = 'Aprovado') AS aprovados,
                SUM(situacao = 'Rejeitado') AS rejeitados
             FROM relatos
             WHERE fk_id_municipio = ?`,
            [request.municipioId]
        );

        // Tempo médio de resposta
        const [tempoResposta] = await pool.execute(
            `SELECT AVG(TIMESTAMPDIFF(MINUTE, r.enviado_em, a.realizada_em)) AS media_minutos
             FROM relatos r
             INNER JOIN decisoes d ON d.fk_id_relato = r.id_relato
             INNER JOIN acoes_administrativas a ON a.id_acao = d.fk_id_acao
             WHERE r.fk_id_municipio = ?`,
            [request.municipioId]
        );

        // Últimos 5 relatos do município
        const [recentes] = await pool.execute(
            `SELECT
                r.id_relato,
                r.descricao,
                r.data_fato,
                r.hora_fato,
                r.enviado_em,
                r.situacao,
                cat.nome AS categoria,
                c.nome AS nome_cidadao
             FROM relatos r
             INNER JOIN categorias cat
                ON cat.id_categoria = r.fk_id_categoria
             INNER JOIN contas c
                ON c.id_conta = r.fk_id_conta_autor
             WHERE r.fk_id_municipio = ?
             ORDER BY r.enviado_em DESC
             LIMIT 5`,
            [request.municipioId]
        );

        const dados = contadores[0];

        return response.json({
            total: Number(dados.total || 0),
            pendentes: Number(dados.pendentes || 0),
            aprovados: Number(dados.aprovados || 0),
            rejeitados: Number(dados.rejeitados || 0),

            mediaTempoRespostaMinutos:
                tempoResposta[0].media_minutos === null
                    ? null
                    : Number(tempoResposta[0].media_minutos),

            recentes
        });

    } catch (error) {
        next(error);
    }
}


// USUÁRIOS VINCULADOS AO MUNICÍPIO DA CONTA ADMINISTRADORA
export async function listarUsuariosMunicipais(request, response, next) {
    try {
        const [usuarios] = await pool.execute(
            `SELECT
                c.id_conta,
                c.nome,
                c.email,
                c.perfil
             FROM contas c
             INNER JOIN contas_municipios cm
                ON cm.fk_id_conta = c.id_conta
             WHERE cm.fk_id_municipio = ?
               AND c.perfil = 'cidadao'
             ORDER BY c.nome ASC`,
            [request.municipioId]
        );

        return response.status(200).json({
            usuarios
        });

    } catch (error) {
        tratarErro(error, next);
    }
}