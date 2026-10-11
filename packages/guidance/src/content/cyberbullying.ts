// Category: травля. One skeleton for the three situations; the one question ("один раз или продолжается?") and the safety
// answer decide the weight. "Tell an adult" is step 2 when ongoing or threatened. The support side (feelings, breathe,
// people with the school psychologist first) is the app's flow, not an item here. Report taps carry verifyOnDay.

import type { Item } from "../items";
import type { ShowWhen } from "../showWhen";
import { ADULT_MESSAGE } from "./common";

const cat: ShowWhen = { category: "cyberbullying" };
const heavy: ShowWhen = { any: [{ flag: "ongoing" }, { flag: "threatened" }, { safety: ["threatened", "unsure", "urgent"] }] };

export const CYBERBULLYING: readonly Item[] = [
  {
    kind: "question",
    id: "cb.ongoing",
    showWhen: cat,
    text: { ru: "Это один раз или продолжается?", tg: "Ин як бор буд ё идома дорад?", verify: true },
    hint: { ru: "От этого зависит, что делать первым. Неправильного ответа нет.", tg: "Аз ин вобаста аст, ки аввал чӣ кор кунем. Ҷавоби нодуруст нест.", verify: true },
    answers: [
      { id: "once", label: { ru: "Один раз", tg: "Як бор", verify: true }, next: "plan" },
      { id: "ongoing", label: { ru: "Продолжается", tg: "Идома дорад", verify: true }, sets: { ongoing: true }, next: "plan" },
    ],
  },
  {
    kind: "urgent",
    id: "cb.urgent_line",
    showWhen: cat,
    text: { ru: "Угрозы — это уже не «шутки». Ты не виноват(а), и тебе не нужно справляться с этим в одиночку.", tg: "Таҳдид дигар «шӯхӣ» нест. Ту гунаҳкор нестӣ ва набояд бо ин танҳо мубориза барӣ.", verify: true },
  },
  {
    kind: "step",
    id: "cb.dont_reply",
    showWhen: cat,
    order: 10,
    title: { ru: "Не отвечай и не мсти", tg: "Ҷавоб надеҳ ва интиқом нагир", verify: true },
    why: { ru: "Ответ — это то, чего они ждут. Молчание не слабость, это защита.", tg: "Ҷавоб ҳамон чизест, ки онҳо интизоранд. Хомӯшӣ заъф нест, ин муҳофизат аст.", verify: true },
  },
  {
    kind: "step",
    id: "cb.save",
    showWhen: cat,
    order: 20,
    title: { ru: "Сохрани всё", tg: "Ҳамаашро нигоҳ дор", verify: true },
    how: { ru: "Скриншоты сообщений и комментариев, название группы, имена аккаунтов, даты. До того, как выйти из группы или что-то удалить. Хранится только на твоём телефоне.", tg: "Скриншоти паёмҳо ва шарҳҳо, номи гурӯҳ, номи ҳисобҳо, санаҳо. Пеш аз он ки аз гурӯҳ бароӣ ё чизе нест кунӣ. Танҳо дар телефони ту нигоҳ дошта мешавад.", verify: true },
    why: { ru: "Без скриншотов взрослым и платформе нечего показать — а сообщения они удалят.", tg: "Бе скриншотҳо ба калонсолон ва платформа чизе нишон додан мумкин нест — паёмҳоро онҳо нест мекунанд.", verify: true },
  },
  // "Tell an adult" is step 2 when it is ongoing or the kid is threatened; otherwise it sits after reporting.
  {
    kind: "step",
    id: "cb.tell_adult_early",
    showWhen: { all: [cat, heavy] },
    order: 15,
    title: { ru: "Расскажи взрослому сейчас", tg: "Ҳозир ба калонсол бигӯ", verify: true },
    how: { ru: "Часто это учитель или школьный психолог — те, кто травит, обычно одноклассники. Не обязательно родителям.", tg: "Аксар вақт ин муаллим ё равоншиноси мактаб аст — онҳое, ки таҳқир мекунанд, одатан ҳамсинфонанд. Ҳатман ба волидайн не.", verify: true },
    why: { ru: "Когда это продолжается, само оно не заканчивается.", tg: "Вақте ки идома дорад, худ аз худ тамом намешавад.", verify: true },
    message: ADULT_MESSAGE.cyberbullying,
  },
  {
    kind: "step",
    id: "cb.tell_adult",
    showWhen: { all: [cat, { not: heavy }] },
    order: 60,
    title: { ru: "Расскажи взрослому", tg: "Ба калонсол бигӯ", verify: true },
    how: { ru: "Часто это учитель или школьный психолог — те, кто травит, обычно одноклассники. Не обязательно родителям.", tg: "Аксар вақт ин муаллим ё равоншиноси мактаб аст — онҳое, ки таҳқир мекунанд, одатан ҳамсинфонанд. Ҳатман ба волидайн не.", verify: true },
    message: ADULT_MESSAGE.cyberbullying,
  },
  {
    kind: "step",
    id: "cb.restrict.instagram",
    showWhen: { all: [cat, { platform: "instagram" }] },
    order: 30,
    verifyOnDay: true,
    title: { ru: "Ограничь, не только блокируй", tg: "Маҳдуд кун, на танҳо баста кун", verify: true },
    how: { ru: "Профиль → три точки → «Ограничить». Он не узнает: его комментарии увидит только он сам, а сообщения уйдут в запросы.", tg: "Профил → се нуқта → «Маҳдуд кардан». Ӯ намефаҳмад: шарҳҳояшро танҳо худаш мебинад, паёмҳояш ба дархостҳо мераванд.", verify: true },
    why: { ru: "Блокировку он заметит и может завести новый аккаунт. Ограничение — тихое.", tg: "Бастанро ӯ мефаҳмад ва метавонад ҳисоби нав кушояд. Маҳдудият хомӯшона аст.", verify: true },
  },
  {
    kind: "step",
    id: "cb.block",
    showWhen: { all: [cat, { not: { platform: "instagram" } }] },
    order: 30,
    title: { ru: "Заблокируй или отключи уведомления", tg: "Баста кун ё огоҳиҳоро хомӯш кун", verify: true },
    how: { ru: "После скриншотов, не раньше. Если блокировка подтолкнёт его писать с других аккаунтов — сначала просто отключи уведомления от чата.", tg: "Пас аз скриншотҳо, на пештар. Агар бастан ӯро водор кунад, ки аз ҳисобҳои дигар нависад — аввал танҳо огоҳиҳои чатро хомӯш кун.", verify: true },
  },
  {
    kind: "step",
    id: "cb.group",
    showWhen: { situation: "group_against_me" },
    order: 35,
    verifyOnDay: true,
    title: { ru: "Пожалуйся на группу, потом выйди", tg: "Ба гурӯҳ шикоят кун, баъд баро", verify: true },
    how: { ru: "Сначала скриншоты. Потом открой группу → название или три точки → «Пожаловаться». Если группа создана против тебя — жалуйся на всю группу, не на одно сообщение. Выходи только после этого.", tg: "Аввал скриншотҳо. Баъд гурӯҳро кушо → ном ё се нуқта → «Шикоят». Агар гурӯҳ зидди ту сохта шуда бошад — ба тамоми гурӯҳ шикоят кун, на ба як паём. Танҳо пас аз ин баро.", verify: true },
    why: { ru: "Не рассчитывай на админа — часто это тот, кто и начал.", tg: "Ба админ умед набанд — аксар вақт маҳз ӯ оғоз кардааст.", verify: true },
  },

  // Report, per platform. Reason: травля / преследование. The floater re-checks the taps on the demo day.
  {
    kind: "step",
    id: "cb.report.instagram",
    showWhen: { all: [cat, { platform: "instagram" }] },
    order: 40,
    verifyOnDay: true,
    title: { ru: "Пожалуйся в Instagram", tg: "Ба Instagram шикоят кун", verify: true },
    how: { ru: "Три точки у комментария или профиля → «Пожаловаться» → «Травля или преследование». Мы не обещаем, что контент удалят, но жалоба — это аргумент.", tg: "Се нуқта дар назди шарҳ ё профил → «Шикоят» → «Таҳқир ё таъқиб». Мо ваъда намедиҳем, ки мазмун нест мешавад, аммо шикоят далел аст.", verify: true },
  },
  {
    kind: "step",
    id: "cb.report.tiktok",
    showWhen: { all: [cat, { platform: "tiktok" }] },
    order: 40,
    verifyOnDay: true,
    title: { ru: "Пожалуйся в TikTok", tg: "Ба TikTok шикоят кун", verify: true },
    how: { ru: "Удержи комментарий или открой профиль → «Пожаловаться» → «Преследование и травля».", tg: "Шарҳро нигоҳ дор ё профилро кушо → «Шикоят» → «Таъқиб ва таҳқир».", verify: true },
  },
  {
    kind: "step",
    id: "cb.report.telegram",
    showWhen: { all: [cat, { platform: "telegram" }] },
    order: 40,
    verifyOnDay: true,
    title: { ru: "Пожалуйся в Telegram", tg: "Ба Telegram шикоят кун", verify: true },
    how: { ru: "Открой профиль или группу → три точки → «Пожаловаться» → «Оскорбления» или «Другое» и опиши в двух словах.", tg: "Профил ё гурӯҳро кушо → се нуқта → «Шикоят» → «Таҳқир» ё «Дигар» ва бо ду калима тасвир кун.", verify: true },
  },
  {
    kind: "step",
    id: "cb.report.vk",
    showWhen: { all: [cat, { platform: "vk" }] },
    order: 40,
    verifyOnDay: true,
    title: { ru: "Пожалуйся во ВКонтакте", tg: "Ба ВКонтакте шикоят кун", verify: true },
    how: { ru: "Три точки у комментария или профиля → «Пожаловаться» → «Оскорбление».", tg: "Се нуқта дар назди шарҳ ё профил → «Шикоят» → «Таҳқир».", verify: true },
  },
  {
    kind: "step",
    id: "cb.photo",
    showWhen: { situation: "public_humiliation" },
    order: 45,
    title: { ru: "Если выложили твоё фото — пожалуйся на само фото", tg: "Агар аксатро паҳн карда бошанд — ба худи акс шикоят кун", verify: true },
    how: { ru: "Причина: «фото без моего согласия» или «интимные изображения». Не пересылай его никому, даже чтобы показать — лучше скриншот поста с именем аккаунта.", tg: "Сабаб: «акс бе розигии ман» ё «тасвирҳои маҳрамона». Онро ба ҳеҷ кас нафирист, ҳатто барои нишон додан — беҳтар скриншоти пост бо номи ҳисоб.", verify: true },
    why: { ru: "Это отдельная жалоба: на фото, а не на слова.", tg: "Ин шикояти алоҳида аст: ба акс, на ба суханҳо.", verify: true },
  },
];
