// Learn the signs: что это · как это выглядит · почему ребёнок молчит, per category. From Home and the plan's
// "узнать больше" link, never a step in a journey. No incident is needed to read it.

import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ABOUT, CATEGORY_LABEL, SIGN_CATEGORIES, SIGNS, type SignCategory } from "@safechilds/guidance";
import { Icon } from "../../components/Icon";
import { SignCard } from "../../components/SignCard";
import { TopBar } from "../../components/TopBar";
import { pick, type Locale } from "../../lib/locale";
import "./signs.css";

export default async function SignsPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const category: SignCategory = (SIGN_CATEGORIES as readonly string[]).includes(c ?? "") ? (c as SignCategory) : "fake_content";
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("signs");
  const about = ABOUT[category];
  return (
    <>
      <TopBar title={t("title")} backHref="/" />
      <main>
        <nav className="chips" aria-label={t("categories")}>
          {SIGN_CATEGORIES.map((cat) => (
            <Link key={cat} className="chip" href={`/signs?c=${cat}`} aria-current={cat === category ? "page" : undefined}>
              {pick(CATEGORY_LABEL[cat], locale)}
            </Link>
          ))}
        </nav>

        <section className="about">
          <h2>{t("what")}</h2>
          <p>{pick(about.what, locale)}</p>
        </section>

        <section className="stack">
          <h2>{t("looks")}</h2>
          {SIGNS[category].map((card) => (
            <SignCard key={card.id} card={card} locale={locale} />
          ))}
        </section>

        <section className="silent" id="silent">
          <h2>{t("silent")}</h2>
          <ul>
            {about.silent.map((s, i) => (
              <li key={i}>
                <b>{pick(s.thought, locale)}</b>
                <span>{pick(s.answer, locale)}</span>
              </li>
            ))}
          </ul>
        </section>

        <Link className="option" href={`/situation?c=${category}`}>
          <span className="ic"><Icon name="circle-help" /></span>
          <span className="body"><span className="t">{t("start.title")}</span><span className="d">{t("start.sub")}</span></span>
          <Icon name="chevron-right" className="i chev" />
        </Link>
      </main>
    </>
  );
}
