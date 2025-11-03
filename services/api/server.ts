import path from "path";
import { fileURLToPath } from "url";
import Fastify, { FastifyInstance } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import staticPlugin from "@fastify/static";

import ConfigService from "@/configs/config.service.js";
import { setupMapRateLimit } from "@/routes/rate-limit-optimized.js";
import { getVersion } from "@/utils/get-verion.js";

import { AppModules, createModuleLogger } from "@/logger/index.js";

// Build server function
const buildServer = async (): Promise<FastifyInstance> => {
  // Get config instance and ensure it's properly initialized
  const configService = ConfigService.getInstance();
  const config = configService.getAppConfig();

  // Initialize logger after config is ready
  const logger = createModuleLogger(AppModules.SERVER_RUNING);

  const fastify = Fastify({
    logger: false,
  }).withTypeProvider<TypeBoxTypeProvider>();

  logger.info(`Build server at port ${config.appPort}...`);

  const corsAccess = config.corsAccessList || [
    `http://localhost:${config.appPort}`,
  ];

  // CORS support
  await fastify.register(cors, {
    origin: [`http://localhost:${config.appPort}`, ...corsAccess],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Device-Fingerprint",
      "x-device-fingerprint",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ['x-device-fingerprint', 'X-Device-Fingerprint'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  logger.info("CORS support enabled", { ...corsAccess });

  // Rate limiting
  await setupMapRateLimit(fastify, config.nodeEnv);
  // =============================================================================
  // STATIC FILES SETUP - Thêm phần này
  // =============================================================================

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Đăng ký plugin static files
  await fastify.register(staticPlugin, {
    root: path.join(__dirname, "."), // Thư mục chứa index.html (cùng cấp với server.js)
    prefix: "/map-be", // Prefix cho static files
  });

  logger.info("Static files support enabled");

  // =============================================================================
  // SWAGGER DOCUMENTATION SETUP
  // =============================================================================
  if (config.nodeEnv !== "production") {
    logger.info("Swagger documentation setup...", {
      swaggerHost: config.swaggerHost,
      appPort: config.appPort,
      swaggerSchemes: config.swaggerSchemes,
    });

    await fastify.register(swagger, {
      swagger: {
        info: {
          title: "Map Management System API Documentation",
          description:
            "Comprehensive API documentation for the Map Management System",
          version: "1.0.0",
          contact: {
            name: "Map API Support",
            email: "cuondq3500888@gmail.com",
          },
        },
        host: config.swaggerHost || `localhost:${config.appPort || 3000}`,
        schemes: [config.swaggerSchemes || "http"],
        basePath: "/map-be",
        consumes: ["application/json"],
        produces: ["application/json"],
        tags: [
          {
            name: "Authentication",
            description: "User authentication endpoints",
          },
          {
            name: "Google Authentication",
            description: "User Google authentication endpoints",
          },
          { name: "Admin", description: "Administrative endpoints" },
          {
            name: "User",
            description: "User/Store/Enterprise management endpoints",
          },
          { name: "Articles", description: "Article management endpoints" },
          { name: "Comments", description: "Comment management endpoints" },
          { name: "Reactions", description: "Reaction management endpoints" },
          { name: "Utility", description: "Utility endpoints" },
        ],
        securityDefinitions: {
          Bearer: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
            description:
              "Enter your bearer token in the format **Bearer &lt;token&gt;**",
          },
        },
        security: [
          {
            Bearer: [],
          },
        ],
      },
      transform: ({ schema, url }: { schema: any; url: string }) => {
        // Transform TypeBox schemas for Swagger
        const transformed = { ...schema };

        // Add examples and descriptions
        // nếu các nhóm nào chưa định nghĩa tags thì mới dùng transformed này
        // còn nếu định nghĩa tag đúng thì thôi
        //      if (url.includes("/auth/")) {
        //         transformed.tags = ["Authentication"];
        //       }

        return { schema: transformed, url };
      },
    });

    await fastify.register(swaggerUI, {
      routePrefix: "/map-be/docs",
      uiConfig: {
        docExpansion: "list",
        deepLinking: false,
        defaultModelsExpandDepth: 2,
      },
      uiHooks: {
        onRequest: function (request: any, reply: any, next: () => void) {
          next();
        },
        preHandler: function (request: any, reply: any, next: () => void) {
          next();
        },
      },
      staticCSP: true,
      transformStaticCSP: (header: any) => header,
      transformSpecification: (
        swaggerObject: any,
        request: any,
        reply: any
      ) => {
        return swaggerObject;
      },
      transformSpecificationClone: true,
    });

    logger.info("Swagger documentation setup completed");
  } else {
    logger.info("Swagger documentation disabled in production mode");
  }
  logger.info("--------------------------------------------");

  // Đăng ký plugin API với prefix
  // fastify.register(apiAuthRoutes, { prefix: "/map-be" });
  // fastify.register(apiGoogleAuthRoutes, { prefix: "/map-be" });
  // fastify.register(apiUserRoutes, { prefix: "/map-be" });
  // fastify.register(apiArticleRoutes, { prefix: "/map-be" });
  // fastify.register(apiCommentRoutes, { prefix: "/map-be" });
  // fastify.register(apiReactionRoutes, { prefix: "/map-be" });
  // fastify.register(apiAdminRoutes, { prefix: "/map-be" });
  // fastify.register(healthCheckRoutes, { prefix: "/map-be" });
  // fastify.register(apiUtilityRoutes, { prefix: "/map-be" });

  // =============================================================================
  // ERROR HANDLERS
  // =============================================================================

  // 404 handler
  fastify.setNotFoundHandler((request: any, reply: any) => {
    reply.status(404).send({
      error: "Route not found",
      message: `${request.method} ${request.url} does not exist`,
    });
  });

  // Global error handler
  fastify.setErrorHandler((error, request: any, reply: any) => {
    fastify.log.error(error);

    // Handle validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: "Validation Error",
        details: error.validation,
      });
    }

    // Handle rate limit errors
    if (error.statusCode === 429) {
      return reply.status(429).send({
        error: "Rate Limit Exceeded",
        message: "Too many requests, please try again later",
      });
    }

    reply.status(error.statusCode || 500).send({
      error: error.statusCode === 500 ? "Internal Server Error" : error.message,
      message:
        config.nodeEnv === "development"
          ? error.message
          : "Something went wrong",
    });
  });

  return fastify;
};

// Start server function
const start = async () => {
  try {
    // Ensure config is fully loaded before building server
    const configService = ConfigService.getInstance();
    const config = configService.getAppConfig();

    // Initialize logger with proper config
    const logger = createModuleLogger(AppModules.SERVER_RUNING);

    const fastify = await buildServer();

    const PORT = config.appPort || 3000;
    await fastify.listen({ port: Number(PORT), host: "0.0.0.0" });

    logger.info(`🚀 MAP Server is running at http://localhost:${PORT}`);
    
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[SIGTERM] received, shutting down gracefully");
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  try {
    // await closeDB();
    console.log("Database closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    await delay(3000);
    process.exit(1);
  }
});

process.on("SIGINT", async () => {
  console.log("[SIGINT] [Ctl+C] received, shutting down gracefully");
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  try {
    // await closeDB();
    console.log("Database closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    await delay(3000);
    process.exit(1);
  }
});

// Export for testing
export { buildServer, start };

// Check if this file is run directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  start();
}
