// utils/fingerprint.utils.ts in client-side
import { createModuleLogger, AppModules } from "@/logger";

const logger = createModuleLogger(AppModules.FINGER_PRINT);

let cachedFingerprint: string | null = null;
// ✅ Bỏ qua cho dòng tiếp theo
 
let fpPromise: Promise<any> | null = null;

export const getClientFingerprint = async (): Promise<string> => {
  // Kiểm tra môi trường browser
  if (typeof window === "undefined") {
    logger.warn("Running on server-side, cannot generate fingerprint");
    return generateFallbackFingerprint();
  }

  if (cachedFingerprint) {
    logger.debug("Using cached fingerprint");
    return cachedFingerprint;
  }

  try {
    if (!fpPromise) {
      logger.debug("Initializing FingerprintJS");

      // Dynamic import cho Next.js
      const FingerprintJS = (await import("@fingerprintjs/fingerprintjs"))
        .default;
      fpPromise = FingerprintJS.load();
    }

    const fp = await fpPromise;
    const result = await fp.get();

    cachedFingerprint = result.visitorId;

    if (!cachedFingerprint) {
      cachedFingerprint = generateFallbackFingerprint();
    }

    logger.info("Generated fingerprint successfully", {
      fingerprintId: cachedFingerprint.substring(0, 8) + "...",
    });

    return cachedFingerprint;
  } catch (error) {
    logger.warn("FingerprintJS failed, using fallback", error);
    cachedFingerprint = generateFallbackFingerprint();
    return cachedFingerprint;
  }
};

const generateFallbackFingerprint = (): string => {
  // Kiểm tra browser environment
  if (typeof window === "undefined") {
    return "server-side-" + Date.now();
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth.toString(),
    screen.width.toString(),
    screen.height.toString(),
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() || "",
    navigator.platform,
  ].filter(Boolean);

  const fingerprint = btoa(components.join("|"));

  logger.debug("Generated fallback fingerprint", {
    components: components.length,
    fingerprintLength: fingerprint.length,
  });

  return fingerprint;
};

export const clearFingerprint = () => {
  cachedFingerprint = null;
  fpPromise = null;
  logger.debug("Cleared cached fingerprint");
};

export const initializeFingerprint = async (): Promise<void> => {
  if (typeof window === "undefined") {
    logger.warn("Cannot initialize fingerprint on server-side");
    return;
  }

  try {
    await getClientFingerprint();
    logger.info("Fingerprint pre-initialized");
  } catch (error) {
    logger.error("Failed to pre-initialize fingerprint", error);
  }
};
