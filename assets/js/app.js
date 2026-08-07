/* ============================================================
   App — language handling, routing and views
   ============================================================ */
(function () {
  const view = document.getElementById("view");
  const esc = (s) => window.Simulator.esc(s);

  /* ---------- language ---------- */
  function applyLang() {
    const lang = window.Lang.current;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = window.t(el.getAttribute("data-i18n"));
    });
    document.querySelector("#langToggle .lang-current").textContent = lang === "fa" ? "EN" : "فا";
    document.title = window.t("brand") + " — Automation Studio";
  }

  document.getElementById("langToggle").addEventListener("click", () => {
    window.Lang.set(window.Lang.other());
    applyLang();
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
      </section>`;
  }

  /* ---------- about ---------- */
  function aboutView() {
    return `
      <section class="section" style="padding-top:3.5rem">
        <div class="wrap">
          <h1 style="font-size:1.7rem;font-weight:800;margin-bottom:.9rem">${window.t("aboutTitle")}</h1>
          <p style="color:var(--text-dim);max-width:70ch">${window.t("aboutLead")}</p>
          <div class="about-grid">
            <div class="about-card"><h3>🔒 ${window.t("aboutCard1Title")}</h3><p>${window.t("aboutCard1Body")}</p></div>
            <div class="about-card"><h3>⚙️ ${window.t("aboutCard2Title")}</h3><p>${window.t("aboutCard2Body")}</p></div>
            <div class="about-card"><h3>🌐 ${window.t("aboutCard3Title")}</h3><p>${window.t("aboutCard3Body")}</p></div>
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
          <p class="source-line">${window.t("sourceWorkflow")}: <b>${esc(p.workflow)}</b></p>
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
  function render() {
    const hash = location.hash || "#/";
    const match = hash.match(/^#\/p\/(.+)$/);

    if (match) {
      const p = window.PROJECTS.find((x) => x.id === match[1]);
      if (!p) {
        view.innerHTML = `<section class="section"><div class="wrap"><p>${window.t("notFound")}</p><a class="back-link" href="#/">${window.t("back")}</a></div></section>`;
        return;
      }
      view.innerHTML = detailView(p);
      bindDetail(p);
    } else if (hash === "#/about") {
      view.innerHTML = aboutView();
    } else {
      view.innerHTML = homeView();
    }
    window.scrollTo({ top: 0 });
  }

  window.addEventListener("hashchange", render);

  applyLang();
  render();
})();
