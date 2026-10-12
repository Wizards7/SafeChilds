import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { CATEGORIES, CATEGORY_LABEL } from "@safechilds/guidance";
import { Icon } from "../components/Icon";
import { UrgentLink } from "../components/UrgentLink";
import { pick, type Locale } from "../lib/locale";
import { WelcomeGate } from "./WelcomeGate";

export default async function Home() {
  const t = await getTranslations("home");
  const locale = (await getLocale()) as Locale;
  const cats = CATEGORIES.filter((c) => c !== "unknown");
  return (
    <>
      <WelcomeGate />
      <header className="top">
        <span className="brand brandmark">
          <img src="/icon.svg" width={28} height={28} alt="" />
          SafeChilds
        </span>
        <UrgentLink />
      </header>
      <main>
        <div>
          <h1>{t("headline")}</h1>
          <p className="sub">{t("sub")}</p>
        </div>
        <div className="tiles">
          {cats.map((c) => (
            <Link key={c} className="tile" href={`/situation?c=${c}`}>
              <img src={`/home/${c}.webp`} width={640} height={640} alt="" />
              <span className="t">{pick(CATEGORY_LABEL[c], locale)}</span>
              <span className="d">{t(`desc.${c}`)}</span>
              <Icon name="chevron-right" className="i go" />
            </Link>
          ))}
        </div>
        <Link className="exit" href="/chat">
          <span className="ic">
            <Icon name="circle-help" />
          </span>
          <span className="t">{pick(CATEGORY_LABEL.unknown, locale)}</span>
          <Icon name="chevron-right" className="i chev" />
        </Link>
        <Link className="btn btn-quiet" href="/signs">
          <Icon name="search" size={20} />
          {t("signs")}
        </Link>
        <footer style={{ textAlign: "center" }}>
          <Link href="/privacy" className="small">
            {t("privacy")}
          </Link>
        </footer>
      </main>
    </>
  );
}
