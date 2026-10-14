// Strings shared by every category: categories, situations, safety answers, feelings.
// tg: AI-written, verify: true until a native speaker reviewed them.

import type { Text } from "../items";
import type { Category, Feeling, SafetyAnswer, SituationId } from "../profile";

export const CATEGORY_DESCRIPTION: Record<Category, Text> = {
  fake_content: { ru: "Фейковое фото или видео, кто-то выдаёт себя за меня", tg: "Акс ё видеои қалбакӣ, касе худро ба ҷои ман муаррифӣ мекунад", verify: true },
  extortion: { ru: "Угрожают выложить фото, требуют деньги", tg: "Таҳдид мекунанд, ки аксро паҳн кунанд, пул талаб мекунанд", verify: true },
  fraud: { ru: "Просят деньги или код, подозрительная ссылка", tg: "Пул ё рамз мепурсанд, пайванди шубҳанок", verify: true },
  cyberbullying: { ru: "Унижают, пишут и не останавливаются, группа против меня", tg: "Таҳқир мекунанд, менависанд ва бас намекунанд, гурӯҳ зидди ман", verify: true },
  unknown: { ru: "", tg: "" },
};

export const SITUATION_LABEL: Record<SituationId, Text> = {
  fake_photo: { ru: "Кто-то сделал фейковое фото со мной", tg: "Касе бо ман акси қалбакӣ сохт", verify: true },
  fake_video: { ru: "Кто-то сделал фейковое видео со мной", tg: "Касе бо ман видеои қалбакӣ сохт", verify: true },
  impersonation: { ru: "Кто-то выдаёт себя за меня", tg: "Касе худро ба ҷои ман муаррифӣ мекунад", verify: true },
  threat_to_publish: { ru: "Угрожают выложить мои фото", tg: "Таҳдид мекунанд, ки аксҳоямро паҳн мекунанд", verify: true },
  demand_money_or_photos: { ru: "Требуют деньги или ещё фото", tg: "Пул ё боз акс талаб мекунанд", verify: true },
  profile_asks_money_or_code: { ru: "Профиль просит деньги или код", tg: "Профил пул ё рамз мепурсад", verify: true },
  already_sent: { ru: "Я уже отправил(а) деньги или код", tg: "Ман аллакай пул ё рамз фиристодам", verify: true },
  public_humiliation: { ru: "Унижают публично", tg: "Дар назди ҳама таҳқир мекунанд", verify: true },
  persistent_messages: { ru: "Пишут и не останавливаются", tg: "Менависанд ва бас намекунанд", verify: true },
  group_against_me: { ru: "Группа против меня", tg: "Гурӯҳ зидди ман", verify: true },
  unknown: { ru: "Не знаю, что произошло", tg: "Намедонам, чӣ шуд", verify: true },
};

export const SAFETY_QUESTION: Text = { ru: "Ты сейчас в безопасности?", tg: "Ту ҳоло дар амон ҳастӣ?", verify: true };
export const SAFETY_HINT: Text = { ru: "Это поможет понять, с чего начать.", tg: "Ин мефаҳмонад, ки аз чӣ оғоз кунем.", verify: true };
export const SAFETY_LABEL: Record<SafetyAnswer, Text> = {
  safe: { ru: "Да, я в безопасности", tg: "Ҳа, ман дар амонам", verify: true },
  threatened: { ru: "Мне угрожают", tg: "Ба ман таҳдид мекунанд", verify: true },
  unsure: { ru: "Не уверен(а)", tg: "Боварӣ надорам", verify: true },
  urgent: { ru: "Мне нужна срочная помощь", tg: "Ба ман кӯмаки таъҷилӣ лозим", verify: true },
};

export const FEELINGS_QUESTION: Text = { ru: "Как ты сейчас?", tg: "Ҳоло худро чӣ тавр ҳис мекунӣ?", verify: true };
export const FEELINGS_HINT: Text = { ru: "Можно не отвечать. Это только чтобы подобрать, что поможет.", tg: "Ҷавоб надодан мумкин аст. Ин танҳо барои он, ки чӣ кӯмак мекунад, интихоб кунем.", verify: true };
export const FEELING_LABEL: Record<Feeling, Text> = {
  scared: { ru: "Страшно", tg: "Метарсам", verify: true },
  anxious: { ru: "Тревожно", tg: "Ташвиш дорам", verify: true },
  angry: { ru: "Злюсь", tg: "Хашмгинам", verify: true },
  sad: { ru: "Грустно", tg: "Ғамгинам", verify: true },
  ashamed: { ru: "Стыдно", tg: "Шарм медорам", verify: true },
  overwhelmed: { ru: "Всё навалилось", tg: "Ҳама чиз якбора", verify: true },
  dont_know: { ru: "Не знаю", tg: "Намедонам", verify: true },
  prefer_not: { ru: "Не хочу отвечать", tg: "Ҷавоб додан намехоҳам", verify: true },
};

// Feelings whose reply on the Поддержка tab is the one-minute breathing (2026-10-14: anxious now gets one plan step).
export const BREATHE_FOR: ReadonlySet<Feeling> = new Set(["scared", "overwhelmed"]);

// The reply under the feelings grid on the Поддержка tab (Ali, 2026-10-14, after a safety / coping / honesty review):
// one reviewed line per feeling, never generated, and the app picks one action for it (apps/mobile/app/feelings).
// The ashamed reply is NOT_YOUR_FAULT plus the category's reviewed answer (SHAME_SILENT in content/signs.ts).
// tg: AI-written, verify. Wording about danger and feeling very bad: VERIFY with a child-protection professional.
export const FEELING_REPLY = {
  scared: { ru: "Страшно — это понятно. Давай сначала выдохнем.", tg: "Тарсидан фаҳмост. Биё аввал нафас ором кашем.", verify: true },
  overwhelmed: { ru: "Когда всего слишком много, не нужно решать всё сразу. Начни с одной минуты.", tg: "Вақте ки ҳама чиз аз ҳад зиёд аст, ҳамаашро якбора ҳал кардан лозим нест. Аз як дақиқа оғоз кун.", verify: true },
  sad: { ru: "Грусть не нужно прятать. Вот готовые слова — их можно отправить взрослому, которому доверяешь.", tg: "Ғамро пинҳон кардан лозим нест. Ана суханони тайёр — онҳоро ба калонсоле, ки ба ӯ бовар дорӣ, фиристодан мумкин аст.", verify: true },
  anxious: {
    step: { ru: "Тревожно, когда не знаешь, что будет дальше. Не нужно всё сразу — вот один шаг.", tg: "Вақте намедонӣ, ки баъд чӣ мешавад, ташвиш меоварад. Ҳамаашро якбора кардан лозим нест — ана як қадам.", verify: true },
    noCase: { ru: "Тревожно, когда не знаешь, что будет дальше. Можно разобраться по шагам.", tg: "Вақте намедонӣ, ки баъд чӣ мешавад, ташвиш меоварад. Метавон қадам ба қадам фаҳмид.", verify: true },
    allDone: { ru: "Все шаги плана уже отмечены. Можно просто выдохнуть.", tg: "Ҳамаи қадамҳои нақша аллакай қайд шудаанд. Метавонӣ танҳо нафас ором кашӣ.", verify: true },
  },
  angry: {
    withCase: { ru: "Злиться — нормально. Только не отвечай и не мсти — лучше сохрани доказательства.", tg: "Хашмгин шудан муқаррарист. Танҳо ҷавоб надеҳ ва интиқом нагир — беҳтараш далелҳоро нигоҳ дор.", verify: true },
    noCase: { ru: "Злиться — нормально. Только не отвечай и не мсти.", tg: "Хашмгин шудан муқаррарист. Танҳо ҷавоб надеҳ ва интиқом нагир.", verify: true },
  },
} satisfies Record<string, Text | Record<string, Text>>;

// On every feeling reply: the door to /urgent (quiet, or full-size on scared, extortion, or an unsafe safety answer).
export const FEELING_URGENT: Text = { ru: "Если тебе опасно или очень плохо прямо сейчас", tg: "Агар ҳозир ба ту хатар дорад ё хеле вазнин аст", verify: true };

export const NOT_YOUR_FAULT: Text = { ru: "Ты не виноват(а).", tg: "Ту гунаҳкор нестӣ.", verify: true };

// The ready message a kid can copy or share to a trusted adult. One per category where it differs.
export const ADULT_MESSAGE: Record<Category, Text> = {
  fake_content: { ru: "Мне нужна помощь. Кто-то выложил фейковое фото со мной. Я не знаю, что делать. Пожалуйста, не ругай меня.", tg: "Ба ман кӯмак лозим. Касе бо ман акси қалбакӣ паҳн кард. Намедонам, чӣ кор кунам. Лутфан, маро сарзаниш накун.", verify: true },
  extortion: { ru: "Мне нужна помощь. Меня шантажируют в интернете. Я не знаю, что делать. Пожалуйста, не ругай меня.", tg: "Ба ман кӯмак лозим. Дар интернет маро шантаж мекунанд. Намедонам, чӣ кор кунам. Лутфан, маро сарзаниш накун.", verify: true },
  fraud: { ru: "Мне нужна помощь. Кажется, меня обманули в интернете. Я не знаю, что делать. Пожалуйста, не ругай меня.", tg: "Ба ман кӯмак лозим. Гумон мекунам, маро дар интернет фиреб доданд. Намедонам, чӣ кор кунам. Лутфан, маро сарзаниш накун.", verify: true },
  cyberbullying: { ru: "Мне нужна помощь. Меня травят в интернете. Я не хочу, чтобы стало хуже — давай сначала просто поговорим.", tg: "Ба ман кӯмак лозим. Дар интернет маро таҳқир мекунанд. Намехоҳам бадтар шавад — биё аввал танҳо сӯҳбат кунем.", verify: true },
  unknown: { ru: "Мне нужна помощь. В интернете что-то случилось, и я не знаю, что делать. Пожалуйста, не ругай меня.", tg: "Ба ман кӯмак лозим. Дар интернет чизе рӯй дод ва намедонам, чӣ кор кунам. Лутфан, маро сарзаниш накун.", verify: true },
};
