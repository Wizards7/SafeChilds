import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import "./privacy.css";

// Plain language. Every claim here must stay true in the app; the app's RULES.md is the contract behind it.
export default async function PrivacyPage() {
  const t = await getTranslations("privacy");
  const sections = [
    { icon: "lock", color: "var(--support)", title: t("noReg.title"), items: [t("noReg.a"), t("noReg.b")] },
    { icon: "folder", color: "var(--support)", title: t("onPhone.title"), items: [t("onPhone.a"), t("onPhone.b")] },
    { icon: "share", color: "var(--primary)", title: t("leaves.title"), items: [t("leaves.a"), t("leaves.b"), t("leaves.c"), t("leaves.d")] },
    { icon: "info", color: "var(--warning)", title: t("limits.title"), items: [t("limits.a"), t("limits.b"), t("limits.c")] },
  ];
  return (
    <>
      <TopBar title={t("title")} backHref="/" />
      <main>
        <h1>{t("headline")}</h1>
        {sections.map((s) => (
          <section key={s.title} className="card p">
            <div className="head"><Icon name={s.icon} className="i" /><span style={{ color: "var(--text)" }}>{s.title}</span></div>
            <ul>{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </section>
        ))}
        <div className="stack">
          <Link className="btn btn-secondary" href="/welcome">{t("about")}</Link>
          <Link className="btn btn-quiet danger" href="/incident">{t("deleteAll")}</Link>
        </div>
      </main>
    </>
  );
}
