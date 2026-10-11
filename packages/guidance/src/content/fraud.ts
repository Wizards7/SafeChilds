// Category: мошенничество. Two doors: a profile asks for money or a code (link check offered first), or the kid already
// sent something (bank first, no shame). Report taps carry verifyOnDay. Bank hotline numbers (Alif, Eskhata, Амонатбанк,
// Душанбе Сити) are a VERIFY item in plan 0001 § 9 and never appear here until a human called them.

import type { Item } from "../items";
import type { ShowWhen } from "../showWhen";
import { ADULT_MESSAGE } from "./common";

const cat: ShowWhen = { category: "fraud" };
// The kid came in through "I already sent money or a code", or the flag was set later (the bot may set it).
const sent: ShowWhen = { any: [{ situation: "already_sent" }, { flag: "alreadySent" }] };
const notSent: ShowWhen = { not: sent };

export const FRAUD: readonly Item[] = [
  {
    kind: "question",
    id: "fraud.link",
    showWhen: { situation: "profile_asks_money_or_code" },
    text: { ru: "Тебе прислали ссылку?", tg: "Ба ту пайванд фиристоданд?", verify: true },
    hint: { ru: "Её можно проверить, не открывая. Необязательно — план доступен и без этого.", tg: "Онро бе кушодан санҷидан мумкин аст. Ҳатмӣ нест — нақша бе ин ҳам дастрас аст.", verify: true },
    answers: [
      { id: "yes", label: { ru: "Да, проверить ссылку", tg: "Ҳа, пайвандро санҷидан", verify: true }, next: "link" },
      { id: "no", label: { ru: "Нет, сразу к плану", tg: "Не, якбора ба нақша", verify: true }, next: "plan" },
    ],
  },
  {
    kind: "urgent",
    id: "fraud.urgent_line",
    showWhen: cat,
    text: { ru: "Это обман, а не твоя глупость. Так ловят и взрослых.", tg: "Ин фиреб аст, на нодонии ту. Калонсолонро ҳам ҳамин тавр фиреб медиҳанд.", verify: true },
  },

  // Door 1: nothing sent yet.
  {
    kind: "step",
    id: "fraud.dont_send",
    showWhen: { all: [cat, notSent] },
    order: 10,
    title: { ru: "Не отправляй ничего", tg: "Ҳеҷ чиз нафирист", verify: true },
    how: { ru: "Ни деньги, ни код из СМС, ни фото, ни данные карты. Код из СМС не сообщают никому — даже «банку».", tg: "На пул, на рамз аз СМС, на акс, на маълумоти корт. Рамзи СМС-ро ба ҳеҷ кас намегӯянд — ҳатто ба «бонк».", verify: true },
    why: { ru: "Настоящий банк, магазин или друг никогда не просят код в переписке.", tg: "Бонки аслӣ, мағоза ё дӯст ҳеҷ гоҳ дар мукотиба рамз намепурсанд.", verify: true },
  },
  {
    kind: "step",
    id: "fraud.save",
    showWhen: cat,
    order: 20,
    title: { ru: "Сохрани доказательства", tg: "Далелҳоро нигоҳ дор", verify: true },
    how: { ru: "Скриншоты профиля и переписки, реквизиты, которые он дал, ссылки, даты. Не удаляй чат. Хранится только на твоём телефоне.", tg: "Скриншоти профил ва мукотиба, реквизитҳое, ки ӯ дод, пайвандҳо, санаҳо. Чатро нест накун. Танҳо дар телефони ту нигоҳ дошта мешавад.", verify: true },
    why: { ru: "Без скриншотов платформе и милиции нечего показать.", tg: "Бе скриншотҳо ба платформа ва милиса чизе нишон додан мумкин нест.", verify: true },
  },

  // Door 2: already sent. Bank first, then the rest; no shame anywhere.
  {
    kind: "step",
    id: "fraud.dont_send_more",
    showWhen: { all: [cat, sent] },
    order: 5,
    title: { ru: "Не отправляй больше", tg: "Дигар нафирист", verify: true },
    why: { ru: "Тот, кто получил деньги или код, попросит ещё — «чтобы вернуть», «чтобы разблокировать». Это продолжение обмана, а не выход.", tg: "Касе, ки пул ё рамзро гирифт, боз мепурсад — «барои баргардонидан», «барои кушодан». Ин идомаи фиреб аст, на роҳи ҳал.", verify: true },
  },
  {
    kind: "step",
    id: "fraud.bank",
    showWhen: { all: [cat, sent] },
    order: 10,
    title: { ru: "Позвони в банк и заблокируй карту", tg: "Ба бонк занг зан ва кортро баста кун", verify: true },
    how: { ru: "Номер есть на обратной стороне карты и в приложении банка. Скажи: «Я отправил(а) код или перевод мошеннику, заблокируйте карту». Если карта родителей — позвони вместе с ними.", tg: "Рақам дар пушти корт ва дар барномаи бонк ҳаст. Бигӯ: «Ман ба қаллоб рамз ё интиқол фиристодам, кортро баста кунед». Агар корти волидайн бошад — якҷоя бо онҳо занг зан.", verify: true },
    why: { ru: "Чем раньше позвонить, тем меньше успеют снять.", tg: "Ҳар қадар зудтар занг занӣ, ҳамон қадар камтар гирифта метавонанд.", verify: true },
  },
  {
    kind: "step",
    id: "fraud.passwords",
    showWhen: { all: [cat, sent] },
    order: 15,
    verifyOnDay: true,
    title: { ru: "Смени пароль там, где был этот код", tg: "Дар он ҷое, ки рамз буд, паролро иваз кун", verify: true },
    how: { ru: "Telegram: Настройки → Конфиденциальность → Активные сеансы → «Завершить все другие сеансы», потом включи облачный пароль. Instagram, почта, игры: смени пароль и выйди со всех устройств.", tg: "Telegram: Танзимот → Махфият → Сеансҳои фаъол → «Ҳамаи сеансҳои дигарро қатъ кардан», баъд пароли абриро фаъол кун. Instagram, почта, бозиҳо: паролро иваз кун ва аз ҳамаи дастгоҳҳо баро.", verify: true },
    why: { ru: "Код из СМС — это ключ от аккаунта. Пока пароль старый, ключ у них.", tg: "Рамзи СМС калиди ҳисоб аст. То пароли кӯҳна бошад, калид дар дасти онҳост.", verify: true },
  },
  {
    kind: "step",
    id: "fraud.tell_adult_now",
    showWhen: { all: [cat, sent] },
    order: 25,
    title: { ru: "Расскажи взрослому сейчас", tg: "Ҳозир ба калонсол бигӯ", verify: true },
    how: { ru: "Не обязательно родителям — тот, кому доверяешь. С банком и милицией проще говорить вместе со взрослым.", tg: "Ҳатман ба волидайн не — касе, ки бовар дорӣ. Бо бонк ва милиса якҷоя бо калонсол гап задан осонтар аст.", verify: true },
    message: ADULT_MESSAGE.fraud,
  },

  // Report, per platform. Reason: мошенничество / спам. The floater re-checks the taps on the demo day.
  {
    kind: "step",
    id: "fraud.report.instagram",
    showWhen: { all: [cat, { platform: "instagram" }] },
    order: 40,
    verifyOnDay: true,
    title: { ru: "Пожалуйся в Instagram", tg: "Ба Instagram шикоят кун", verify: true },
    how: { ru: "Профиль → три точки → «Пожаловаться» → «Мошенничество или обман». Мы не обещаем, что аккаунт заблокируют, но жалоба — это аргумент.", tg: "Профил → се нуқта → «Шикоят» → «Қаллобӣ ё фиреб». Мо ваъда намедиҳем, ки ҳисобро мебанданд, аммо шикоят далел аст.", verify: true },
  },
  {
    kind: "step",
    id: "fraud.report.tiktok",
    showWhen: { all: [cat, { platform: "tiktok" }] },
    order: 40,
    verifyOnDay: true,
    title: { ru: "Пожалуйся в TikTok", tg: "Ба TikTok шикоят кун", verify: true },
    how: { ru: "Профиль → «Поделиться» → «Пожаловаться» → «Мошенничество».", tg: "Профил → «Мубодила» → «Шикоят» → «Қаллобӣ».", verify: true },
  },
  {
    kind: "step",
    id: "fraud.report.telegram",
    showWhen: { all: [cat, { platform: "telegram" }] },
    order: 40,
    verifyOnDay: true,
    title: { ru: "Пожалуйся в Telegram", tg: "Ба Telegram шикоят кун", verify: true },
    how: { ru: "Профиль → три точки → «Пожаловаться» → «Спам» или «Мошенничество». На каналы и ботов можно пожаловаться через @notoscam.", tg: "Профил → се нуқта → «Шикоят» → «Спам» ё «Қаллобӣ». Ба каналҳо ва ботҳо тавассути @notoscam шикоят кардан мумкин.", verify: true },
  },
  {
    kind: "step",
    id: "fraud.report.vk",
    showWhen: { all: [cat, { platform: "vk" }] },
    order: 40,
    verifyOnDay: true,
    title: { ru: "Пожалуйся во ВКонтакте", tg: "Ба ВКонтакте шикоят кун", verify: true },
    how: { ru: "Профиль → три точки → «Пожаловаться» → «Мошенничество».", tg: "Профил → се нуқта → «Шикоят» → «Қаллобӣ».", verify: true },
  },
  {
    kind: "step",
    id: "fraud.block",
    showWhen: cat,
    order: 50,
    title: { ru: "Заблокируй аккаунт", tg: "Ҳисобро баста кун", verify: true },
    how: { ru: "После скриншотов, не раньше.", tg: "Пас аз скриншотҳо, на пештар.", verify: true },
  },
  {
    kind: "step",
    id: "fraud.warn_friend",
    showWhen: cat,
    order: 55,
    title: { ru: "Если писали с аккаунта друга — предупреди его", tg: "Агар аз ҳисоби дӯст навишта бошанд — ӯро огоҳ кун", verify: true },
    how: { ru: "Позвони или напиши в другом мессенджере, не в том же чате: его аккаунт, скорее всего, взломали.", tg: "Занг зан ё дар мессенҷери дигар навис, на дар ҳамон чат: ҳисоби ӯро эҳтимол шикастаанд.", verify: true },
    why: { ru: "Пока он не знает, с его аккаунта пишут всем остальным.", tg: "То ӯ намедонад, аз ҳисобаш ба ҳамаи дигарон менависанд.", verify: true },
  },
  {
    kind: "step",
    id: "fraud.tell_adult",
    showWhen: { all: [cat, notSent] },
    order: 60,
    title: { ru: "Расскажи взрослому", tg: "Ба калонсол бигӯ", verify: true },
    how: { ru: "Не обязательно родителям. Тот, кому доверяешь.", tg: "Ҳатман ба волидайн не. Касе, ки бовар дорӣ.", verify: true },
    message: ADULT_MESSAGE.fraud,
  },
  {
    kind: "step",
    id: "fraud.police",
    showWhen: { all: [cat, sent] },
    order: 70,
    title: { ru: "Сообщи в милицию", tg: "Ба милиса хабар деҳ", verify: true },
    how: { ru: "Телефон доверия МВД появится здесь после проверки командой. Пока — взрослый и список специалистов.", tg: "Телефони боварии ВКД пас аз санҷиши даста дар ин ҷо пайдо мешавад. То он гоҳ — калонсол ва рӯйхати мутахассисон.", verify: true },
  },
];
