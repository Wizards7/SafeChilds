// Helpline candidates. Numbers stay null and nothing renders until a team member has CALLED the line and set
// verifiedBy + verifiedAt (plan 0001 § VERIFY). The candidates come from the organizers' example app (Лупа),
// which itself says "verified from open sources, re-verify before the demo".

import type { Helpline } from "./types";

export const HELPLINES: readonly Helpline[] = [
  {
    id: "mvd-trust",
    name: { ru: "Телефон доверия МВД", tg: "Телефони боварии ВКД", verify: true },
    number: null,
    hours: null,
    languages: ["tg", "ru"],
    categories: ["extortion", "fraud"],
    verifiedBy: null,
    verifiedAt: null,
    note: { ru: "VERIFY: кандидат 1919 / +992 37 221-21-21 — шантаж, угрозы, мошенничество, взлом. Позвонить, записать часы и языки.", tg: "VERIFY", verify: true },
  },
  {
    id: "national-trust",
    name: { ru: "Национальный телефон доверия", tg: "Телефони боварии миллӣ", verify: true },
    number: null,
    hours: null,
    languages: ["tg", "ru"],
    categories: ["extortion", "cyberbullying", "fake_content"],
    verifiedBy: null,
    verifiedAt: null,
    note: { ru: "VERIFY: кандидат 1313 (Комитет по делам женщин и семьи). Позвонить, записать часы, языки, принимают ли подростков.", tg: "VERIFY", verify: true },
  },
  {
    id: "police",
    name: { ru: "Милиция (срочно)", tg: "Милиса (фаврӣ)", verify: true },
    number: null,
    hours: null,
    languages: ["tg", "ru"],
    categories: ["extortion"],
    verifiedBy: null,
    verifiedAt: null,
    note: { ru: "VERIFY: кандидат 102.", tg: "VERIFY", verify: true },
  },
  {
    id: "violence-centre-dushanbe",
    name: { ru: "Центр помощи пострадавшим от насилия (Душанбе)", tg: "Маркази кӯмак ба ҷабрдидагони зӯроварӣ (Душанбе)", verify: true },
    number: null,
    hours: null,
    languages: ["tg", "ru"],
    categories: ["extortion", "cyberbullying"],
    verifiedBy: null,
    verifiedAt: null,
    note: { ru: "VERIFY: кандидаты +992 37 233-33-53, +992 48 888-07-07. Позвонить, уточнить, работают ли с несовершеннолетними.", tg: "VERIFY", verify: true },
  },
];
