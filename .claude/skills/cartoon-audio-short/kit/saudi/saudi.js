// ---------------- Saudi neighbourhood cast, built on the same Pen / blob / face helpers ----------------
FACE.scared = { eye: ["shock", "shock"], brow: [-5, -6], mouth: "wave" };
FACE.cry = { eye: ["squeeze", "squeeze"], brow: [-3, 3], mouth: "O" };
FACE.sad = { eye: ["small", "small"], brow: [-4, 3], mouth: "frown" };
FACE.brave = { eye: ["lid", "lid"], brow: [4, -2], mouth: "dash" };
FACE.sleep = { eye: ["dash", "dash"], brow: [0, -1], mouth: "dash" };
FACE.calm = { eye: ["dot", "dot"], brow: [0, -1], mouth: "smile" };
FACE.hush = { eye: ["lid", "lid"], brow: [-1, -2], mouth: "o" };

export const SAUDI = {
  girl: { top: "#f4f1e4", bib: "#f2c24c", bottom: "#f2c24c", skin: "#fbd9bf", curly: "#3b3033", band: "#efece0", kid: true, slipper: "#7a4a3a", cheeks: true },
  girlDay: { top: "#e4573d", bottom: "#7a3f4a", skin: "#e8b48a", hairLong: "#2a1a22", clip: "#ffcf3a", kid: true, slipper: "#2b2b3a" },
  schoolA: { top: "#6fa08a", bottom: "#2f5a4a", skin: "#e8b48a", hairLong: "#2a1a22", kid: true, slipper: "#2b2b3a", collar: "#ffffff" },
  schoolB: { top: "#d98a5a", bottom: "#7a3f2a", skin: "#d9a27a", hairLong: "#4a2f22", kid: true, slipper: "#2b2b3a", collar: "#ffffff" },
  schoolC: { top: "#7a9ad0", bottom: "#2f3f7a", skin: "#f0c8a2", hairLong: "#1e1714", kid: true, slipper: "#2b2b3a", collar: "#ffffff" },
  mother: { dress: "#241e33", tunic: "#241e33", hijab: "#b4606f", skin: "#eec19a" },
  aunt: { dress: "#241e33", tunic: "#241e33", hijab: "#2f6a6a", skin: "#eec19a" },
  father: { dress: "#f6f1e6", tunic: "#f6f1e6", ghutra: "#f6f1e6", skin: "#e0aa7e", moustache: "#2a1c14", stout: true },
  man: { dress: "#f2efe6", tunic: "#f2efe6", ghutra: "#f2efe6", red: true, skin: "#d6a074", moustache: "#2a1c14" },
  sleeper: { top: "#6c8fb3", bottom: "#4f6f93", skin: "#d6a074", hairShort: "#241a16", moustache: "#2a1c14", slipper: "#2b2b3a" },
};

/** front-facing Saudi neighbourhood character. Same opts as romanFront plus: hairLong / hijab / ghutra via the outfit. */
export const saudiFront = (p, key, opts = {}) => {
  const O = typeof key === "string" ? SAUDI[key] : key;
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0, light = rad(-120), step = 0 } = opts;
  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.08, legsL = 1.38, sole = 975;
  const torsoBot = sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const long = !!O.dress, topC = O.top || O.tunic, botC = O.bottom || mix(topC, INK, 0.55), armCol = long ? O.dress : mix(topC, INK, 0.18);
  p.rot = null;
  // ---- legs ----
  for (const side of [-1, 1]) {
    const up = Math.max(0, Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)))) * 30 * (step ? 1 : 0);
    const hx = cx + side * 16 * u, fx = cx + side * 22 * u, fy = sole - 4 * u - up;
    if (!long) p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), O.kid ? 6.4 * u : 6 * u, botC);
    const shoe = O.slipper || "#3a2f2a";
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 8.5 * u + 3, INK);
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 8.5 * u, shoe);
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = { a: (0.4 * W) / 1.06 * (O.stout ? 1.12 : 1), b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.17 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.1 + k * u);
    switch (pose) {
      case "point": return { pts: [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]], front: false, finger: true };
      case "up": return { pts: [s, [X(14), s[1] - 0.3 * HH], [X(22), s[1] - 0.75 * HH]], front: false };
      case "wave": return { pts: [s, [X(16), s[1] - 0.2 * HH], [X(30 + 10 * Math.sin(opts.wv || 0)), s[1] - 0.62 * HH]], front: false };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.95, torsoBot - 0.3 * HH]], front: false };
      case "belly": return { pts: [s, [X(8), s[1] + 0.45 * HH], [tcx + side * 0.25 * T.a, torsoBot - 0.35 * HH]], front: true };
      case "hold": return { pts: [s, [X(6), s[1] + 0.42 * HH], [tcx - side * 0.15 * T.a, s[1] + 0.58 * HH]], front: true }; // cradling something
      case "cross": return { pts: [s, [X(2), s[1] + 0.38 * HH], [tcx - side * 0.45 * T.a, s[1] + 0.32 * HH]], front: true };
      case "hush": return { pts: [s, [X(20), s[1] + 0.12 * HH], [cx + side * 6 * u, hc + 0.5 * H.b]], front: true, finger: false };
      case "cover": return { pts: [s, [X(16), s[1] - 0.1 * HH], [cx + side * 22 * u, hc + 0.1 * H.b]], front: true };
      case "hug": return { pts: [s, [X(4), s[1] + 0.35 * HH], [tcx - side * 0.5 * T.a, s[1] + 0.5 * HH]], front: true };
      case "reach": return { pts: [s, [X(42), s[1] - 0.12 * HH], [X(82), s[1] - 0.45 * HH]], front: false };
      case "run": return { pts: [s, [X(16), s[1] + 0.22 * HH], [X(28), s[1] + 0.02 * HH - side * (opts.swing || 0) * 0.3 * HH]], front: false };
      case "cheek": return { pts: [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]], front: false };
      default: return { pts: [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.04 * HH]], front: false };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.4 * u, armCol);
    const [hx, hy] = a.pts[2]; p.dot(hx, hy, 5.6 * u, skin);
    if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); p.stroke([[hx, hy], [hx + dx / l * 14 * u, hy + dy / l * 14 * u]], 2.6 * u, skin); }
  };
  for (const a of arms) if (!a.front) drawArm(a);
  if (long) { // abaya / thobe down to the ankles
    const D = { a: 0.5 * W * (O.stout ? 1.02 : 0.96), b: 0.5 * ((sole - 0.3 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.3, asym: 0, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(cx, sole - 0.3 * HH - D.b, D);
    p.gradFill(dp, O.dress, mul(O.dress, SH_CLOTH), light);
    if (O.ghutra) p.clip(dp, () => { p.stroke([[cx, chin + 0.1 * HH], [cx, sole - 0.4 * HH]], 1.8 * u, "#c9c2b2"); for (let i = 0; i < 4; i++) p.dot(cx + 3 * u, chin + (0.25 + i * 0.12) * HH, 1.4 * u, "#9a9486"); });
    p.inkRing(dp, ow, thick);
  } else { // pyjamas / uniform: the tunic hangs a little over the hips
    const sk = [[tcx - 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 1.0 * T.a, torsoBot + 0.18 * HH], [tcx - 1.0 * T.a, torsoBot + 0.18 * HH]];
    p.gradFill(sk, O.collar ? botC : topC, mul(O.collar ? botC : topC, SH_CLOTH), light); p.poly(sk, null, ow * 0.8);
  }
  if (!long) {
    p.gradFill(tp, topC, mul(topC, SH_CLOTH), light);
    p.clip(tp, () => {
      if (O.stars) for (const [dx, dy] of [[-0.5, 0.1], [0.4, 0.3], [-0.1, 0.55], [0.55, -0.05], [-0.45, 0.65]]) { const sx = tcx + dx * T.a, sy = chin + (0.15 + dy) * HH; p.poly([[sx, sy - 8 * u], [sx + 2.6 * u, sy - 2.5 * u], [sx + 8 * u, sy - 2 * u], [sx + 3.5 * u, sy + 2 * u], [sx + 5 * u, sy + 8 * u], [sx, sy + 4 * u], [sx - 5 * u, sy + 8 * u], [sx - 3.5 * u, sy + 2 * u], [sx - 8 * u, sy - 2 * u], [sx - 2.6 * u, sy - 2.5 * u]], "#ffcf3a", 0); }
      if (O.bib) { p.poly([[tcx - 0.46 * T.a, chin + 0.1 * HH], [tcx + 0.46 * T.a, chin + 0.1 * HH], [tcx + 0.62 * T.a, torsoBot], [tcx - 0.62 * T.a, torsoBot]], O.bib, 2 * u); for (const sd of [-1, 1]) { p.poly([[tcx + sd * 0.46 * T.a, chin + 0.1 * HH], [tcx + sd * 0.3 * T.a, chin + 0.1 * HH], [tcx + sd * 0.34 * T.a, chin - 0.04 * HH], [tcx + sd * 0.5 * T.a, chin - 0.04 * HH]], O.bib, 2 * u); p.ell(tcx + sd * 0.42 * T.a, chin + 0.2 * HH, 3.2 * u, 3.2 * u, "#ffffff", 1.6 * u); } }
      if (O.collar) { p.poly([[tcx - 0.5 * T.a, chin + 0.02 * HH], [tcx, chin + 0.2 * HH], [tcx + 0.5 * T.a, chin + 0.02 * HH]], O.collar, 2 * u); }
    });
    p.inkRing(tp, ow, thick);
  }
  for (const a of arms) if (a.front) drawArm(a);
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  const hp = blobPts(cx, hc, H);
  if (O.hijab) { // veil: wide wrap behind the face, drape over the shoulders and chest
    const wrap = blobPts(cx, hc + 0.1 * H.b, { ...H, a: H.a * 1.24, b: H.b * 1.24, asym: 0, egg: 0.08, seed: H.seed + 5 });
    p.gradFill(wrap, O.hijab, mul(O.hijab, SH_CLOTH), light); p.inkRing(wrap, ow * 0.9, thick);
    const dr = [[cx - 1.28 * H.a, hc + 0.4 * H.b], [cx + 1.28 * H.a, hc + 0.4 * H.b], [cx + 1.12 * T.a, chin + 0.42 * HH], [cx + 0.4 * T.a, chin + 0.62 * HH], [cx - 0.4 * T.a, chin + 0.62 * HH], [cx - 1.12 * T.a, chin + 0.42 * HH]];
    p.gradFill(dr, O.hijab, mul(O.hijab, SH_CLOTH), light); p.poly(dr, null, ow * 0.85);
  } else if (O.ghutra) { // ghutra: cloth over the head with two flaps to the shoulders
    for (const s of [-1, 1]) { const fl = [[cx + s * 0.86 * H.a, hc - 0.2 * H.b], [cx + s * 1.3 * H.a, hc + 0.1 * H.b], [cx + s * 1.18 * T.a, chin + 0.5 * HH], [cx + s * 0.6 * H.a, chin + 0.45 * HH], [cx + s * 0.7 * H.a, hc + 0.4 * H.b]]; p.gradFill(fl, O.ghutra, mul(O.ghutra, SH_CLOTH), light); p.poly(fl, null, ow * 0.85); }
    const wrap = blobPts(cx, hc - 0.05 * H.b, { ...H, a: H.a * 1.16, b: H.b * 1.16, asym: 0, egg: 0.05, seed: H.seed + 6 });
    p.gradFill(wrap, O.ghutra, mul(O.ghutra, SH_CLOTH), light);
    if (O.red) p.clip(wrap, () => { for (let i = -8; i <= 8; i++) for (let j = -6; j <= 4; j++) p.poly([[cx + i * 11 * u, hc + j * 10 * u], [cx + i * 11 * u + 5 * u, hc + j * 10 * u], [cx + i * 11 * u + 5 * u, hc + j * 10 * u + 5 * u], [cx + i * 11 * u, hc + j * 10 * u + 5 * u]], "#d33a3a", 0); });
    p.inkRing(wrap, ow * 0.9, thick);
  } else if (O.curly) {
    const pts = [], rx = H.a * 1.34, ry = H.b * 1.3, ccy = hc - 0.1 * H.b; for (let i = 0; i < 120; i++) { const th = i / 120 * Math.PI * 2, f = 1 + 0.055 * Math.abs(Math.sin(th * 9)); pts.push([cx + rx * f * Math.cos(th), ccy + ry * f * Math.sin(th)]); }
    p.poly(pts, O.curly, 5 * u);
  } else if (O.hairLong) {
    const back = blobPts(cx, hc + 0.22 * H.b, { ...H, a: H.a * 1.14, b: H.b * 1.3, asym: 0, egg: 0.1, seed: H.seed + 4 });
    p.gradFill(back, O.hairLong, mul(O.hairLong, [0.7, 0.7, 0.8]), light); p.inkRing(back, ow * 0.9, thick);
  }
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (O.hijab) { // fabric band across the forehead + cheek edges
    p.clip(hp, () => { const top = hc - H.b * 1.05; p.poly([[cx - 1.3 * H.a, top], [cx + 1.3 * H.a, top], [cx + 1.3 * H.a, hc - 0.2 * H.b], [cx + 0.6 * H.a, hc - 0.42 * H.b], [cx, hc - 0.5 * H.b], [cx - 0.6 * H.a, hc - 0.42 * H.b], [cx - 1.3 * H.a, hc - 0.2 * H.b]], O.hijab, 0);
      for (const s of [-1, 1]) p.poly([[cx + s * 1.3 * H.a, hc - 0.3 * H.b], [cx + s * 0.8 * H.a, hc - 0.2 * H.b], [cx + s * 0.86 * H.a, hc + 0.5 * H.b], [cx + s * 1.3 * H.a, hc + 0.5 * H.b]], O.hijab, 0); });
    p.stroke([[cx - 0.62 * H.a, hc - 0.42 * H.b], [cx, hc - 0.5 * H.b], [cx + 0.62 * H.a, hc - 0.42 * H.b]], 2.4 * u, INK);
    p.stroke(curve([cx + 0.9 * H.a, hc - 0.2 * H.b], [cx + 0.8 * H.a, hc + 0.2 * H.b], [cx + 0.88 * H.a, hc + 0.5 * H.b]), 1.8 * u, INK);
    p.stroke(curve([cx - 0.9 * H.a, hc - 0.2 * H.b], [cx - 0.8 * H.a, hc + 0.2 * H.b], [cx - 0.88 * H.a, hc + 0.5 * H.b]), 1.8 * u, INK);
  } else if (O.ghutra) { // agal: black double ring on the crown
    p.clip(hp, () => { p.poly([[cx - 1.3 * H.a, hc - H.b * 1.1], [cx + 1.3 * H.a, hc - H.b * 1.1], [cx + 1.3 * H.a, hc - 0.32 * H.b], [cx, hc - 0.4 * H.b], [cx - 1.3 * H.a, hc - 0.32 * H.b]], O.ghutra, 0);
      if (O.red) for (let i = -8; i <= 8; i++) for (let j = -9; j <= -4; j++) p.poly([[cx + i * 11 * u, hc + j * 10 * u], [cx + i * 11 * u + 5 * u, hc + j * 10 * u], [cx + i * 11 * u + 5 * u, hc + j * 10 * u + 5 * u], [cx + i * 11 * u, hc + j * 10 * u + 5 * u]], "#d33a3a", 0); });
    p.stroke(curve([cx - 1.02 * H.a, hc - 0.28 * H.b], [cx, hc - 0.5 * H.b], [cx + 1.02 * H.a, hc - 0.28 * H.b]), 6.5 * u, INK);
    p.stroke(curve([cx - 1.0 * H.a, hc - 0.46 * H.b], [cx, hc - 0.68 * H.b], [cx + 1.0 * H.a, hc - 0.46 * H.b]), 5 * u, INK);
  } else if (O.curly) {
    p.clip(hp, () => { const top = hc - H.b * 1.2, by = hc - 0.3 * H.b, edge = []; for (let i = 0; i <= 40; i++) { const t = i / 40; edge.push([cx + (t * 2 - 1) * 1.2 * H.a, by + 0.1 * H.b * Math.abs(Math.sin(t * Math.PI * 6)) - 0.18 * H.b * Math.sin(t * Math.PI)]); } p.poly([[cx - 1.3 * H.a, top], [cx + 1.3 * H.a, top], ...edge.slice().reverse()], O.curly, 0); });
    const ed = []; for (let i = 0; i <= 40; i++) { const t = i / 40; ed.push([cx + (t * 2 - 1) * 0.98 * H.a, hc - 0.3 * H.b + 0.1 * H.b * Math.abs(Math.sin(t * Math.PI * 6)) - 0.18 * H.b * Math.sin(t * Math.PI)]); } p.stroke(ed, 3.4 * u, INK);
    p.band(curve([cx - 0.95 * H.a, hc - 0.62 * H.b], [cx, hc - 0.98 * H.b], [cx + 0.95 * H.a, hc - 0.62 * H.b]), O.band, 7.5 * u, 2 * u, "round");
  } else if (O.hairLong) { // fringe
    const hc0 = O.hairLong;
    p.clip(hp, () => { const top = hc - H.b * 1.1, by = hc - 0.22 * H.b; const edge = []; for (let i = 0; i <= 10; i++) { const t = i / 10; edge.push([cx + (t * 2 - 1) * 1.15 * H.a, by + Math.sin(t * Math.PI * 3) * 0.1 * H.b - Math.sin(t * Math.PI) * 0.12 * H.b]); }
      p.poly([[cx - 1.2 * H.a, top], [cx + 1.2 * H.a, top], ...edge.slice().reverse()], hc0, 0); });
    p.stroke(curve([cx - 0.95 * H.a, hc - 0.1 * H.b], [cx - 0.9 * H.a, hc + 0.35 * H.b], [cx - 0.82 * H.a, hc + 0.7 * H.b]), 3.5 * u, hc0);
    p.stroke(curve([cx + 0.95 * H.a, hc - 0.1 * H.b], [cx + 0.9 * H.a, hc + 0.35 * H.b], [cx + 0.82 * H.a, hc + 0.7 * H.b]), 3.5 * u, hc0);
    if (O.clip) p.ell(cx + 0.55 * H.a, hc - 0.62 * H.b, 7 * u, 7 * u, O.clip, 2 * u);
  } else if (O.hairShort) {
    p.clip(hp, () => { p.poly([[cx - 1.3 * H.a, hc - H.b * 1.1], [cx + 1.3 * H.a, hc - H.b * 1.1], [cx + 1.3 * H.a, hc - 0.4 * H.b], [cx, hc - 0.55 * H.b], [cx - 1.3 * H.a, hc - 0.4 * H.b]], O.hairShort, 0); });
  }
  faceFront(p, cx, hc, W, expr, facing, look, lid, false, skin, O.moustache, !!O.stout);
  if (O.cheeks) for (const sd of [-1, 1]) p.ell(cx + 7 * u * facing + sd * 0.55 * H.a, hc + 0.33 * H.b, 0.2 * H.a, 0.11 * H.b, "#f6a79f", 0);
  p.rot = null;
};

/** swaddled baby bundle (a 600x1000 design card; origin at the soles) */
export const babyCard = (p, o = {}) => {
  const { cry = 0, t = 0, expr = "sleep" } = o, light = rad(-120), thick = thickAngle(light);
  const bx = 300, by = 860, wob = cry ? Math.sin(t * 2.2) * 5 : 0;
  const body = blobPts(bx, by - 40, { a: 150, b: 120, nTop: 2.2, nBot: 2.4, egg: 0.1, asym: 0, rot: 0, noise: 0.01, seed: 4 });
  p.gradFill(body, "#f4b6c6", "#b8788e", light); p.clip(body, () => { for (let i = -3; i <= 3; i++) p.stroke([[bx - 170, by - 110 + i * 22 + 40], [bx + 170, by - 60 + i * 22 + 40]], 3, "#d98aa2"); p.band([[bx - 160, by - 50], [bx + 160, by - 120]], "#ffffff", 36, 0); }); p.inkRing(body, 9, thick);
  const hp = blobPts(bx + wob, by - 190, { a: 92, b: 86, nTop: 2.2, nBot: 2.4, egg: 0.05, asym: 0, rot: 0, noise: 0.01, seed: 9 });
  const bon = blobPts(bx + wob, by - 205, { a: 104, b: 96, nTop: 2.2, nBot: 2.0, egg: 0.0, asym: 0, rot: 0, noise: 0.01, seed: 8 });
  p.gradFill(bon, "#ffffff", "#c9c0d8", light); p.inkRing(bon, 8, thick);
  p.shadedFill(hp, "#f0c19c", mul("#f0c19c", SH_SKIN), light, 92); p.inkRing(hp, 8, thick);
  p.clip(hp, () => p.poly([[bx - 120 + wob, by - 300], [bx + 120 + wob, by - 300], [bx + 120 + wob, by - 235], [bx + wob, by - 250], [bx - 120 + wob, by - 235]], "#ffffff", 0));
  faceFront(p, bx + wob, by - 175, 150, cry ? "cry" : "sleep", 0, 0, 0, false, "#f0c19c", null, false);
  if (cry) for (const s of [-1, 1]) { const k = (t * 1.4 + (s > 0 ? 0.5 : 0)) % 1; p.ell(bx + wob + s * 60, by - 150 + k * 70, 7, 11, "#9fd4ff", 3); }
};

/** the monster: a tall black shadow with no readable features. step 0..1 walk phase, ear 0..1 perk, lean -1..1 */
export const monsterCard = (p, o = {}) => {
  const { step = 0, ear = 0.5, lean = 0, twitch = 0, t = 0, run = 0 } = o;
  const BLACK = "#06040b", RIM = "#46527a", g = p.g;
  const sw = Math.sin(step * Math.PI * 2), up = (s) => Math.max(0, Math.sin(Math.PI * 2 * (step + s))) * 40;
  const lx = lean * 60, sway = Math.sin(t * 1.3) * 5;
  const shape = (pts) => { p.poly(pts, BLACK, 0); p.stroke([...pts, pts[0]], 3.2, RIM); };
  const limb = (pts, w) => { p.stroke(pts, w + 7, RIM); p.stroke(pts, w, BLACK); };
  // smoky ground haze
  g.save(); for (let i = 0; i < 6; i++) { g.globalAlpha = 0.3 - i * 0.03; p.ell(300 + (i - 3) * 55 + Math.sin(t * 1.2 + i) * 14, 972 - (i % 2) * 8, 90 + i * 8, 20 + (i % 3) * 6, "#0a0712", 0); } g.restore();
  // long thin legs
  for (const s of [-1, 1]) { const hx = 300 + s * 30 + lx * 0.4, fx = 300 + s * 52, fy = 972 - (step ? up(s > 0 ? 0.5 : 0) : 0); limb(curve([hx, 580], [(hx + fx) / 2 + s * 6, (580 + fy) / 2], [fx, fy]), 38); p.stroke([[fx - 22, fy + 2], [fx + 24, fy + 2]], 14, BLACK); }
  // stretched torso, hunched forward
  const body = blobPts(300 + lx * 0.7 + sway * 0.3, 410, { a: 76, b: 190, nTop: 2.1, nBot: 2.5, egg: 0.12, asym: 0, rot: 0, noise: 0.014, seed: 41 });
  shape(body);
  // very long arms hanging past the knees, spidery fingers
  for (const s of [-1, 1]) {
    const sx = 300 + s * 58 + lx * 0.8, ex = sx + s * 26 + sw * s * 10, hx = sx + s * 14 + sw * s * 26, hy = 880 - Math.abs(sw) * 14;
    limb(curve([sx, 290], [ex, 590], [hx, hy]), 30);
    for (let f = -2; f <= 2; f++) p.stroke([[hx, hy], [hx + f * 10 + s * 3, hy + 62 + Math.abs(f) * -6]], 6, BLACK);
  }
  // small stretched head on a long neck; two thin listening ears
  const hx = 300 + lx * 1.3 + sway, hy = 196 + Math.abs(lean) * 24;
  limb([[300 + lx * 0.7, 270], [hx - 4, hy + 40]], 36);
  const head = blobPts(hx, hy, { a: 46, b: 74, nTop: 2.1, nBot: 2.0, egg: 0.1, asym: 0, rot: 0, noise: 0.012, seed: 43 });
  shape(head);
  const spread = 0.12 + ear * 0.22, flick = twitch ? Math.sin(t * 34) * 0.05 : 0;
  for (const s of [-1, 1]) { const a0 = s * (spread + flick), bx = hx + s * 34, by = hy - 40, tipx = bx + Math.sin(a0 + s * 0.35) * 110, tipy = by - 110 * (0.8 + 0.3 * ear); shape([[bx - 14 * s, by + 28], [bx + s * 24, by - 20], [tipx, tipy], [bx - s * 4, by - 40]]); }
};

export const fxZzz = (p, t) => {
  const g = p.g; g.save(); g.font = "900 120px Arial Black, Arial"; g.lineJoin = "round";
  for (let i = 0; i < 3; i++) {
    const k = (t + i / 3) % 1, x = 220 + i * 70 + Math.sin(k * 6) * 20, y = 700 - k * 500, s = 0.5 + k * 0.7;
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = Math.min(1, (1 - k) * 2.5);
    g.lineWidth = 16; g.strokeStyle = INK; g.strokeText("Z", 0, 0); g.fillStyle = "#ffffff"; g.fillText("Z", 0, 0); g.restore();
  }
  g.restore();
};
export const fxRingWave = (p, k, col = "#ffd9a0") => { // expanding sound rings
  const g = p.g; g.save();
  for (let i = 0; i < 3; i++) { const kk = (k + i / 3) % 1; g.globalAlpha = Math.max(0, 1 - kk); g.beginPath(); g.arc(300, 500, 40 + kk * 250, 0, Math.PI * 2); g.lineWidth = 22 * (1 - kk * 0.5); g.strokeStyle = INK; g.stroke(); g.lineWidth = 12 * (1 - kk * 0.5); g.strokeStyle = col; g.stroke(); }
  g.restore();
};
export const fxFootstep = (p, k) => { const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k); g.beginPath(); g.ellipse(300, 600, 60 + k * 240, 20 + k * 80, 0, 0, Math.PI * 2); g.lineWidth = 14; g.strokeStyle = INK; g.stroke(); g.lineWidth = 7; g.strokeStyle = "#a8c4ff"; g.stroke(); g.restore(); };
export const fxXMark = (p) => { p.stroke([[170, 340], [430, 660]], 60, INK); p.stroke([[430, 340], [170, 660]], 60, INK); p.stroke([[170, 340], [430, 660]], 38, "#e4573d"); p.stroke([[430, 340], [170, 660]], 38, "#e4573d"); };
