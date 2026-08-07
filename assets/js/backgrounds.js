/* ============================================================
   Backgrounds — animated 3D scenes, drawn entirely as inline
   SVG. No images, no CDN, no network requests.

   Every scene is built from parallax layers:
     <g class="layer" data-depth="0.18">   ← moved by the pointer
       <g class="anim float-a" …>          ← CSS keyframe motion
   The home page gets a galaxy; each project gets props from
   its own subject matter (a jeweller's counter, a trading
   desk, a scanner, a planner, a mail room).
   ============================================================ */
(function () {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- layer + animation helpers ---------- */
  let ids = 0;
  const nid = (n) => "b" + ids + "-" + n;

  /** Wrap shapes in a parallax layer + an animated group. */
  function layer(depth, anim, ox, oy, delay, body) {
    const style = `transform-origin:${ox}px ${oy}px;animation-delay:${delay}s`;
    return `<g class="layer" data-depth="${depth}"><g class="anim ${anim}" style="${style}">${body}</g></g>`;
  }

  /* ============================================================
     Props — reusable 3D-looking objects
     ============================================================ */

  /** A gold coin seen at a tilt, optionally flipping. */
  function coin(x, y, r, face) {
    const g1 = nid("coinA" + Math.round(x + y));
    return `
      <defs>
        <linearGradient id="${g1}" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stop-color="#fff2c0"/><stop offset="35%" stop-color="#f5cd5b"/>
          <stop offset="70%" stop-color="#d29c1c"/><stop offset="100%" stop-color="#a4700d"/>
        </linearGradient>
      </defs>
      <ellipse cx="${x}" cy="${y + r * 0.16}" rx="${r}" ry="${r * 0.88}" fill="#6b4a05" opacity=".85"/>
      <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.88}" fill="url(#${g1})"/>
      <ellipse cx="${x}" cy="${y}" rx="${r * 0.76}" ry="${r * 0.66}" fill="none" stroke="#8d6209" stroke-width="${r * 0.06}" opacity=".55"/>
      <ellipse cx="${x - r * 0.3}" cy="${y - r * 0.36}" rx="${r * 0.3}" ry="${r * 0.16}" fill="#fffdf2" opacity=".65" transform="rotate(-28 ${x - r * 0.3} ${y - r * 0.36})"/>
      <text x="${x}" y="${y + r * 0.26}" text-anchor="middle" font-size="${r * 0.72}" fill="#8a5f06" opacity=".8" font-family="serif">${face || "﷼"}</text>`;
  }

  /** A gold ring / torus. */
  function ring(x, y, rx, ry, rot) {
    const g1 = nid("ringA" + Math.round(x + y));
    return `
      <defs>
        <linearGradient id="${g1}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff0b8"/><stop offset="30%" stop-color="#e9bb43"/>
          <stop offset="60%" stop-color="#9d6d0b"/><stop offset="100%" stop-color="#f0cd70"/>
        </linearGradient>
      </defs>
      <g transform="rotate(${rot} ${x} ${y})">
        <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="url(#${g1})" stroke-width="${rx * 0.17}"/>
        <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="#fffbe6" stroke-width="${rx * 0.045}" opacity=".55"
                 stroke-dasharray="${rx * 1.1} ${rx * 4}"/>
      </g>`;
  }

  /** A faceted gemstone. */
  function gem(x, y, s, hue) {
    const c = hue || "#5ad9e8";
    return `
      <g>
        <polygon points="${x},${y - s} ${x + s * 0.9},${y - s * 0.25} ${x},${y + s * 1.15} ${x - s * 0.9},${y - s * 0.25}" fill="${c}" opacity=".9"/>
        <polygon points="${x},${y - s} ${x + s * 0.9},${y - s * 0.25} ${x},${y - s * 0.1}" fill="#ffffff" opacity=".45"/>
        <polygon points="${x},${y - s} ${x - s * 0.9},${y - s * 0.25} ${x},${y - s * 0.1}" fill="#000000" opacity=".18"/>
        <polygon points="${x - s * 0.9},${y - s * 0.25} ${x},${y + s * 1.15} ${x},${y - s * 0.1}" fill="#ffffff" opacity=".2"/>
      </g>`;
  }

  /** A gold ingot drawn in isometric projection. */
  function ingot(x, y, w) {
    const h = w * 0.34, d = w * 0.3;
    return `
      <g>
        <polygon points="${x},${y} ${x + w},${y} ${x + w - d * 0.5},${y - d} ${x + d * 0.5},${y - d}" fill="#ffe08a"/>
        <polygon points="${x},${y} ${x + w},${y} ${x + w - d * 0.3},${y + h} ${x + d * 0.3},${y + h}" fill="#d9a521"/>
        <polygon points="${x + w},${y} ${x + w - d * 0.5},${y - d} ${x + w - d * 0.5},${y - d + h} ${x + w - d * 0.3},${y + h}" fill="#a8760d"/>
        <rect x="${x + w * 0.2}" y="${y + h * 0.28}" width="${w * 0.4}" height="${h * 0.16}" rx="2" fill="#8a6009" opacity=".5"/>
      </g>`;
  }

  /** A jeweller's balance scale. */
  function scale(x, y, s) {
    return `
      <g stroke="#e3b649" stroke-width="${s * 0.05}" fill="none" stroke-linecap="round">
        <path d="M${x} ${y + s * 0.9} L${x} ${y - s * 0.55}"/>
        <path d="M${x - s * 0.35} ${y + s * 0.95} L${x + s * 0.35} ${y + s * 0.95}"/>
        <g class="anim sway" style="transform-origin:${x}px ${y - s * 0.55}px">
          <path d="M${x - s * 0.75} ${y - s * 0.55} L${x + s * 0.75} ${y - s * 0.55}"/>
          <path d="M${x - s * 0.75} ${y - s * 0.55} L${x - s * 0.75} ${y - s * 0.2}"/>
          <path d="M${x + s * 0.75} ${y - s * 0.55} L${x + s * 0.75} ${y - s * 0.2}"/>
          <path d="M${x - s * 1.05} ${y - s * 0.2} A ${s * 0.3} ${s * 0.24} 0 0 0 ${x - s * 0.45} ${y - s * 0.2}" fill="#f0cd70" opacity=".85"/>
          <path d="M${x + s * 0.45} ${y - s * 0.2} A ${s * 0.3} ${s * 0.24} 0 0 0 ${x + s * 1.05} ${y - s * 0.2}" fill="#f0cd70" opacity=".85"/>
        </g>
        <circle cx="${x}" cy="${y - s * 0.62}" r="${s * 0.08}" fill="#fff2c0" stroke="none"/>
      </g>`;
  }

  /** A banknote in perspective. */
  function note(x, y, w, rot, tint) {
    const h = w * 0.45;
    return `
      <g transform="rotate(${rot} ${x} ${y})">
        <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${w * 0.03}" fill="${tint || "#3f8f6a"}" opacity=".92"/>
        <rect x="${x - w / 2 + 6}" y="${y - h / 2 + 5}" width="${w - 12}" height="${h - 10}" rx="3" fill="none" stroke="#eafff4" stroke-width="1.2" opacity=".6"/>
        <circle cx="${x}" cy="${y}" r="${h * 0.26}" fill="#eafff4" opacity=".35"/>
        <rect x="${x - w / 2 + 10}" y="${y - h * 0.32}" width="${w * 0.16}" height="${h * 0.12}" fill="#eafff4" opacity=".5"/>
      </g>`;
  }

  /** A candlestick price chart standing on the floor. */
  function candles(x, y, n) {
    let out = "";
    let v = 0;
    for (let i = 0; i < n; i++) {
      const up = Math.random() > 0.42;
      const h = rnd(26, 78);
      v += rnd(-14, 20);
      const cx = x + i * 30;
      const cy = y - v;
      out += `
        <line x1="${cx}" y1="${cy - h / 2 - 12}" x2="${cx}" y2="${cy + h / 2 + 12}" stroke="${up ? "#35d6a4" : "#ff7a8a"}" stroke-width="2" opacity=".8"/>
        <rect x="${cx - 8}" y="${cy - h / 2}" width="16" height="${h}" rx="2" fill="${up ? "#35d6a4" : "#ff7a8a"}" opacity=".9"/>
        <rect x="${cx - 8}" y="${cy - h / 2}" width="5" height="${h}" rx="2" fill="#ffffff" opacity=".25"/>`;
    }
    return out;
  }

  /** A printed receipt with a torn edge. */
  function receipt(x, y, w, rot) {
    const h = w * 1.35;
    let lines = "";
    for (let i = 0; i < 6; i++) {
      lines += `<rect x="${x - w / 2 + 10}" y="${y - h / 2 + 26 + i * 15}" width="${w - 20 - (i % 3) * 14}" height="4" rx="2" fill="#8e9bb5" opacity=".7"/>`;
    }
    let zig = `M${x - w / 2} ${y + h / 2 - 10}`;
    for (let i = 0; i <= 6; i++) zig += ` L${x - w / 2 + (w / 6) * i} ${y + h / 2 - (i % 2 ? 0 : 10)}`;
    zig += ` L${x + w / 2} ${y - h / 2} L${x - w / 2} ${y - h / 2} Z`;
    return `
      <g transform="rotate(${rot} ${x} ${y})">
        <path d="${zig}" fill="#f7f9fd" opacity=".95"/>
        <rect x="${x - w / 2 + 10}" y="${y - h / 2 + 10}" width="${w * 0.5}" height="7" rx="3" fill="#4b3fb0" opacity=".8"/>
        ${lines}
        <rect x="${x - w / 2 + 10}" y="${y + h / 2 - 34}" width="${w - 20}" height="9" rx="3" fill="#4b3fb0" opacity=".45"/>
      </g>`;
  }

  /** An AI chip with pins. */
  function chip(x, y, s) {
    let pins = "";
    for (let i = 0; i < 5; i++) {
      const o = -s * 0.6 + i * s * 0.3;
      pins += `<rect x="${x + o}" y="${y - s * 0.95}" width="${s * 0.1}" height="${s * 0.2}" fill="#8b7bff" opacity=".8"/>
               <rect x="${x + o}" y="${y + s * 0.75}" width="${s * 0.1}" height="${s * 0.2}" fill="#8b7bff" opacity=".8"/>
               <rect x="${x - s * 0.95}" y="${y + o}" width="${s * 0.2}" height="${s * 0.1}" fill="#8b7bff" opacity=".8"/>
               <rect x="${x + s * 0.75}" y="${y + o}" width="${s * 0.2}" height="${s * 0.1}" fill="#8b7bff" opacity=".8"/>`;
    }
    return `
      <g>${pins}
        <rect x="${x - s * 0.75}" y="${y - s * 0.75}" width="${s * 1.5}" height="${s * 1.5}" rx="${s * 0.14}" fill="#241f4d"/>
        <rect x="${x - s * 0.75}" y="${y - s * 0.75}" width="${s * 1.5}" height="${s * 0.5}" rx="${s * 0.14}" fill="#ffffff" opacity=".12"/>
        <rect x="${x - s * 0.42}" y="${y - s * 0.42}" width="${s * 0.84}" height="${s * 0.84}" rx="${s * 0.08}" fill="none" stroke="#a78bfa" stroke-width="2" opacity=".9"/>
        <circle cx="${x}" cy="${y}" r="${s * 0.16}" fill="#c4b5fd"/>
      </g>`;
  }

  /** A scanning beam over a document. */
  function scanner(x, y, w) {
    return `
      <g>
        <rect x="${x - w / 2}" y="${y - w * 0.3}" width="${w}" height="${w * 0.6}" rx="6" fill="none" stroke="#3fc9e8" stroke-width="2" opacity=".6"/>
        <g class="anim scan" style="transform-origin:${x}px ${y}px">
          <rect x="${x - w / 2}" y="${y - 3}" width="${w}" height="6" fill="#3fc9e8" opacity=".85"/>
        </g>
        <path d="M${x - w / 2} ${y - w * 0.3} h${w * 0.16} M${x - w / 2} ${y - w * 0.3} v${w * 0.14}" stroke="#3fc9e8" stroke-width="3" fill="none"/>
        <path d="M${x + w / 2} ${y + w * 0.3} h-${w * 0.16} M${x + w / 2} ${y + w * 0.3} v-${w * 0.14}" stroke="#3fc9e8" stroke-width="3" fill="none"/>
      </g>`;
  }

  /** A tear-off calendar page. */
  function calendarPage(x, y, w, day) {
    const h = w * 1.1;
    return `
      <g>
        <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="8" fill="#f6f9ff" opacity=".95"/>
        <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h * 0.26}" rx="8" fill="#2d6fd1"/>
        <text x="${x}" y="${y + h * 0.22}" text-anchor="middle" font-size="${w * 0.46}" font-weight="700" fill="#2d6fd1" font-family="sans-serif">${day}</text>
        <circle cx="${x - w * 0.22}" cy="${y - h / 2}" r="4" fill="#9db6dd"/>
        <circle cx="${x + w * 0.22}" cy="${y - h / 2}" r="4" fill="#9db6dd"/>
      </g>`;
  }

  /** A clock face. */
  function clock(x, y, r) {
    return `
      <g>
        <circle cx="${x}" cy="${y}" r="${r}" fill="#eaf2ff" opacity=".92"/>
        <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#2d6fd1" stroke-width="${r * 0.1}"/>
        <circle cx="${x}" cy="${y}" r="${r * 0.75}" fill="none" stroke="#7ee0c0" stroke-width="1.5" opacity=".6"/>
        <g class="anim spin-slow" style="transform-origin:${x}px ${y}px">
          <line x1="${x}" y1="${y}" x2="${x}" y2="${y - r * 0.6}" stroke="#2d6fd1" stroke-width="${r * 0.09}" stroke-linecap="round"/>
        </g>
        <g class="anim spin-fast" style="transform-origin:${x}px ${y}px">
          <line x1="${x}" y1="${y}" x2="${x + r * 0.5}" y2="${y}" stroke="#ff7a8a" stroke-width="${r * 0.06}" stroke-linecap="round"/>
        </g>
        <circle cx="${x}" cy="${y}" r="${r * 0.09}" fill="#2d6fd1"/>
      </g>`;
  }

  /** A checklist clipboard. */
  function clipboard(x, y, w) {
    const h = w * 1.3;
    let rows = "";
    for (let i = 0; i < 4; i++) {
      const cy = y - h * 0.22 + i * h * 0.17;
      rows += `<rect x="${x - w * 0.3}" y="${cy - 6}" width="12" height="12" rx="3" fill="none" stroke="#2d6fd1" stroke-width="2"/>
               ${i < 3 ? `<path d="M${x - w * 0.28} ${cy} l4 4 l6 -8" stroke="#159a5c" stroke-width="2.4" fill="none" stroke-linecap="round"/>` : ""}
               <rect x="${x - w * 0.12}" y="${cy - 4}" width="${w * 0.36 - i * 8}" height="6" rx="3" fill="#9db6dd" opacity=".8"/>`;
    }
    return `
      <g>
        <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="10" fill="#f6f9ff" opacity=".95"/>
        <rect x="${x - w * 0.16}" y="${y - h / 2 - 8}" width="${w * 0.32}" height="16" rx="6" fill="#2d6fd1"/>
        ${rows}
      </g>`;
  }

  /** A flying envelope. */
  function envelope(x, y, w, rot, open) {
    const h = w * 0.66;
    return `
      <g transform="rotate(${rot} ${x} ${y})">
        <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="6" fill="#fff3ef"/>
        <path d="M${x - w / 2} ${y - h / 2} L${x} ${y + (open ? -h * 0.5 : h * 0.12)} L${x + w / 2} ${y - h / 2} Z" fill="${open ? "#ffb9a8" : "#ff9d86"}"/>
        <path d="M${x - w / 2} ${y + h / 2} L${x - w * 0.1} ${y} M${x + w / 2} ${y + h / 2} L${x + w * 0.1} ${y}" stroke="#ffd0c4" stroke-width="2" fill="none"/>
        <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="6" fill="none" stroke="#d4462f" stroke-width="1.6" opacity=".45"/>
      </g>`;
  }

  /** A colour-coded label tag. */
  function tag(x, y, w, fill) {
    return `
      <g>
        <path d="M${x - w / 2} ${y - w * 0.2} h${w * 0.7} l${w * 0.3} ${w * 0.2} l-${w * 0.3} ${w * 0.2} h-${w * 0.7} z" fill="${fill}" opacity=".9"/>
        <circle cx="${x - w * 0.32}" cy="${y}" r="${w * 0.06}" fill="#fff" opacity=".85"/>
      </g>`;
  }

  /* ============================================================
     Shared scene furniture
     ============================================================ */
  function nebula(a, b, c) {
    const A = nid("nA"), B = nid("nB"), C = nid("nC"), F = nid("nF");
    return {
      defs: `
        <radialGradient id="${A}"><stop offset="0%" stop-color="${a}" stop-opacity=".85"/><stop offset="100%" stop-color="${a}" stop-opacity="0"/></radialGradient>
        <radialGradient id="${B}"><stop offset="0%" stop-color="${b}" stop-opacity=".8"/><stop offset="100%" stop-color="${b}" stop-opacity="0"/></radialGradient>
        <radialGradient id="${C}"><stop offset="0%" stop-color="${c}" stop-opacity=".7"/><stop offset="100%" stop-color="${c}" stop-opacity="0"/></radialGradient>
        <filter id="${F}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="88"/></filter>`,
      body: `
        <g class="bg-blobs" filter="url(#${F})">
          <ellipse cx="1400" cy="90" rx="400" ry="300" fill="url(#${A})"/>
          <ellipse cx="140" cy="820" rx="440" ry="330" fill="url(#${B})"/>
          <ellipse cx="900" cy="900" rx="420" ry="230" fill="url(#${C})"/>
        </g>`,
    };
  }

  function floorGrid(colour) {
    const F = nid("fl");
    return `
      <defs><linearGradient id="${F}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${colour}" stop-opacity=".3"/><stop offset="100%" stop-color="${colour}" stop-opacity="0"/>
      </linearGradient></defs>
      <g class="bg-floor" stroke="url(#${F})" stroke-width="1.4" fill="none">
        <path d="M-200 900 L760 470"/><path d="M120 900 L800 470"/><path d="M440 900 L840 470"/>
        <path d="M760 900 L880 470"/><path d="M1080 900 L920 470"/><path d="M1400 900 L960 470"/>
        <path d="M1800 900 L1000 470"/>
        <path d="M0 600 H1600" opacity=".45"/><path d="M0 670 H1600" opacity=".36"/>
        <path d="M0 760 H1600" opacity=".28"/><path d="M0 870 H1600" opacity=".2"/>
      </g>`;
  }

  /** Star layers with parallax depth and twinkle. */
  function starfield(counts) {
    return counts
      .map((c, i) => {
        const depth = [0.06, 0.16, 0.34][i];
        const rmax = [1.1, 1.8, 2.8][i];
        let dots = "";
        for (let k = 0; k < c; k++) {
          dots += `<circle cx="${rnd(-80, 1680).toFixed(0)}" cy="${rnd(-60, 960).toFixed(0)}" r="${rnd(0.6, rmax).toFixed(2)}"
                    opacity="${rnd(0.35, 1).toFixed(2)}" style="animation-delay:${rnd(0, 4).toFixed(1)}s"/>`;
        }
        return `<g class="layer" data-depth="${depth}"><g class="bg-stars twinkle" fill="#ffffff">${dots}</g></g>`;
      })
      .join("");
  }

  /* ============================================================
     Scenes
     ============================================================ */
  const SCENES = {};

  /* --- home: a galaxy --- */
  SCENES.home = function () {
    const core = nid("core"), arm = nid("arm"), pl = nid("pl"), hal = nid("hal");
    return `
      <defs>
        <radialGradient id="${core}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fffdf2" stop-opacity=".95"/>
          <stop offset="22%" stop-color="#ffe6a6" stop-opacity=".8"/>
          <stop offset="55%" stop-color="#e0b64d" stop-opacity=".35"/>
          <stop offset="100%" stop-color="#7a5cff" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="${arm}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7a5cff" stop-opacity=".0"/>
          <stop offset="40%" stop-color="#2fd8d0" stop-opacity=".55"/>
          <stop offset="75%" stop-color="#e0b64d" stop-opacity=".45"/>
          <stop offset="100%" stop-color="#7a5cff" stop-opacity="0"/>
        </linearGradient>
        <radialGradient id="${pl}" cx="34%" cy="28%" r="76%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity=".9"/>
          <stop offset="20%" stop-color="#5ad9e8" stop-opacity=".92"/>
          <stop offset="70%" stop-color="#2b4a8f" stop-opacity=".9"/>
          <stop offset="100%" stop-color="#05070c" stop-opacity=".92"/>
        </radialGradient>
        <radialGradient id="${hal}"><stop offset="0%" stop-color="#7a5cff" stop-opacity=".5"/><stop offset="100%" stop-color="#7a5cff" stop-opacity="0"/></radialGradient>
        <filter id="${nid("gb")}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="34"/></filter>
      </defs>

      <!-- deep space wash -->
      <g class="bg-blobs">
        <ellipse cx="700" cy="640" rx="720" ry="470" fill="url(#${hal})"/>
      </g>

      ${starfield([150, 90, 46])}

      <!-- spiral arms, turning very slowly -->
      <g class="layer" data-depth="0.1">
        <g class="anim galaxy-spin" style="transform-origin:700px 640px">
          <g class="bg-arms" stroke="url(#${arm})" fill="none" stroke-linecap="round">
            <path d="M700 640 C 850 520, 1090 540, 1170 680 C 1235 800, 1085 950, 900 930" stroke-width="42" opacity=".5"/>
            <path d="M700 640 C 550 760, 310 740, 230 600 C 165 480, 315 330, 500 350" stroke-width="42" opacity=".5"/>
            <path d="M700 640 C 810 560, 985 570, 1050 670" stroke-width="14" opacity=".65"/>
            <path d="M700 640 C 590 720, 415 710, 350 610" stroke-width="14" opacity=".65"/>
          </g>
          <g class="bg-stars" fill="#ffffff" opacity=".8">
            <circle cx="1040" cy="600" r="2.2"/><circle cx="1120" cy="710" r="1.8"/>
            <circle cx="380" cy="676" r="2"/><circle cx="288" cy="562" r="1.6"/>
            <circle cx="912" cy="546" r="1.8"/><circle cx="500" cy="734" r="2.1"/>
          </g>
        </g>
      </g>

      <!-- galactic core -->
      <g class="layer" data-depth="0.05">
        <g class="anim breathe" style="transform-origin:700px 640px">
          <ellipse cx="700" cy="640" rx="245" ry="175" fill="url(#${core})"/>
          <ellipse cx="700" cy="640" rx="78" ry="58" fill="#fffdf2" opacity=".55" filter="url(#${nid("gb")})"/>
        </g>
      </g>

      <!-- a ringed planet drifting in the foreground -->
      ${layer(0.45, "float-a", 1450, 155, 0, `
        <ellipse cx="1450" cy="155" rx="140" ry="36" fill="none" stroke="#e0b64d" stroke-width="7" opacity=".55" transform="rotate(-18 1450 155)"/>
        <circle cx="1450" cy="155" r="74" fill="url(#${pl})"/>
        <ellipse cx="1426" cy="126" rx="20" ry="13" fill="#fff" opacity=".5" transform="rotate(-24 1426 126)"/>
        <path d="M1310 171 A 140 36 0 0 0 1590 139" fill="none" stroke="#e0b64d" stroke-width="7" opacity=".85" transform="rotate(-18 1450 155)"/>`)}

      <!-- a small moon -->
      ${layer(0.6, "float-c", 130, 250, 1.4, `
        <circle cx="130" cy="250" r="30" fill="#cfd8ea" opacity=".9"/>
        <circle cx="120" cy="240" r="8" fill="#ffffff" opacity=".5"/>
        <circle cx="141" cy="261" r="5" fill="#9aa7c2" opacity=".6"/>`)}

      <!-- comet -->
      ${layer(0.28, "comet", 300, 120, 0, `
        <path d="M180 60 L340 150" stroke="#fff2c0" stroke-width="4" stroke-linecap="round" opacity=".7"/>
        <circle cx="344" cy="153" r="5" fill="#fffdf2"/>`)}
    `;
  };

  /* --- gold-invoice: a jeweller's counter --- */
  SCENES["gold-invoice"] = function () {
    const n = nebula("#f0c14b", "#c98a1e", "#68d7c6");
    return `
      ${n.defs}${n.body}
      ${floorGrid("#f0c14b")}
      ${layer(0.5, "float-a", 170, 700, 0, scale(170, 700, 118))}
      ${layer(0.62, "coin-flip", 1440, 250, 0, coin(1440, 250, 52))}
      ${layer(0.4, "float-b", 1520, 470, 0.8, coin(1520, 470, 36, "۱۸"))}
      ${layer(0.34, "float-c", 110, 300, 1.6, coin(110, 300, 32, "﷼"))}
      ${layer(0.55, "spin-tilt", 1370, 660, 0, ring(1370, 660, 74, 37, -16))}
      ${layer(0.44, "float-c", 190, 470, 1.1, ring(190, 470, 50, 26, 24))}
      ${layer(0.7, "float-a", 1330, 840, 0.4, ingot(1290, 830, 125))}
      ${layer(0.66, "sparkle", 1530, 120, 0, gem(1530, 120, 34, "#68d7c6"))}
      ${layer(0.5, "sparkle", 80, 620, 1.2, gem(80, 620, 26, "#f5cd5b"))}
      ${layer(0.3, "float-b", 640, 820, 0.6, receipt(640, 820, 96, -8))}
    `;
  };

  /* --- price-bot: a trading desk --- */
  SCENES["price-bot"] = function () {
    const n = nebula("#35d6a4", "#1f9d92", "#e0b64d");
    return `
      ${n.defs}${n.body}
      ${floorGrid("#35d6a4")}
      ${layer(0.36, "float-b", 1330, 780, 0, `<g opacity=".95">${candles(1180, 790, 8)}</g>`)}
      ${layer(0.55, "float-a", 190, 690, 0, `
        <path d="M70 810 L170 720 L240 766 L330 640" stroke="#35d6a4" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M296 640 L330 640 L330 676" stroke="#35d6a4" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="170" cy="720" r="7" fill="#eafff4"/><circle cx="240" cy="766" r="7" fill="#eafff4"/>`)}
      ${layer(0.68, "coin-flip", 150, 210, 0, coin(150, 210, 54))}
      ${layer(0.46, "float-c", 1490, 250, 1.1, coin(1490, 250, 38, "﷼"))}
      ${layer(0.6, "float-a", 1420, 520, 0.5, note(1420, 520, 160, -14, "#3f8f6a"))}
      ${layer(0.44, "float-b", 160, 470, 1.4, note(160, 470, 125, 9, "#2f6f8f"))}
      ${layer(0.5, "float-c", 1530, 760, 0.3, `
        <circle cx="1530" cy="760" r="42" fill="none" stroke="#e0b64d" stroke-width="5" opacity=".8"/>
        <text x="1530" y="777" text-anchor="middle" font-size="48" fill="#e0b64d" font-family="serif" opacity=".95">$</text>`)}
      ${layer(0.38, "float-a", 80, 840, 0.9, `
        <circle cx="80" cy="840" r="32" fill="none" stroke="#35d6a4" stroke-width="4" opacity=".75"/>
        <text x="80" y="853" text-anchor="middle" font-size="36" fill="#35d6a4" font-family="serif">€</text>`)}
    `;
  };

  /* --- invoice-ai: a scanning bench --- */
  SCENES["invoice-ai"] = function () {
    const n = nebula("#8b7bff", "#4b3fb0", "#3fc9e8");
    let net = "";
    const pts = [[1400, 200], [1500, 140], [1510, 280], [1560, 210], [1420, 340], [1540, 380]];
    pts.forEach((p, i) => {
      pts.slice(i + 1).forEach((q) => {
        if (Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) < 220)
          net += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="#a78bfa" stroke-width="1.6" opacity=".55"/>`;
      });
    });
    pts.forEach((p, i) => {
      net += `<circle cx="${p[0]}" cy="${p[1]}" r="${7 - (i % 3)}" fill="#c4b5fd" class="twinkle" style="animation-delay:${i * 0.4}s"/>`;
    });
    return `
      ${n.defs}${n.body}
      ${floorGrid("#8b7bff")}
      ${layer(0.6, "float-a", 180, 390, 0, receipt(180, 390, 132, -9))}
      ${layer(0.44, "float-b", 620, 810, 0.7, receipt(620, 810, 104, 12))}
      ${layer(0.32, "float-c", 120, 740, 1.5, receipt(120, 740, 88, -19))}
      ${layer(0.5, "float-b", 180, 390, 0, scanner(180, 390, 200))}
      ${layer(0.66, "float-c", 1430, 620, 0.4, chip(1430, 620, 62))}
      ${layer(0.4, "drift", 1480, 265, 0, `<g>${net}</g>`)}
      ${layer(0.55, "float-a", 1330, 840, 1.1, `
        <rect x="1250" y="800" width="160" height="100" rx="12" fill="#241f4d" opacity=".9"/>
        <rect x="1250" y="800" width="160" height="32" rx="12" fill="#ffffff" opacity=".12"/>
        <circle cx="1288" cy="856" r="12" fill="#3fc9e8"/><circle cx="1326" cy="856" r="12" fill="#a78bfa"/>
        <rect x="1350" y="850" width="44" height="12" rx="6" fill="#c4b5fd" opacity=".7"/>`)}
    `;
  };

  /* --- daily-report: a planner desk --- */
  SCENES["daily-report"] = function () {
    const n = nebula("#4aa8ff", "#2d6fd1", "#7ee0c0");
    return `
      ${n.defs}${n.body}
      ${floorGrid("#4aa8ff")}
      ${layer(0.55, "float-a", 165, 390, 0, calendarPage(165, 390, 128, "۰۷"))}
      ${layer(0.4, "float-c", 1500, 190, 0.9, calendarPage(1500, 190, 92, "۰۸"))}
      ${layer(0.62, "float-b", 1450, 520, 0.3, clock(1450, 520, 70))}
      ${layer(0.5, "float-c", 175, 730, 1.2, clipboard(175, 730, 126))}
      ${layer(0.36, "float-a", 700, 800, 0.6, `
        <g>
          <rect x="620" y="790" width="24" height="72" rx="5" fill="#4aa8ff" opacity=".85"/>
          <rect x="656" y="756" width="24" height="106" rx="5" fill="#7ee0c0" opacity=".85"/>
          <rect x="692" y="722" width="24" height="140" rx="5" fill="#2d6fd1" opacity=".85"/>
          <rect x="620" y="790" width="8" height="72" rx="4" fill="#fff" opacity=".28"/>
          <rect x="656" y="756" width="8" height="106" rx="4" fill="#fff" opacity=".28"/>
          <rect x="692" y="722" width="8" height="140" rx="4" fill="#fff" opacity=".28"/>
        </g>`)}
      ${layer(0.66, "sparkle", 1540, 790, 0.5, `
        <path d="M1530 770 l10 22 l24 4 l-18 16 l5 24 l-21 -12 l-21 12 l5 -24 l-18 -16 l24 -4 z" fill="#7ee0c0" opacity=".9"/>`)}
    `;
  };

  /* --- gmail-agent: a mail room --- */
  SCENES["gmail-agent"] = function () {
    const n = nebula("#ff7a8a", "#d4462f", "#f2b23c");
    return `
      ${n.defs}${n.body}
      ${floorGrid("#ff7a8a")}
      ${layer(0.6, "float-a", 175, 320, 0, envelope(175, 320, 160, -12, true))}
      ${layer(0.46, "float-b", 1500, 170, 0.8, envelope(1500, 170, 118, 14))}
      ${layer(0.34, "float-c", 120, 620, 1.5, envelope(120, 620, 96, -22))}
      ${layer(0.52, "float-c", 1430, 690, 0.4, envelope(1430, 690, 132, 8))}
      ${layer(0.68, "float-a", 740, 820, 0.2, `
        <circle cx="740" cy="820" r="58" fill="none" stroke="#f2b23c" stroke-width="6" opacity=".8"/>
        <text x="740" y="843" text-anchor="middle" font-size="68" fill="#f2b23c" font-family="serif" opacity=".95">@</text>`)}
      ${layer(0.42, "float-b", 1160, 850, 1, `
        <g>
          <path d="M1080 860 h170 l-20 -52 h-130 z" fill="#ffd6cb" opacity=".9"/>
          <path d="M1080 860 h170 v30 h-170 z" fill="#ff9d86" opacity=".9"/>
          <path d="M1080 860 h46 a22 22 0 0 0 44 0 h46" fill="none" stroke="#d4462f" stroke-width="3"/>
        </g>`)}
      ${layer(0.56, "float-c", 1520, 420, 0.6, tag(1520, 420, 104, "#f2b23c"))}
      ${layer(0.44, "float-a", 90, 430, 1.3, tag(90, 430, 88, "#ff7a8a"))}
    `;
  };

  /* --- about / contact --- */
  SCENES.about = function () {
    const n = nebula("#7fb3d5", "#3f6f8f", "#e0b64d");
    return `
      ${n.defs}${n.body}
      ${starfield([90, 50, 24])}
      ${floorGrid("#7fb3d5")}
      ${layer(0.55, "float-a", 320, 620, 0, `
        <circle cx="320" cy="620" r="120" fill="none" stroke="#7fb3d5" stroke-width="3" opacity=".6"/>
        <circle cx="320" cy="620" r="76" fill="none" stroke="#e0b64d" stroke-width="2" opacity=".6"/>
        <circle cx="320" cy="620" r="34" fill="#e0b64d" opacity=".35"/>`)}
      ${layer(0.4, "drift", 1300, 320, 0, `
        <ellipse cx="1300" cy="320" rx="190" ry="66" fill="none" stroke="#7fb3d5" stroke-width="6" opacity=".55"/>
        <circle cx="1490" cy="320" r="12" fill="#e0b64d"/>`)}
    `;
  };

  SCENES.contact = function () {
    const n = nebula("#2fd8d0", "#1d8f9c", "#e0b64d");
    return `
      ${n.defs}${n.body}
      ${starfield([100, 56, 26])}
      ${floorGrid("#2fd8d0")}
      ${layer(0.6, "float-a", 380, 400, 0, envelope(380, 400, 170, -10, true))}
      ${layer(0.44, "float-c", 1300, 620, 0.9, `
        <circle cx="1300" cy="620" r="58" fill="none" stroke="#2fd8d0" stroke-width="6" opacity=".8"/>
        <text x="1300" y="644" text-anchor="middle" font-size="66" fill="#2fd8d0" font-family="serif">@</text>`)}
      ${layer(0.34, "float-b", 1420, 250, 1.4, `
        <circle cx="1420" cy="250" r="44" fill="none" stroke="#e0b64d" stroke-width="4" opacity=".7"/>
        <path d="M1400 250 h40 M1420 230 v40" stroke="#e0b64d" stroke-width="4" opacity=".7"/>`)}
    `;
  };

  /* ============================================================
     Mount + pointer parallax
     ============================================================ */
  const host = document.getElementById("bg");
  let layers = [];
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function tick() {
    cx += (tx - cx) * 0.07;
    cy += (ty - cy) * 0.07;
    for (let i = 0; i < layers.length; i++) {
      const d = parseFloat(layers[i].getAttribute("data-depth")) || 0;
      layers[i].setAttribute("transform", "translate(" + (cx * d * 120).toFixed(2) + " " + (cy * d * 90).toFixed(2) + ")");
    }
    raf = requestAnimationFrame(tick);
  }

  function onMove(e) {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  function onTilt(e) {
    if (e.gamma == null) return;
    tx = Math.max(-1, Math.min(1, e.gamma / 35));
    ty = Math.max(-1, Math.min(1, (e.beta - 45) / 35));
  }

  function set(key) {
    if (!host) return;
    if (host.dataset.scene === key) return;
    host.dataset.scene = key;
    const build = SCENES[key] || SCENES.home;
    ids += 1;
    host.classList.remove("is-in");
    host.innerHTML =
      '<svg class="bg-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      build() +
      "</svg>";
    layers = Array.prototype.slice.call(host.querySelectorAll(".layer"));
    requestAnimationFrame(() => host.classList.add("is-in"));
  }

  if (!reduced) {
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onTilt, { passive: true });
    raf = requestAnimationFrame(tick);
  }

  window.Backgrounds = { set, SCENES };
})();
