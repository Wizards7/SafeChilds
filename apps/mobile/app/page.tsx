import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { CATEGORIES, CATEGORY_DESCRIPTION, CATEGORY_LABEL } from "@safechilds/guidance";
import { Icon } from "../components/Icon";
import { StartIncident } from "../components/StartIncident";
import { pick, type Locale } from "../lib/locale";
import { ContinueCard } from "./ContinueCard";
import { WelcomeGate } from "./WelcomeGate";

const CATEGORY_ICON: Record<string, string> = {
  fake_content: "image",
  extortion: "shield-alert",
  fraud: "banknote",
  cyberbullying: "message-warning",
  unknown: "circle-help",
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
      </header>
      <main>
        <ContinueCard />
        <h1>{t("headline")}</h1>
        <div className="stack">
          {cats.map((c) => (
            <Link key={c} className={`option${c === "extortion" ? " danger" : ""}`} href={`/situation?c=${c}`}>
              <span className="ic"><Icon name={CATEGORY_ICON[c] ?? "circle-help"} /></span>
              <span className="body">
                <span className="t">{pick(CATEGORY_LABEL[c], locale)}</span>
                <span className="d">{pick(CATEGORY_DESCRIPTION[c], locale)}</span>
              </span>
              <Icon name="chevron-right" className="i chev" />
            </Link>
          ))}
          <StartIncident situation="unknown" className="option">
            <span className="ic"><Icon name="circle-help" /></span>
            <span className="body"><span className="t">{pick(CATEGORY_LABEL.unknown, locale)}</span></span>
            <Icon name="chevron-right" className="i chev" />
          </StartIncident>
          <Link className="option support" href="/chat">
            <span className="ic"><Icon name="message-circle" /></span>
            <span className="body"><span className="t">{t("chat.title")}</span><span className="d">{t("chat.sub")}</span></span>
            <Icon name="chevron-right" className="i chev" />
          </Link>
        </div>
        <Link className="btn btn-quiet" href="/signs"><Icon name="search" size={20} />{t("signs")}</Link>
        <footer style={{ textAlign: "center" }}>
          <Link href="/privacy" className="small">{t("privacy")}</Link>
        </footer>
      </main>
    </>
  );
}
