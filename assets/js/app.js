/* ============================================================
   App — theme, language, routing and views
   ============================================================ */
(function () {
  const view = document.getElementById("view");
  const esc = (s) => window.Simulator.esc(s);

  const OWNER = {
    github: "https://github.com/Fatemeh1203",
    repo: "https://github.com/Fatemeh1203/n8n-Automation-Workflows",
    linkedin: "https://www.linkedin.com/in/fatemeh-shams/",
    email: "fatemeh.shams19@gmail.com",
  };

  const ICONS = {
    github: '<svg viewBox="0 0 24 24"><path d="M12 .5C5.73.5.9 5.33.9 11.6c0 4.9 3.17 9.05 7.57 10.52.55.1.76-.24.76-.53v-2.05c-3.08.67-3.73-1.3-3.73-1.3-.5-1.29-1.23-1.63-1.23-1.63-1.01-.69.08-.67.08-.67 1.11.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.46-.28-5.05-1.23-5.05-5.48 0-1.21.43-2.2 1.14-2.98-.11-.28-.5-1.41.11-2.94 0 0 .93-.3 3.05 1.14a10.5 10.5 0 0 1 5.56 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.22 2.66.11 2.94.71.78 1.14 1.77 1.14 2.98 0 4.26-2.6 5.2-5.07 5.47.4.35.76 1.03.76 2.08v3.08c0 .3.2.64.77.53 4.4-1.47 7.56-5.62 7.56-10.52C23.1 5.33 18.27.5 12 .5Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6.5 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.2 1.45-2.2 2.96V21h-4V9Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><path d="M2.5 6.5A2.5 2.5 0 0 1 5 4h14a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 19 20H5a2.5 2.5 0 0 1-2.5-2.5v-11Zm2.2-.4 7.3 5.5 7.3-5.5H4.7Zm14.8 1.9-6.9 5.2a1.8 1.8 0 0 1-2.2 0L4.5 8v9.5c0 .28.22.5.5.5h14a.5.5 0 0 0 .5-.5V8Z"/></svg>',
  };

  /* ---------- theme ---------- */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", window.Theme.current);
    document.getElementById("themeToggle").title = window.t("themeTitle");
  }
  document.getElementById("themeToggle").addEventListener("click", () => {
    window.Theme.set(window.Theme.other());
    applyTheme();
  });

  /* ---------- language ---------- */
  function applyLang() {
    const lang = window.Lang.current;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = window.t(el.getAttribute("data-i18n"));
    });
    document.querySelector("#langToggle .lang-current").textContent = lang === "fa" ? "EN" : "فا";
    document.getElementById("githubLink").title = window.t("githubTitle");
    document.title = window.t("brand") + " — Fatemeh Shams";
  }
  document.getElementById("langToggle").addEventListener("click", () => {
    window.Lang.set(window.Lang.other());
    applyLang();
    applyTheme();
    render();
  });

  /* ---------- home ---------- */
  function totals() {
    const nodes = window.PROJECTS.reduce((s, p) => s + p.nodes.length, 0);
    const services = new Set();
    window.PROJECTS.forEach((p) => p.tags.forEach((t) => services.add(t)));
    return { projects: window.PROJECTS.length, nodes, services: services.size };
  }

  function projectCard(p) {
    return `
      <a class="project-card ${p.featured ? "is-featured" : ""}" href="#/p/${p.id}">
        ${p.featured ? `<span class="badge">${window.Lang.current === "fa" ? "شاخص" : "Featured"}</span>` : ""}
        <div class="card-top">
          <div class="card-icon">${p.icon}</div>
          <div>
            <div class="card-title">${esc(window.tx(p.title))}</div>
            <div class="card-tagline">${esc(window.tx(p.tagline))}</div>
          </div>
        </div>
        <p class="card-desc">${esc(window.tx(p.desc).slice(0, 150))}…</p>
        <div class="tag-row">${p.tags.slice(0, 4).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <div class="card-foot">
          <span class="card-steps">${p.nodes.length} ${window.t("stepsCount")}</span>
          <span class="card-cta">${window.t("openDemo")} <span class="cta-arrow">→</span></span>
        </div>
      </a>`;
  }

  function homeView() {
    const s = totals();
    return `
      <section class="hero">
        <div class="wrap">
          <span class="hero-eyebrow">${window.t("heroEyebrow")}</span>
          <h1>${window.t("heroTitle")}</h1>
          <p>${window.t("heroLead")}</p>
          <p class="hero-author">
            ${window.t("heroAuthorLabel")}
            <b>${window.t("ownerName")}</b>
            <span dir="ltr" class="muted">${window.Lang.current === "fa" ? "Fatemeh Shams" : "فاطمه شمس"}</span>
          </p>
          <div class="hero-stats">
            <div><div class="stat-value">${window.fmt(s.projects)}</div><div class="stat-label">${window.t("statProjects")}</div></div>
            <div><div class="stat-value">${window.fmt(s.nodes)}</div><div class="stat-label">${window.t("statNodes")}</div></div>
            <div><div class="stat-value">${window.fmt(s.services)}</div><div class="stat-label">${window.t("statServices")}</div></div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="wrap">
          <div class="section-head">
            <h2>${window.t("projectsTitle")}</h2>
            <p>${window.t("projectsSub")}</p>
          </div>
          <div class="project-grid">${window.PROJECTS.map(projectCard).join("")}</div>
        </div>
      </section>

      <section class="section">
        <div class="wrap">
          <a class="sabt-banner" href="sabt/">
            <div class="sabt-copy">
              <h3>${window.t("sabtTitle")}</h3>
              <p>${window.t("sabtBody")}</p>
            </div>
            <span class="sabt-cta">${window.t("sabtCta")}</span>
          </a>
        </div>
      </section>`;
  }

  /* ---------- about ---------- */
  function aboutView() {
    return `
      <section class="section page-head">
        <div class="wrap">
          <h1>${window.t("aboutTitle")}</h1>
          <p class="page-lead">${window.t("aboutLead")}</p>

          <div class="owner-card">
            <div class="owner-avatar"><img src="assets/img/logo.svg" alt="" /></div>
            <div>
              <div class="owner-name">${window.t("ownerName")}</div>
              <div class="owner-name-alt">${window.Lang.current === "fa" ? "Fatemeh Shams" : "فاطمه شمس"}</div>
              <div class="owner-role">${window.t("ownerRole")}</div>
            </div>
            <a class="btn btn-ghost" style="margin-inline-start:auto" href="${OWNER.github}" target="_blank" rel="noopener noreferrer">
              ${ICONS.github.replace("<svg", '<svg style="width:17px;height:17px;fill:currentColor"')} ${window.t("viewOnGithub")}
            </a>
          </div>

          <div class="about-grid">
            <div class="about-card"><h3>🔒 ${window.t("aboutCard1Title")}</h3><p>${window.t("aboutCard1Body")}</p></div>
            <div class="about-card"><h3>⚙️ ${window.t("aboutCard2Title")}</h3><p>${window.t("aboutCard2Body")}</p></div>
            <div class="about-card"><h3>🌐 ${window.t("aboutCard3Title")}</h3><p>${window.t("aboutCard3Body")}</p></div>
          </div>
        </div>
      </section>`;
  }

  /* ---------- contact ---------- */
  function contactCard(icon, label, value, hint, href) {
    return `
      <a class="contact-card" href="${href}" ${href.startsWith("mailto") ? "" : 'target="_blank" rel="noopener noreferrer"'}>
        <div class="contact-icon">${icon}</div>
        <div>
          <div class="contact-label">${label} · <span class="muted">${hint}</span></div>
          <div class="contact-value">${value}</div>
        </div>
      </a>`;
  }

  function contactView() {
    return `
      <section class="section page-head">
        <div class="wrap">
          <h1>${window.t("contactTitle")}</h1>
          <p class="page-lead">${window.t("contactLead")}</p>

          <div class="owner-card">
            <div class="owner-avatar"><img src="assets/img/logo.svg" alt="" /></div>
            <div>
              <div class="owner-name">${window.t("ownerName")}</div>
              <div class="owner-name-alt">${window.Lang.current === "fa" ? "Fatemeh Shams" : "فاطمه شمس"}</div>
              <div class="owner-role">${window.t("ownerRole")}</div>
            </div>
          </div>

          <div class="contact-grid">
            ${contactCard(ICONS.linkedin, window.t("contactLinkedin"), "linkedin.com/in/fatemeh-shams", window.t("contactLinkedinHint"), OWNER.linkedin)}
            ${contactCard(ICONS.mail, window.t("contactEmail"), OWNER.email, window.t("contactEmailHint"), "mailto:" + OWNER.email)}
            ${contactCard(ICONS.github, window.t("contactGithub"), "github.com/Fatemeh1203", window.t("contactGithubHint"), OWNER.github)}
          </div>
        </div>
      </section>`;
  }

  /* ---------- project detail ---------- */
  function detailView(p) {
    return `
      <section class="detail">
        <div class="wrap">
          <a class="back-link" href="#/"><span class="back-arrow">←</span> ${window.t("back")}</a>

          <div class="detail-head">
            <div class="card-icon">${p.icon}</div>
            <div>
              <h1>${esc(window.tx(p.title))}</h1>
              <div class="card-tagline">${esc(window.tx(p.tagline))}</div>
            </div>
          </div>
          <p class="source-line">${window.t("sourceWorkflow")}: <b>${esc(p.workflow)}</b> · ${window.t("footerBy")} ${window.t("ownerName")}</p>
          <p class="detail-desc">${esc(window.tx(p.desc))}</p>
          <div class="tag-row">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>

          <div class="panel">
            <div class="panel-title"><span class="dot"></span>${window.t("inputsTitle")}<span class="panel-hint">${window.t("inputsHint")}</span></div>
            ${window.Simulator.buildInputs(p)}
            <div class="run-bar">
              <button class="btn btn-primary" data-run type="button">▶ <span data-run-label>${window.t("runDemo")}</span></button>
              <button class="btn btn-ghost" data-reset type="button">${window.t("reset")}</button>
              <span class="run-status" data-status>${window.t("statusIdle")}</span>
            </div>
          </div>

          <div class="panel">
            <div class="panel-title"><span class="dot"></span>${window.t("flowTitle")}<span class="panel-hint">${window.t("flowHint")}</span></div>
            ${window.Simulator.buildCanvas(p)}
          </div>

          <div class="panel">
            <div class="panel-title"><span class="dot"></span>${window.t("logTitle")}<span class="panel-hint">${window.t("logHint")}</span></div>
            <div class="log" data-log><p class="log-empty">${window.t("logEmpty")}</p></div>
            <div data-result></div>
          </div>
        </div>
      </section>`;
  }

  function bindDetail(p) {
    const root = view;
    root.querySelector("[data-run]").addEventListener("click", () => window.Simulator.run(root, p));
    root.querySelector("[data-reset]").addEventListener("click", () => {
      window.Simulator.reset(root);
      root.querySelector("[data-run-label]").textContent = window.t("runDemo");
    });
  }

  /* ---------- router ---------- */
  function markNav(hash) {
    document.querySelectorAll("[data-nav]").forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("data-nav") === hash);
    });
  }

  function render() {
    const hash = location.hash || "#/";
    const match = hash.match(/^#\/p\/(.+)$/);

    if (match) {
      const p = window.PROJECTS.find((x) => x.id === match[1]);
      if (!p) {
        view.innerHTML = `<section class="section page-head"><div class="wrap"><p>${window.t("notFound")}</p><a class="back-link" href="#/">${window.t("back")}</a></div></section>`;
        window.Backgrounds.set("home");
        markNav("#/");
        return;
      }
      view.innerHTML = detailView(p);
      bindDetail(p);
      window.Backgrounds.set(p.id);
      markNav("#/");
    } else if (hash === "#/about") {
      view.innerHTML = aboutView();
      window.Backgrounds.set("about");
      markNav("#/about");
    } else if (hash === "#/contact") {
      view.innerHTML = contactView();
      window.Backgrounds.set("contact");
      markNav("#/contact");
    } else {
      view.innerHTML = homeView();
      window.Backgrounds.set("home");
      markNav("#/");
    }
    window.scrollTo({ top: 0 });
  }

  window.addEventListener("hashchange", render);

  applyTheme();
  applyLang();
  render();
})();
