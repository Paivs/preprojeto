import { checkDatabaseConnection } from "../config/Database.js";

export async function healthCheck(request, response, next) {
  try {
    const databaseConnected = await checkDatabaseConnection();

    response.json({
      status: "ok",
      database: databaseConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}
