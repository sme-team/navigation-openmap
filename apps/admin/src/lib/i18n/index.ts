// ./src/lib/i18n/index.ts
import { dir } from "i18next";
import nextI18NextConfig from "./next-i18next.config";
import { createModuleLogger, AppModules } from "@/logger";

const logger = createModuleLogger(AppModules.I18N_SERVER);
logger.debug("lib/i18n/index.ts initing");

export const languages = nextI18NextConfig.i18n.locales; // ["en", "vi", "cn"]
export const fallbackLng = nextI18NextConfig.i18n.defaultLocale; // "vi"


export { dir };