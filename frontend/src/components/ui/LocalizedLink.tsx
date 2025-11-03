// ./src/components/ui/LocalizedLink.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { ComponentProps } from "react";

type LocalizedLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
  const { locale } = useLanguage();

  // Nếu href đã có locale prefix thì không thêm nữa
  const localizedHref = href.startsWith(`/${locale}`)
    ? href
    : `/${locale}${href}`;

  return <Link href={localizedHref} {...props} />;
}
