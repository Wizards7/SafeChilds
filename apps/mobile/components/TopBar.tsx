"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { UrgentLink } from "./UrgentLink";

export function TopBar({ title, back = true, backHref, right }: { title?: ReactNode; back?: boolean; backHref?: string | undefined; right?: ReactNode }) {
  const t = useTranslations("common");
  const router = useRouter();
  return (
    <header className="top">
      {back ? (
        <button className="back" aria-label={t("back")} onClick={() => (backHref ? router.push(backHref) : router.back())}>
          <Icon name="arrow-left" />
        </button>
      ) : (
        <span className="brand brandmark"><img src="/icon.svg" width={28} height={28} alt="" />SafeChilds</span>
      )}
      <span className="title">{title}</span>
      {right}
      <UrgentLink />
    </header>
  );
}
