import { getLocale, getTranslations } from "next-intl/server";
import { CATEGORIES, CATEGORY_LABEL, SITUATION_CATEGORY, SITUATION_LABEL, SITUATIONS, type Category } from "@safechilds/guidance";
import { Icon } from "../../components/Icon";
import { StartIncident } from "../../components/StartIncident";
import { TopBar } from "../../components/TopBar";
import { pick, type Locale } from "../../lib/locale";
import { NO_UNSURE, SITUATION_ART } from "../../lib/situation-art";
import "./situation.css";

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

  // Illustrated tiles (Ali's mockup, 2026-10-14), only for a category whose every situation has its picture: two per row,
  // an odd last one spans the row with the picture beside the text. «Не уверен(а)» sits right under them.
  const tiles = situations.flatMap((s) => {
    const art = SITUATION_ART[s];
    return art ? [{ s, width: art[0], height: art[1] }] : [];
  });
  if (category !== "unknown" && tiles.length === situations.length) {
    const th = await getTranslations("home");
    return (
      <>
        <TopBar title={pick(CATEGORY_LABEL[category], locale)} backHref="/" />
        <main className="no-nav situation">
          <div>
            <h1>{t("headline")}</h1>
            <p className="sub">{th("sub")}</p>
          </div>
          <div className="tiles sit-grid">
            {tiles.map(({ s, width, height }, i) => {
              const wide = tiles.length % 2 === 1 && i === tiles.length - 1;
              return (
                <StartIncident key={s} situation={s} className={wide ? "tile sit-tile sit-wide" : "tile sit-tile"}>
                  <img src={`/situation/${s}.webp`} width={width} height={height} alt="" />
                  <span className="body">
                    <span className="t">{t(`tile.${s}.t`)}</span>
                    <span className="d">{t(`tile.${s}.d`)}</span>
                  </span>
                  <Icon name="chevron-right" className="i go" />
                </StartIncident>
              );
            })}
          </div>
          {/* Not where the "don't know" case costs more than any tile (Ali, 2026-10-14); the categories and their reasons
              sit with NO_UNSURE in lib/situation-art.ts. */}
          {!NO_UNSURE.has(category) && (
            <StartIncident situation="unknown" className="sit-unsure">
              <Icon name="circle-help" />
              <span>{t("unsure")}</span>
            </StartIncident>
          )}
        </main>
      </>
    );
  }

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
