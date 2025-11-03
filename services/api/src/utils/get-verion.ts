// utils/get-verion.js
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { AppModules, createModuleLogger } from "@/logger";
const logger = createModuleLogger(AppModules.SERVER_ROUTE);

export const getVersion = (): string => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Thử các đường dẫn khác nhau
    const possiblePaths = [
      join(__dirname, "../package.json"), // Relative to utils/
      join(process.cwd(), "package.json"), // Working directory
      "/app/package.json", // Docker absolute path
      join(__dirname, "../../package.json"), // If nested deeper
    ];

    for (const packagePath of possiblePaths) {
      if (existsSync(packagePath)) {
        logger.info(`Found package.json at: ${packagePath}`);
        const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
        logger.info(`Version found: ${packageJson.version}`);
        return packageJson.version || "1.0.0";
      } else {
        logger.info(`Package.json not found at: ${packagePath}`);
      }
    }

    logger.info("Package.json not found in any location");
    logger.info("Current working directory:", process.cwd());
    logger.info("__dirname:", __dirname);

    return "1.0.0";
  } catch (error) {
    logger.error("Error reading package.json:", error);
    return "1.0.0";
  }
};
