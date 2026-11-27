// Shot plan for «الساعة ٣:٣٣», timed to the ElevenLabs voice (116.1 s, 30 fps). Phrase times come from timing.js.
import { HOUSES, doorX, CAR, DUMP, SIDE_DOOR, ROOMS } from './layout.js';
import { TIMING } from './timing.js';
import { camFromKeys, M, idle, blinkAt, q, ramp, lerp, lerp3, clamp } from './motion.js';
const CH = TIMING.chunks, S = (i) => CH[i - 1].s, F = (t) => Math.round(t * 30);
export const FPS = 30, END = TIMING.dur + 1.6, TOTAL = Math.round(END * 30);
const sm = M.smooth;

// [id, first chunk, place, light]
const LIST = [
  ['doors', 0, 'street', 'night'], ['clock1', 3, 'bed', 'bed'], ['monWalk', 4, 'street', 'night'], ['monClose', 6, 'street', 'night'], ['listen', 7, 'street', 'night'], ['enter', 8, 'street', 'night'],
  ['quiet', 9, 'living', 'warm'], ['wallclock', 11, 'living', 'warm'], ['tap', 12, 'kitchen', 'kitchen'], ['horn0', 13, 'wheel', 'wheel'], ['roof', 14, 'street', 'night'],
  ['scaredGirl', 16, 'bed', 'bed'], ['school', 18, 'school', 'school'], ['cant', 19, 'bed', 'bed'], ['steps', 20, 'bed', 'bed'],
  ['aunt', 24, 'living', 'warm'], ['silent', 27, 'living', 'dark'], ['clock2', 30, 'bed', 'bed'], ['door', 31, 'living', 'dark'], ['stepsSt', 32, 'street', 'night'],
  ['cry', 33, 'living', 'dark'], ['turn', 34, 'street', 'night'], ['decide', 35, 'living', 'dark'], ['sneak', 36, 'street', 'night'], ['run', 37, 'street', 'night'],
  ['carArrive', 38, 'street', 'night'], ['press', 39, 'wheel', 'wheel'], ['fill', 40, 'street', 'night'], ['mturn', 41, 'street', 'night'], ['mrun', 42, 'street', 'night'],
  ['stuck', 43, 'street', 'night'], ['hide', 44, 'street', 'night'], ['dump', 45, 'dump', 'dump'], ['mcar', 46, 'street', 'night'], ['clock3', 47, 'bed', 'bed'],
  ['close', 48, 'street', 'night'], ['slam', 49, 'street', 'night'], ['trapped', 50, 'street', 'night'], ['day', 51, 'street', 'day'], ['window', 52, 'bed', 'bed'],
  ['pov', 54, 'street', 'night'], ['empty', 55, 'street', 'night'], ['out', 56, 'bed', 'bed'], ['know', 57, 'bed', 'bed'], ['ask', 60, 'street', 'dawn'],
];
export const SHOTS = LIST.map(([id, ch, place, light], i) => ({ id, place, light, a: i ? F(S(ch)) : 0, b: 0 }));
SHOTS.forEach((s, i) => { s.b = i + 1 < SHOTS.length ? SHOTS[i + 1].a - 1 : TOTAL - 1; });
export const shotAt = (f) => { for (let i = SHOTS.length - 1; i >= 0; i--) if (f >= SHOTS[i].a) return SHOTS[i]; return SHOTS[0]; };
const T0 = (id) => SHOTS.find((s) => s.id === id).a / 30;
const DUR = (s) => (s.b - s.a + 1) / 30;

// ---------- lights ----------
const NIGHT = { az: 150, el: 38, sky: '#5a5ca8', ground: '#2a2a50', hemi: 1.25, sun: '#a8b8ff', sunI: 1.5, fog: '#2e2e68', fogNear: 70, fogFar: 800, skyTop: '#0b0a2a', skyHor: '#3a3a80', sat: 1.12, vig: 0.28, shadowExt: 22, gain: '#fff4ea' };
export const LIGHTS = {
  night: NIGHT,
  day: { az: 130, el: 50, sky: '#cfe0f5', ground: '#9a8a68', hemi: 1.2, sun: '#fff0d8', sunI: 2.6, fog: '#d4e4f4', fogNear: 90, fogFar: 900, skyTop: '#4a86d6', skyHor: '#cfe3f6', sat: 1.12, vig: 0.18, shadowExt: 26 },
  dawn: { az: 40, el: 14, sky: '#e8b9a0', ground: '#8a6a58', hemi: 1.1, sun: '#ffb774', sunI: 2.6, fog: '#f1b890', fogNear: 60, fogFar: 700, skyTop: '#6a6ab8', skyHor: '#ffc088', sunDisc: '#fff2cc', sunSize: 0.004, sat: 1.15, gain: '#fff2e4', vig: 0.24, shadowExt: 26 },
  bed: { az: 110, el: 40, sky: '#7a6ab0', ground: '#3a3050', hemi: 0.95, sun: '#9fb0ff', sunI: 0.7, fog: '#2a2448', fogNear: 60, fogFar: 600, skyTop: '#140e2c', skyHor: '#2a2448', sat: 1.1, vig: 0.34, shadowExt: 8, pl: { pos: [401, 2.5, 1.2], color: '#ffb98a', i: 7, dist: 14 } },
  warm: { az: 120, el: 50, sky: '#b49474', ground: '#5a4a3a', hemi: 1.0, sun: '#ffd9a0', sunI: 0.8, fog: '#3a2a22', fogNear: 60, fogFar: 600, skyTop: '#1a1020', skyHor: '#3a2a30', sat: 1.08, vig: 0.28, shadowExt: 10, pl: { pos: [460, 2.7, 0.6], color: '#ffc98a', i: 26, dist: 16 } },
  dark: { az: 120, el: 50, sky: '#5a5a98', ground: '#2a2640', hemi: 0.7, sun: '#9fb0ff', sunI: 0.5, fog: '#201c3a', fogNear: 50, fogFar: 500, skyTop: '#0a0820', skyHor: '#201c3a', sat: 1.05, vig: 0.4, shadowExt: 10, pl: { pos: [460, 2.7, 0.6], color: '#8aa0ff', i: 6, dist: 14 } },
  kitchen: { az: 110, el: 50, sky: '#b8d0d4', ground: '#6a7a7a', hemi: 1.0, sun: '#ffffff', sunI: 1.0, fog: '#4a6a6a', fogNear: 50, fogFar: 500, skyTop: '#223a3a', skyHor: '#4a6a6a', sat: 1.08, vig: 0.3, shadowExt: 8, pl: { pos: [520, 2.6, 0.8], color: '#e8f4ff', i: 14, dist: 12 } },
  school: { az: 110, el: 60, sky: '#f5ecd5', ground: '#a89870', hemi: 1.35, sun: '#fff6e0', sunI: 1.6, fog: '#e9dcc0', fogNear: 50, fogFar: 500, skyTop: '#e9dcc0', skyHor: '#e9dcc0', sat: 1.1, vig: 0.16, shadowExt: 10, pl: { pos: [580, 3.0, 1.0], color: '#fff3d6', i: 18, dist: 16 } },
  wheel: { az: 110, el: 50, sky: '#5a60a0', ground: '#2a2640', hemi: 0.9, sun: '#a8b8ff', sunI: 0.8, fog: '#1e1c38', fogNear: 40, fogFar: 400, skyTop: '#140e2c', skyHor: '#2a2448', sat: 1.08, vig: 0.4, shadowExt: 6, pl: { pos: [640, 1.8, 1.0], color: '#ffc98a', i: 6, dist: 8 } },
  dump: { az: 110, el: 50, sky: '#101018', ground: '#08080c', hemi: 0.35, sun: '#ffffff', sunI: 0.0, fog: '#000000', fogNear: 3, fogFar: 14, skyTop: '#000000', skyHor: '#000000', sat: 1.0, vig: 0.7, shadowExt: 4, pl: { pos: [700, 1.5, 0.6], color: '#fff0b8', i: 2.5, dist: 5 } },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'know') { const k = sm(ramp(f, S.a + 20, S.b)); L.pl = { ...L.pl, color: k > 0.5 ? '#ffc08a' : '#ffb98a', i: lerp(7, 16, k) }; L.hemi = lerp(0.95, 1.3, k); }
  if (S.id === 'ask') { L.shadowExt = 30; }
  return L;
};

// ---------- cameras ----------
const K = (t, pos, look, fov, roll = 0) => ({ t, pos, look, fov, roll });
const CAMS = {
  doors: [K(0, [-50, 1.7, 3.2], [-12, 2.3, -6], 46), K('e', [-42, 1.6, 2.6], [-8, 2.2, -6], 42)],
  clock1: [K(0, [399.7, 1.06, 0.7], [399.7, 1.02, -1.94], 50), K('e', [399.7, 1.05, 0.4], [399.7, 1.02, -1.94], 46)],
  monWalk: [K(0, [26, 1.7, 8.5], [24, 2.6, -2], 42), K('e', [7, 1.7, 8.5], [5, 2.6, -2], 42)],
  monClose: [K(0, [9.8, 1.0, 3.4], [6.5, 3.5, -1.5], 40), K('e', [8.8, 1.2, 2.6], [6.5, 3.5, -1.5], 36)],
  listen: [K(0, [8.8, 1.2, 2.6], [6.5, 3.6, -1.5], 36), K('e', [10.4, 1.6, 4.4], [6.5, 3.4, -1.5], 42)],
  enter: [K(0, [6.5, 1.8, 8.5], [8, 2.2, -4], 46), K('e', [11.5, 1.8, 7.2], [11, 1.6, -5], 40)],
  quiet: [K(0, [460.0, 1.3, 3.3], [460.05, 1.1, -1.0], 64), K('e', [460.0, 1.25, 2.9], [460.05, 1.1, -1.0], 56)],
  wallclock: [K(0, [461.0, 2.0, 0.8], [462.2, 2.2, -2.88], 36), K('e', [461.8, 2.15, -0.2], [462.2, 2.2, -2.88], 30)],
  tap: [K(0, [520.9, 1.95, 0.3], [520.25, 1.75, -1.7], 38), K('e', [520.7, 1.9, -0.2], [520.25, 1.75, -1.7], 32)],
  horn0: [K(0, [640, 0.95, 1.2], [640, 0.95, -0.3], 38), K('e', [640, 0.95, 0.8], [640, 0.95, -0.3], 32)],
  roof: [K(0, [14, 10.5, 5], [22.4, 7.0, -9.5], 28), K('e', [17, 9.6, 1], [22.6, 7.0, -9.5], 22)],
  scaredGirl: [K(0, [401.6, 1.3, 2.9], [399.8, 1.1, -0.7], 42), K('e', [400.9, 1.25, 1.9], [399.8, 1.15, -0.7], 33)],
  school: [K(0, [580.0, 1.4, 3.4], [580, 1.0, -1.0], 62), K('e', [580.0, 1.3, 2.9], [580, 1.0, -1.0], 54)],
  cant: [K(0, [402.4, 1.5, 2.2], [401.4, 1.1, -1.6], 44), K('e', [402.0, 1.4, 1.5], [401.4, 1.05, -1.6], 36)],
  steps: [K(0, [400.9, 1.6, 2.7], [400.9, 1.5, -2.2], 62), K('e', [401.0, 1.45, 1.8], [400.7, 1.45, -2.2], 52)],
  aunt: [K(0, [460.0, 1.35, 3.3], [460.0, 1.15, -0.6], 64), K('e', [460.0, 1.3, 2.9], [460.0, 1.2, -0.5], 56)],
  silent: [K(0, [460, 1.45, 3.3], [460, 1.2, -0.8], 64), K('e', [460, 1.35, 2.8], [460, 1.2, -0.6], 54)],
  clock2: [K(0, [399.7, 1.05, 0.4], [399.7, 1.02, -1.94], 46), K('e', [399.7, 1.05, 0.7], [399.7, 1.02, -1.94], 50)],
  door: [K(0, [460, 1.3, 3.0], [460.0, 1.3, -2.9], 56), K('e', [460, 1.3, 2.1], [460.0, 1.3, -2.9], 46)],
  stepsSt: [K(0, [-3, 1.5, 7], [-5, 2.2, -2], 46), K('e', [-12, 1.5, 6], [-10, 2.0, -3], 44)],
  cry: [K(0, [460, 0.75, 1.9], [460, 0.55, 0.5], 40), K('e', [460, 0.7, 1.3], [460, 0.55, 0.5], 32)],
  turn: [K(0, [-9, 1.2, 5.8], [-6, 2.6, -3.5], 48), K('e', [-10, 1.5, 5.0], [-6.5, 2.8, -3.5], 42)],
  decide: [K(0, [460.1, 1.25, 1.8], [460.2, 1.2, -0.2], 34), K('e', [460.2, 1.22, 1.1], [460.2, 1.2, -0.2], 28)],
  sneak: [K(0, [-9.4, 1.5, -4.4], [-11.4, 1.2, -7.4], 46), K('e', [-9.0, 1.5, -4.0], [-10.4, 1.0, -6.6], 40)],
  run: [K(0, [2, 1.5, 7.5], [4, 1.3, -1.8], 44), K('e', [38, 1.5, 7.5], [40, 1.3, -1.8], 44)],
  carArrive: [K(0, [37, 1.5, 6.5], [CAR.x - 1, 1.1, -2.9], 46), K('e', [40.5, 1.5, 5.6], [CAR.x, 1.1, -2.9], 40)],
  press: [K(0, [640, 1.05, 1.0], [640, 0.98, -0.5], 42), K('e', [640, 1.0, 0.7], [640, 0.98, -0.5], 33)],
  fill: [K(0, [32, 6.5, 10], [42, 1.5, -3], 50), K('e', [24, 9.0, 14], [34, 2.5, -3], 56)],
  mturn: [K(0, [-6, 1.4, 4.6], [-9, 3.0, -1.5], 46), K('e', [-5, 1.6, 4.0], [-9, 3.3, -1.5], 40)],
  mrun: [K(0, [-4, 1.6, 7], [-8, 1.8, -1.5], 46), K('e', [36, 1.6, 7], [32, 1.8, -1.5], 46)],
  stuck: [K(0, [CAR.x + 0.5, 1.3, 5.6], [CAR.x, 1.0, -2.9], 46), K('e', [CAR.x - 0.5, 1.2, 4.8], [CAR.x, 1.0, -2.9], 38, 2)],
  hide: [K(0, [47.5, 1.8, 7.2], [47.6, 1.3, -3], 46), K('e', [50.0, 1.8, 6.6], [49.6, 1.4, -3], 42)],
  dump: [K(0, [700, 1.15, 0.9], [700, 1.0, -1.2], 36), K('e', [700, 1.1, 0.5], [700, 1.0, -1.2], 28)],
  mcar: [K(0, [CAR.x - 3, 2.0, 7.5], [CAR.x - 1, 1.4, -3], 46), K('e', [CAR.x - 1.5, 1.6, 5.8], [CAR.x, 1.2, -2.9], 40)],
  clock3: [K(0, [399.7, 1.06, 0.7], [399.7, 1.02, -1.94], 50), K('e', [399.7, 1.05, 0.4], [399.7, 1.02, -1.94], 46)],
  close: [K(0, [-42, 1.6, 2.6], [-8, 2.2, -6], 42), K('e', [-50, 1.7, 3.2], [-12, 2.3, -6], 46)],
  slam: [K(0, [CAR.x + 2.2, 1.2, 4.6], [CAR.x, 1.0, -2.9], 40), K('e', [CAR.x + 1.6, 1.2, 4.2], [CAR.x, 1.0, -2.9], 36)],
  trapped: [K(0, [CAR.x + 2.5, 1.5, 5.6], [CAR.x, 1.1, -2.9], 40), K('e', [CAR.x + 8, 2.6, 11], [CAR.x, 1.2, -3], 44)],
  day: [K(0, [34, 2.0, 10], [38, 1.4, -2], 46), K('e', [24, 2.0, 10], [28, 1.4, -2], 46)],
  window: [K(0, [400.1, 1.3, 1.9], [399.5, 1.25, -2.0], 48), K('e', [399.9, 1.3, 1.4], [399.5, 1.25, -2.0], 42)],
  pov: [K(0, [-17, 5.0, -5.7], [44, 1.2, -2.9], 15), K('e', [-17, 5.0, -5.7], [44, 1.2, -2.9], 12)],
  empty: [K(0, [CAR.x - 4.2, 1.5, 5.2], [CAR.x, 1.1, -2.9], 38), K('e', [CAR.x - 2.6, 1.4, 4.2], [CAR.x, 1.1, -2.9], 30)],
  out: [K(0, [400.0, 1.3, 1.7], [399.4, 1.25, -2.0], 46), K('e', [399.8, 1.3, 1.2], [399.4, 1.25, -2.0], 40, 3)],
  know: [K(0, [400.2, 1.35, 1.9], [399.5, 1.25, -2.0], 46), K('e', [400.0, 1.32, 1.4], [399.5, 1.25, -2.0], 40)],
  ask: [K(0, [1, 1.25, 9.5], [0.4, 1.15, 2.5], 38), K('e', [0.6, 1.2, 7.0], [0.4, 1.15, 2.5], 30)],
};
const STEP_T = []; { const t0 = S(22) + 0.2; for (let t = t0; t < S(24); t += 0.7) STEP_T.push(t); for (let t = S(32); t < S(33); t += 0.62) STEP_T.push(t); for (let t = S(42); t < S(43); t += 0.3) STEP_T.push(t); }
const KICKS = [...STEP_T.map((t) => ({ f: F(t), a: 0.012 })), { f: F(S(39) + 0.4), a: 0.05 }, { f: F(S(49) + 0.5), a: 0.07 }, { f: F(S(56)), a: 0.06 }, { f: F(S(43) + 0.2), a: 0.03 }, { f: F(S(43) + 0.6), a: 0.03 }, { f: F(S(43) + 1.0), a: 0.03 }];
const FOLLOW = {
  run: (lt, d) => { const gx = lerp(-3, 41, sm(lt / d * 0.98 + 0.01)); return { pos: [gx - 2.0, 1.4, 5.6], look: [gx + 0.5, 1.0, -1.8], fov: 44 }; },
  mrun: (lt, d) => { const mx = lerp(-8, 30, sm(lt / d)); return { pos: [mx + 8, 1.7, 6.2], look: [mx, 2.3, -1.5], fov: 46 }; },
  monWalk: (lt, d) => { const mx = lerp(24, 4, lt / d); return { pos: [mx + 5, 1.7, 8], look: [mx, 2.3, -1.6], fov: 42 }; },
  stepsSt: (lt, d) => { const mx = lerp(2, -8, lt / d); return { pos: [mx - 5.5, 1.5, 6], look: [mx, 2.2, -1.6], fov: 46 }; },
};
export const camAt = (f) => {
  const s = shotAt(f), keys = CAMS[s.id].map((k) => ({ ...k, f: s.a + (k.t === 'e' ? s.b - s.a : k.t * 30) }));
  const c = camFromKeys(keys, f, { creep: 0.0004, kicks: KICKS });
  const lt = (f - s.a) / 30, dd = (s.b - s.a + 1) / 30, fo = FOLLOW[s.id];
  if (fo) { const r = fo(lt, dd); c.pos = r.pos; c.look = r.look; c.fov = r.fov; }
  c.flash = 0; c.fade = 0;
  if (s.id === 'clock1' && lt > 0.55 && lt < 0.8) c.flash = 0.3 * (1 - (lt - 0.55) / 0.25);
  if (s.id === 'press') c.flash = lt > 0.4 && lt < 0.6 ? 0.25 * (1 - (lt - 0.4) / 0.2) : 0;
  if (s.id === 'slam') c.flash = lt > 0.5 && lt < 0.7 ? 0.35 * (1 - (lt - 0.5) / 0.2) : 0;
  if (s.id === 'out') c.flash = lt < 0.2 ? 0.7 * (1 - lt / 0.2) : 0;
  if (f > TOTAL - 28) c.fade = (f - (TOTAL - 28)) / 28;
  c.shadowAt = c.look;
  return c;
};
// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = { monClose: [[6.5, 3.4, -1.5], 9], listen: [[6.5, 3.4, -1.5], 8], clock1: [[399.7, 1.02, -1.94], 8], clock2: [[399.7, 1.02, -1.94], 8], clock3: [[399.7, 1.02, -1.94], 8], wallclock: [[462.2, 2.2, -2.88], 8], tap: [[520, 1.8, -1.5], 8], horn0: [[640, 0.95, -0.3], 8], press: [[640, 0.98, -0.5], 8], cry: [[460, 1.0, 0.4], 9], decide: [[460.2, 1.2, -0.2], 10], dump: [[700, 1.0, -0.6], 9], scaredGirl: [[399.8, 1.15, -0.7], 8], cant: [[401.4, 1.05, -1.6], 8], pov: [[44, 1.2, -2.9], 6], ask: [[0.4, 1.15, 2.5], 8], know: [[399.4, 1.28, -2.4], 8], window: [[399.4, 1.3, -2.5], 7], out: [[399.4, 1.3, -2.5], 7], slam: [[CAR.x, 1.0, -2.9], 7], stuck: [[CAR.x, 1.0, -2.9], 6], empty: [[CAR.x, 1.1, -2.9], 6] };
export const dofAt = (f) => { const s = shotAt(f), C = camAt(f), fo = FOCUS[s.id]; return fo ? { focus: dist(C.pos, fo[0]), cinf: fo[1], near: 1 } : { focus: 14, cinf: 0 }; };

// ---------- world state ----------
export const worldAt = (f) => {
  const s = shotAt(f), lt = (f - s.a) / 30, d = DUR(s), W = { place: s.place, lamps: true };
  const closed = [0, 0, 0, 0, 0], all = (v) => [v, v, v, v, v];
  switch (s.id) {
    case 'doors': W.doors = closed.map((_, i) => M.easeOut(ramp(lt, 0.25 + i * 0.32, 0.95 + i * 0.32))); W.lit = [1, 0, 3, 0, 5]; break;
    case 'monWalk': case 'monClose': case 'listen': W.doors = all(1); W.lit = [0, 0, 3, 0, 0]; break;
    case 'enter': W.doors = [1, 1, 1, M.easeOut(ramp(lt, 1.3, 1.9)), 1]; W.lit = [0, 0, 0, lt > 0.8 ? 1 : 0, 0]; break;
    case 'roof': W.doors = closed; W.roofBed = true; W.lit = [0, 1, 0, 0, 0]; break;
    case 'living': break;
    case 'door': W.livDoor = M.easeOut(ramp(lt, 0.15, 0.95)); break;
    case 'quiet': case 'aunt': case 'silent': case 'cry': case 'decide': case 'wallclock': W.wallClock = s.id === 'silent' ? [3, 30, 12] : [3, 33, 0]; break;
    case 'tap': W.tapRot = M.smooth(ramp(lt, 0.4, 1.3)) * 1.57; W.water = 1 - M.smooth(ramp(lt, 0.5, 1.3)); break;
    case 'press': W.horn = lt > 0.4; break;
    case 'clock1': W.clock = lt < 0.55 ? '3:32' : '3:33'; break;
    case 'clock2': W.clock = '3:33'; break;
    case 'clock3': W.clock = lt < 0.9 ? '3:33' : '3:34'; W.clockCol = lt < 0.9 ? '#ff4d5e' : '#ffd24a'; break;
    case 'steps': W.clock = '3:33'; W.winMon = lt > S(22) - T0('steps') ? clamp((lt - (S(22) - T0('steps'))) / 2.2) * 0.9 : null; break;
    case 'window': W.clock = lt < S(53) - T0('window') ? '3:32' : '3:33'; break;
    case 'out': W.clock = '3:33'; W.winMon = 0.15 + lt * 0.35; break;
    case 'know': W.clock = '3:33'; W.dawn = M.smooth(ramp(lt, 1.2, d)); break;
    case 'scaredGirl': case 'cant': W.clock = '3:33'; break;
    case 'stepsSt': case 'turn': W.doors = all(1); W.lit = [0, 1, 1, 0, 0]; break;
    case 'sneak': W.doors = all(1); W.sideDoor = M.easeOut(ramp(lt, 0.2, 0.7)); break;
    case 'run': W.doors = all(1); W.sideDoor = 1; break;
    case 'carArrive': W.doors = all(1); W.carDoor = M.easeOut(ramp(lt, 1.6, 2.4)) * 0.9; break;
    case 'fill': W.doors = all(1); W.carDoor = 0.9; W.carLights = true; W.lit = [1, 1, 1, 1, 1].map((_, i) => (lt > 0.3 + i * 0.25 ? 1 : 0)); W.carShake = 1; break;
    case 'mturn': case 'mrun': W.doors = all(1); W.carDoor = 0.9; W.carLights = true; W.lit = all(1); break;
    case 'stuck': W.doors = all(1); W.carDoor = 0.9; W.carLights = true; W.carShake = 1; W.lit = all(1); break;
    case 'hide': W.doors = all(1); W.carDoor = 0.9; W.carLights = true; W.dumpLid = lt < 2.7 ? M.easeOut(ramp(lt, 0.9, 1.4)) * 0.8 : 0.8 * (1 - M.easeIn(ramp(lt, 2.9, 3.3))); W.lit = all(1); break;
    case 'mcar': W.doors = all(1); W.carDoor = 0.9; W.carLights = true; W.carMon = lt > 1.5; W.carShake = lt > 1.5 ? 1.5 : 0.3; W.lit = all(1); break;
    case 'close': W.doors = closed.map((_, i) => 1 - M.easeIn(ramp(lt, 0.2 + i * 0.3, 0.55 + i * 0.3))); W.lit = all(1); W.carDoor = 0.9; W.carMon = true; break;
    case 'slam': W.doors = closed; W.carDoor = 0.9 * (1 - M.easeIn(ramp(lt, 0.3, 0.55))); W.carMon = true; W.carShake = lt > 0.55 ? 2 : 0.4; W.lit = all(1); break;
    case 'trapped': W.doors = closed; W.carMon = true; W.carShake = 1.5 * (1 - ramp(lt, 0, d)); W.lit = [1, 1, 1, 1, 1]; break;
    case 'day': W.doors = closed; W.lamps = false; break;
    case 'pov': W.doors = closed; W.carDoor = 0.9; W.lit = [0, 1, 0, 0, 0]; break;
    case 'empty': W.doors = closed; W.carDoor = 0.9 + Math.sin(lt * 1.3) * 0.03; break;
    case 'ask': W.doors = closed; W.lamps = false; break;
  }
  return W;
};

// ---------- actors ----------
const MAIN = 0.6; // main character scale (1.35 m)
export const actorsAt = (f, T) => {
  const s = shotAt(f), lt = (f - s.a) / 30, d = DUR(s), out = [];
  const R = (who, o, pos, extra = {}) => out.push({ key: who + JSON.stringify(o), draw: (p) => T.saudiFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
  const alive = (seed, o = {}) => { const i = idle(f, seed); return { bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1), blink: blinkAt(f, seed), ...o }; };
  const girl = (o, pos, sc = MAIN, extra = {}) => R('girl', alive(3, { seed: 3, ...o }), pos, { s: sc, ...extra });
  const mon = (o, pos, sc = 1.9, extra = {}) => out.push({ key: 'mon' + JSON.stringify(o), draw: (p) => T.monsterCard(p, o), x: pos[0], y: pos[1], z: pos[2], s: sc, shadow: false, ...extra });
  const baby = (o, pos, sc, extra = {}) => out.push({ key: 'baby' + JSON.stringify(o), draw: (p) => T.babyCard(p, o), x: pos[0], y: pos[1], z: pos[2], s: sc, ...extra });
  const SW = 0.18; // sidewalk height
  const st = (t) => Math.floor(t * 3.2 * 20) / 20;
  switch (s.id) {
    case 'doors': { const a = M.smooth(ramp(lt, 1.6, 2.6)); if (a > 0.01) mon({ ear: q(0.4 + 0.6 * ramp(lt, 2.4, 3.2), 2), step: 0, twitch: lt > 2.6 ? 1 : 0, t: q(lt, 2) }, [38, 0, -2], 1.9, { alpha: a }); break; }
    case 'monWalk': { const mx = lerp(24, 4, lt / d); mon({ step: q((lt * 1.1) % 1, 2), ear: 0.5, t: q(lt, 2) }, [mx, 0, -1.6]); break; }
    case 'monClose': mon({ step: 0, ear: q(0.3 + 0.3 * sm(ramp(lt, 0, d)), 2), t: q(lt, 2) }, [6.5, 0, -1.6]); break;
    case 'listen': mon({ step: 0, ear: q(M.easeOut(ramp(lt, 0, 0.5)), 2), twitch: 1, t: q(lt, 2), lean: q(0.2 * Math.sin(lt * 3), 2) }, [6.5, 0, -1.6]); break;
    case 'enter': { const w = sm(ramp(lt, 0.4, 2.4)), mx = lerp(5, 10.2, w), mz = lerp(-1.6, -5.2, M.smooth(ramp(lt, 1.8, 2.5))), a = 1 - ramp(lt, 2.3, 2.7); if (a > 0) mon({ step: q((lt * 1.1) % 1, 2), ear: 1, t: q(lt, 2), lean: 0.3 }, [mx, mz > -3 ? 0 : SW, mz], 1.9, { alpha: a }); break; }
    case 'quiet': R('mother', alive(11, { seed: 11, expr: 'hush', R: 'hush', L: 'hold', look: 0.4 }), [459.3, 0, -0.9], { s: 0.86 }); girl({ expr: lt > 1.4 ? 'hush' : 'calm', R: lt > 1.4 ? 'hush' : 'hang', look: -0.5 }, [460.9, 0, -0.5]); break;
    case 'wallclock': break;
    case 'roof': R('sleeper', { seed: 21, expr: 'sleep', L: 'cross', R: 'cross' }, [HOUSES[4].x + 1.95, HOUSES[4].h + 1.2, -9.5], { s: 0.8, roll: Math.PI / 2, order: 4, blob: false, yaw: 0 }); break;
    case 'scaredGirl': girl({ expr: lt > 0.4 ? 'scared' : 'calm', L: 'hug', R: 'hug', look: -0.4 }, [399.6, 0, -0.6], MAIN + 0.04 * sm(lt / d)); break;
    case 'school': { const lb = (sd) => q(Math.abs(Math.sin((f + sd) * 0.45)) * 0.02, 3);
      R('schoolA', alive(31, { seed: 31, expr: 'laugh', L: 'point', R: 'belly', bob: lb(0), look: 0.5 }), [578.5, 0, -0.5], { s: 0.66 }); R('schoolB', alive(32, { seed: 32, expr: 'laugh', R: 'point', L: 'belly', bob: lb(6), look: -0.5 }), [581.7, 0, -0.5], { s: 0.64 });
      R('schoolC', alive(33, { seed: 33, expr: 'grin', L: 'belly', R: 'belly', bob: lb(3), look: 0.3 }), [579.3, 0, -1.2], { s: 0.62 }); R('schoolA', alive(34, { seed: 36, expr: 'laugh', R: 'belly', L: 'belly', bob: lb(9), look: -0.3 }), [580.9, 0, -1.2], { s: 0.63 });
      girl({ expr: 'sad', L: 'cheek', R: 'hang', look: 0.3 }, [580.3, 0, -0.1]); break; }
    case 'cant': girl({ expr: 'sad', L: 'hug', R: 'hug', look: lt > d / 2 ? -0.5 : 0.4 }, [401.45, 0.82, -1.9], MAIN - 0.02, { order: 2 }); break;
    case 'steps': girl({ expr: 'scared', L: 'cover', R: 'cover', look: lt > S(22) - T0('steps') ? -0.8 : 0 }, [401.45, 0.82, -1.9], MAIN - 0.02); break;
    case 'aunt': R('aunt', alive(41, { seed: 41, expr: 'smile', L: 'hold', R: 'hold' }), [458.9, 0, -0.3], { s: 0.86 }); baby({ cry: 0, t: q(lt, 1) }, [459.4, 1.0, 0.1], 0.42, { blob: false, order: 4 });
      R('mother', alive(11, { seed: 11, expr: 'smile', R: 'wave', wv: q(lt * 6, 1) }), [461.2, 0, -0.8], { s: 0.86 }); girl({ expr: 'calm', look: -0.7 }, [460.2, 0, 0.5]); break;
    case 'silent': { const sh = lt > S(29) - T0('silent'); R('mother', alive(11, { seed: 11, expr: sh ? 'hush' : 'scared', R: sh ? 'hush' : 'hang', L: 'hang', look: 0.3 }), [461.2, 0, -1.0], { s: 0.86 }); R('aunt', alive(41, { seed: 41, expr: 'scared', L: 'hold', R: 'hold' }), [458.8, 0, -0.8], { s: 0.86 }); baby({ cry: 0, t: 0 }, [459.3, 1.0, -0.4], 0.42, { blob: false, order: 4 }); girl({ expr: 'scared', L: 'hug', R: 'hug', look: Math.sin(lt) * 0.4 }, [460.1, 0, 0.5]); break; }
    case 'door': R('mother', alive(11, { seed: 11, expr: 'scared', R: 'hush', look: -0.4 }), [461.0, 0, -0.2], { s: 0.86 }); girl({ expr: 'scared', L: 'hug', R: 'hug', look: -0.4 }, [459.3, 0, 0.0]); break;
    case 'stepsSt': { const mx = lerp(2, -8, lt / d); mon({ step: q((lt * 0.95) % 1, 2), ear: 1, t: q(lt, 2), twitch: 1 }, [mx, 0, -1.6]); break; }
    case 'cry': baby({ cry: 1, t: q(lt, 2) }, [460, 0.15, 0.5], 0.75, { blob: false }); R('aunt', alive(41, { seed: 41, expr: 'shock', L: 'cheek', R: 'cheek' }), [459.0, 0, -1.2], { s: 0.86, order: 1 }); break;
    case 'turn': { const tn = M.smooth(ramp(lt, 0.2, 0.8)); mon({ step: 0, ear: 1, twitch: 1, t: q(lt, 2), lean: q(-0.5 + 0.9 * tn, 2) }, [-6.5, 0, -1.6]); break; }
    case 'decide': girl({ expr: lt < 1.3 ? 'scared' : 'brave', L: 'hang', R: 'hang', look: lt < 1.3 ? -0.3 : 0.4 }, [460.2, 0, -0.2], MAIN + 0.05 * sm(lt / d)); break;
    case 'sneak': { const g1 = M.smooth(ramp(lt, 0.6, 1.2)), gx = lerp(SIDE_DOOR.x + 0.6, -10.4, g1), gz = lerp(SIDE_DOOR.z, -6.4, M.smooth(ramp(lt, 1.0, d))); girl({ expr: 'scared', step: q(st(lt), 2), look: 0.5, L: 'run', R: 'run', swing: q(Math.sin(lt * 9), 1) }, [gx, 0.0, gz], 0.56, { alpha: ramp(lt, 0.5, 0.8) }); mon({ step: 0, ear: 1, twitch: 1, t: q(lt, 2), lean: -0.3 }, [-22, 0, -1.6], 1.9); break; }
    case 'run': { const gx = lerp(-3, 41, M.smooth(lt / d * 0.98 + 0.01)); girl({ expr: 'determined' in {} ? 'brave' : 'brave', step: q((lt * 3.2) % 1, 2), L: 'run', R: 'run', swing: q(Math.sin(lt * 20), 1), look: 0.3, bob: q(Math.abs(Math.sin(lt * 20)) * 0.012, 3) }, [gx, 0, -1.8], 0.58, { yaw: 0 }); break; }
    case 'carArrive': { const gx = lerp(35, CAR.x - 1.2, M.smooth(ramp(lt, 0.2, 1.7))); const a = 1 - ramp(lt, 2.5, 2.8); if (a > 0) girl({ expr: 'scared', step: lt < 1.7 ? q((lt * 2.6) % 1, 2) : 0, L: 'run', R: 'run', swing: q(Math.sin(lt * 14), 1), look: 0.4 }, [gx, 0, CAR.z + 1.6], 0.56, { alpha: a }); break; }
    case 'press': girl({ expr: lt > 0.4 ? 'brave' : 'scared', L: 'reach', R: 'reach', look: 0 }, [640, 0.3, -0.95], 0.56); break;
    case 'mturn': { const tn = M.smooth(ramp(lt, 0.7, 1.2)); mon({ step: 0, ear: 1, twitch: 1, t: q(lt, 2), lean: q(-0.4 + 0.8 * tn, 2) }, [-9, 0, -1.6]); break; }
    case 'mrun': { const mx = lerp(-8, 30, M.smooth(lt / d)); mon({ step: q((lt * 3.4) % 1, 2), ear: 1, run: 1, lean: 0.9, t: q(lt, 2) }, [mx, 0, -1.6]); break; }
    case 'hide': { const a1 = ramp(lt, 0.3, 1.2), gx = lerp(CAR.x - 0.9, DUMP.x - 1.3, M.smooth(a1)); const jump = ramp(lt, 1.5, 2.3); let x = gx, y = 0, gz = CAR.z + 1.8, al = 1;
      if (jump > 0) { x = lerp(DUMP.x - 1.3, DUMP.x - 0.2, jump); y = Math.sin(jump * Math.PI) * 1.5 + jump * 1.0; gz = lerp(CAR.z + 1.8, DUMP.z, jump); al = 1 - ramp(lt, 2.2, 2.4); }
      if (al > 0.01) girl({ expr: 'scared', step: jump > 0 ? 0 : q((lt * 3) % 1, 2), L: jump > 0 ? 'up' : 'run', R: jump > 0 ? 'up' : 'run', swing: q(Math.sin(lt * 16), 1), look: 0.3 }, [x, y, gz], 0.56, { alpha: al });
      const ma = ramp(lt, 2.2, 2.8); if (ma > 0) mon({ step: q((lt * 3.4) % 1, 2), ear: 1, run: 1, lean: 0.9, t: q(lt, 2) }, [lerp(28, 40, ma), 0, -1.6], 1.9, { alpha: ma }); break; }
    case 'dump': girl({ expr: 'scared', L: 'cover', R: 'cover', look: Math.sin(lt * 1.3) * 0.5 }, [700 + Math.sin(f * 1.6) * 0.012, 0, -0.7], 0.7); break;
    case 'mcar': { const w = M.smooth(ramp(lt, 0, 1.4)), mx = lerp(CAR.x - 8, CAR.x - 1.4, w), a = 1 - ramp(lt, 1.4, 1.9); if (a > 0) mon({ step: q((lt * 2.4) % 1, 2), ear: 1, twitch: 1, t: q(lt, 2), lean: 0.4 }, [mx, 0, lerp(-1.6, CAR.z + 1.2, ramp(lt, 1.0, 1.6))], 1.9, { alpha: a }); break; }
    case 'day': { const gx = lerp(36, 28, lt / d), wk = q((lt * 1.6) % 1, 2); R('man', alive(51, { seed: 51, expr: 'calm' in {} ? 'smile' : 'smile', step: wk, R: 'hang' }), [gx + 0.6, 0, -1.4], { s: 0.86, flip: true }); girl({ expr: 'smile', step: wk }, [gx - 0.3, 0, -1.2], 0.52, { flip: true }); break; }
    case 'window': girl({ expr: lt < S(53) - T0('window') ? 'calm' : 'scared', L: 'hang', R: 'hang', look: 0.7 }, [398.95, 0, -1.6], 0.6); break;
    case 'out': girl({ expr: 'shock', L: 'cheek', R: 'cheek', look: 0.7 }, [398.95, 0, -1.6], 0.6); break;
    case 'know': girl({ expr: lt < S(58) - T0('know') + 0.3 ? 'scared' : lt < S(59) - T0('know') + 0.6 ? 'sad' : 'brave', L: 'hang', R: 'hang', look: 0.7 }, [398.95, 0, -1.6], 0.6); break;
    case 'ask': girl({ expr: 'brave', L: 'hang', R: 'hang', look: 0 }, [0.4, 0, 2.5], 0.62 + 0.04 * sm(lt / d)); break;
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 6, ...extra });
const ringFx = (T, id, c, size, t, col) => FX('ring' + id + q(t % 1, 2), (p) => T.fxRingWave(p, t % 1, col), [c[0], c[1] - 1.07 * size, c[2]], size, { tint: '#ffffff' });
export const fxAt = (f, T) => {
  const s = shotAt(f), lt = (f - s.a) / 30, out = [];
  switch (s.id) {
    case 'doors': if (lt > 2.6) out.push(ringFx(T, 'd', [37, 4.1, -1.9], 2.2, lt * 0.9, '#ffd9a0')); break;
    case 'listen': out.push(ringFx(T, 'l', [5.4, 3.4, -1.3], 2.2 + 0.4 * Math.sin(lt * 3), lt * 1.2, '#cfe0ff')); break;
    case 'enter': if (lt < 1.7) out.push(ringFx(T, 'e', [HOUSES[3].x - 1.5, 4.6, -5.8], 1.4, lt * 1.2, '#ffd9a0')); break;
    case 'wallclock': if (lt > 0.5) out.push(FX('x', (p) => T.fxXMark(p), [462.2, 2.2 - 1.07 * 0.34, -2.4], 0.34, { alpha: M.easeOut(ramp(lt, 0.5, 0.8)) })); break;
    case 'horn0': if (lt > 0.4) out.push(FX('x2', (p) => T.fxXMark(p), [640, 0.95 - 1.07 * 0.5, 0.2], 0.5, { alpha: M.easeOut(ramp(lt, 0.4, 0.7)) })); break;
    case 'roof': out.push(FX('z' + q((lt * 0.5) % 1, 2), (p) => T.fxZzz(p, (lt * 0.5) % 1), [HOUSES[4].x - 0.4, HOUSES[4].h + 1.4, -9.5], 0.9)); break;
    case 'cry': out.push(ringFx(T, 'c', [460, 1.2, 0.2], 1.6 + lt * 0.3, lt * 1.5, '#ffd0a0')); break;
    case 'turn': out.push(FX('arcs', (p) => T.fxFootstep(p, (lt * 1.4) % 1), [-12, 0.05, -4.2], 3)); break;
    case 'press': if (lt > 0.4) out.push(ringFx(T, 'p', [640, 0.95, 0.4], 1.4 + (lt - 0.4) * 0.6, (lt - 0.4) * 1.8, '#ffe2a8')); break;
    case 'fill': if (lt > 0.1) out.push(ringFx(T, 'f', [CAR.x, 2.2, -2.9], 9 + lt * 2, lt * 0.7, '#ffe2a8')); break;
    case 'stuck': out.push(ringFx(T, 's', [CAR.x, 1.5, -2.9], 3.5, lt * 1.4, '#ffe2a8')); break;
    case 'mturn': out.push(ringFx(T, 'm', [-6, 3.4, -1.3], 3.5, lt * 1.1, '#ffe2a8')); break;
    case 'mrun': break;
    case 'slam': if (lt > 0.5 && lt < 1.2) { const k = (lt - 0.5) / 0.7; out.push(FX('dust' + q(k, 2), (p) => T.fxDust(p, k, '#e9dcc4'), [CAR.x - 0.6, 0.3 - 0.5, CAR.z + 1.2], 1.3)); } break;
  }
  return out;
};
