import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { CATEGORIES, CATEGORY_LABEL } from "@safechilds/guidance";
import { Icon } from "../components/Icon";
import { UrgentLink } from "../components/UrgentLink";
import { pick, type Locale } from "../lib/locale";
import { ContinueCard } from "./ContinueCard";
import { WelcomeGate } from "./WelcomeGate";

// Lucide placeholders in the tile spots until the illustrated set lands (same style as the welcome).
const CATEGORY_ICON: Record<string, string> = {
  fake_content: "image",
  extortion: "shield-alert",
  fraud: "banknote",
  cyberbullying: "message-warning",
};

export default async function Home() {
  const t = await getTranslations("home");
  const locale = (await getLocale()) as Locale;
  const cats = CATEGORIES.filter((c) => c !== "unknown");
  return (
    <>
      <WelcomeGate />
      <header className="top">
        <span className="brand brandmark"><img src="/icon.svg" width={28} height={28} alt="" />SafeChilds</span>
        <UrgentLink />
      </header>
      <main>
        <ContinueCard />
        <h1>{t("headline")}</h1>
        <div className="tiles">
          {cats.map((c) => (
            <Link key={c} className={`tile${c === "extortion" ? " danger" : ""}`} href={`/situation?c=${c}`}>
              <span className="head">
                <span className="spot"><Icon name={CATEGORY_ICON[c] ?? "circle-help"} /></span>
                <span className="go"><Icon name="chevron-right" /></span>
              </span>
              <span className="t">{pick(CATEGORY_LABEL[c], locale)}</span>
            </Link>
          ))}
        </div>
        <Link className="btn btn-quiet" href="/signs"><Icon name="search" size={20} />{t("signs")}</Link>
      </main>
    </>
  );
}
