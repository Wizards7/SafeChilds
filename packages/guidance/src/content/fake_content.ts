// Category: поддельный контент. The demo path. Report taps carry verifyOnDay — the floater re-checks them on the demo day.

import type { Item } from "../items";
import { ADULT_MESSAGE } from "./common";

const cat = { category: "fake_content" } as const;

export const FAKE_CONTENT: readonly Item[] = [
  {
    kind: "question",
    id: "fake.analyze",
    showWhen: { situation: ["fake_photo", "fake_video"] },
    text: { ru: "Хочешь проверить изображение?", tg: "Мехоҳӣ тасвирро санҷӣ?", verify: true },
    hint: { ru: "Необязательно. План действий доступен и без этого.", tg: "Ҳатмӣ нест. Нақшаи амал бе ин ҳам дастрас аст.", verify: true },
    answers: [
      { id: "yes", label: { ru: "Да, проверить", tg: "Ҳа, санҷидан", verify: true }, next: "analyze" },
      { id: "no", label: { ru: "Нет, сразу к плану", tg: "Не, якбора ба нақша", verify: true }, next: "plan" },
    ],
  },
  {
    kind: "step",
    id: "fake.save_link",
    showWhen: cat,
    order: 10,
    title: { ru: "Сохрани ссылку на пост", tg: "Пайванди постро нигоҳ дор", verify: true },
    how: { ru: "Открой пост → три точки → «Копировать ссылку» → вставь в «Мой случай».", tg: "Постро кушо → се нуқта → «Нусхаи пайванд» → дар «Ҳолати ман» гузор.", verify: true },
    why: { ru: "Если пост удалят, ссылка останется доказательством.", tg: "Агар постро нест кунанд, пайванд далел мемонад.", verify: true },
  },
  {
    kind: "step",
    id: "fake.screenshot",
    showWhen: cat,
    order: 20,
    title: { ru: "Сделай скриншот", tg: "Скриншот гир", verify: true },
    how: { ru: "Пост целиком, имя аккаунта и дата должны быть видны. Хранится только на твоём телефоне.", tg: "Пости пурра, номи ҳисоб ва сана намоён бошанд. Танҳо дар телефони ту нигоҳ дошта мешавад.", verify: true },
  },
  {
    kind: "step",
    id: "fake.dont_reply",
    showWhen: cat,
    order: 30,
    title: { ru: "Не отвечай и не спорь", tg: "Ҷавоб надеҳ ва баҳс накун", verify: true },
    why: { ru: "Ответ — это то, чего они ждут. Молчание не слабость, это защита.", tg: "Ҷавоб ҳамон чизест, ки онҳо интизоранд. Хомӯшӣ заъф нест, ин муҳофизат аст.", verify: true },
  },
  {
    kind: "step",
    id: "fake.report.instagram",
    showWhen: { all: [cat, { platform: "instagram" }] },
    order: 40,
    verifyOnDay: true,
    title: { ru: "Пожалуйся в Instagram", tg: "Ба Instagram шикоят кун", verify: true },
    how: { ru: "Три точки над постом → «Пожаловаться» → «Фото или видео со мной» → «Поддельное изображение». Мы не обещаем, что пост удалят, но жалоба — это аргумент.", tg: "Се нуқта болои пост → «Шикоят» → «Акс ё видео бо ман» → «Тасвири қалбакӣ». Мо ваъда намедиҳем, ки постро нест мекунанд, аммо шикоят далел аст.", verify: true },
  },
  {
    kind: "step",
    id: "fake.report.tiktok",
    showWhen: { all: [cat, { platform: "tiktok" }] },
    order: 40,
    verifyOnDay: true,
    title: { ru: "Пожалуйся в TikTok", tg: "Ба TikTok шикоят кун", verify: true },
    how: { ru: "Удержи видео или нажми «Поделиться» → «Пожаловаться» → «Выдача себя за другого» или «Поддельный контент».", tg: "Видеоро нигоҳ дор ё «Мубодила» → «Шикоят» → «Худро ба ҷои дигар муаррифӣ кардан» ё «Мазмуни қалбакӣ».", verify: true },
  },
  {
    kind: "step",
    id: "fake.report.telegram",
    showWhen: { all: [cat, { platform: "telegram" }] },
    order: 40,
    verifyOnDay: true,
    title: { ru: "Пожалуйся в Telegram", tg: "Ба Telegram шикоят кун", verify: true },
    how: { ru: "Открой профиль или канал → три точки → «Пожаловаться» → выбери причину. Для каналов можно написать @notoscam.", tg: "Профил ё каналро кушо → се нуқта → «Шикоят» → сабабро интихоб кун. Барои каналҳо ба @notoscam навиштан мумкин.", verify: true },
  },
  {
    kind: "step",
    id: "fake.report.vk",
    showWhen: { all: [cat, { platform: "vk" }] },
    order: 40,
    verifyOnDay: true,
    title: { ru: "Пожалуйся во ВКонтакте", tg: "Ба ВКонтакте шикоят кун", verify: true },
    how: { ru: "Три точки у записи → «Пожаловаться» → «Оскорбление» или «Фейк».", tg: "Се нуқта дар назди навишта → «Шикоят» → «Таҳқир» ё «Қалбакӣ».", verify: true },
  },
  {
    kind: "step",
    id: "fake.restrict.instagram",
    showWhen: { all: [cat, { platform: "instagram" }] },
    order: 50,
    title: { ru: "Ограничь аккаунт", tg: "Ҳисобро маҳдуд кун", verify: true },
    how: { ru: "Профиль → три точки → «Ограничить». Он не узнает. Его комментарии будут видны только ему.", tg: "Профил → се нуқта → «Маҳдуд кардан». Ӯ намефаҳмад. Шарҳҳояш танҳо ба худаш намоён мешаванд.", verify: true },
  },
  {
    kind: "step",
    id: "fake.block",
    showWhen: { all: [cat, { not: { platform: "instagram" } }] },
    order: 50,
    title: { ru: "Заблокируй аккаунт", tg: "Ҳисобро баста кун", verify: true },
    how: { ru: "После скриншотов, не раньше.", tg: "Пас аз скриншотҳо, на пештар.", verify: true },
  },
  {
    kind: "step",
    id: "fake.tell_adult",
    showWhen: cat,
    order: 60,
    title: { ru: "Расскажи взрослому", tg: "Ба калонсол бигӯ", verify: true },
    how: { ru: "Не обязательно родителям. Учитель, старший брат или сестра, тётя — тот, кому доверяешь.", tg: "Ҳатман ба волидайн не. Муаллим, бародар ё хоҳари калонӣ, хола — касе, ки бовар дорӣ.", verify: true },
    message: ADULT_MESSAGE.fake_content,
  },
];
