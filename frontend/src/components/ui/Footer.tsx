// ./src/components/Footer.tsx
"use client";

import { useVersion } from "@/hooks/useVersion";
import { useLanguage } from "@/contexts/LanguageContext";

const FooterContent = () => {
  const { t } = useLanguage();
  const { versionInfo } = useVersion();
  return (
    <>
      {/* Footer */}
      <footer
        className=" 
                  text-center 
                  flex 
                  items-center 
                  justify-center 
                  h-30 mt-2 
                  border-t 
                  border-slate-700/20 
                  dark:border-slate-600/30 
                  backdrop-blur-sm
                  transition-colors duration-300
                  "
      >
        <div className="max-w-7xl mx-auto px-12 mt-3 mb-3">
          <p
            className="
                  text-base sm:text-lg lg:text-xl 
                  text-secondary-700 dark:text-secondary-300
                  "
          >
            {t("footer.copyright") ||
              "© 2025 TechInsights. All rights reserved."}
          </p>
        </div>
        <div
          className="
                  text-right 
                  text-sm 
                  text-secondary-600 
                  dark:text-secondary-400
                  "
        >
          <div>Version: {versionInfo?.version || "..."}</div>
          <div className="text-xs">
            {versionInfo?.environment} |{" "}
            {versionInfo?.commitSha?.substring(0, 7)}
          </div>
        </div>
      </footer>
    </>
  );
};
const Footer = () => {
  return <FooterContent />;
};

export default Footer;
