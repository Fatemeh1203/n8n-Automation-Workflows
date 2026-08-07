/* ============================================================
   Simulator — renders a workflow canvas and executes it
   step by step inside the browser.
   ============================================================ */
(function () {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  }

  /** Pretty-print JSON with light syntax colouring. */
  function highlight(value) {
    const json = JSON.stringify(value, null, 2) || "null";
    return esc(json).replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "json-num";
        if (/^"/.test(match)) cls = /:$/.test(match) ? "json-key" : "json-str";
        else if (/true|false|null/.test(match)) cls = "json-bool";
        return '<span class="' + cls + '">' + match + "</span>";
      }
    );
  }

  /** Build the horizontal node canvas for a project. */
  function buildCanvas(project) {
    const parts = [];
    project.nodes.forEach((node, i) => {
      if (i > 0) parts.push('<div class="connector" data-conn="' + (i - 1) + '"><span class="arrow">➜</span></div>');
      parts.push(
        '<div class="node" data-node="' + i + '" data-state="idle">' +
          '<div class="node-head">' +
            '<div class="node-icon">' + node.icon + "</div>" +
            "<div>" +
              '<div class="node-name">' + esc(node.name) + "</div>" +
              '<div class="node-type">' + esc(node.type) + "</div>" +
            "</div>" +
          "</div>" +
          '<div class="node-note">' + esc(window.tx(node.note)) + "</div>" +
        "</div>"
      );
    });
    return '<div class="canvas">' + parts.join("") + "</div>";
  }

  /** Build the input form for a project. */
  function buildInputs(project) {
    const fields = project.inputs.map((f) => {
      const label = esc(window.tx(f.label));
      const unit = f.unit ? ' <span class="unit">(' + esc(window.tx(f.unit)) + ")</span>" : "";
      const hint = f.hint ? '<span class="unit">' + esc(window.tx(f.hint)) + "</span>" : "";
      const raw = window.tx(f.value);
      let control;

      if (f.type === "select") {
        const opts = f.options
          .map((o) => '<option value="' + esc(o.value) + '"' + (o.value === f.value ? " selected" : "") + ">" + esc(window.tx(o.label)) + "</option>")
          .join("");
        control = '<select data-input="' + f.key + '">' + opts + "</select>";
      } else if (f.type === "textarea") {
        control = '<textarea data-input="' + f.key + '" rows="4">' + esc(raw) + "</textarea>";
      } else if (f.type === "number") {
        control = '<input type="number" data-input="' + f.key + '" value="' + esc(raw) + '" step="' + (f.step || 1) + '" />';
      } else {
        control = '<input type="text" data-input="' + f.key + '" value="' + esc(raw) + '" />';
      }

      const span = f.type === "textarea" ? ' style="grid-column:1/-1"' : "";
      return '<div class="field"' + span + "><label>" + label + unit + "</label>" + control + hint + "</div>";
    });
    return '<div class="input-grid">' + fields.join("") + "</div>";
  }

  /** Read the current form values into a fresh execution context. */
  function readContext(root, project) {
    const ctx = {};
    project.inputs.forEach((f) => {
      const el = root.querySelector('[data-input="' + f.key + '"]');
      ctx[f.key] = el ? el.value : window.tx(f.value);
    });
    return ctx;
  }

  /** Reset all node/connector states and clear the output panels. */
  function reset(root) {
    root.querySelectorAll(".node").forEach((n) => n.setAttribute("data-state", "idle"));
    root.querySelectorAll(".connector").forEach((c) => c.removeAttribute("data-state"));
    root.querySelector("[data-log]").innerHTML = '<p class="log-empty">' + esc(window.t("logEmpty")) + "</p>";
    root.querySelector("[data-result]").innerHTML = "";
    root.querySelector("[data-status]").textContent = window.t("statusIdle");
  }

  /** Execute the workflow node by node. */
  async function run(root, project) {
    const btn = root.querySelector("[data-run]");
    const status = root.querySelector("[data-status]");
    const log = root.querySelector("[data-log]");
    const result = root.querySelector("[data-result]");

    btn.disabled = true;
    reset(root);
    status.textContent = window.t("running");
    log.innerHTML = "";

    const ctx = readContext(root, project);
    let step = 0;

    for (let i = 0; i < project.nodes.length; i++) {
      const node = project.nodes[i];
      const el = root.querySelector('.node[data-node="' + i + '"]');
      const conn = root.querySelector('.connector[data-conn="' + (i - 1) + '"]');
      if (conn) conn.setAttribute("data-state", "active");

      if (node.when && !node.when(ctx)) {
        el.setAttribute("data-state", "skipped");
        el.title = window.t("statusSkipped");
        await sleep(160);
        continue;
      }

      el.setAttribute("data-state", "running");
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      await sleep(520);

      let output;
      try {
        output = node.run(ctx);
      } catch (err) {
        output = { error: String(err && err.message ? err.message : err) };
      }

      el.setAttribute("data-state", "done");
      step += 1;

      const item = document.createElement("div");
      item.className = "log-item";
      item.innerHTML =
        '<div class="log-head">' +
          '<span class="log-step">#' + step + "</span>" +
          "<span>" + node.icon + " " + esc(node.name) + "</span>" +
          '<span class="log-ok">200 OK</span>' +
        "</div>" +
        '<div class="log-body"><pre>' + highlight(output) + "</pre></div>";
      log.appendChild(item);
      await sleep(140);
    }

    if (project.result) {
      try {
        result.innerHTML = project.result(ctx);
      } catch (err) {
        result.innerHTML = "";
      }
    }

    status.textContent = window.t("statusDone");
    btn.disabled = false;
    btn.querySelector("[data-run-label]").textContent = window.t("runAgain");
  }

  window.Simulator = { buildCanvas, buildInputs, reset, run, highlight, esc };
})();
