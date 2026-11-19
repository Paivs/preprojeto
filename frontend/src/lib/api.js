const apiConfigurada = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const origemApi = apiConfigurada.replace(/\/api\/?$/i, "").replace(/\/+$/, "");

export const API_BASE_URL = `${origemApi}/api`;
