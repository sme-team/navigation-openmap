// src/config/config.service.ts
// Simple console logger

 
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

 

// Check if running on server or client
const isServer = typeof window === "undefined";

// Detect environment
const detectEnvironment = (): string => {
  // simpleLogger.info("🔧 Detecting environment...", {
  //   isServer,
  //   Nextenv: process.env.NEXT_PUBLIC_NODE_ENV,
  // });
  if (isServer) {
    // Server-side: có thể dùng process.env
    // simpleLogger.info("🔧 Environment detected:", process.env.NODE_ENV);
    if (process.env.NODE_ENV) {
      return process.env.NODE_ENV;
    }
    const npmScript = process.env.npm_lifecycle_event;
    // simpleLogger.info("mpmScript:", npmScript);
    if (npmScript) {
      if (npmScript.includes("dev") || npmScript.includes("development"))
        return "development";
      if (npmScript.includes("test")) return "test";
      if (npmScript.includes("prod") || npmScript.includes("production"))
        return "production";
      if (npmScript.includes("start")) return "production";
    }
    return "development";
  } else {
    // Client-side: chỉ có thể dùng NEXT_PUBLIC_NODE_ENV hoặc default
    return process.env.NEXT_PUBLIC_NODE_ENV || "production";
  }
};

// Interface cho Next.js config
interface NextJSConfig {
  // Server-side config
  nodeEnv: "development" | "production" | "test";
  hostPort: number;
  appPort: number;

  // Log config
  logEnabled: boolean;
  logLevel: "trace" | "debug" | "info" | "warn" | "error";

  // API config
  publicApiUrl: string;
  publicAppName: string;
  apiTimeout: number;

  buildDate?: string;
  commitSha?: string;
}

// Service class
class ConfigService {
  private static instance: ConfigService | null = null;
  private config!: NextJSConfig;
  private environment: string;

  private constructor() {
    this.environment = detectEnvironment();
    this.initializeConfig();
  }

  private initializeConfig() {
    // Detect environment
    const nodeEnv = this.environment as "development" | "production" | "test";
    const buildDate = process.env.NEXT_PUBLIC_BUILD_TIME;
    const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA;

    if (isServer) {
      // SERVER-SIDE: có thể truy cập tất cả process.env
      const appPort = process.env.APP_PORT
        ? parseInt(process.env.APP_PORT, 10)
        : 3000;
      const hostPort = process.env.HOST_PORT
        ? parseInt(process.env.HOST_PORT, 10)
        : 8890;

      const logEnabled = process.env.LOG_ENABLED === "true";
      const logLevel = (process.env.LOG_LEVEL || "info") as
        | "trace"
        | "debug"
        | "info"
        | "warn"
        | "error";

      const publicApiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8890/blog-be";
      const publicAppName = process.env.NEXT_PUBLIC_APP_NAME || "dqcai-blog-fe";
      const apiTimeout = process.env.API_TIMEOUT
        ? parseInt(process.env.API_TIMEOUT, 10)
        : 30000;

      this.config = {
        nodeEnv,
        appPort,
        hostPort,
        logEnabled,
        logLevel,
        publicApiUrl,
        publicAppName,
        apiTimeout,
        buildDate,
        commitSha,
      };

      // Log config in development
      if (nodeEnv === "development") {
        // Debug: Show loading order
        simpleLogger.info("🔍 Development ENV loading order:", {
          "1_base": ".env",
          "2_development": ".env.development",
          "3_local": ".env.local",
          "4_dev_local": ".env.development.local",
          "5_os_env": "OS environment variables (HIGHEST)",
        });

        simpleLogger.info("🔧 Next.js Configuration loaded (SERVER)", {
          environment: this.environment,
          nodeEnv,
          appPort,
          hostPort,
          logEnabled,
          logLevel,
          publicApiUrl,
          publicAppName,
          apiTimeout,
        });
      }
    } else {
      // CLIENT-SIDE: chỉ có thể truy cập NEXT_PUBLIC_* variables
      const publicApiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8890/blog-be";
      const publicAppName = process.env.NEXT_PUBLIC_APP_NAME || "dqcai-blog-fe";
      const apiTimeout = process.env.NEXT_PUBLIC_API_TIMEOUT
        ? parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT, 10)
        : 30000;
      const logEnabled = process.env.NEXT_PUBLIC_LOG_ENABLED === "true";
      const logLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL || "info") as
        | "trace"
        | "debug"
        | "info"
        | "warn"
        | "error";

      this.config = {
        nodeEnv,
        appPort: 3000, // Default, không dùng trên client
        hostPort: 8890, // Default, không dùng trên client
        logEnabled,
        logLevel,
        publicApiUrl,
        publicAppName,
        apiTimeout,
        buildDate,
        commitSha,
      };
      // simpleLogger.info("🔧 Next.js logger (CLIENT)", { logEnabled, logLevel });
      // Log config in development
      if (nodeEnv === "development") {
        // Debug: Show where each value comes from
        simpleLogger.info("📊 ENV values debug:", {
          APP_PORT: {
            value: process.env.APP_PORT,
            possibleSources: [
              ".env: 3000?",
              ".env.development: 3001?",
              ".env.local: 3002?",
              ".env.development.local: 3003?",
              "OS env: ???",
            ],
          },
          NEXT_PUBLIC_API_URL: {
            value: process.env.NEXT_PUBLIC_API_URL,
            note: "This will be hardcoded in client bundle on build",
          },
        });
        simpleLogger.info("🔧 Next.js Configuration loaded (CLIENT)", {
          environment: this.environment,
          nodeEnv,
          logEnabled,
          logLevel,
          publicApiUrl,
          publicAppName,
          apiTimeout,
          buildDate,
          commitSha,
        });
      }
    }
  }

  // Singleton pattern
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  // Environment
  public getCurrentEnvironment(): string {
    return this.environment;
  }

  public getNodeEnv(): "development" | "production" | "test" {
    return this.config.nodeEnv;
  }

  public getBuildDate() {
    return this.config.buildDate;
  }
  public getCommitSha() {
    return this.config.commitSha;
  }

  public getAppPort(): number {
    if (!isServer) {
      console.warn(
        "[CONFIG_SERVICE] getAppPort() should only be called on server-side"
      );
    }
    return this.config.appPort;
  }

  public getHostPort(): number {
    if (!isServer) {
      console.warn(
        "[CONFIG_SERVICE] getHostPort() should only be called on server-side"
      );
    }
    return this.config.hostPort;
  }

  // Logger
  public isLogEnabled(): boolean {
    return this.config.logEnabled;
  }

  public getLogLevel(): "trace" | "debug" | "info" | "warn" | "error" {
    return this.config.logLevel;
  }

  // API
  public getApiUrl(): string {
    return this.config.publicApiUrl;
  }

  public getApiTimeout(): number {
    return this.config.apiTimeout;
  }

  public getAppName(): string {
    return this.config.publicAppName;
  }

  // Public config (safe for client-side)
  public getPublicConfig() {
    return {
      apiUrl: this.config.publicApiUrl,
      appName: this.config.publicAppName,
      env: this.config.nodeEnv,
      apiTimeout: this.config.apiTimeout,
    };
  }

  // Full config (server-side only)
  public getConfig(): NextJSConfig {
    if (!isServer) {
      console.warn(
        "[CONFIG_SERVICE] getConfig() should only be called on server-side"
      );
    }
    return { ...this.config };
  }

  // Check if running on server
  public isServerSide(): boolean {
    return isServer;
  }

  // Validation
  public validateConfig(): boolean {
    try {
      if (!["development", "production", "test"].includes(this.config.nodeEnv))
        return false;
      if (!this.config.publicApiUrl) return false;
      return true;
    } catch {
      return false;
    }
  }

  // Debug
  public debugConfig(): void {
    if (this.config.nodeEnv !== "production") {
      console.log("\n🔍 Next.js Configuration:");
      console.log(`Side: ${isServer ? "SERVER" : "CLIENT"}`);
      console.log(`Environment: ${this.environment}`);
      console.log(`NODE_ENV: ${this.config.nodeEnv}`);
      if (isServer) {
        console.log(`App Port: ${this.config.appPort}`);
        console.log(`Host Port: ${this.config.hostPort}`);
      }
      console.log(`Logger Enabled: ${this.config.logEnabled}`);
      console.log(`Log Level: ${this.config.logLevel}`);
      console.log(`API URL: ${this.config.publicApiUrl}`);
      console.log(`App Name: ${this.config.publicAppName}`);
      console.log(`API Timeout: ${this.config.apiTimeout}ms`);
      console.log("---\n");
    }
  }
}

// Export singleton instance
export default ConfigService;
