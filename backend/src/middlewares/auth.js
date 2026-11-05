import jwt from "jsonwebtoken";

// Exige um token JWT válido no header: Authorization: Bearer <token>
export function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || "").split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ sucesso: false, erro: "Token não informado." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (err) {
    const mensagem = err.name === "TokenExpiredError" ? "Token expirado." : "Token inválido.";
    return res.status(401).json({ sucesso: false, erro: mensagem });
  }
}

// Exige que o usuário logado tenha uma das roles informadas.
// Uso: autorizar("admin")  ou  autorizar("admin", "cliente")
export function autorizar(...rolesPermitidas) {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidas.includes(req.user.role)) {
      return res
        .status(403)
        .json({ sucesso: false, erro: "Acesso negado: permissão insuficiente." });
    }
    return next();
  };
}
