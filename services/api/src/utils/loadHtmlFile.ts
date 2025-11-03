import { promises as fs } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import ConfigService from "../configs/config.service.js";

// ES Modules: Thay thế __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đọc file callback.html lưu ở ./public hoặc dịch ra lưu ở ./dist
export async function loadCallbackHTML(): Promise<string> {
  const config = ConfigService.getInstance();
  const { nodeEnv } = config.getAppConfig();
  const isProduction = nodeEnv === "production";
  
  const callbackHtmlPath = isProduction
    ? path.join(__dirname, "../callback.html")  // Từ dist/utils lên dist/callback.html
    : path.join(process.cwd(), "public", "callback.html");

  return await fs.readFile(callbackHtmlPath, "utf-8");
}
