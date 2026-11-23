import bcrypt from "bcrypt";
import { pool } from "../config/database.js";

export async function obterDashboard(request, response, next) {
  try {
    const [[relatos], [contas], [situacoes], [registrosOficiais], [recentes]] =
      await Promise.all([
        pool.execute(`
                SELECT COUNT(*) AS total
                FROM relatos
            `),

        pool.execute(`
                SELECT COUNT(*) AS total
                FROM contas
            `),

        pool.execute(`
                SELECT
                    COALESCE(SUM(situacao = 'Pendente'), 0) AS pendentes,
                    COALESCE(SUM(situacao = 'Aprovado'), 0) AS aprovados,
                    COALESCE(SUM(situacao = 'Rejeitado'), 0) AS rejeitados
                FROM relatos
            `),

        pool.execute(`
                SELECT COUNT(*) AS total
                FROM registro_oficial
            `),

        pool.execute(`
                SELECT
                    r.id_relato,
                    r.descricao,
                    r.situacao,
                    r.enviado_em,
                    c.nome AS categoria,
                    m.nome AS municipio,
                    COALESCE(
                        NULLIF(r.referencia_local, ''),
                        m.nome
                    ) AS localizacao
                FROM relatos r
                INNER JOIN categorias c
                    ON c.id_categoria = r.fk_id_categoria
                INNER JOIN municipios m
                    ON m.id_municipio = r.fk_id_municipio
                ORDER BY r.enviado_em DESC
                LIMIT 5
            `),
      ]);

    return response.status(200).json({
      indicadores: {
        totalRelatos: Number(relatos[0].total),
        totalContas: Number(contas[0].total),
        pendentes: Number(situacoes[0].pendentes),
        aprovados: Number(situacoes[0].aprovados),
        rejeitados: Number(situacoes[0].rejeitados),
        totalRegistrosOficiais: Number(registrosOficiais[0].total),
      },

      distribuicao: {
        pendentes: Number(situacoes[0].pendentes),
        aprovados: Number(situacoes[0].aprovados),
        rejeitados: Number(situacoes[0].rejeitados),
      },

      recentes,
    });
  } catch (error) {
    next(error);
  }
}


export async function listarUsuarios(request, response, next) {
    try {
        const busca = String(request.query.busca || "").trim();
        const perfil = String(request.query.perfil || "").trim();

        const pagina = Math.max(
            1,
            Number.parseInt(request.query.pagina, 10) || 1
        );

        const limite = Math.min(
            50,
            Math.max(1, Number.parseInt(request.query.limite, 10) || 10)
        );

        const offset = (pagina - 1) * limite;

        const perfisPermitidos = [
            "cidadao",
            "admin_municipal",
            "admin_geral"
        ];

        if (perfil && !perfisPermitidos.includes(perfil)) {
            return response.status(400).json({
                mensagem: "Perfil informado inválido."
            });
        }

        const condicoes = [];
        const parametros = [];

        if (busca) {
            condicoes.push("(c.nome LIKE ? OR c.email LIKE ?)");
            parametros.push(`%${busca}%`, `%${busca}%`);
        }

        if (perfil) {
            condicoes.push("c.perfil = ?");
            parametros.push(perfil);
        }

        const where = condicoes.length
            ? `WHERE ${condicoes.join(" AND ")}`
            : "";

        const [resultadoTotal] = await pool.execute(
            `
                SELECT COUNT(*) AS total
                FROM contas c
                ${where}
            `,
            parametros
        );

        const total = Number(resultadoTotal[0].total);

        const [usuarios] = await pool.execute(
            `
                SELECT
                    c.id_conta,
                    c.nome,
                    c.email,
                    c.perfil,
                    c.fk_id_municipio,
                    m.nome AS municipio
                FROM contas c
                LEFT JOIN municipios m
                    ON m.id_municipio = c.fk_id_municipio
                ${where}
                ORDER BY c.id_conta DESC
                LIMIT ${limite} OFFSET ${offset}
            `,
            parametros
        );

        return response.status(200).json({
            usuarios,
            paginacao: {
                pagina,
                limite,
                total,
                totalPaginas: Math.ceil(total / limite)
            }
        });

    } catch (error) {
        next(error);
    }
}


export async function criarUsuario(request, response, next) {
  try {
    const { nome, email, senha, perfil, fk_id_municipio } = request.body;

    const nomeLimpo = String(nome || "").trim();
    const emailLimpo = String(email || "")
      .trim()
      .toLowerCase();
    const senhaLimpa = String(senha || "");

    const perfisPermitidos = ["cidadao", "admin_municipal", "admin_geral"];

    if (!nomeLimpo || !emailLimpo || !senhaLimpa || !perfil) {
      return response.status(400).json({
        mensagem: "Preencha todos os campos obrigatórios.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      return response.status(400).json({
        mensagem: "Informe um e-mail válido.",
      });
    }

    if (senhaLimpa.length < 8) {
      return response.status(400).json({
        mensagem: "A senha deve ter pelo menos 8 caracteres.",
      });
    }

    if (!perfisPermitidos.includes(perfil)) {
      return response.status(400).json({
        mensagem: "Perfil inválido.",
      });
    }

    let municipioId = null;

    if (perfil === "admin_municipal") {
      municipioId = Number(fk_id_municipio);

      if (!Number.isInteger(municipioId) || municipioId <= 0) {
        return response.status(400).json({
          mensagem: "Selecione um município para o administrador municipal.",
        });
      }

      const [municipios] = await pool.execute(
        "SELECT id_municipio FROM municipios WHERE id_municipio = ?",
        [municipioId]
      );

      if (municipios.length === 0) {
        return response.status(400).json({
          mensagem: "O município selecionado não existe.",
        });
      }
    }

    const [emailExistente] = await pool.execute(
      "SELECT id_conta FROM contas WHERE email = ?",
      [emailLimpo]
    );

    if (emailExistente.length > 0) {
      return response.status(409).json({
        mensagem: "Já existe uma conta cadastrada com este e-mail.",
      });
    }

    const senhaHash = await bcrypt.hash(senhaLimpa, 12);

    const [resultado] = await pool.execute(
      `INSERT INTO contas
                (nome, email, senha_hash, perfil, fk_id_municipio)
             VALUES (?, ?, ?, ?, ?)`,
      [nomeLimpo, emailLimpo, senhaHash, perfil, municipioId]
    );

    return response.status(201).json({
      mensagem: "Conta criada com sucesso.",
      usuario: {
        id_conta: resultado.insertId,
        nome: nomeLimpo,
        email: emailLimpo,
        perfil,
        fk_id_municipio: municipioId,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listarMunicipios(request, response, next) {
  try {
    const [municipios] = await pool.execute(
      `SELECT id_municipio, nome
             FROM municipios
             ORDER BY nome ASC`
    );

    return response.status(200).json({ municipios });
  } catch (error) {
    next(error);
  }
}

function montarFiltrosRelatos(request) {
  const busca = String(request.query.busca || "").trim();
  const situacao = String(request.query.situacao || "").trim();
  const categoria = String(request.query.categoria || "").trim();

  const condicoes = ["r.latitude IS NOT NULL", "r.longitude IS NOT NULL"];

  const parametros = [];

  if (busca) {
    condicoes.push(`(
            r.descricao LIKE ?
            OR r.referencia_local LIKE ?
            OR c.nome LIKE ?
            OR m.nome LIKE ?
        )`);

    const termo = `%${busca}%`;

    parametros.push(termo, termo, termo, termo);
  }

  const situacoesPermitidas = ["Pendente", "Aprovado", "Rejeitado"];

  if (situacao) {
    if (!situacoesPermitidas.includes(situacao)) {
      throw new Error("Situação informada inválida.");
    }

    condicoes.push("r.situacao = ?");
    parametros.push(situacao);
  }

  if (categoria) {
    const categoriaId = Number(categoria);

    if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
      throw new Error("Categoria informada inválida.");
    }

    condicoes.push("r.fk_id_categoria = ?");
    parametros.push(categoriaId);
  }

  return {
    where: `WHERE ${condicoes.join(" AND ")}`,
    parametros,
  };
}


export async function listarRelatos(request, response, next) {
    try {
        const pagina = Math.max(
            1,
            Number.parseInt(request.query.pagina, 10) || 1
        );

        const limite = Math.min(
            50,
            Math.max(1, Number.parseInt(request.query.limite, 10) || 10)
        );

        const offset = (pagina - 1) * limite;

        const { where, parametros } = montarFiltrosRelatos(request);

        const [
            [resultadoTotal],
            [relatos],
            [categorias],
            [indicadores]
        ] = await Promise.all([
            pool.execute(
                `
                    SELECT COUNT(*) AS total
                    FROM relatos r
                    INNER JOIN categorias c
                        ON c.id_categoria = r.fk_id_categoria
                    INNER JOIN municipios m
                        ON m.id_municipio = r.fk_id_municipio
                    ${where}
                `,
                parametros
            ),

            pool.execute(
                `
                    SELECT
                        r.id_relato,
                        r.descricao,
                        r.data_fato,
                        r.hora_fato,
                        r.latitude,
                        r.longitude,
                        r.referencia_local,
                        r.enviado_em,
                        r.situacao,
                        r.fk_id_categoria,
                        r.fk_id_municipio,
                        c.nome AS categoria,
                        m.nome AS municipio
                    FROM relatos r
                    INNER JOIN categorias c
                        ON c.id_categoria = r.fk_id_categoria
                    INNER JOIN municipios m
                        ON m.id_municipio = r.fk_id_municipio
                    ${where}
                    ORDER BY r.enviado_em DESC
                    LIMIT ${limite} OFFSET ${offset}
                `,
                parametros
            ),

            pool.execute(`
                SELECT id_categoria, nome
                FROM categorias
                ORDER BY nome ASC
            `),

            pool.execute(`
                SELECT
                    COUNT(*) AS total,
                    COALESCE(SUM(situacao = 'Pendente'), 0) AS pendentes,
                    COALESCE(SUM(situacao = 'Aprovado'), 0) AS aprovados,
                    COALESCE(SUM(situacao = 'Rejeitado'), 0) AS rejeitados
                FROM relatos
            `)
        ]);

        const total = Number(resultadoTotal[0].total);

        return response.status(200).json({
            relatos,
            categorias,
            indicadores: {
                total: Number(indicadores[0].total),
                pendentes: Number(indicadores[0].pendentes),
                aprovados: Number(indicadores[0].aprovados),
                rejeitados: Number(indicadores[0].rejeitados)
            },
            paginacao: {
                pagina,
                limite,
                total,
                totalPaginas: Math.ceil(total / limite)
            }
        });

    } catch (error) {
        if (
            error.message === "Situação informada inválida." ||
            error.message === "Categoria informada inválida."
        ) {
            return response.status(400).json({
                mensagem: error.message
            });
        }

        next(error);
    }
}

export async function listarRelatosMapa(request, response, next) {
  try {
    const { where, parametros } = montarFiltrosRelatos(request);

    const [relatos] = await pool.execute(
      `
                SELECT
                    r.id_relato,
                    r.descricao,
                    r.data_fato,
                    r.hora_fato,
                    r.latitude,
                    r.longitude,
                    r.referencia_local,
                    r.enviado_em,
                    r.situacao,
                    c.nome AS categoria,
                    m.nome AS municipio
                FROM relatos r
                INNER JOIN categorias c
                    ON c.id_categoria = r.fk_id_categoria
                INNER JOIN municipios m
                    ON m.id_municipio = r.fk_id_municipio
                ${where}
                ORDER BY r.enviado_em DESC
            `,
      parametros
    );

    return response.status(200).json({ relatos });
  } catch (error) {
    if (
      error.message === "Situação informada inválida." ||
      error.message === "Categoria informada inválida."
    ) {
      return response.status(400).json({
        mensagem: error.message,
      });
    }

    next(error);
  }
}
export async function obterConfiguracoesConta(request, response) {
  try {
    const id = request.usuario.id;

    const [usuarios] = await pool.execute(
      `SELECT id_conta, nome, email, perfil
             FROM contas
             WHERE id_conta = ?
             LIMIT 1`,
      [id]
    );

    if (!usuarios.length) {
      return response.status(404).json({
        mensagem: "Conta não encontrada.",
      });
    }

    return response.json({ usuario: usuarios[0] });
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);

    return response.status(500).json({
      mensagem: "Erro ao carregar os dados da conta.",
    });
  }
}

// Atualizar nome e e-mail
export async function atualizarDadosConta(request, response) {
  try {
    const id = request.usuario.id;

    const nome = String(request.body.nome || "").trim();
    const email = String(request.body.email || "")
      .trim()
      .toLowerCase();

    if (!nome || !email) {
      return response.status(400).json({
        mensagem: "Preencha o nome e o e-mail.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return response.status(400).json({
        mensagem: "Informe um e-mail válido.",
      });
    }

    const [duplicados] = await pool.execute(
      `SELECT id_conta
             FROM contas
             WHERE email = ? AND id_conta <> ?
             LIMIT 1`,
      [email, id]
    );

    if (duplicados.length) {
      return response.status(409).json({
        mensagem: "Este e-mail já está sendo utilizado.",
      });
    }

    const [resultado] = await pool.execute(
      `UPDATE contas
             SET nome = ?, email = ?
             WHERE id_conta = ? AND perfil = 'admin_geral'`,
      [nome, email, id]
    );

    if (!resultado.affectedRows) {
      return response.status(404).json({
        mensagem: "Conta não encontrada ou não autorizada.",
      });
    }

    return response.json({
      mensagem: "Dados atualizados com sucesso.",
      usuario: {
        id,
        nome,
        email,
        perfil: "admin_geral",
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);

    return response.status(500).json({
      mensagem: "Erro ao atualizar os dados da conta.",
    });
  }
}

// Alterar senha
export async function alterarSenhaConta(request, response) {
  try {
    const id = request.usuario.id;

    const senhaAtual = request.body.senhaAtual;
    const novaSenha = request.body.novaSenha;

    if (!senhaAtual || !novaSenha) {
      return response.status(400).json({
        mensagem: "Preencha a senha atual e a nova senha.",
      });
    }

    if (novaSenha.length < 8) {
      return response.status(400).json({
        mensagem: "A nova senha deve ter pelo menos 8 caracteres.",
      });
    }

    const [usuarios] = await pool.execute(
      `SELECT senha_hash
             FROM contas
             WHERE id_conta = ? AND perfil = 'admin_geral'
             LIMIT 1`,
      [id]
    );

    if (!usuarios.length) {
      return response.status(404).json({
        mensagem: "Conta não encontrada.",
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senhaAtual,
      usuarios[0].senha_hash
    );

    if (!senhaCorreta) {
      return response.status(400).json({
        mensagem: "A senha atual está incorreta.",
      });
    }

    const novoHash = await bcrypt.hash(novaSenha, 10);

    await pool.execute(
      `UPDATE contas
             SET senha_hash = ?
             WHERE id_conta = ?`,
      [novoHash, id]
    );

    return response.json({
      mensagem: "Senha alterada com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);

    return response.status(500).json({
      mensagem: "Erro ao alterar a senha.",
    });
  }
}
