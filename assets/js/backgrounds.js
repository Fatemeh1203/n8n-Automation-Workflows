/* ============================================================
   Backgrounds — self-contained 3D-looking scenes.
   Everything is inline SVG: no images, no CDN, no requests.
   Each scene = blurred colour volumes + a glossy sphere +
   a tilted ring + a perspective floor.
   ============================================================ */
(function () {
  const SCENES = {
    home:           { a: "#e0b64d", b: "#2fd8d0", c: "#7a5cff", tilt: -18 },
    "gold-invoice": { a: "#f0c14b", b: "#c98a1e", c: "#68d7c6", tilt: -12 },
    "price-bot":    { a: "#35d6a4", b: "#1f9d92", c: "#e0b64d", tilt: 14 },
    "invoice-ai":   { a: "#8b7bff", b: "#4b3fb0", c: "#3fc9e8", tilt: -22 },
    "daily-report": { a: "#4aa8ff", b: "#2d6fd1", c: "#7ee0c0", tilt: 20 },
    "gmail-agent":  { a: "#ff7a8a", b: "#d4462f", c: "#f2b23c", tilt: -8 },
    about:          { a: "#7fb3d5", b: "#3f6f8f", c: "#e0b64d", tilt: 10 },
    contact:        { a: "#2fd8d0", b: "#1d8f9c", c: "#e0b64d", tilt: -14 },
  };

  /** Build one scene as an SVG string. */
  function scene(key) {
    const p = SCENES[key] || SCENES.home;
    const uid = "s" + Math.random().toString(36).slice(2, 8);
    const g = (n) => uid + "-" + n;

    return `
<svg class="bg-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <radialGradient id="${g("blobA")}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${p.a}" stop-opacity=".85"/>
      <stop offset="100%" stop-color="${p.a}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${g("blobB")}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${p.b}" stop-opacity=".8"/>
      <stop offset="100%" stop-color="${p.b}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${g("blobC")}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${p.c}" stop-opacity=".7"/>
      <stop offset="100%" stop-color="${p.c}" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="${g("sphere")}" cx="34%" cy="28%" r="76%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity=".95"/>
      <stop offset="18%" stop-color="${p.a}" stop-opacity=".92"/>
      <stop offset="62%" stop-color="${p.b}" stop-opacity=".85"/>
      <stop offset="100%" stop-color="#05070c" stop-opacity=".9"/>
    </radialGradient>
    <radialGradient id="${g("sphere2")}" cx="30%" cy="26%" r="78%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity=".9"/>
      <stop offset="22%" stop-color="${p.c}" stop-opacity=".9"/>
      <stop offset="100%" stop-color="#05070c" stop-opacity=".85"/>
    </radialGradient>

    <linearGradient id="${g("ring")}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.a}" stop-opacity=".9"/>
      <stop offset="45%" stop-color="${p.c}" stop-opacity=".25"/>
      <stop offset="100%" stop-color="${p.b}" stop-opacity=".85"/>
    </linearGradient>

    <linearGradient id="${g("floor")}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${p.a}" stop-opacity=".28"/>
      <stop offset="100%" stop-color="${p.a}" stop-opacity="0"/>
    </linearGradient>

    <filter id="${g("blur")}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="90"/>
    </filter>
    <filter id="${g("softShadow")}" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
  </defs>

  <!-- colour volumes -->
  <g class="bg-blobs" filter="url(#${g("blur")})">
    <ellipse cx="1400" cy="90" rx="400" ry="300" fill="url(#${g("blobA")})"/>
    <ellipse cx="140" cy="820" rx="440" ry="330" fill="url(#${g("blobB")})"/>
    <ellipse cx="900" cy="900" rx="420" ry="230" fill="url(#${g("blobC")})"/>
  </g>

  <!-- perspective floor -->
  <g class="bg-floor" stroke="url(#${g("floor")})" stroke-width="1.4" fill="none">
    <path d="M-200 900 L760 470"/><path d="M120 900 L800 470"/><path d="M440 900 L840 470"/>
    <path d="M760 900 L880 470"/><path d="M1080 900 L920 470"/><path d="M1400 900 L960 470"/>
    <path d="M1800 900 L1000 470"/>
    <path d="M0 600 H1600" opacity=".45"/><path d="M0 670 H1600" opacity=".36"/>
    <path d="M0 760 H1600" opacity=".28"/><path d="M0 870 H1600" opacity=".2"/>
  </g>

  <!-- tilted ring, low and to the side -->
  <g class="bg-ring" transform="translate(1290 800) rotate(${p.tilt})">
    <ellipse rx="270" ry="92" fill="none" stroke="url(#${g("ring")})" stroke-width="14"/>
    <ellipse rx="270" ry="92" fill="none" stroke="#ffffff" stroke-width="2" opacity=".3"/>
  </g>

  <!-- glossy spheres, pushed into the corners -->
  <g class="bg-orb">
    <ellipse cx="150" cy="905" rx="180" ry="38" fill="#000" opacity=".25" filter="url(#${g("softShadow")})"/>
    <circle cx="150" cy="770" r="180" fill="url(#${g("sphere")})"/>
    <ellipse cx="92" cy="694" rx="52" ry="34" fill="#fff" opacity=".5" transform="rotate(-24 92 694)"/>
    <circle cx="150" cy="770" r="180" fill="none" stroke="#fff" stroke-width="1.4" opacity=".2"/>
  </g>
  <g class="bg-orb">
    <circle cx="1470" cy="130" r="105" fill="url(#${g("sphere2")})"/>
    <ellipse cx="1436" cy="88" rx="30" ry="19" fill="#fff" opacity=".5" transform="rotate(-24 1436 88)"/>
  </g>

  <!-- floating motes -->
  <g class="bg-motes" fill="#fff">
    <circle cx="1180" cy="120" r="2.6"/><circle cx="380" cy="640" r="2.2"/>
    <circle cx="1520" cy="380" r="2.8"/><circle cx="80" cy="380" r="2.4"/>
    <circle cx="700" cy="840" r="2"/><circle cx="1340" cy="620" r="2.4"/>
  </g>
</svg>`;
  }

  const layer = document.getElementById("bg");

  /** Swap the background scene with a short cross-fade. */
  function set(key) {
    if (!layer) return;
    if (layer.dataset.scene === key) return;
    layer.dataset.scene = key;
    layer.classList.remove("is-in");
    layer.innerHTML = scene(key);
    requestAnimationFrame(() => layer.classList.add("is-in"));
  }

  window.Backgrounds = { set, scene, SCENES };
})();
