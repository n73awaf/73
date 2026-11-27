// Shot plan for «وين السيارة؟», timed to the ElevenLabs voice (60.4 s, 30 fps). Phrase times come from timing.js.
import { ROOMS } from './layout.js';
import { TIMING } from './timing.js';
import { camFromKeys, M, idle, blinkAt, q, ramp, lerp, clamp } from './motion.js';
const CH = TIMING.chunks, S = (i) => CH[i - 1].s, F = (t) => Math.round(t * 30);
const WS = (ci, wi) => CH[ci - 1].words[wi][1]; // start time of word wi in chunk ci
export const FPS = 30, END = TIMING.dur + 1.3, TOTAL = Math.round(END * 30);
const sm = M.smooth, PX = ROOMS.park[0], WX = ROOMS.wash[0], LX = ROOMS.living[0];
const RED = PX - 9, BLUE = PX - 3, GREEN = PX + 3, GAP = PX - 7.6;

// [id, start time, place, light]
const LIST = [
  ['hook', 0, 'park', 'mall'], ['shout', S(3), 'park', 'mall'], ['stolen', S(5), 'park', 'mall'], ['remember', S(6), 'park', 'mall'],
  ['walk', S(9), 'park', 'mall'], ['pRed', WS(10, 0), 'park', 'mall'], ['pBlue', WS(10, 2), 'park', 'mall'], ['pGreen', WS(10, 4), 'park', 'mall'],
  ['mom', S(11), 'park', 'mall'], ['dad', S(14), 'park', 'mall'], ['search', S(16), 'park', 'mall'], ['bro', S(20), 'park', 'mall'],
  ['freeze', S(23), 'park', 'mall'], ['sky', S(24), 'park', 'mall'], ['wash', S(26), 'wash', 'wash'], ['laugh', S(27), 'park', 'mall'],
  ['home', S(29), 'living', 'home'], ['ask', S(34), 'living', 'home'],
];
export const SHOTS = LIST.map(([id, t, place, light], i) => ({ id, place, light, a: i ? F(t) : 0, b: 0 }));
SHOTS.forEach((s, i) => { s.b = i + 1 < SHOTS.length ? SHOTS[i + 1].a - 1 : TOTAL - 1; });
export const shotAt = (f) => { for (let i = SHOTS.length - 1; i >= 0; i--) if (f >= SHOTS[i].a) return SHOTS[i]; return SHOTS[0]; };
const DUR = (s) => (s.b - s.a + 1) / 30;

// ---------- lights ----------
const MALL = { az: 110, el: 70, sky: '#f3f0e6', ground: '#8a8478', hemi: 1.3, sun: '#fff6e0', sunI: 1.5, fog: '#cfc9bf', fogNear: 40, fogFar: 260, skyTop: '#cfc9bf', skyHor: '#cfc9bf', sat: 1.14, vig: 0.2, shadowExt: 16, gain: '#fffaf2' };
export const LIGHTS = {
  mall: MALL,
  wash: { ...MALL, sky: '#e8f6fb', ground: '#6b8ea0', sun: '#f4fbff', fog: '#cfe6ee', skyTop: '#cfe6ee', skyHor: '#cfe6ee', pl: { pos: [WX, 3.4, 1.2], color: '#ffffff', i: 24, dist: 18 } },
  home: { az: 120, el: 50, sky: '#e0c8a8', ground: '#6a5a4a', hemi: 1.15, sun: '#fff0d8', sunI: 1.2, fog: '#3a2a22', fogNear: 60, fogFar: 600, skyTop: '#1a1020', skyHor: '#3a2a30', sat: 1.1, vig: 0.22, shadowExt: 10, pl: { pos: [LX, 2.7, 0.8], color: '#ffe2b8', i: 30, dist: 16 } },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.light === 'mall') { const c = CAMS[S.id][0]; L.pl = { pos: [c.look[0], 3.2, 1.0], color: '#fff2d6', i: 34, dist: 22 }; }
  return L;
};

// ---------- cameras ----------
const K = (t, pos, look, fov, roll = 0, ease) => ({ t, pos, look, fov, roll, ease });
const CAMS = {
  hook: [K(0, [PX - 11.2, 1.7, 3.6], [PX - 12, 1.9, -6], 50), K('e', [PX - 11.4, 1.6, 2.8], [PX - 12, 1.8, -6], 44)],
  shout: [K(0, [GAP + 1.2, 1.4, 3.4], [GAP, 1.3, -3], 48), K('e', [GAP + 0.6, 1.4, 1.8], [GAP, 1.35, -3], 38, -2)],
  stolen: [K(0, [GAP + 0.2, 1.5, 4.8], [GAP + 0.4, 1.0, -2], 56), K('e', [GAP + 0.2, 1.45, 4.2], [GAP + 0.4, 1.0, -2], 52)],
  remember: [K(0, [GAP + 1.6, 1.5, 2.8], [GAP + 0.2, 1.4, -3], 46), K('e', [GAP + 0.8, 1.5, 3.4], [RED + 0.6, 1.5, -3.5], 50)],
  walk: [K(0, [RED - 3.5, 1.5, 4.5], [RED - 3.5, 1.2, -3], 50), K('e', [RED - 1.4, 1.5, 4.5], [RED - 1.0, 1.2, -3], 50)],
  pRed: [K(0, [RED + 0.4, 1.4, 3.4], [RED, 1.6, -3.7], 46), K('e', [RED + 0.3, 1.4, 3.0], [RED, 1.6, -3.7], 42)],
  pBlue: [K(0, [BLUE - 0.4, 1.4, 3.4], [BLUE, 1.6, -3.7], 46), K('e', [BLUE - 0.3, 1.4, 3.0], [BLUE, 1.6, -3.7], 42)],
  pGreen: [K(0, [GREEN + 0.4, 1.4, 3.4], [GREEN, 1.6, -3.7], 46), K('e', [GREEN + 0.3, 1.4, 3.0], [GREEN, 1.6, -3.7], 42)],
  mom: [K(0, [GREEN + 3.4, 1.5, 3.4], [GREEN + 3.4, 1.3, -2], 50), K('e', [GREEN + 3.2, 1.45, 2.6], [GREEN + 3.0, 1.35, -2], 42)],
  dad: [K(0, [GREEN + 4.2, 1.35, 2.2], [GREEN + 4.2, 1.28, -1.4], 36), K('e', [GREEN + 4.2, 1.35, 1.6], [GREEN + 4.2, 1.3, -1.4], 30, 2)],
  search: [K(0, [PX + 10, 1.6, 5.2], [PX + 9, 1.2, -2], 54), K('e', [PX - 1, 1.6, 5.2], [PX - 2, 1.2, -2], 54)],
  bro: [K(0, [PX - 3.2, 0.95, 1.6], [PX - 3.2, 0.82, -0.8], 40), K('e', [PX - 3.2, 0.9, 0.9], [PX - 3.2, 0.82, -0.8], 32)],
  freeze: [K(0, [PX - 3, 1.5, 5.0], [PX - 3, 1.1, -1.5], 56), K('e', [PX - 3, 1.48, 4.7], [PX - 3, 1.1, -1.5], 54)],
  sky: [K(0, [PX - 1.0, 0.85, 1.6], [PX - 1.2, 1.55, -1.4], 50), K('e', [PX - 1.0, 0.8, 1.2], [PX - 1.2, 1.7, -1.4], 44)],
  wash: [K(0, [WX + 1.4, 1.7, 3.6], [WX, 1.2, -2.2], 52), K('e', [WX + 0.6, 1.6, 2.8], [WX, 1.2, -2.2], 46)],
  laugh: [K(0, [PX - 3, 1.5, 4.4], [PX - 3, 1.15, -1.5], 54), K('e', [PX - 3, 1.45, 3.4], [PX - 3, 1.2, -1.5], 46)],
  home: [K(0, [LX, 1.35, 3.3], [LX, 1.15, -1.0], 62), K('e', [LX, 1.3, 2.8], [LX, 1.15, -1.0], 54)],
  ask: [K(0, [LX, 1.0, 2.6], [LX, 0.9, 0.6], 36), K('e', [LX, 0.98, 2.1], [LX, 0.9, 0.6], 30)],
};
const STEP_T = []; for (let t = S(9); t < S(11); t += 0.45) STEP_T.push(t); for (let t = S(16); t < S(20); t += 0.5) STEP_T.push(t);
const KICKS = [{ f: F(S(4)), a: 0.04 }, { f: F(S(5) + 0.6), a: 0.03 }, { f: F(S(22)), a: 0.03 }, { f: F(S(26)), a: 0.02 }];
const FOLLOW = {
  walk: (lt, d) => { const x = lerp(RED - 5.5, RED - 1.6, lt / d) - 0.7; return { pos: [x, 1.5, 4.2], look: [x, 1.1, -2], fov: 52 }; },
  search: (lt, d) => { const x = lerp(PX + 9.5, PX - 1.5, lt / d) + 0.4; return { pos: [x, 1.55, 4.8], look: [x, 1.1, -2], fov: 56 }; },
};
export const camAt = (f) => {
  const s = shotAt(f), keys = CAMS[s.id].map((k) => ({ ...k, f: s.a + (k.t === 'e' ? s.b - s.a : k.t * 30) }));
  const c = camFromKeys(keys, f, { creep: 0.0004, kicks: KICKS });
  const lt = (f - s.a) / 30, fo = FOLLOW[s.id];
  if (fo) { const r = fo(lt, DUR(s)); c.pos = r.pos; c.look = r.look; c.fov = r.fov; }
  c.flash = 0; c.fade = 0;
  if (s.id === 'wash') c.flash = lt < 0.2 ? 0.5 * (1 - lt / 0.2) : 0;
  if (s.id === 'pRed' || s.id === 'pBlue' || s.id === 'pGreen') c.flash = lt < 0.1 ? 0.15 * (1 - lt / 0.1) : 0;
  if (f > TOTAL - 24) c.fade = (f - (TOTAL - 24)) / 24;
  c.shadowAt = c.look;
  return c;
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = { dad: [[GREEN + 4.2, 1.25, -1.4], 9], bro: [[PX - 3.2, 0.8, -0.8], 9], sky: [[PX - 1.2, 1.3, -1.4], 7], ask: [[LX, 0.9, 0.6], 9], shout: [[GAP, 1.35, -1.8], 6] };
export const dofAt = (f) => { const s = shotAt(f), C = camAt(f), fo = FOCUS[s.id]; return fo ? { focus: dist(C.pos, fo[0]), cinf: fo[1], near: 1 } : { focus: 12, cinf: 0 }; };

// ---------- world state ----------
export const worldAt = (f) => {
  const s = shotAt(f), lt = (f - s.a) / 30, W = { place: s.place };
  if (s.place === 'park') { const k = s.id === 'hook' ? sm(ramp(lt, 1.9, 3.0)) : 1; const mins = 180 * k; W.pc = [7 + Math.floor(mins / 60), mins % 60, 0]; }
  if (s.id === 'home' || s.id === 'ask') { W.livDoor = 0.35; W.wallClock = [5, 10, 0]; }
  return W;
};

// ---------- actors ----------
export const actorsAt = (f, T) => {
  const s = shotAt(f), lt = (f - s.a) / 30, d = DUR(s), out = [];
  const R = (who, o, pos, extra = {}) => out.push({ key: who + JSON.stringify(o), draw: (p) => T.saudiFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
  const alive = (seed, o = {}) => { const i = idle(f, seed); return { bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1), blink: blinkAt(f, seed), ...o }; };
  const dad = (o, pos, extra = {}) => R('father', alive(5, { seed: 5, ...o }), pos, { s: 0.88, ...extra });
  const mom = (o, pos, extra = {}) => R('mother', alive(11, { seed: 11, ...o }), pos, { s: 0.84, ...extra });
  const girl = (o, pos, extra = {}) => R('girl', alive(3, { seed: 3, ...o }), pos, { s: 0.6, ...extra });
  const bro = (o, pos, extra = {}) => R('brother', alive(17, { seed: 17, ...o }), pos, { s: 0.5, ...extra });
  const guard = (o, pos, extra = {}) => R('guard', alive(23, { seed: 23, ...o }), pos, { s: 0.9, ...extra });
  const wk = (sp = 1.6) => q((lt * sp) % 1, 2);
  const laughO = (sd) => ({ expr: 'laugh', L: 'belly', R: 'belly', bob: q(Math.abs(Math.sin((f + sd) * 0.5)) * 0.022, 3), tilt: q(4 * Math.sin((f + sd) * 0.45), 1) });
  switch (s.id) {
    case 'hook': { const x = lerp(PX - 9.6, PX - 11.6, sm(ramp(lt, 0, 1.6))); dad({ expr: lt < 2.2 ? 'smile' : 'neutral', step: lt < 1.6 ? wk(1.8) : 0, look: -0.5 }, [x, 0, -1.6]);
      mom({ expr: 'smile', step: lt < 1.6 ? wk(1.8) : 0 }, [x + 1.3, 0, -2.3]); girl({ expr: 'calm', step: lt < 1.6 ? wk(2) : 0 }, [x + 0.9, 0, -0.9]); bro({ expr: 'smile', step: lt < 1.6 ? wk(2.2) : 0 }, [x - 0.9, 0, -0.8]); break; }
    case 'shout': dad({ expr: lt < 0.4 ? 'neutral' : 'shock', L: lt < 0.4 ? 'hang' : 'up', R: lt < 0.4 ? 'hang' : 'up', look: 0 }, [GAP, 0, -1.8]); break;
    case 'stolen': mom({ expr: 'shock', L: 'cheek', R: 'cheek' }, [GAP - 1.5, 0, -1.8]); girl({ expr: 'scared', L: 'cheek', R: 'cheek' }, [GAP - 0.4, 0, -0.6]); bro({ expr: 'neutral', look: 0.4 }, [GAP + 0.7, 0, -0.4]); dad({ expr: 'shock', L: 'up', R: 'up' }, [GAP + 1.8, 0, -1.7]); break;
    case 'remember': { const pt = lt > S(8) - S(6) + 0.4; dad({ expr: lt < 0.6 ? 'stern' : pt ? 'grin' : 'squint', R: lt < 0.6 ? 'hang' : 'up', L: pt ? 'point' : 'hang', look: pt ? -0.8 : 0.2 }, [GAP + 0.3, 0, -1.5], { flip: pt }); mom({ expr: 'stern', L: 'hip', R: 'hip' }, [GAP + 1.6, 0, -2.4]); break; }
    case 'walk': { const x = lerp(RED - 5.5, RED - 1.6, lt / d); dad({ expr: 'grin', step: wk(1.7), R: 'point' }, [x, 0, -1.5]); mom({ expr: 'neutral', step: wk(1.7) }, [x - 1.2, 0, -2.2]); girl({ expr: 'calm', step: wk(2) }, [x - 0.8, 0, -0.6]); bro({ expr: 'smile', step: wk(2.2) }, [x - 1.8, 0, -0.5]); break; }
    case 'pRed': case 'pBlue': case 'pGreen': { const P0 = s.id === 'pRed' ? RED : s.id === 'pBlue' ? BLUE : GREEN; const x = P0 - 1 + lt * 1.2; dad({ expr: s.id === 'pRed' ? 'grin' : s.id === 'pBlue' ? 'squint' : 'nervous', step: wk(1.8), R: 'point', look: -0.4 }, [x, 0, -1.6]); girl({ expr: s.id === 'pGreen' ? 'sad' : 'calm', step: wk(2) }, [x - 1.1, 0, -0.6]); break; }
    case 'mom': mom({ expr: 'stern', L: 'hip', R: 'up', look: 0.5 }, [GREEN + 2.6, 0, -1.4]); dad({ expr: 'nervous', R: 'cheek', look: -0.3 }, [GREEN + 3.9, 0, -1.6]); bro({ expr: 'neutral' }, [GREEN + 3.2, 0, -0.4]); break;
    case 'dad': dad({ expr: lt < 0.8 ? 'squint' : 'stern', R: 'up', L: 'cheek', look: 0.1 }, [GREEN + 4.2, 0, -1.4]); break;
    case 'search': { const x = lerp(PX + 9.5, PX - 1.5, lt / d), g0 = ramp(lt, S(17) - S(16) - 0.3, S(17) - S(16) + 0.7);
      dad({ expr: 'nervous', step: wk(1.7), look: 0.5 }, [x, 0, -1.6]); mom({ expr: 'stern', step: wk(1.7), L: 'hip' }, [x + 1.2, 0, -2.3]); girl({ expr: 'sad', step: wk(2) }, [x + 0.9, 0, -0.6]); bro({ expr: 'neutral', step: wk(2.2) }, [x + 1.9, 0, -0.5]);
      if (g0 > 0) guard({ expr: 'stern', step: wk(1.6), look: -0.4 }, [x - 1.3 + (1 - g0) * -3, 0, -1.0], { alpha: g0 });
      if (lt > S(18) - S(16) - 0.4) R('man', alive(51, { seed: 51, expr: 'smile', R: 'point', look: 0.6 }), [lerp(PX - 5, PX - 3.2, ramp(lt, S(18) - S(16) - 0.4, d)), 0, 0.4], { s: 0.86, flip: true }); break; }
    case 'bro': bro({ expr: lt < S(22) - S(20) ? 'neutral' : 'smile', R: lt > S(21) - S(20) ? 'wave' : 'hang', wv: q(lt * 6, 1), look: 0.3 }, [PX - 3.2, 0, -0.8]); break;
    case 'freeze': dad({ expr: 'shock', L: 'hang', R: 'hang', bob: 0, tilt: 0, headTilt: 0 }, [PX - 4.6, 0, -1.6]); mom({ expr: 'shock', bob: 0, tilt: 0, headTilt: 0 }, [PX - 3.4, 0, -2.2]); girl({ expr: 'shock', bob: 0, tilt: 0, headTilt: 0 }, [PX - 2.6, 0, -0.6]);
      guard({ expr: 'shock', bob: 0, tilt: 0, headTilt: 0 }, [PX - 1.4, 0, -1.6]); bro({ expr: 'smile', look: q(Math.sin(lt * 2), 1) }, [PX - 3.4, 0, -0.2]); break;
    case 'sky': dad({ expr: lt < S(25) - S(24) ? 'squint' : 'grin', L: 'cheek', R: lt < S(25) - S(24) ? 'hang' : 'up', headTilt: -12, look: 0 }, [PX - 1.2, 0, -1.4]); break;
    case 'laugh': dad({ ...laughO(0) }, [PX - 4.6, 0, -1.6]); mom({ ...laughO(7) }, [PX - 3.4, 0, -2.2]); girl({ ...laughO(3) }, [PX - 2.6, 0, -0.6]); guard({ ...laughO(11), L: 'belly', R: 'belly' }, [PX - 1.4, 0, -1.6]); bro({ ...laughO(5) }, [PX - 3.6, 0, -0.3]); break;
    case 'home': { const q2 = lt > S(31) - S(29); mom({ expr: q2 ? 'stern' : 'neutral', L: 'hip', R: q2 ? 'point' : 'hip', look: 0.4 }, [LX - 1.3, 0, -0.6]); dad({ expr: q2 ? 'nervous' : 'smile', R: 'cheek', look: -0.4 }, [LX + 0.9, 0, -1.0]); girl({ expr: 'grin', look: -0.2 }, [LX - 0.2, 0, 0.3]); bro({ expr: 'smile' }, [LX + 1.6, 0, 0.0]); break; }
    case 'ask': girl({ expr: lt < 0.5 ? 'calm' : 'grin', L: 'hang', R: lt > 0.6 ? 'wave' : 'hang', wv: q(lt * 6, 1), look: 0 }, [LX, 0, 0.6]); break;
  }
  return out;
};
// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 6, ...extra });
export const fxAt = (f, T) => {
  const s = shotAt(f), lt = (f - s.a) / 30, out = [];
  if (s.id === 'shout' && lt > 0.4) out.push(FX('rs' + q((lt * 1.6) % 1, 2), (p) => T.fxRingWave(p, (lt * 1.6) % 1, '#ffd9a0'), [GAP, 2.25 - 1.07 * 1.2, -1.6], 1.2));
  if (s.id === 'freeze') out.push(FX('dust' + q((lt * 0.6) % 1, 2), (p) => T.fxDust(p, (lt * 0.6) % 1, '#d8cbb0'), [PX - 6 + lt * 2.2, 0.0, 0.8], 0.5));
  return out;
};
