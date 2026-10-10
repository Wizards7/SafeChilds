// What the kid reads: "what it is", "how to check it yourself", "what it means for the next step".
// Keyed by tier, evidence, indicator. tg: AI-written, verify until a native speaker reviewed.

import type { Evidence } from "./evidence";
import type { Indicator } from "./indicators";
import type { LinkTier } from "./links";
import type { Tier } from "./rules";

export interface Text {
  ru: string;
  tg: string;
  verify?: boolean;
}
export interface Explanation {
  what: Text;
  how?: Text;
  means?: Text;
  label: "fact" | "maybe";
}

export const TIER_TEXT: Record<Tier, { title: Text; body: Text }> = {
  evidence: {
    title: { ru: "Есть доказательства изменения", tg: "Далелҳои тағйир ҳастанд", verify: true },
    body: { ru: "Это можно проверить своими глазами. Ниже — где.", tg: "Инро бо чашми худ санҷидан мумкин аст. Дар поён — куҷо.", verify: true },
  },
  indicators: {
    title: { ru: "Есть признаки возможной подделки", tg: "Нишонаҳои қалбакии эҳтимолӣ ҳастанд", verify: true },
    body: { ru: "Это не доказательство. Посмотри сам(а) — вот где.", tg: "Ин далел нест. Худат бин — ана куҷо.", verify: true },
  },
  inconclusive: {
    title: { ru: "Не удалось определить", tg: "Муайян карда нашуд", verify: true },
    body: { ru: "Проверка не дала ответа. Это не значит, что фото настоящее. Посмотри сам(а) на шесть признаков.", tg: "Санҷиш ҷавоб надод. Ин маънои онро надорад, ки акс аслӣ аст. Худат ба шаш нишона нигоҳ кун.", verify: true },
  },
  unavailable: {
    title: { ru: "Проверка недоступна", tg: "Санҷиш дастнорас аст", verify: true },
    body: { ru: "Нет сети или сервис не ответил. То, что проверили на телефоне, ниже. Это не мешает сделать следующий шаг.", tg: "Шабака нест ё хидмат ҷавоб надод. Он чи дар телефон санҷида шуд, дар поён аст. Ин ба қадами навбатӣ халал намерасонад.", verify: true },
  },
};

export const ORIGINAL_MATCHES_TEXT = {
  title: { ru: "Совпадает с твоим оригиналом", tg: "Бо аслии ту мувофиқ аст", verify: true },
  body: { ru: "Это твоё настоящее фото, которое используют без разрешения. План для этого случая другой.", tg: "Ин акси аслии ту аст, ки бе иҷозат истифода мешавад. Нақша барои ин ҳолат дигар аст.", verify: true },
} as const;

export const EVIDENCE_TEXT: Record<Evidence, Explanation> = {
  c2pa_declares_generated: { label: "fact", what: { ru: "Подпись файла говорит: создано ИИ-инструментом", tg: "Имзои файл мегӯяд: бо абзори ИИ сохта шудааст", verify: true }, how: { ru: "Content Credentials можно проверить на contentcredentials.org/verify.", tg: "Content Credentials-ро дар contentcredentials.org/verify санҷидан мумкин.", verify: true }, means: { ru: "Это аргумент для жалобы на платформе.", tg: "Ин далел барои шикоят дар платформа аст.", verify: true } },
  c2pa_declares_edited: { label: "fact", what: { ru: "Подпись файла говорит: изображение редактировали", tg: "Имзои файл мегӯяд: тасвир таҳрир шудааст", verify: true }, how: { ru: "Content Credentials можно проверить на contentcredentials.org/verify.", tg: "Content Credentials-ро дар contentcredentials.org/verify санҷидан мумкин.", verify: true }, means: { ru: "Это аргумент для жалобы на платформе.", tg: "Ин далел барои шикоят дар платформа аст.", verify: true } },
  exif_contradiction: { label: "fact", what: { ru: "Данные файла противоречат друг другу", tg: "Маълумоти файл ба ҳамдигар мухолифанд", verify: true }, how: { ru: "Свойства файла → поле «Software» или размеры, которых не бывает у телефонных камер.", tg: "Хусусиятҳои файл → майдони «Software» ё андозаҳое, ки дар камераи телефон намешаванд.", verify: true }, means: { ru: "Сохрани это в доказательства.", tg: "Инро дар далелҳо нигоҳ дор.", verify: true } },
  original_differs: { label: "fact", what: { ru: "Отличается от твоего оригинала", tg: "Аз аслии ту фарқ мекунад", verify: true }, how: { ru: "Положи рядом — вот что изменили.", tg: "Паҳлӯи ҳам гузор — ана чиро тағйир доданд.", verify: true }, means: { ru: "Самое сильное доказательство: его поймёт любой взрослый.", tg: "Қавитарин далел: онро ҳар калонсол мефаҳмад.", verify: true } },
  exif_stripped: { label: "fact", what: { ru: "Метаданные удалены", tg: "Метамаълумот нест шудааст", verify: true }, how: { ru: "Свойства файла → нет данных о камере и дате. У фото с телефона они есть почти всегда, но платформы тоже их удаляют.", tg: "Хусусиятҳои файл → маълумоти камера ва сана нест. Дар акси телефон онҳо қариб ҳамеша ҳастанд, аммо платформаҳо ҳам онҳоро нест мекунанд.", verify: true } },
  exif_present: { label: "fact", what: { ru: "Метаданные на месте", tg: "Метамаълумот дар ҷояш аст", verify: true } },
  c2pa_absent: { label: "fact", what: { ru: "Content Credentials не найдены", tg: "Content Credentials ёфт нашуд", verify: true } },
  original_matches: { label: "fact", what: { ru: "Совпадает с оригиналом", tg: "Бо аслӣ мувофиқ аст", verify: true } },
};

export const INDICATOR_TEXT: Record<Indicator, Explanation> = {
  face_boundary: { label: "maybe", what: { ru: "Граница лица и волос", tg: "Ҳудуди рӯй ва мӯй", verify: true }, how: { ru: "Приблизь здесь: у настоящего фото волосы не сливаются с фоном ровной линией.", tg: "Ин ҷоро наздик кун: дар акси аслӣ мӯй бо замина бо хати рост намепайвандад.", verify: true } },
  lighting_mismatch: { label: "maybe", what: { ru: "Тень не совпадает со светом", tg: "Соя бо рӯшноӣ мувофиқ нест", verify: true }, how: { ru: "Откуда падает свет и куда ложится тень — должно совпадать.", tg: "Рӯшноӣ аз куҷо меафтад ва соя ба куҷо — бояд мувофиқ бошад.", verify: true } },
  hands_or_fingers: { label: "maybe", what: { ru: "Пальцы", tg: "Ангуштон", verify: true }, how: { ru: "Посчитай их. Сгенерированные изображения часто ошибаются в руках.", tg: "Онҳоро ҳисоб кун. Тасвирҳои сохташуда дар дастҳо зуд-зуд хато мекунанд.", verify: true } },
  text_or_logo_artifacts: { label: "maybe", what: { ru: "Текст или логотип на фоне", tg: "Матн ё логотип дар замина", verify: true }, how: { ru: "Буквы «плывут» или не читаются — частый признак генерации.", tg: "Ҳарфҳо «шино мекунанд» ё хонда намешаванд — нишонаи зуд-зуди сохтан.", verify: true } },
  background_warp: { label: "maybe", what: { ru: "Искажённый фон", tg: "Заминаи таҳрифшуда", verify: true }, how: { ru: "Прямые линии (двери, окна, плитка) изгибаются рядом с лицом.", tg: "Хатҳои рост (дарҳо, тирезаҳо, сафолак) дар назди рӯй хам мешаванд.", verify: true } },
  skin_too_smooth: { label: "maybe", what: { ru: "Слишком гладкая кожа", tg: "Пӯсти аз ҳад ҳамвор", verify: true }, how: { ru: "Нет пор и мелких деталей там, где у обычного фото они есть.", tg: "Дар ҷойҳое, ки дар акси оддӣ ҳастанд, сӯрохчаҳо ва ҷузъиёти хурд нест.", verify: true } },
};

export const SELF_CHECK_SIGNS: Text[] = [
  { ru: "Руки и пальцы: число, форма", tg: "Дастҳо ва ангуштон: шумора, шакл", verify: true },
  { ru: "Граница волос и фона", tg: "Ҳудуди мӯй ва замина", verify: true },
  { ru: "Тени и источник света", tg: "Сояҳо ва манбаи рӯшноӣ", verify: true },
  { ru: "Текст и логотипы на фоне", tg: "Матн ва логотипҳо дар замина", verify: true },
  { ru: "Слишком гладкая кожа, нет мелких деталей", tg: "Пӯсти аз ҳад ҳамвор, ҷузъиёти хурд нест", verify: true },
  { ru: "Поиск по картинке: появлялось ли раньше", tg: "Ҷустуҷӯ бо тасвир: оё пештар буд", verify: true },
];

export const REVERSE_SEARCH: Explanation = {
  label: "maybe",
  what: { ru: "Поиск по картинке", tg: "Ҷустуҷӯ бо тасвир", verify: true },
  how: { ru: "Google Объектив или Яндекс → загрузи изображение. Если оно появлялось раньше с другим лицом — это подделка.", tg: "Google Lens ё Яндекс → тасвирро бор кун. Агар пештар бо рӯи дигар буд — ин қалбакӣ аст.", verify: true },
};

export const LINK_TIER_TEXT: Record<LinkTier, { title: Text; body: Text }> = {
  known_dangerous: {
    title: { ru: "Известная опасная ссылка", tg: "Пайванди хатарноки маълум", verify: true },
    body: { ru: "Она есть в списке опасных сайтов. Не открывай.", tg: "Он дар рӯйхати сомонаҳои хатарнок ҳаст. Накушо.", verify: true },
  },
  signs: {
    title: { ru: "Есть признаки обмана", tg: "Нишонаҳои фиреб ҳастанд", verify: true },
    body: { ru: "В списках опасных её нет, но вот что мы увидели.", tg: "Дар рӯйхати хатарнок нест, аммо ана чӣ дидем.", verify: true },
  },
  nothing_known: {
    title: { ru: "Ничего известного не найдено", tg: "Чизи маълум ёфт нашуд", verify: true },
    body: { ru: "Это не значит, что ссылка безопасна. Новые обманы появляются раньше, чем попадают в списки.", tg: "Ин маънои онро надорад, ки пайванд бехатар аст. Фиребҳои нав пеш аз он ки ба рӯйхатҳо расанд, пайдо мешаванд.", verify: true },
  },
  unavailable: {
    title: { ru: "Проверка недоступна", tg: "Санҷиш дастнорас аст", verify: true },
    body: { ru: "Нет сети или сервис не ответил. Правила ниже работают без проверки.", tg: "Шабака нест ё хидмат ҷавоб надод. Қоидаҳои поён бе санҷиш кор мекунанд.", verify: true },
  },
};
