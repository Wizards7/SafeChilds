// Category: вымогательство. Stop card first, then the plan; "tell an adult" moves up when ongoing or threatened.

import type { Item } from "../items";
import { ADULT_MESSAGE } from "./common";

const cat = { category: "extortion" } as const;

export const EXTORTION: readonly Item[] = [
  {
    kind: "stop",
    id: "ext.stop",
    showWhen: cat,
    title: { ru: "Стоп. Прямо сейчас:", tg: "Ист. Ҳозир:", verify: true },
    lines: [
      { ru: "Не плати", tg: "Пул напардоз", verify: true },
      { ru: "Не отправляй ничего", tg: "Ҳеҷ чиз нафирист", verify: true },
      { ru: "Не удаляй переписку", tg: "Мукотибаро нест накун", verify: true },
      { ru: "Не спорь с ним", tg: "Бо ӯ баҳс накун", verify: true },
      { ru: "Ты не виноват(а)", tg: "Ту гунаҳкор нестӣ", verify: true },
    ],
    note: { ru: "Шантаж не заканчивается после оплаты. Он заканчивается, когда ты перестаёшь отвечать и рассказываешь взрослому.", tg: "Шантаж пас аз пардохт тамом намешавад. Вақте тамом мешавад, ки ту ҷавоб доданро бас мекунӣ ва ба калонсол мегӯӣ.", verify: true },
  },
  {
    kind: "question",
    id: "ext.paid",
    showWhen: cat,
    text: { ru: "Ты уже заплатил(а) или отправил(а) что-то?", tg: "Ту аллакай пардохт кардӣ ё чизе фиристодӣ?", verify: true },
    hint: { ru: "Если да — это не конец. План будет другим, без упрёков.", tg: "Агар ҳа — ин охир нест. Нақша дигар мешавад, бе сарзаниш.", verify: true },
    answers: [
      { id: "yes", label: { ru: "Да", tg: "Ҳа", verify: true }, sets: { alreadyPaid: true }, next: "stop" },
      { id: "no", label: { ru: "Нет", tg: "Не", verify: true }, next: "stop" },
    ],
  },
  {
    kind: "urgent",
    id: "ext.urgent_line",
    showWhen: cat,
    text: { ru: "Это преступление против тебя, не твоя ошибка.", tg: "Ин ҷиноят бар зидди туст, на хатои ту.", verify: true },
  },
  {
    kind: "step",
    id: "ext.evidence",
    showWhen: cat,
    order: 10,
    title: { ru: "Сохрани доказательства", tg: "Далелҳоро нигоҳ дор", verify: true },
    how: { ru: "Скриншоты требований, имя аккаунта, реквизиты, которые он дал, даты. Не удаляй переписку — она нужна полиции.", tg: "Скриншоти талабҳо, номи ҳисоб, реквизитҳое, ки ӯ дод, санаҳо. Мукотибаро нест накун — ба милиса лозим аст.", verify: true },
  },
  {
    kind: "step",
    id: "ext.stop_talking",
    showWhen: cat,
    order: 20,
    title: { ru: "Прекрати общение, но не блокируй сразу", tg: "Муоширатро бас кун, аммо якбора баста накун", verify: true },
    why: { ru: "Сначала скриншоты, потом блокировка. Если заблокировать раньше, доказательства пропадут.", tg: "Аввал скриншотҳо, баъд бастан. Агар пештар баста кунӣ, далелҳо гум мешаванд.", verify: true },
  },
  // "Tell an adult" is step 2 when it is ongoing or the kid is threatened; otherwise it sits after reporting.
  {
    kind: "step",
    id: "ext.tell_adult_early",
    showWhen: { all: [cat, { any: [{ flag: "ongoing" }, { flag: "threatened" }, { safety: ["threatened", "unsure", "urgent"] }] }] },
    order: 15,
    title: { ru: "Расскажи взрослому сейчас", tg: "Ҳозир ба калонсол бигӯ", verify: true },
    how: { ru: "Не обязательно родителям. Тот, кому доверяешь.", tg: "Ҳатман ба волидайн не. Касе, ки бовар дорӣ.", verify: true },
    message: ADULT_MESSAGE.extortion,
  },
  {
    kind: "step",
    id: "ext.tell_adult",
    showWhen: { all: [cat, { not: { any: [{ flag: "ongoing" }, { flag: "threatened" }, { safety: ["threatened", "unsure", "urgent"] }] } }] },
    order: 50,
    title: { ru: "Расскажи взрослому", tg: "Ба калонсол бигӯ", verify: true },
    how: { ru: "Не обязательно родителям. Тот, кому доверяешь.", tg: "Ҳатман ба волидайн не. Касе, ки бовар дорӣ.", verify: true },
    message: ADULT_MESSAGE.extortion,
  },
  {
    kind: "step",
    id: "ext.report",
    showWhen: cat,
    order: 30,
    verifyOnDay: true,
    title: { ru: "Пожалуйся на платформе", tg: "Дар платформа шикоят кун", verify: true },
    how: { ru: "Причина: «шантаж» или «интимные изображения». Мы не обещаем, что контент удалят, но жалоба — это аргумент.", tg: "Сабаб: «шантаж» ё «тасвирҳои маҳрамона». Мо ваъда намедиҳем, ки мазмун нест мешавад, аммо шикоят далел аст.", verify: true },
  },
  {
    kind: "step",
    id: "ext.take_it_down",
    showWhen: { all: [cat, { flag: "intimate" }] },
    order: 35,
    verifyOnDay: true,
    title: { ru: "Take It Down", tg: "Take It Down", verify: true },
    // Nothing about this reaches a screen until VERIFY (works from Tajikistan; participating platforms) is done — plan 0001.
    how: { ru: "VERIFY: сервис NCMEC для несовершеннолетних. Создаёт отпечаток изображения на твоём телефоне, само фото никуда не уходит; платформы-участники блокируют его публикацию.", tg: "VERIFY: хидмати NCMEC барои ноболиғон. Дар телефони ту нақши тасвирро месозад, худи акс ба ҳеҷ ҷо намеравад; платформаҳои иштирокчӣ нашри онро мебанданд.", verify: true },
  },
  {
    kind: "step",
    id: "ext.helpline",
    showWhen: cat,
    order: 60,
    title: { ru: "Сообщи в службу помощи", tg: "Ба хадамоти кӯмак хабар деҳ", verify: true },
    how: { ru: "Номер появится после проверки командой. Пока — взрослый и список специалистов.", tg: "Рақам пас аз санҷиши даста пайдо мешавад. То он гоҳ — калонсол ва рӯйхати мутахассисон.", verify: true },
  },
  {
    kind: "step",
    id: "ext.already_paid",
    showWhen: { all: [cat, { flag: "alreadyPaid" }] },
    order: 5,
    title: { ru: "Не плати больше", tg: "Дигар напардоз", verify: true },
    why: { ru: "После оплаты не заканчивается — потребуют ещё. Те же шаги, без стыда.", tg: "Пас аз пардохт тамом намешавад — боз талаб мекунанд. Ҳамон қадамҳо, бе шарм.", verify: true },
  },
];
