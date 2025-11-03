// ./src/logger/index.ts
import {
  LoggerConfigBuilder,
  CommonLoggerConfig,
  CommonModules,
  createModuleLogger,
} from "@dqcai/logger";

const AppModules = {
  ...CommonModules,
  SERVER_RUNING: "SERVER_RUNING",
  SERVER_ROUTE: "SERVER_ROUTE",
};

const config = new LoggerConfigBuilder()
  .setEnabled(true)
  .setDefaultLevel("trace")
  .build();
CommonLoggerConfig.updateConfiguration(config);

export { createModuleLogger, AppModules };
