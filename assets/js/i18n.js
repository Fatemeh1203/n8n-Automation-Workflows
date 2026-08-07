/* ============================================================
   i18n — bilingual dictionary (fa / en)
   ============================================================ */
window.I18N = {
  fa: {
    brand: "استودیو اتوماسیون",
    brandSub: "دموی تعاملی گردش‌کارها",
    navProjects: "پروژه‌ها",
    navAbout: "درباره",
    footerNote: "همه‌ی دموها در مرورگر شما اجرا می‌شوند — بدون سرور، بدون کلید API.",
    builtWith: "ساخته‌شده با",

    heroEyebrow: "دموها آماده‌ی اجرا هستند",
    heroTitle: 'گردش‌کارهای <span class="accent">n8n</span> را زنده ببینید، نه در اسکرین‌شات',
    heroLead: "هر پروژه یک شبیه‌ساز کامل دارد: ورودی را خودتان تغییر دهید، دکمه‌ی اجرا را بزنید و خروجی هر نود را مرحله‌به‌مرحله ببینید — دقیقاً با همان منطقی که در n8n پیاده شده است.",

    statProjects: "پروژه‌ی اتوماسیون",
    statNodes: "نود در مجموع",
    statServices: "سرویس متصل",

    projectsTitle: "پروژه‌ها",
    projectsSub: "روی هر کارت بزنید تا شبیه‌ساز آن باز شود",

    back: "بازگشت به پروژه‌ها",
    stepsCount: "نود",
    openDemo: "اجرای دمو",

    inputsTitle: "ورودی‌ها",
    inputsHint: "مقادیر را تغییر دهید و دوباره اجرا کنید",
    flowTitle: "گردش‌کار",
    flowHint: "ساختار واقعی نودها در n8n",
    logTitle: "خروجی اجرا",
    logHint: "خروجی JSON هر نود",
    logEmpty: "هنوز اجرایی انجام نشده است. دکمه‌ی «اجرای دمو» را بزنید.",
    resultTitle: "نتیجه‌ی نهایی",

    runDemo: "اجرای دمو",
    runAgain: "اجرای دوباره",
    running: "در حال اجرا…",
    reset: "پاک‌سازی",
    statusIdle: "آماده",
    statusDone: "اجرا با موفقیت کامل شد",
    statusSkipped: "نود غیرفعال (شرط برقرار نبود)",

    aboutTitle: "درباره‌ی این سایت",
    aboutLead: "این صفحه ویترین اتوماسیون‌هایی است که با n8n ساخته‌ام. برای اینکه هر کسی بدون نصب و بدون حساب کاربری بتواند کارکرد آن‌ها را ببیند، منطق هر گردش‌کار در جاوااسکریپت بازسازی شده و مستقیماً در مرورگر اجرا می‌شود.",
    aboutCard1Title: "بدون سرور",
    aboutCard1Body: "کل سایت استاتیک است؛ هیچ درخواستی به بیرون فرستاده نمی‌شود و هیچ کلید API‌ای در کد نیست.",
    aboutCard2Title: "منطق واقعی",
    aboutCard2Body: "فرمول‌ها و مسیرهای شرطی دقیقاً از نودهای Code و IF همان گردش‌کار در n8n برداشته شده‌اند.",
    aboutCard3Title: "دو زبانه",
    aboutCard3Body: "کل رابط کاربری و توضیح نودها به فارسی و انگلیسی است و جهت صفحه خودکار تغییر می‌کند.",

    navContact: "ارتباط با من",
    footerBy: "ساخته‌شده توسط",
    ownerName: "فاطمه شمس",
    ownerRole: "طراح و توسعه‌دهنده‌ی اتوماسیون با n8n",
    heroAuthorLabel: "پروژه‌ها و دموها از",
    themeTitle: "تغییر تم روشن / تاریک",
    githubTitle: "مشاهده‌ی پروفایل گیت‌هاب",
    viewOnGithub: "مشاهده در گیت‌هاب",

    contactTitle: "ارتباط با من",
    contactLead: "برای همکاری، سفارش اتوماسیون یا پرسش درباره‌ی هر کدام از این پروژه‌ها، از راه‌های زیر در دسترس هستم.",
    contactLinkedin: "لینکدین",
    contactEmail: "ایمیل",
    contactGithub: "گیت‌هاب",
    contactLinkedinHint: "رزومه و سوابق کاری",
    contactEmailHint: "پاسخ معمولاً تا ۲۴ ساعت",
    contactGithubHint: "کد و مخازن پروژه‌ها",

    sourceWorkflow: "گردش‌کار در n8n",
    currency: "تومان",
    notFound: "پروژه‌ای با این نشانی پیدا نشد.",
  },

  en: {
    brand: "Automation Studio",
    brandSub: "Interactive workflow demos",
    navProjects: "Projects",
    navAbout: "About",
    footerNote: "Every demo runs in your browser — no server, no API keys.",
    builtWith: "Built with",

    heroEyebrow: "Demos are ready to run",
    heroTitle: 'See <span class="accent">n8n</span> workflows run — not screenshots of them',
    heroLead: "Each project ships with a full simulator: change the inputs, hit run, and watch every node produce its output step by step — using the exact logic implemented in n8n.",

    statProjects: "automation projects",
    statNodes: "nodes in total",
    statServices: "connected services",

    projectsTitle: "Projects",
    projectsSub: "Open any card to launch its simulator",

    back: "Back to projects",
    stepsCount: "nodes",
    openDemo: "Run demo",

    inputsTitle: "Inputs",
    inputsHint: "Change the values and run again",
    flowTitle: "Workflow",
    flowHint: "The real node structure in n8n",
    logTitle: "Execution output",
    logHint: "JSON output of each node",
    logEmpty: "Nothing has run yet. Press “Run demo”.",
    resultTitle: "Final result",

    runDemo: "Run demo",
    runAgain: "Run again",
    running: "Running…",
    reset: "Clear",
    statusIdle: "Ready",
    statusDone: "Execution finished successfully",
    statusSkipped: "Node skipped (condition not met)",

    aboutTitle: "About this site",
    aboutLead: "This page showcases automations I build with n8n. So anyone can see how they behave without installing anything or signing up, each workflow's logic is reimplemented in JavaScript and executed right in the browser.",
    aboutCard1Title: "No server",
    aboutCard1Body: "The whole site is static. No outbound requests are made and no API key exists in the code.",
    aboutCard2Title: "Real logic",
    aboutCard2Body: "Formulas and conditional branches are taken straight from the Code and IF nodes of the actual n8n workflow.",
    aboutCard3Title: "Bilingual",
    aboutCard3Body: "The entire interface and every node description exist in Persian and English, with automatic text direction.",

    navContact: "Contact",
    footerBy: "Built by",
    ownerName: "Fatemeh Shams",
    ownerRole: "n8n automation designer & developer",
    heroAuthorLabel: "Projects and demos by",
    themeTitle: "Switch light / dark theme",
    githubTitle: "Open the GitHub profile",
    viewOnGithub: "View on GitHub",

    contactTitle: "Contact",
    contactLead: "For collaboration, an automation build, or a question about any of these projects, reach me through any of the channels below.",
    contactLinkedin: "LinkedIn",
    contactEmail: "Email",
    contactGithub: "GitHub",
    contactLinkedinHint: "Resume and work history",
    contactEmailHint: "Usually answered within 24 hours",
    contactGithubHint: "Source code and repositories",

    sourceWorkflow: "n8n workflow",
    currency: "Toman",
    notFound: "No project matches this address.",
  },
};

window.Theme = {
  current: localStorage.getItem("theme") ||
    (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"),
  set(mode) {
    this.current = mode;
    localStorage.setItem("theme", mode);
    document.documentElement.setAttribute("data-theme", mode);
  },
  other() {
    return this.current === "dark" ? "light" : "dark";
  },
};

window.Lang = {
  current: localStorage.getItem("lang") || "fa",
  set(code) {
    this.current = code;
    localStorage.setItem("lang", code);
  },
  other() {
    return this.current === "fa" ? "en" : "fa";
  },
};

/** Translate a UI key. */
window.t = function (key) {
  const dict = window.I18N[window.Lang.current] || window.I18N.fa;
  return dict[key] != null ? dict[key] : key;
};

/** Pick the localized side of a { fa, en } pair. */
window.tx = function (pair) {
  if (pair == null) return "";
  if (typeof pair !== "object") return String(pair);
  return pair[window.Lang.current] != null ? pair[window.Lang.current] : pair.fa;
};

/** Locale-aware number formatting. */
window.fmt = function (n, digits) {
  const locale = window.Lang.current === "fa" ? "fa-IR" : "en-US";
  return Number(n || 0).toLocaleString(locale, {
    minimumFractionDigits: digits || 0,
    maximumFractionDigits: digits != null ? digits : 0,
  });
};
