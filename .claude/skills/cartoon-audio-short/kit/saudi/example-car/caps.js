// Arabic captions (plain text, no diacritics), word by word, drawn on a 2D overlay.
import { TIMING } from './timing.js';
const HL = '#ff9460';
const KEY = new Set(['«سيارتي', 'راحت!»', 'سرقوها!', 'الأحمر».', 'أحمر…', 'أزرق…', 'أخضر.', 'بالشرطة', 'أتذكر!»', 'حارس', 'بالتاكسي».', 'بالتاكسي؟»', 'المغسلة».', 'ضحكنا', 'هالمواقف؟', 'سؤال:']);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), eout = (t) => 1 - Math.pow(1 - t, 3);
const GROUPS = [];
TIMING.chunks.forEach((c, ci) => {
  let words;
  if (c.d) { const dw = c.d.split(' '), L = dw.map((w) => w.length), T = L.reduce((a, b) => a + b, 0); let acc = 0; words = dw.map((w, i) => { const s = c.s + (c.e - c.s) * acc / T; acc += L[i]; return { w, s }; }); }
  else words = c.words.map(([w, s]) => ({ w, s }));
  const n = words.length, g = Math.ceil(n / 4), base = Math.floor(n / g), extra = n % g; let k = 0;
  for (let i = 0; i < g; i++) { const sz = base + (i < extra ? 1 : 0); GROUPS.push({ words: words.slice(k, k + sz), ci }); k += sz; }
});
GROUPS.forEach((gp, i) => { gp.s = gp.words[0].s; const next = GROUPS[i + 1]; const ce = TIMING.chunks[gp.ci].e + 0.35; gp.e = next ? Math.min(next.words[0].s, Math.max(ce, gp.words[gp.words.length - 1].s + 0.5)) : TIMING.dur + 1.2; if (next && next.words[0].s - gp.e < 0.12) gp.e = next.words[0].s; });
export function drawCaptions(ctx, t) {
  const gp = GROUPS.find((g) => t >= g.s - 0.02 && t < g.e); if (!gp) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const FS = 76; ctx.font = `800 ${FS}px Taj`; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
  const sp = 22, maxW = 880, ws = gp.words.map((w) => ({ ...w, wd: ctx.measureText(w.w).width }));
  let lines = [ws]; const tot = ws.reduce((a, w) => a + w.wd, 0) + sp * (ws.length - 1);
  if (tot > maxW && ws.length > 1) { let best = 1, bd = 1e9; for (let i = 1; i < ws.length; i++) { const a = ws.slice(0, i).reduce((s, w) => s + w.wd + sp, -sp), b = ws.slice(i).reduce((s, w) => s + w.wd + sp, -sp), dd = Math.max(a, b); if (dd < bd) { bd = dd; best = i; } } lines = [ws.slice(0, best), ws.slice(best)]; }
  const lh = 104, cy0 = 1440 - (lines.length - 1) * lh / 2, out = clamp((gp.e - t) / 0.12);
  lines.forEach((ln, li) => { const lw = ln.reduce((s, w) => s + w.wd + sp, -sp); let x = 540 + lw / 2; const y = cy0 + li * lh;
    ln.forEach((w) => { const a = clamp((t - w.s) / 0.16); if (a <= 0) { x -= w.wd + sp; return; } const e = eout(a), key = KEY.has(w.w);
      ctx.save(); ctx.globalAlpha = e * out; ctx.translate(x - w.wd / 2, y + (1 - e) * 26); const sc = 0.9 + 0.1 * e + (key ? 0.06 * Math.sin(a * Math.PI) : 0); ctx.scale(sc, sc); ctx.textAlign = 'center';
      ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(10,8,22,0.95)'; ctx.strokeText(w.w, 0, 0); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6; ctx.fillStyle = key ? HL : '#fff6e6'; ctx.fillText(w.w, 0, 0); ctx.restore(); x -= w.wd + sp; }); });
  ctx.restore();
}
