// src/config/config.service.ts
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

// ES Modules: Thay thế __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple console logger để tránh circular dependency
const simpleLogger = {
  info: (message: string, data?: any) => {
    console.log(
      `[INFO] [CONFIG_SERVICE] ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  },
  warn: (message: string, data?: any) => {
    console.warn(
      `[WARN] [CONFIG_SERVICE] ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  },
  error: (message: string, error?: any) => {
    console.error(
      `[ERROR] [CONFIG_SERVICE] ${message}`,
      error ? JSON.stringify(error, null, 2) : ""
    );
  },
};

// Auto-detect environment từ NODE_ENV hoặc script name
const detectEnvironment = (): string => {
  // 1. Ưu tiên NODE_ENV từ system
  if (process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  }

  // 2. Detect từ npm script đang chạy
  const npmScript = process.env.npm_lifecycle_event;
  if (npmScript) {
    if (npmScript.includes("dev") || npmScript.includes("development"))
      return "development";
    if (npmScript.includes("test")) return "test";
    if (npmScript.includes("prod") || npmScript.includes("production"))
      return "production";
    if (npmScript.includes("start")) return "production"; // npm start = production
  }

  // 3. Detect từ command line arguments
  const args = process.argv.join(" ");
  if (args.includes("--env=")) {
    const envMatch = args.match(/--env=(\w+)/);
    if (envMatch) return envMatch[1];
  }

  // 4. Default fallback
  return "development";
};

// Load .env file theo environment
const loadEnvFile = () => {
  const environment = detectEnvironment();

  // Danh sách env files theo thứ tự ưu tiên
  const envFiles = [
    `.env.${environment}.local`, // Highest priority
    `.env.local`, // Local overrides
    `.env.${environment}`, // Environment specific
    ".env", // Default fallback
  ];

  const envPaths = [
    path.resolve(__dirname, "../"), // src level
    path.resolve(__dirname, "../../"), // root project
    path.resolve(process.cwd()), // current directory
    path.resolve("/app/"), // docker path
  ];

  let loadedFiles: string[] = [];

  // Try each env file in each path
  for (const envFile of envFiles) {
    for (const envPath of envPaths) {
      const fullPath = path.resolve(envPath, envFile);
      try {
        const result = dotenv.config({ path: fullPath });
        if (!result.error) {
          loadedFiles.push(`${envFile} (${fullPath})`);
          break; // Found this env file, move to next
        }
      } catch (error) {
        // Continue searching
      }
    }
  }

  if (loadedFiles.length > 0) {
    simpleLogger.info(`✅ Environment: ${environment}`);
    simpleLogger.info(`📁 Loaded env files: ${loadedFiles.join(", ")}`);
  } else {
    simpleLogger.info(
      `⚠️  Environment: ${environment} (using system variables only)`
    );
  }

  return environment;
};

// Load environment immediately when module is imported
const currentEnvironment = loadEnvFile();

// Interface định nghĩa config
interface AppConfig {
  mongodbConnectionString: string;
  adminUsername: string;
  adminPassword: string;
  adminEmail?: string;
  nodeEnv: "development" | "production" | "test";
  defaultStoreId: string;
  hostPort: number;
  appPort: number;
  logLevel?: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  corsAccessList: string[];
  googleClientId: string;
  googleClientSecret: string;
  googleRedirectUri:string;
  googleFrongendUrl:string;
  nodeExtraCATrust:string;
  swaggerHost: string;
  swaggerSchemes: string;
}

// Service class để quản lý config
class ConfigService {
  private static instance: ConfigService | null = null;
  private config!: AppConfig;
  private environment: string;

  private constructor() {
    this.environment = currentEnvironment;
    this.initializeConfig();
  }

  private initializeConfig() {
    // Validate và parse env vars
    const mongodbConnectionString = process.env.MONGODB_CONNECTION_STRING|| "";
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminEmail = process.env.ADMIN_EMAIL || "admin@system.com";
    const defaultStoreId = process.env.DEFAULT_STORE_ID || "default";
    const hostPort = process.env.HOST_PORT
      ? parseInt(process.env.HOST_PORT, 10)
      : 3000;
    const appPort = process.env.APP_PORT
      ? parseInt(process.env.APP_PORT, 10)
      : 3000;
    const nodeEnv = detectEnvironment() as
      | "development"
      | "production"
      | "test";
    const jwtSecret = process.env.JWT_SECRET || "";
    const logLevel = process.env.LOG_LEVEL || "info";
    const corsAccessList = process.env.CORS_ACCESS_LIST
      ? process.env.CORS_ACCESS_LIST.split(",")
      : [];

    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || "";
    const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || "";
    const googleFrongendUrl = process.env.GOOGLE_FRONTEND_URL || "";
    const nodeExtraCATrust = process.env.NODE_EXTRA_CA_CERTS || "";

    const swaggerHost =
      process.env.SWAGGER_HOST_WITH_PORT || `localhost:${appPort}`;
    const swaggerSchemes =
      process.env.SWAGGER_SCHEMES ||
      (nodeEnv === "production" ? "https" : "http");

    // Validation
    if (!mongodbConnectionString) {
      throw new Error(
        `MONGODB_CONNECTION_STRING is required but not found in ${nodeEnv} environment. ` +
          `Check your .env.${nodeEnv} file or environment variables.`
      );
    }

    // Production-specific validations
    if (nodeEnv === "production") {
      if (!jwtSecret) {
        throw new Error("JWT_SECRET is required in production environment");
      }
      if (jwtSecret && jwtSecret.length < 32) {
        throw new Error(
          "JWT_SECRET must be at least 32 characters long in production"
        );
      }
    }

    this.config = {
      mongodbConnectionString,
      adminUsername,
      adminPassword,
      adminEmail,
      defaultStoreId,
      hostPort,
      appPort,
      nodeEnv,
      jwtSecret,
      logLevel,
      corsAccessList,
      jwtRefreshSecret,
      googleClientId,
      googleClientSecret,
      googleRedirectUri,
      googleFrongendUrl,
      swaggerHost,
      swaggerSchemes,
      nodeExtraCATrust
    };

    // Log config in development (excluding sensitive data) - sử dụng simple logger
    if (nodeEnv === "development") {
      simpleLogger.info("🔧 Configuration loaded", {
        environment: this.environment,
        nodeEnv,
        hostPort,
        appPort,
        defaultStoreId,
        logLevel,
        corsAccessList,
        swaggerHost,
        swaggerSchemes,
        mongodbConnectionString: mongodbConnectionString.replace(
          /\/\/.*:.*@/,
          "//***:***@"
        ), // Hide credentials
      });
    }
  }

  // Singleton pattern
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  // Get current environment
  public getCurrentEnvironment(): string {
    return this.environment;
  }

  // Getter methods
  public getMongoDBConnectionString(): string {
    return this.config.mongodbConnectionString;
  }

  public getNodeEnv(): "development" | "production" | "test" {
    return this.config.nodeEnv;
  }

  public getHostPort(): number {
    return this.config.hostPort;
  }

  public getAppPort(): number {
    return this.config.appPort;
  }

  public getDefaultStoreId(): string {
    return this.config.defaultStoreId;
  }

  public getJwtSecret(): string {
    if (!this.config.jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }
    return this.config.jwtSecret;
  }

  public getLogLevel(): string {
    return this.config.logLevel || "info";
  }

  public getCorsAccessList(): string[] {
    return this.config.corsAccessList;
  }

  public getJwtRefreshSecret(): string {
    return this.config.jwtRefreshSecret;
  }

  public getGoogleClientId(): string {
    return this.config.googleClientId;
  }

  public getGoogleClientSecret(): string {
    return this.config.googleClientSecret;
  }

  public getSwaggerHost(): string {
    return this.config.swaggerHost;
  }

  public getSwaggerSchemes(): string {
    return this.config.swaggerSchemes;
  }

  public getAppConfig(): AppConfig {
    return { ...this.config }; // Return copy to prevent mutation
  }

  // Health check method
  public validateConfig(): boolean {
    try {
      // Basic validation
      if (!this.config.mongodbConnectionString) return false;
      if (!["development", "production", "test"].includes(this.config.nodeEnv))
        return false;

      // Production validations
      if (this.config.nodeEnv === "production") {
        if (!this.config.jwtSecret || this.config.jwtSecret.length < 32)
          return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  // Debug method to show current config
  public debugConfig(): void {
    if (this.config.nodeEnv !== "production") {
      console.log("\n🔍 Current Configuration:");
      console.log(`Environment: ${this.environment}`);
      console.log(`NODE_ENV: ${this.config.nodeEnv}`);
      console.log(`Host Port: ${this.config.hostPort}`);
      console.log(`App Port: ${this.config.appPort}`);
      console.log(`Log Level: ${this.config.logLevel}`);
      console.log(`Default Store ID: ${this.config.defaultStoreId}`);
      console.log(`CORS Access List: ${this.config.corsAccessList}`);
      console.log(`Swagger Host: ${this.config.swaggerHost}`);
      console.log(`Swagger Schemes: ${this.config.swaggerSchemes}`);
      console.log(
        `MongoDB: ${this.config.mongodbConnectionString.replace(
          /\/\/.*:.*@/,
          "//***:***@"
        )}`
      );
      console.log("---\n");
    }
  }
}

export default ConfigService;
