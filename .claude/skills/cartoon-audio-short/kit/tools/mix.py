#!/usr/bin/env python3
"""Voice-first mix.  python3 mix.py voice.(mp3|wav) music.wav sfx.wav [--out mix_raw.wav]
Voice is untouched. Music sits at -13 dB and SFX at -12 dB (gated RMS vs the voice). While the voice is
speaking SFX are held to -16 dB under it (loud continuous sounds like horns never cover the narrator);
in pauses they may rise to -10 dB. SFX peaks are capped at 0.35x the voice peak. Output 48 kHz stereo."""
import sys, subprocess, numpy as np, wave, tempfile, os
args = [a for a in sys.argv[1:] if not a.startswith('--')]
out = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else 'mix_raw.wav'
if out in args: args.remove(out)
SR = 48000
def load(p):
    t = tempfile.mktemp(suffix='.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-ar', str(SR), '-ac', '1', t], check=True)
    w = wave.open(t); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; w.close(); os.remove(t); return x
v = load(args[0]); n = len(v)
fit = lambda x: np.pad(x, (0, max(0, n - len(x))))[:n]
m = fit(load(args[1])) if len(args) > 1 and os.path.exists(args[1]) else np.zeros(n, np.float32)
s = fit(load(args[2])) if len(args) > 2 and os.path.exists(args[2]) else np.zeros(n, np.float32)
win = SR // 20; k = n // win
def wr(x): return np.sqrt((x[:k * win].reshape(k, win) ** 2).mean(1)) + 1e-9
sm = lambda a, L: np.convolve(a, np.ones(L) / L, mode='same')
vw = wr(v); act = vw > 0.02; vg = np.sqrt((vw[act] ** 2).mean()) if act.any() else 0.05
db = lambda d: 10 ** (d / 20)
def gated(x):
    w = wr(x); a = w > max(1e-4, w.max() * .02); return np.sqrt((w[a] ** 2).mean()) if a.any() else 1e-9
if m.any(): m = m * (vg * db(-13) / gated(m))
if s.any():
    s = s * (vg * db(-12) / gated(s))
    sw = wr(s); vloc = sm(vw, 20); speak = sm(act.astype(float), 10) > .15
    target = np.where(speak, np.minimum(vloc, vg) * db(-16), vg * db(-10))
    gain = sm(np.minimum(1.0, target / sw), 6)
    s = s * np.pad(np.repeat(gain, win), (0, n - k * win), mode='edge')
    cap = .35 * np.abs(v).max(); s = np.clip(s, -cap, cap)
mix = v + m + s
mix = mix / max(1.0, np.abs(mix).max() / .89)
st = np.repeat(mix[:, None], 2, 1)
w = wave.open(out, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes()); w.close()
r = lambda x: 20 * np.log10(gated(x) / gated(v)) if x.any() else float('-inf')
print(f'music {r(m):.1f} dB vs voice, sfx {r(s):.1f} dB vs voice (while speaking max -16 dB), wrote {out}')
