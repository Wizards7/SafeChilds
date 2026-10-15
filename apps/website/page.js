// SafeChilds v2 page code. The engine (scrollcraft.js) stays untouched; this file adds
// the language switch, the route nav, and the signature move: the plan writes itself
// as the reader scrolls the pinned #plan act (driven off the act's --sc-p).
// Demo content is copied from packages/guidance (ru + tg). Nothing is stored or sent.

(function () {
  "use strict";
  document.documentElement.classList.add("js");

  // The deployed PWA (CLAUDE.md, status 2026-10-11).
  var APP = "https://mobile-production-ea38.up.railway.app";

  // ---------- strings: ru is read from the HTML; tg is an AI draft, to be checked ----------
  var TG = {
    skip: "Ба мундариҷа гузаштан",
    routeLabel: "Масири саҳифа",
    rProb: "Мушкилот", rSol: "Ҳал", rPlan: "Намуна", rPrivacy: "Махфият", rFaq: "Саволҳо",
    helpNow: "Кӯмак ҳозир",
    ctaOpen: "Барномаро кушо",
    eyebrow: "Дастгирии наврасон дар интернет · Тоҷикистон",
    h1a: "Нороҳат шудӣ?",
    h1b1: "Аз", h1b2: "як қадам", h1b3: " оғоз мекунем.",
    lead: "Таҳқир, шантаж, фиреб ё қалбакӣ: SafeChilds мегӯяд, ки баъд чӣ кор кунӣ.",
    ctaExample: "Намунаро дидан",
    factNoReg: "Бе бақайдгирӣ",
    factLang: "Бо забони русӣ ва тоҷикӣ",
    factLangShort: "RU · TJ",
    coverT: "Нақшаи худ барои 4 ҳолат", coverD: "Бе бақайдгирӣ · бо забони русӣ ва тоҷикӣ",
    heroMsg: "Касе бо ман акси қалбакӣ паҳн кард.",
    heroStep: "Пайванди постро нигоҳ дор",
    lFake: "Қалбакӣ", lExt: "Шантаж", lFraud: "Фиреб", lBully: "Таҳқир",
    cFake: "Мазмуни қалбакӣ", cExt: "Тамаъҷӯӣ", cFraud: "Фиреб", cBully: "Таҳқир",
    // problems: "что это" and "почему молчат" follow packages/guidance ABOUT (tg there is also a draft)
    probKicker: "Мушкилот",
    probTitle: "Наврасон дар интернет бо чӣ рӯ ба рӯ мешаванд",
    probBody: "Ва чаро аксар вақт дар ин бора хомӯш мемонанд.",
    whySilent: "Чаро хомӯшанд",
    pFakeD: "Акс, видео ё профил бо номи ту, ки онро каси дигар сохтааст. Барои ин як барномаи ройгон ва панҷ дақиқа кифоя аст.",
    pExtD: "Таҳдид мекунанд, ки аксҳоятро паҳн мекунанд ва пул ё аксҳои нав талаб мекунанд. Бо вақт фишор меоранд: «як соат дорӣ».",
    pFraudD: "Пул, рамз аз СМС ё паролро мегиранд: кристаллҳои «ройгон», «дӯст» мепурсад, ки фавран интиқол кунӣ.",
    pBullyD: "Дашном медиҳанд, овоза паҳн мекунанд, аз гурӯҳҳо хориҷ мекунанд, ва ин такрор мешавад. Телефон таҳқирро ба хона меорад.",
    pFakeQ: "«Ба касе нишон додан шарм аст»", pExtQ: "«Худам гунаҳкорам»", pFraudQ: "«Шарм аст, ки фирефта шудам»", pBullyQ: "«Танҳо бадтар мешавад»",
    pEndT: "Дар натиҷа наврас бо ин танҳо мемонад.",
    pEndD: "Метарсад, шарм медорад, намедонад аз куҷо оғоз кунад ва ба кӣ гӯяд.",
    pEndGo: "SafeChilds чӣ тавр кӯмак мекунад",
    // solution
    solKicker: "Ҳал дар барнома", solTabsLabel: "Мушкилот",
    s1T: "Санҷиши акс нишон медиҳад, ки куҷо нигоҳ кунӣ",
    s1a: "Дар акс ҷойҳоеро қайд мекунад, ки шояд нишонаҳои қалбакӣ дошта бошанд.",
    s1b: "Бе ҳукми «қалбакӣ» ва бе фоиз: танҳо «куҷо нигоҳ кардан» ва чӣ тавр худат санҷидан.",
    s1c: "Баъд нақша барои платформа: Instagram, TikTok, Telegram, VK.",
    s1q: "Скриншотро бо номи ҳисоб нишон додан мумкин аст, на худи аксро. Калонсоле, ки бовар дорӣ, сарзаниш намекунад.",
    s2T: "Аввал «ист», баъд нақша",
    s2a: "Корти «ист» барои даҳ сония: пул напардоз, ҳеҷ чиз нафирист, мукотибаро нест накун.",
    s2b: "Баъд бо тартиб: далелҳоро нигоҳ дор, шикоят кун, ба калонсол бигӯ.",
    s2c: "«Ба ман вазнин аст»: як дақиқа нафаскашӣ, агар душвор шавад.",
    s2q: "Гунаҳкор касест, ки таҳдид мекунад. Бовар кардан ҷиноят нест.",
    s3T: "Санҷиши пайванд бе кушодани он",
    s3a: "Пайвандро барнома дар тарафи худ мекушояд. Ба ту кушодан лозим нест.",
    s3b: "Агар аллакай пул ё рамз фиристода бошӣ, нақша дигар мешавад.",
    s3c: "Намунаҳои таълимӣ: «Ройгон» барои парол, «Ман аз бонк, рамзро бигӯед».",
    s3q: "Калонсолонро ҳам ҳамин тавр фиреб медиҳанд. Фиреб касби касест, на нодонии ту.",
    s4T: "Аввал савол: як бор ё идома дорад?",
    s4a: "Аз ҷавоб вобаста аст, ки аввал чӣ кор кунӣ.",
    s4b: "Ҳамаашро нигоҳ дор, маҳдуд ё баста кун, ба гурӯҳ шикоят кун.",
    s4c: "Паёми тайёр барои калонсол: «биё аввал танҳо сӯҳбат кунем».",
    s4q: "Бадтар вақте мешавад, ки касе бас намекунад. Калонсоле, ки сарзаниш намекунад, — ин истодан аст.",
    kidLabel: "Фикри наврас", replies: "ҷавоб медиҳад",
    k1: "Ба касе нишон додан шарм аст", k2: "Худам гунаҳкорам", k3: "Шарм аст, ки фирефта шудам", k4: "Танҳо бадтар мешавад",
    solOpen: "Дар барнома кушодан",
    solUnsure: "Намедонӣ, ки кадомаш? Бо суханони худ нақл кун",
    quietTitle: "Ҳамаашро якбора ҳал кардан лозим нест.",
    p1: "Ҳолатро интихоб кун",
    p2: "Санҷ, ки кӯмаки таъҷилӣ лозим аст ё не",
    p3: "Нақша гир",
    p4: "Муроҷиат ба калонсолро омода кун",
    demoTag: "Намунаи таълимӣ",
    switchLabel: "Намунаи ҳолат",
    tabFake: "Акси қалбакӣ", tabLink: "Пайванди шубҳанок", tabBully: "Таҳқир", tabExt: "Шантаж",
    cap1: "Ту менависӣ, ки чӣ шуд.",
    cap2: "Аввал: ту дар амон ҳастӣ?",
    cap3: "Баъд: се қадам. Иҷрошударо қайд кун.",
    cap4: "Ва суханони тайёр барои калонсол.",
    cardYou: "Ту менависӣ",
    ansSafe: "Ҳа, ман дар амонам", ansThreat: "Ба ман таҳдид мекунанд", ansUnsure: "Боварӣ надорам", ansUrgent: "Ба ман кӯмаки таъҷилӣ лозим",
    safetyQ: "Ту ҳоло дар амон ҳастӣ?",
    copy: "Матнро нусха бардор",
    checkHead: "Санҷиши тасвир", scrHelp: "Кӯмак", scrWhere: "Куҷо нигоҳ кардан", checkAlt: "Намунаи таълимӣ: рӯе, ки ИИ сохтааст, бо ду аломат",
    checkModel: "Дар тасвир нишонаҳоро меҷӯем…",
    checkTier: "Нишонаҳои қалбакии эҳтимолӣ ҳастанд", checkTierD: "Ин далел нест. Худат бин — ана куҷо.",
    ind1: "Ҳудуди рӯй ва мӯй", ind1how: "Ин ҷоро наздик кун: дар акси аслӣ мӯй бо замина бо хати рост намепайвандад.",
    ind2: "Заминаи таҳрифшуда", ind2how: "Хатҳои рост (дарҳо, тирезаҳо, сафолак) дар назди рӯй хам мешаванд.",
    maybe: "эҳтимол",
    demoOpen: "Ин сенарияро кушо",
    toolsTitle: "Боз якчанд абзор",
    toolsBody: "Онҳо ҳатмӣ нестанд: нақша бе онҳо ҳам дастрас аст.",
    t1: "Санҷиши тасвир",
    t1d: "Нишонаҳои тағйиротро нишон медиҳад ва мефаҳмонад, ки куҷо нигоҳ кунӣ. Ҳукми «аслӣ ё қалбакӣ» намебарорад.",
    t1m: "JPEG, PNG, WebP · то 8 МБ",
    vizWhere: "Нишон медиҳад, ки куҷо нигоҳ кунӣ",
    vizNoVerdict: "Бе ҳукми «қалбакӣ» ё «аслӣ»",
    sg1: "Салом! Ин ту дар ин акс?", sg2: "bit.ly/3x… худат бин", sg3: "Танҳо зудтар, то нест накардаанд",
    sgNote: "Пайванди кӯтоҳшуда ё сомонаи бегона: мақсад — ки ту пахш кунӣ ва парол ворид кунӣ.",
    linkCheck: "Санҷиш бе кушодан",
    breatheIn: "Нафас гир", breatheOut: "Нафас барор",
    t2: "Санҷиши пайванд",
    t2d: "Бе он ки худат онро кушоӣ. Агар нишонаҳои хатарнок набошанд, ин маънои бехатар будани пайвандро надорад.",
    t3: "Намунаҳои таълимӣ", t3d: "Нишонаҳои фиреб ва таҳқир дар мисолҳо.",
    t4: "Як дақиқа нафаскашӣ", t4d: "Танаффуси кӯтоҳ, вақте ки ҳама чиз аз ҳад зиёд аст.",
    prTitle: "Ҳолати ту дар дастгоҳи ту нигоҳ дошта мешавад.",
    pr1: "Ҳолат, далелҳои нигоҳдошташуда ва қадамҳои иҷрошуда дар ҳамин дастгоҳ нигоҳ дошта мешаванд. Бақайдгирӣ лозим нест.",
    pr2: "Агар ту санҷиши тасвир, пайванд ё тавсифи ҳолатро оғоз кунӣ, маълумоти дахлдор барои коркард фиристода мешавад. Барнома дар ин бора пешакӣ хабар медиҳад.",
    prLink: "Бештар дар бораи махфият",
    qKicker: "Ба наздикӣ дар барнома", qTitle: "Ҳама чизи муҳим бо як ламс",
    qBody: "Тугмаи шинокунанда болои шабакаҳои иҷтимоӣ. Дар лента чизи бадро дидӣ — пахш кун, ва дар назди ту кӯмак, санҷиши акс ва ҳолати ту ҳастанд.",
    qL1: "Барномаро ҷустан лозим нест: кӯмак дар ҳамон ҷо, ки ҳама чиз рӯй дод", qL2: "Тугмаро ба кунҷи қулай кашидан мумкин", qL3: "«Кӯмак ҳозир» ҳамеша дар ҷои аввал",
    qHint: "Тугмаро дар телефон пахш кун", igNew: "3 рӯз пеш сохта шуд", igCap: "Салом, ин ҳисоби нави ман, кӯҳнаро шикастанд. Илова кун!", qBtn: "Менюи зуд",
    qBreathe: "Нафаскашӣ", qPhoto: "Аксро санҷидан", qHome: "SafeChilds", qLink: "Пайвандро санҷидан",
    prP1T: "Ҳама чиз дар телефон мемонад", prP2T: "Санҷиш танҳо вақте ки худат онро оғоз мекунӣ",
    vCase: "Ҳолати ман", vLink: "Пайванди пост", vShot: "Скриншот", vSteps: "Қадамҳои иҷрошуда",
    vHere: "Танҳо дар ҳамин телефон нигоҳ дошта мешавад", vNoId: "Бе ном, телефон ва акс ҳангоми ворид шудан",
    stageT: "Чӣ ҳоло ҳамчун прототип кор мекунад.",
    stageD: "Ҳоло феҳрист кортҳои демои мутахассисонро дорад. Шакли дархости тамос сенарияи ояндаро нишон медиҳад: дархост ба ҳеҷ ҷо фиристода намешавад.",
    faqTitle: "Саволҳои маъмул",
    q1: "Бақайдгирӣ лозим аст?", a1: "Не. Барнома ҳангоми ворид шудан ном, телефон ё аксро намепурсад.",
    q2: "SafeChilds-ро дар телефон чӣ тавр кушоям?", a2: "Ин барномаи веб аст: дар браузер кушода мешавад. Онро ба экрани асосӣ мисли барномаи оддӣ илова кардан мумкин аст.",
    q3: "Санҷиш қалбакиро аниқ муайян мекунад?", a3: "Не. Санҷиш нишонаҳои тағйирот ва маҳдудиятҳои худро нишон медиҳад, аммо ҷавоби кафолатноки «аслӣ» ё «қалбакӣ» намедиҳад. Нақшаи амал аз санҷиш вобаста нест.",
    q4: "Дар ин ҷо чат бо равоншинос ҳаст?", a4: "Не. «Бо суханони худ» қадамҳои тайёрро, ки одамон санҷидаанд, интихоб мекунад. Ин сӯҳбат бо одам нест. Феҳристи мутахассисон ҳоло кортҳои демо дорад.",
    q5: "Агар ба ман таҳдид кунанд, чӣ кор кунам?", a5: "Кӯмаки таъҷилиро кушо ва ба калонсоле, ки ба ӯ бовар дорӣ, бигӯ. Ту гунаҳкор нестӣ.",
    a5link: "Кӯмаки таъҷилӣ",
    finalTitle: "Аз як қадам оғоз кун.",
    qr: "Дар телефон кушо",
    qrHint: "Камераро ба код равона кун",
    qrAlt: "QR-код: SafeChilds-ро дар телефон кушо",
    footD: "Ба наврасон кӯмак мекунад, ки қадами навбатии бехатарро гузоранд ва ба калонсоле, ки ба ӯ бовар доранд, расанд.",
    footNav: "Пайвандҳо",
    footApp: "Барнома", footPrivacy: "Махфият", footSigns: "Нишонаҳои фиреб ва таҳқир"
  };

  var UI = {
    ru: { title: "SafeChilds · следующий понятный шаг", copy: "Скопировать текст", copied: "Скопировано", done: "Сделано", start: "С чего начать", stop: "Стоп. Прямо сейчас:", urgentGo: "Открыть срочную помощь", summary: "Три шага отмечены", summaryExt: "Стоп-лист прочитан", safe: "Да, я в безопасности", threat: "Мне угрожают", noteSafe: "Пример плана после проверки безопасности", noteExt: "При угрозах приложение сначала ведёт к срочной помощи" },
    tg: { title: "SafeChilds · қадами навбатии фаҳмо", copy: TG.copy, copied: "Нусха бардошта шуд", done: "Иҷро шуд", start: "Аз чӣ оғоз кунем", stop: "Ист. Ҳозир:", urgentGo: "Кӯмаки таъҷилиро кушо", summary: "Се қадам қайд шуд", summaryExt: "Рӯйхати «ист» хонда шуд", safe: "Ҳа, ман дар амонам", threat: "Ба ман таҳдид мекунанд", noteSafe: "Намунаи нақша пас аз санҷиши бехатарӣ", noteExt: "Ҳангоми таҳдид барнома аввал ба кӯмаки таъҷилӣ мебарад" }
  };

  // ---------- demo cases (packages/guidance) ----------
  function t(ru, tg) { return { ru: ru, tg: tg }; }
  var CASES = {
    fake: {
      href: "/situation?c=fake_content",
      msg: t("Кто-то выложил фейковое фото со мной.", "Касе бо ман акси қалбакӣ паҳн кард."),
      steps: [t("Сохрани ссылку на пост", "Пайванди постро нигоҳ дор"), t("Сделай скриншот", "Скриншот гир"), t("Не отвечай и не спорь", "Ҷавоб надеҳ ва баҳс накун")],
      adultT: t("Расскажи взрослому", "Ба калонсол бигӯ"),
      adult: t("Мне нужна помощь. Кто-то выложил фейковое фото со мной. Я не знаю, что делать. Пожалуйста, не ругай меня.", "Ба ман кӯмак лозим. Касе бо ман акси қалбакӣ паҳн кард. Намедонам, чӣ кор кунам. Лутфан, маро сарзаниш накун.")
    },
    link: {
      href: "/situation?c=fraud",
      msg: t("Профиль просит деньги или код и присылает ссылку.", "Профил пул ё рамз мепурсад ва пайванд мефиристад."),
      steps: [t("Не отправляй ничего", "Ҳеҷ чиз нафирист"), t("Сохрани доказательства", "Далелҳоро нигоҳ дор"), t("Заблокируй аккаунт", "Ҳисобро баста кун")],
      adultT: t("Расскажи взрослому", "Ба калонсол бигӯ"),
      adult: t("Мне нужна помощь. Кажется, меня обманули в интернете. Я не знаю, что делать. Пожалуйста, не ругай меня.", "Ба ман кӯмак лозим. Гумон мекунам, маро дар интернет фиреб доданд. Намедонам, чӣ кор кунам. Лутфан, маро сарзаниш накун.")
    },
    bully: {
      href: "/situation?c=cyberbullying",
      msg: t("Пишут и не останавливаются.", "Менависанд ва бас намекунанд."),
      steps: [t("Не отвечай и не мсти", "Ҷавоб надеҳ ва интиқом нагир"), t("Сохрани всё", "Ҳамаашро нигоҳ дор"), t("Заблокируй или отключи уведомления", "Баста кун ё огоҳиҳоро хомӯш кун")],
      adultT: t("Расскажи взрослому", "Ба калонсол бигӯ"),
      adult: t("Мне нужна помощь. Меня травят в интернете. Я не хочу, чтобы стало хуже — давай сначала просто поговорим.", "Ба ман кӯмак лозим. Дар интернет маро таҳқир мекунанд. Намехоҳам бадтар шавад — биё аввал танҳо сӯҳбат кунем.")
    },
    ext: {
      href: "/situation?c=extortion", threat: true,
      msg: t("Угрожают выложить мои фото.", "Таҳдид мекунанд, ки аксҳоямро паҳн мекунанд."),
      line: t("Это преступление против тебя, не твоя ошибка.", "Ин ҷиноят бар зидди туст, на хатои ту."),
      stop: [t("Не плати", "Пул напардоз"), t("Не отправляй ничего", "Ҳеҷ чиз нафирист"), t("Не удаляй переписку", "Мукотибаро нест накун"), t("Не спорь с ним", "Бо ӯ баҳс накун"), t("Ты не виноват(а)", "Ту гунаҳкор нестӣ")],
      adultT: t("Расскажи взрослому сейчас", "Ҳозир ба калонсол бигӯ"),
      adult: t("Мне нужна помощь. Меня шантажируют в интернете. Я не знаю, что делать. Пожалуйста, не ругай меня.", "Ба ман кӯмак лозим. Дар интернет маро шантаж мекунанд. Намедонам, чӣ кор кунам. Лутфан, маро сарзаниш накун.")
    }
  };

  var lang = "ru", current = "fake", RU = {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function L(x) { return x[lang] || x.ru; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function icon(id) { return '<svg class="ic" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

  $$("[data-app]").forEach(function (a) { a.href = APP + a.getAttribute("data-app"); });

  // ---------- language ----------
  var i18n = $$("[data-i18n]");
  i18n.forEach(function (el) { RU[el.getAttribute("data-i18n")] = el.textContent; });
  $$("[data-i18n-aria]").forEach(function (el) { RU[el.getAttribute("data-i18n-aria")] = el.getAttribute("aria-label"); });
  $$("[data-i18n-alt]").forEach(function (el) { RU[el.getAttribute("data-i18n-alt")] = el.getAttribute("alt"); });

  function setLang(next) {
    lang = next === "tg" ? "tg" : "ru";
    var d = lang === "tg" ? TG : RU;
    i18n.forEach(function (el) { var k = el.getAttribute("data-i18n"); if (d[k] != null) el.textContent = d[k]; });
    $$("[data-i18n-aria]").forEach(function (el) { var k = el.getAttribute("data-i18n-aria"); if (d[k]) el.setAttribute("aria-label", d[k]); });
    $$("[data-i18n-alt]").forEach(function (el) { var k = el.getAttribute("data-i18n-alt"); if (d[k]) el.setAttribute("alt", d[k]); });
    document.documentElement.lang = lang;
    document.title = UI[lang].title;
    $$(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang)); });
    renderCase();
    splitWords($(".quiet__title"));
  }
  $$(".lang button").forEach(function (b) { b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); }); });

  // the quiet line is revealed word by word; re-split after each language change
  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", words.join(" "));
    el.innerHTML = words.map(function (w, k) { return '<span class="w" aria-hidden="true" style="--k:' + k + '">' + esc(w) + "</span>"; }).join(" ");
  }

  // ---------- signature move: the plan writes itself ----------
  // A stack of four cards: as the pinned act advances, the next card slides to the front and
  // the earlier ones recede behind it. The title and the segmented bar on the left follow.
  // Driven off the act's --sc-p; nothing is stored or sent.
  var plan = $("#plan"), stack = $("#stack"), body = $("#s-body");
  var adultT = $("#s-adult-t"), adultMsg = $("#s-adult-msg"), planT = $("#s-plan-t");
  var note = $("#peak-note"), openLink = $("#peak-open");
  var cards = $$(".scard", stack), titles = $$("#titles .title"), segs = $$("#plan .segs i"), answers = $$("#answers li");

  // ACTIVE lists the cards in play, CARD_AT where each of them comes to the front; things inside a card fire
  // at a fraction of its window (data-rel).
  var ACTIVE = [0, 1, 2, 3], CARD_AT = [0, 0.22, 0.44, 0.7, 1];
  var DONE_REL = [0.25, 0.45, 0.65];
  function atFor(cardIdx, rel) { var k = ACTIVE.indexOf(cardIdx); return CARD_AT[k] + rel * (CARD_AT[k + 1] - CARD_AT[k]); }

  function renderCase() {
    var c = CASES[current], ui = UI[lang];
    $("#s-msg").textContent = L(c.msg);
    answers.forEach(function (li) {
      var pick = li.getAttribute("data-a") === (c.threat ? "threatened" : "safe");
      li.classList.toggle("is-picked", pick);
      li.classList.toggle("is-threat", pick && !!c.threat);
    });
    note.textContent = c.threat ? ui.noteExt : ui.noteSafe;
    openLink.href = APP + c.href;
    planT.textContent = c.threat ? ui.stop : ui.start;
    adultT.textContent = L(c.adultT);
    adultMsg.textContent = L(c.adult);
    var html;
    if (c.threat) {
      html = '<p class="urgent-box">' + icon("triangle-alert") + "<span>" + esc(L(c.line)) + "</span></p>" +
        '<ul class="stoplist">' + c.stop.map(function (s, i) {
          var last = i === c.stop.length - 1;
          return '<li data-rel="' + (0.15 + i * 0.12).toFixed(2) + '"' + (last ? ' class="is-kind"' : "") + ">" + icon(last ? "heart" : "x") + "<span>" + esc(L(s)) + "</span></li>";
        }).join("") + "</ul>" +
        '<a class="go-urgent" data-rel="0.77" href="' + APP + '/urgent"><span>' + esc(ui.urgentGo) + "</span>" + icon("chevron-right") + "</a>";
    } else {
      html = '<ol class="psteps">' + c.steps.map(function (s, i) {
        return '<li class="pstep" data-done="' + atFor(2, DONE_REL[i]).toFixed(3) + '"><span class="pbox">' + icon("check") + '</span><span class="pstep__t">' + esc(L(s)) + "</span></li>";
      }).join("") + "</ol>";
    }
    body.innerHTML = html;
    // turn each card's relative moments into points on the act's timeline, number the cards in play
    cards.forEach(function (card, i) {
      $$("[data-rel]", card).forEach(function (el) { if (ACTIVE.indexOf(i) >= 0) el.setAttribute("data-at", atFor(i, parseFloat(el.getAttribute("data-rel"))).toFixed(3)); });
      var n = card.querySelector(".scard__n"); if (n) n.textContent = ACTIVE.indexOf(i) + 1;
    });
    segs.forEach(function (sg, i) { sg.parentNode.style.display = i < ACTIVE.length ? "" : "none"; });
    lastP = -1;
    paint(true);
  }

  var lastP = -1;
  function progress() { return parseFloat(plan.style.getPropertyValue("--sc-p")) || 0; }

  function paint(force) {
    var p = progress();
    if (!force && Math.abs(p - lastP) < 0.0005) return;
    lastP = p;
    var front = 0;                                 // position in ACTIVE of the card in front
    for (var k = 0; k < ACTIVE.length; k++) if (p >= CARD_AT[k]) front = k;
    cards.forEach(function (card, i) {
      var pos = ACTIVE.indexOf(i);
      var depth = pos < 0 ? "skip" : front - pos;  // 0 front, 1+ behind, <0 still waiting
      card.setAttribute("data-depth", depth === "skip" ? "skip" : depth < 0 ? "next" : Math.min(depth, 3));
      card.setAttribute("aria-hidden", String(depth !== 0));
      card.inert = depth !== 0;
    });
    titles.forEach(function (t, i) {
      var pos = ACTIVE.indexOf(i);
      t.classList.toggle("is-here", pos === front); t.classList.toggle("is-past", pos >= 0 && pos < front);
    });
    segs.forEach(function (s, i) {
      if (i >= ACTIVE.length) return;
      var f = Math.min(1, Math.max(0, (p - CARD_AT[i]) / (CARD_AT[i + 1] - CARD_AT[i])));
      s.style.transform = "scaleX(" + (i < front ? 1 : f).toFixed(4) + ")";
    });
    $$("[data-at]", stack).forEach(function (el) { el.classList.toggle("is-on", p >= parseFloat(el.getAttribute("data-at"))); });
    $$("[data-done]", stack).forEach(function (el) { el.classList.toggle("is-done", p >= parseFloat(el.getAttribute("data-done"))); });
  }

  $$(".switch button").forEach(function (b) {
    b.addEventListener("click", function () {
      current = b.getAttribute("data-case");
      $$(".switch button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      renderCase();
    });
  });

  // ---------- problem → solution: one chapter per problem, driven off #solution's --sc-p ----------
  var sol = $("#solution"), solChs = $$(".sol__ch"), solTabs = $$(".sol__tabs button");
  var solShots = $$("#solution .device__shots > *"), solBubbles = $$(".sol__pair"), solSegs = [], solOpen = $("#sol-open");
  var SOL_HREF = ["/situation?c=fake_content", "/situation?c=extortion", "/situation?c=fraud", "/situation?c=cyberbullying"];
  var solCh = -1, solLastP = -1;

  function paintSol() {
    var p = parseFloat(sol.style.getPropertyValue("--sc-p")) || 0;
    if (Math.abs(p - solLastP) < 0.0005) return;
    solLastP = p;
    var ch = Math.min(3, Math.floor(p * 4));
    solSegs.forEach(function (s, i) { s.style.transform = "scaleX(" + Math.min(1, Math.max(0, p * 4 - i)).toFixed(4) + ")"; });
    if (ch === solCh) return;
    solCh = ch;
    solChs.forEach(function (el, i) {
      el.classList.toggle("is-here", i === ch); el.classList.toggle("is-past", i < ch);
      el.setAttribute("aria-hidden", String(i !== ch)); el.inert = i !== ch;
    });
    solTabs.forEach(function (b, i) { b.setAttribute("aria-pressed", String(i === ch)); });
    solShots.forEach(function (img, i) { img.classList.toggle("is-here", i === ch); });
    solBubbles.forEach(function (img, i) { img.classList.toggle("is-here", i === ch); });
    solOpen.href = APP + SOL_HREF[ch];
    var tab = solTabs[ch];
    if (tab && tab.parentNode.scrollWidth > tab.parentNode.clientWidth) tab.parentNode.scrollTo({ left: tab.offsetLeft - 16, behavior: "smooth" });
  }

  // a tab scrolls the page to the middle of its chapter, so the pinned act stays the one source of truth
  solTabs.forEach(function (b, i) {
    b.addEventListener("click", function () {
      var top = sol.getBoundingClientRect().top + scrollY;
      var run = Math.max(1, sol.offsetHeight - innerHeight);
      var smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
      scrollTo({ top: top + run * (i * 0.25 + 0.1), behavior: smooth ? "smooth" : "auto" });
    });
  });

  // ---------- quick menu demo: the floating button opens the app's main doors ----------
  var qbtn = $(".qbtn"), qmenu = $("#qmenu");
  function setQuick(open) {
    qmenu.classList.toggle("is-open", open);
    qbtn.setAttribute("aria-expanded", String(open));
    qmenu.inert = !open;
  }
  setQuick(false);
  qbtn.addEventListener("click", function () { setQuick(!qmenu.classList.contains("is-open")); });
  qmenu.querySelector(".qm__dim").addEventListener("click", function () { setQuick(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && qmenu.classList.contains("is-open")) { setQuick(false); qbtn.focus(); } });
  // it opens by itself the first time the section is well in view, so the room sees it without a click
  if ("IntersectionObserver" in window) {
    var qio = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { qio.disconnect(); setTimeout(function () { setQuick(true); }, 900); }
    }, { threshold: 0.55 });
    qio.observe($(".quick__stage"));
  }

  // ---------- copy ----------
  var copyBtn = $("#copy"), copyStatus = $("#copy-status");
  copyBtn.addEventListener("click", function () {
    var text = adultMsg.textContent.trim();
    function ok() {
      var label = copyBtn.querySelector("span");
      label.textContent = UI[lang].copied; copyBtn.classList.add("is-copied"); copyStatus.textContent = UI[lang].copied;
      setTimeout(function () { label.textContent = UI[lang].copy; copyBtn.classList.remove("is-copied"); copyStatus.textContent = ""; }, 2000);
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) { /* nothing to do */ }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  });

  // ---------- route nav: progress line + where you are ----------
  var root = document.documentElement;
  var stops = $$(".route a").map(function (a) { return { a: a, el: document.getElementById(a.getAttribute("data-stop")) }; });
  var closeRoute = $(".close__route path"), closeLen = 0, closeAct = $("#go");

  var hero = $(".hero"), probs = $("#problems");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var quiet = $(".quiet"), quietTitle = $(".quiet__title"), stagesEl = $(".stages");
  function frame() {
    var max = Math.max(1, root.scrollHeight - innerHeight);
    // hero → problems: the hero sticks with its bottom on the screen's bottom, the problems sheet covers it
    hero.style.setProperty("--hero-top", Math.min(0, innerHeight - hero.offsetHeight) + "px");
    root.style.setProperty("--hero-cover", Math.min(1, Math.max(0, 1 - probs.getBoundingClientRect().top / innerHeight)).toFixed(4));
    root.style.setProperty("--page-p", (scrollY / max).toFixed(4));
    var here = null;
    stops.forEach(function (s) { if (s.el && s.el.getBoundingClientRect().top < innerHeight * 0.45) here = s; });
    stops.forEach(function (s) { s.a.classList.toggle("is-here", s === here); if (s === here) s.a.setAttribute("aria-current", "location"); else s.a.removeAttribute("aria-current"); });
    paint(false);
    paintSol();
    // problems → solution: the blue act opens as a growing circle
    if (!reduce) {
      var sr = sol.getBoundingClientRect();
      var t = Math.min(1, Math.max(0, (innerHeight - sr.top) / (innerHeight * 1.05)));
      var e = t * t * (3 - 2 * t);
      var cy = (Math.max(0, -sr.top) + innerHeight - sr.top) / 2;   // middle of the part of the act on screen
      // solution → quiet: as the act leaves, the blue narrows into a rounded card and steps back
      var out = Math.min(1, Math.max(0, 1 - sr.bottom / innerHeight));
      var o = out * out * (3 - 2 * out);
      sol.style.clipPath = t < 1 ? "circle(" + (e * 78).toFixed(2) + "vmax at 50% " + Math.round(cy) + "px)"
        : out > 0 ? "inset(0 " + (o * 7).toFixed(2) + "% 0 " + (o * 7).toFixed(2) + "% round " + Math.round(o * 72) + "px)" : "";
      sol.style.setProperty("--sol-in", e.toFixed(4));
      sol.style.setProperty("--sol-out", o.toFixed(4));
      var qr = quietTitle.getBoundingClientRect();
      quiet.style.setProperty("--q", Math.min(1, Math.max(0, (innerHeight - qr.top) / (innerHeight * 0.75))).toFixed(4));
      var sg = stagesEl.getBoundingClientRect();
      quiet.style.setProperty("--q-line", Math.min(1, Math.max(0, (innerHeight * 0.95 - sg.top) / (innerHeight * 0.45))).toFixed(4));
    }
    if (closeRoute) {
      if (!closeLen) { try { closeLen = closeRoute.getTotalLength(); } catch (e) { closeLen = 700; } closeRoute.style.strokeDasharray = closeLen; }
      var cp = parseFloat(closeAct.style.getPropertyValue("--sc-p")) || 0;
      var r = closeAct.getBoundingClientRect();
      var enter = Math.min(1, Math.max(0, (innerHeight - r.top) / innerHeight)); // draws while the close slides in
      closeRoute.style.strokeDashoffset = closeLen * (1 - Math.min(1, enter * 0.8 + cp * 0.6));
    }
    requestAnimationFrame(frame);
  }

  // ---------- keyboard on the sideways rail ----------
  // The problems rail moves only with page scroll and its stage clips, so Tab could land on a card far off screen. On
  // focus the page scrolls to where that card is in view. Reduced motion makes the rail an ordinary scroll box instead.
  (function () {
    var probs = $("#problems"), rail = probs && probs.querySelector("[data-sc-pan]");
    if (!rail || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    probs.addEventListener("focusin", function (ev) {
      var card = ev.target.closest("[data-sc-pan] > *");
      if (!card) return;
      var shift = new DOMMatrixReadOnly(getComputedStyle(rail).transform).m41;
      var railLeft = rail.getBoundingClientRect().left - shift;
      var cardRight = railLeft + (card.getBoundingClientRect().right - rail.getBoundingClientRect().left);
      var over = rail.scrollWidth - innerWidth;
      if (over <= 0) return;
      var extra = parseFloat(rail.getAttribute("data-sc-pan")) || 0;
      var p = Math.min(1, Math.max(0, (cardRight + 24 - innerWidth) / (over * (1 + extra))));
      var top = probs.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + p * (probs.offsetHeight - innerHeight), behavior: "instant" });
    });
  })();

  // ---------- init ----------
  // Russian only for the demo (Ali, 2026-10-15): TG is an unreviewed AI draft and the page has no language switch, so
  // nothing is saved or restored. Before turning Tajik on: a native review, the switch in the nav, and the same four
  // truth fixes the Russian copy got (prP1T, a3, t1d, qKicker; see README.md).
  ScrollCraft.mount(document.body);
  setLang("ru");
  requestAnimationFrame(frame);
})();
