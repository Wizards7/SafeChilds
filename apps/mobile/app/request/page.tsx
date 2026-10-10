"use client";

// The contact request: the minimum a professional needs to reach the kid. Asked only here, only on the second path.
// PROTOTYPE in the hackathon: validated on the device, shown back masked, never sent, never stored (plan 0001).

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import "./request.css";

type Kind = "phone" | "telegram";
interface Form {
  name: string;
  kind: Kind;
  contact: string;
  lang: "tg" | "ru";
  age: "under_18" | "18_24";
  format: "online" | "in_person";
  when: string;
  proxy: string;
  consent: boolean;
}

const PHONE = /^\+992\d{9}$/;
const TG = /^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/;

function mask(kind: Kind, v: string) {
  const s = v.trim();
  if (kind === "phone") return s.slice(0, 6) + "** *** " + s.slice(-2);
  return s.replace(/^@?/, "@").slice(0, 3) + "***";
}

export default function RequestPage() {
  const t = useTranslations("request");
  const params = useSearchParams();
  const who = params.get("p") ?? "";
  const [f, setF] = useState<Form>({ name: "", kind: "phone", contact: "", lang: "tg", age: "under_18", format: "online", when: "", proxy: "", consent: false });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [sent, setSent] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!f.name.trim()) e.name = t("err.name");
    const c = f.contact.trim().replace(/[\s-]/g, "");
    if (f.kind === "phone" ? !PHONE.test(c) : !TG.test(c)) e.contact = f.kind === "phone" ? t("err.phone") : t("err.telegram");
    if (!f.consent) e.consent = t("err.consent");
    setErrors(e);
    if (Object.keys(e).length === 0) setSent(true);
  };

  if (sent) {
    return (
      <>
        <TopBar title={t("title")} backHref="/people" />
        <main className="no-nav request">
          <div className="card card-support col"><div className="head"><Icon name="check" />{t("sent.title")}</div><p className="small body">{t("sent.body")}</p></div>
          <div className="preview">
            <div><b>{t("sent.name")}</b> {f.name.trim()}</div>
            <div><b>{t("sent.contact")}</b> {mask(f.kind, f.contact)} · {f.kind === "phone" ? t("kind.phone") : "Telegram"}</div>
            <div><b>{t("sent.lang")}</b> {f.lang === "tg" ? "тоҷикӣ" : "русский"}</div>
            <div><b>{t("sent.age")}</b> {t(`age.${f.age}`)}</div>
            <div><b>{t("sent.format")}</b> {t(`format.${f.format}`)}</div>
            {f.when.trim() && <div><b>{t("sent.when")}</b> {f.when.trim()}</div>}
            {f.proxy.trim() && <div><b>{t("sent.proxy")}</b> {f.proxy.trim()}</div>}
            <div><b>{t("sent.expires")}</b> {t("sent.expiresValue")}</div>
          </div>
          <p className="small">{t("sent.noPromise")}</p>
          <div className="stack">
            <Link className="btn btn-primary" href="/incident">{t("sent.back")}</Link>
            <Link className="btn btn-secondary" href="/people">{t("sent.self")}</Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar title={t("title")} backHref="/people" />
      <main className="no-nav request">
        <div className="card card-warning col"><div className="head"><Icon name="info" />{t("proto.title")}</div><p className="small body">{t("proto.body")}</p></div>
        {Object.keys(errors).length > 0 && <div className="banner error" role="alert"><Icon name="triangle-alert" />{t("err.summary")}</div>}
        <p className="small">{t("intro", { who })}</p>

        <div className={`field${errors.name ? " has-error" : ""}`}>
          <label htmlFor="name">{t("name")} <span className="opt">{t("nameHint")}</span></label>
          <input id="name" type="text" autoComplete="nickname" value={f.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>

        <div className={`field${errors.contact ? " has-error" : ""}`}>
          <span className="label">{t("contact")}</span>
          <div className="seg" role="group" aria-label={t("contact")}>
            <button type="button" aria-pressed={f.kind === "phone"} onClick={() => set("kind", "phone")}>{t("kind.phone")}</button>
            <button type="button" aria-pressed={f.kind === "telegram"} onClick={() => set("kind", "telegram")}>Telegram</button>
          </div>
          <input type={f.kind === "phone" ? "tel" : "text"} inputMode={f.kind === "phone" ? "tel" : "text"} autoComplete={f.kind === "phone" ? "tel" : "username"} placeholder={f.kind === "phone" ? "+992" : "@username"} value={f.contact} onChange={(e) => set("contact", e.target.value)} aria-label={t("contact")} aria-invalid={!!errors.contact} />
          {errors.contact && <div className="error">{errors.contact}</div>}
        </div>

        <div className="field"><span className="label">{t("lang")}</span><div className="grid2"><button type="button" className="btn btn-secondary" aria-pressed={f.lang === "tg"} onClick={() => set("lang", "tg")}>Тоҷикӣ</button><button type="button" className="btn btn-secondary" aria-pressed={f.lang === "ru"} onClick={() => set("lang", "ru")}>Русский</button></div></div>
        <div className="field"><span className="label">{t("ageLabel")}</span><div className="grid2"><button type="button" className="btn btn-secondary" aria-pressed={f.age === "under_18"} onClick={() => set("age", "under_18")}>{t("age.under_18")}</button><button type="button" className="btn btn-secondary" aria-pressed={f.age === "18_24"} onClick={() => set("age", "18_24")}>{t("age.18_24")}</button></div></div>
        <div className="field"><span className="label">{t("formatLabel")}</span><div className="grid2"><button type="button" className="btn btn-secondary" aria-pressed={f.format === "online"} onClick={() => set("format", "online")}>{t("format.online")}</button><button type="button" className="btn btn-secondary" aria-pressed={f.format === "in_person"} onClick={() => set("format", "in_person")}>{t("format.in_person")}</button></div></div>

        <div className="field"><label htmlFor="when">{t("when")} <span className="opt">{t("optional")}</span></label><input id="when" type="text" value={f.when} onChange={(e) => set("when", e.target.value)} /></div>
        <div className="field"><label htmlFor="proxy">{t("proxy")} <span className="opt">{t("proxyHint")}</span></label><input id="proxy" type="text" value={f.proxy} onChange={(e) => set("proxy", e.target.value)} /></div>

        <div className={`consent${errors.consent ? " has-error" : ""}`}>
          <input id="ok" type="checkbox" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} aria-invalid={!!errors.consent} />
          <label htmlFor="ok">{errors.consent ?? t("consent")}</label>
        </div>

        <button className="btn btn-support" onClick={submit}>{t("submit")}</button>
        <Link className="btn btn-quiet" href="/people">{t("self")}</Link>
      </main>
    </>
  );
}
