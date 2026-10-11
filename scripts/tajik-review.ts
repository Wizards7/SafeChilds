// Collects every AI-written Tajik string next to its Russian source, for the native speaker's review.
// Sources: packages/guidance, packages/analysis, packages/directory (objects with verify: true), apps/bot UI strings
// (verify: true), and apps/mobile/messages (every key: the whole tg.json was written without a native speaker).
// Output: docs/tajik-review.csv (for a spreadsheet) and docs/tajik-review.md (the checklist), plus a JSON for the page.
// Run from the repo root: pnpm --filter @safechilds/backend exec tsx ../../scripts/tajik-review.ts

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as guidance from "../packages/guidance/src/index.ts";
import * as analysis from "../packages/analysis/src/index.ts";
import * as directory from "../packages/directory/src/index.ts";
import { UI } from "../apps/bot/src/render.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

interface Row {
  n: number;
  source: string;
  id: string;
  ru: string;
  tg: string;
}

const rows: Row[] = [];
const seenText = new Set<string>();

function add(source: string, id: string, ru: string, tg: string) {
  const key = `${ru}\u0000${tg}`;
  if (seenText.has(key)) return; // the same pair in two places is reviewed once
  seenText.add(key);
  rows.push({ n: rows.length + 1, source, id, ru, tg });
}

function walk(value: unknown, path: string, source: string, seen: Set<unknown>) {
  if (!value || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);
  const o = value as Record<string, unknown>;
  if (typeof o.ru === "string" && typeof o.tg === "string") {
    if (o.verify === true) add(source, path, o.ru, o.tg);
    return;
  }
  const prefix = typeof o.id === "string" ? o.id : path;
  for (const [k, v] of Object.entries(o)) walk(v, prefix ? `${prefix}.${k}` : k, source, seen);
}

for (const [source, mod] of [
  ["packages/guidance", guidance],
  ["packages/analysis", analysis],
  ["packages/directory", directory],
] as const) {
  const seen = new Set<unknown>();
  for (const [name, value] of Object.entries(mod)) walk(value, name, source, seen);
}
walk(UI, "UI", "apps/bot", new Set());

// Mobile messages: every key, flattened. A key missing in tg.json is a bug and is listed with an empty Tajik cell.
function flatten(o: Record<string, unknown>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(o)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out[key] = v;
    else if (v && typeof v === "object")
      Object.assign(out, flatten(v as Record<string, unknown>, key));
  }
  return out;
}
const ru = flatten(JSON.parse(readFileSync(resolve(root, "apps/mobile/messages/ru.json"), "utf8")));
const tg = flatten(JSON.parse(readFileSync(resolve(root, "apps/mobile/messages/tg.json"), "utf8")));
for (const [key, text] of Object.entries(ru)) add("apps/mobile/messages", key, text, tg[key] ?? "");

const counts = new Map<string, number>();
for (const r of rows) counts.set(r.source, (counts.get(r.source) ?? 0) + 1);

// CSV with a BOM so Excel and Google Sheets read the Cyrillic and the diacritics correctly.
const csvCell = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
const csv = [
  ["№", "Источник", "Ключ", "Русский", "Тоҷикӣ (черновик)", "Тоҷикӣ (исправлено)", "Комментарий"],
  ...rows.map((r) => [r.n, r.source, r.id, r.ru, r.tg, "", ""]),
]
  .map((line) => line.map(csvCell).join(","))
  .join("\n");
writeFileSync(resolve(root, "docs/tajik-review.csv"), "﻿" + csv + "\n");

const mdCell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");
const md = `# Проверка таджикского текста

**Для кого:** носитель таджикского языка из команды. **Срок:** до вечера воскресенья 12 октября, чтобы в понедельник всё было в приложении.
**Что это:** все строки, которые написал ИИ без носителя. Русский — источник смысла, таджикский — черновик. Всего строк: **${rows.length}**.

## Как проверять

1. Открой \`docs/tajik-review.csv\` в Google Sheets или Excel (или таблицу ниже).
2. Читай русский, потом таджикский. Если таджикский точен и звучит естественно для подростка 13–17 лет — оставь колонку «исправлено» пустой.
3. Если нет — напиши правильный вариант в колонку «Тоҷикӣ (исправлено)». Не меняй русский и не трогай колонку «Ключ».
4. Обращение: везде «ту», коротко, без канцелярита. Так же, как русский: «Сохрани скриншот», а не «Рекомендуется сохранить».
5. Проверь буквы ӣ ӯ ҳ қ ғ ҷ — ИИ иногда ставит русские буквы вместо таджикских.
6. Названия не переводим: Instagram, TikTok, Telegram, VK, Play Store, Take It Down, SafeChilds, @notoscam, Google Lens.
7. Строки с фигурными скобками вида \`{n}\`, \`{done, plural, …}\`, \`[1]\` — это код. Скобки и то, что внутри, оставляем как есть, переводим только слова вокруг. В \`[1]\`, \`[2]\` — номера маркеров, их положение в предложении можно менять.
8. Слова «VERIFY» в тексте — не переводить, это служебная пометка для команды.
9. Если фраза по смыслу неверна для Таджикистана (так не говорят, так не делают) — напиши это в «Комментарий», даже если перевод формально правильный.

## Откуда строки

| Источник | Что там | Строк |
|---|---|---|
| \`packages/guidance\` | категории, ситуации, вопросы, шаги плана, стоп-карточка, карточки «Узнать признаки», «почему молчат» | ${counts.get("packages/guidance") ?? 0} |
| \`packages/analysis\` | результаты проверки изображения и ссылки, «где смотреть», шесть признаков | ${counts.get("packages/analysis") ?? 0} |
| \`packages/directory\` | демо-карточки специалистов и службы помощи | ${counts.get("packages/directory") ?? 0} |
| \`apps/bot\` | тексты Telegram-бота | ${counts.get("apps/bot") ?? 0} |
| \`apps/mobile/messages\` | интерфейс приложения: кнопки, заголовки, подсказки, экран приватности | ${counts.get("apps/mobile/messages") ?? 0} |

Как вернуть: CSV обратно Али. Он вносит правки в код; \`verify: true\` снимается только с проверенных строк.
Обновить этот файл после правок: \`pnpm --filter @safechilds/backend exec tsx ../../scripts/tajik-review.ts\`.

## Все строки

| № | Источник | Ключ | Русский | Тоҷикӣ (черновик) |
|---|---|---|---|---|
${rows.map((r) => `| ${r.n} | ${r.source} | \`${r.id}\` | ${mdCell(r.ru)} | ${mdCell(r.tg)} |`).join("\n")}
`;
writeFileSync(resolve(root, "docs/tajik-review.md"), md);

writeFileSync(
  process.env.TAJIK_REVIEW_JSON ?? "/dev/null",
  JSON.stringify(
    {
      generated: new Date().toISOString().slice(0, 10),
      total: rows.length,
      counts: Object.fromEntries(counts),
      rows,
    },
    null,
    0,
  ),
);

console.log(`rows: ${rows.length}`);
for (const [s, c] of counts) console.log(`  ${s}: ${c}`);
const missing = Object.keys(ru).filter((k) => !(k in tg));
console.log(
  `tg.json keys missing: ${missing.length}${missing.length ? " → " + missing.join(", ") : ""}`,
);
