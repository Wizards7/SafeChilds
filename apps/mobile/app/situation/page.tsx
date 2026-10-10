import { getLocale, getTranslations } from "next-intl/server";
import { CATEGORIES, CATEGORY_LABEL, SITUATION_CATEGORY, SITUATION_LABEL, SITUATIONS, type Category } from "@safechilds/guidance";
import { Icon } from "../../components/Icon";
import { StartIncident } from "../../components/StartIncident";
import { TopBar } from "../../components/TopBar";
import { pick, type Locale } from "../../lib/locale";

const SITUATION_ICON: Record<string, string> = {
  fake_photo: "image",
  fake_video: "video",
  impersonation: "user-x",
  threat_to_publish: "shield-alert",
  demand_money_or_photos: "banknote",
  profile_asks_money_or_code: "banknote",
  already_sent: "banknote",
  public_humiliation: "message-warning",
  persistent_messages: "message-warning",
  group_against_me: "users",
  unknown: "circle-help",
};

export default async function SituationPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const category: Category = (CATEGORIES as readonly string[]).includes(c ?? "") ? (c as Category) : "unknown";
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("situation");
  const situations = SITUATIONS.filter((s) => SITUATION_CATEGORY[s] === category);
  return (
    <>
      <TopBar title={pick(CATEGORY_LABEL[category], locale)} backHref="/" />
      <main className="no-nav">
        <h1>{t("headline")}</h1>
        <div className="stack">
          {situations.map((s) => (
            <StartIncident key={s} situation={s} className="option">
              <span className="ic"><Icon name={SITUATION_ICON[s] ?? "circle-help"} /></span>
              <span className="body"><span className="t">{pick(SITUATION_LABEL[s], locale)}</span></span>
              <Icon name="chevron-right" className="i chev" />
            </StartIncident>
          ))}
        </div>
        <div className="spacer" />
        {category !== "unknown" && (
          <StartIncident situation="unknown" className="btn btn-quiet">
            {t("unsure")}
          </StartIncident>
        )}
      </main>
    </>
  );
}
