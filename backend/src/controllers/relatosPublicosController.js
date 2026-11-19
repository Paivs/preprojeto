
import { pool } from "../config/database.js";

export async function listarRelatosPublicos(request, response, next) {
    try {
        const pagina = Math.max(
            1,
            parseInt(request.query.pagina, 10) || 1
        );

        const limite = 12;
        const offset = (pagina - 1) * limite;

        const pesquisa = String(request.query.pesquisa || "")
            .trim()
            .slice(0, 100);

        const categoria = String(request.query.categoria || "")
            .trim()
            .slice(0, 100);

        const municipio = String(request.query.municipio || "")
            .trim()
            .slice(0, 100);

        const filtros = ["r.situacao = 'Aprovado'"];
        const parametros = [];

        if (pesquisa) {
            filtros.push("(c.nome LIKE ? OR m.nome LIKE ?)");
            parametros.push(
                `%${pesquisa}%`,
                `%${pesquisa}%`
            );
        }

        if (categoria) {
            filtros.push("c.nome = ?");
            parametros.push(categoria);
        }

        if (municipio) {
            filtros.push("m.nome = ?");
            parametros.push(municipio);
        }

        const where = filtros.join(" AND ");

        const [relatos] = await pool.query(
            `SELECT
                r.id_relato,
                r.descricao,
                r.data_fato,
                r.hora_fato,
                r.enviado_em,
                ROUND(r.latitude, 2) AS latitude,
                ROUND(r.longitude, 2) AS longitude,
                c.nome AS categoria,
                m.nome AS municipio
            FROM relatos r
            INNER JOIN categorias c
                ON c.id_categoria = r.fk_id_categoria
            INNER JOIN municipios m
                ON m.id_municipio = r.fk_id_municipio
            WHERE ${where}
            ORDER BY r.enviado_em DESC
            LIMIT ? OFFSET ?`,
            [...parametros, limite, offset]
        );

        const [[resultado]] = await pool.query(
            `SELECT COUNT(*) AS total
            FROM relatos r
            INNER JOIN categorias c
                ON c.id_categoria = r.fk_id_categoria
            INNER JOIN municipios m
                ON m.id_municipio = r.fk_id_municipio
            WHERE ${where}`,
            parametros
        );

        return response.status(200).json({
            relatos,
            total: resultado.total,
            pagina,
            limite,
            totalPaginas: Math.ceil(
                resultado.total / limite
            )
        });

    } catch (erro) {
        next(erro);
    }
}
