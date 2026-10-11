"use client";

// One learn-the-signs card: a mock that looks ordinary, a "what is wrong here?" button, then numbered markers on the mock
// and the explanation under each number. Nothing is stored; the reveal is local state.

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { splitMarkers, type MockLine, type SignCard as Card } from "@safechilds/guidance";
import { pick, type Locale } from "../lib/locale";

function Marked({ text, on }: { text: string; on: boolean }) {
  return (
    <>
      {splitMarkers(text).map((p, i) =>
        typeof p === "number" ? (on ? <span key={i} className="mk" aria-hidden="true">{p}</span> : null) : <span key={i}>{p}</span>,
      )}
    </>
  );
}

// Marker positions on the drawn photo, in % of the frame: hands, window line, shirt text, hair edge.
const PHOTO_MARKS: [number, number][] = [
  [38, 84],
  [84, 22],
  [50, 64],
  [50, 14],
];

function PhotoMock({ on, n }: { on: boolean; n: number }) {
  return (
    <div className="mock mock-photo" aria-hidden="true">
      <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="150" fill="#e2e8f0" />
        <path d="M150 0v150M130 0v150M110 10h90M110 40h90M110 70h90" stroke="#cbd5e1" strokeWidth="2" fill="none" />
        <path d="M150 85c-8 8-8 20 0 30" stroke="#cbd5e1" strokeWidth="2" fill="none" />
        <path d="M40 150c0-30 20-45 60-45s60 15 60 45z" fill="#94a3b8" />
        <rect x="80" y="110" width="40" height="12" rx="2" fill="#cbd5e1" />
        <path d="M84 116h32" stroke="#64748b" strokeWidth="3" strokeDasharray="5 3" />
        <circle cx="100" cy="60" r="28" fill="#94a3b8" />
        <path d="M72 55c0-20 12-32 28-32s28 12 28 32" fill="#475569" />
        <path d="M60 150c-6-14 0-26 12-30M140 150c6-14 0-26-12-30" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" fill="none" />
      </svg>
      {on && PHOTO_MARKS.slice(0, n).map(([x, y], i) => (
        <span key={i} className="mark" style={{ left: `${x}%`, top: `${y}%` }}>{i + 1}</span>
      ))}
    </div>
  );
}

function Mock({ card, locale, on }: { card: Card; locale: Locale; on: boolean }) {
  if (card.mock.kind === "photo") return <PhotoMock on={on} n={card.signs.length} />;
  const line = (l: MockLine, i: number) => (
    <div key={i} className={`line${l.who ? ` ${l.who}` : ""}`}>
      <Marked text={pick(l.text, locale)} on={on} />
    </div>
  );
  if (card.mock.kind === "profile") {
    const [head, ...rest] = card.mock.lines;
    return (
      <div className={`mock mock-${card.mock.kind}`}>
        <div className="phead">
          <span className="avatar" aria-hidden="true" />
          <div className="line">{head && <Marked text={pick(head.text, locale)} on={on} />}</div>
        </div>
        {rest.map((l, i) => line(l, i + 1))}
      </div>
    );
  }
  return <div className={`mock mock-${card.mock.kind}`}>{card.mock.lines.map(line)}</div>;
}

export function SignCard({ card, locale }: { card: Card; locale: Locale }) {
  const t = useTranslations("signs");
  const [on, setOn] = useState(false);
  const listId = useId();
  return (
    <article className="sign">
      <h3>{pick(card.title, locale)}</h3>
      <Mock card={card} locale={locale} on={on} />
      <button type="button" className="btn btn-secondary reveal" aria-expanded={on} aria-controls={listId} onClick={() => setOn((v) => !v)}>
        {on ? t("hide") : t("reveal")}
      </button>
      <ol id={listId} className="signs" hidden={!on}>
        {card.signs.map((s, i) => (
          <li key={i}>
            <span className="mk" aria-hidden="true">{i + 1}</span>
            <span>{pick(s, locale)}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}
