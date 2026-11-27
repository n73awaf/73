// ---------- world: a Saudi neighbourhood street + a few small interiors ----------
const DECK = 0;
const street = new THREE.Group(); scene.add(street);
const sandMat = toon({ color: '#bfa57c' }), asphalt = toon({ color: '#585570' }), curbM = toon({ color: '#aaa39a' }), walkM = toon({ color: '#b9b2a6' });
const dashM = toon({ color: '#efe6c4' }), metal = toon({ color: '#6b6878' }), whiteM = toon({ color: '#f1f1f5' }), blackM = toon({ color: '#08060d' });
const addTo = (g, geo, mat, x, y, z, opts) => add(geo, mat, x, y, z, g, opts);
// ground
add(new THREE.PlaneGeometry(600, 400), sandMat, 20, -0.03, 0, street, { cast: false }).rotation.x = -Math.PI / 2;
addTo(street, tbox(140, 0.1, 8, 3), asphalt, 5, -0.04, -0.3, { cast: false });
addTo(street, tbox(140, 0.2, 2.2, 3), walkM, 5, 0.08, -5.1, {}); addTo(street, tbox(140, 0.26, 0.3, 3), curbM, 5, 0.1, -3.9, {});
addTo(street, tbox(140, 0.2, 2.2, 3), walkM, 5, 0.08, 5.2, {}); addTo(street, tbox(140, 0.26, 0.3, 3), curbM, 5, 0.1, 3.9, {});
for (let x = -52; x < 66; x += 4) addTo(street, box(1.6, 0.02, 0.14), dashM, x, 0.03, -0.3, { cast: false });
// street end wall + sand lot
addTo(street, tbox(1.2, 3.2, 12, 2), M.plaster3, 58.6, 1.6, 0, {}); addTo(street, tbox(1.5, 0.4, 12.4, 2), M.plaster2, 58.6, 3.3, 0, {});
// pivoting doors, windows, per house
const houseObjs = [];
const FACADES = [M.plasterA, M.plasterB, M.plasterC, M.plasterD];
const doorCols = ['#4f7a6b', '#8a5a3c', '#4a6a9a', '#7a3f4a'];
HOUSES.forEach((hs, hi) => {
  const g = new THREE.Group(); street.add(g); const o = { g, wins: [], doorPivot: null };
  const fz = FRONT_Z - 4.5; // box centre z (depth 9)
  addTo(g, tbox(hs.w, hs.h, 9, 2.2), FACADES[hs.mat], hs.x, hs.h / 2, fz, {});
  // parapet + crenellation
  addTo(g, tbox(hs.w + 0.4, 0.7, 9.4, 2), M.plaster2, hs.x, hs.h + 0.35, fz, {});
  for (let i = 0; i * 0.95 < hs.w; i++) { const c = addTo(g, new THREE.ConeGeometry(0.3, 0.55, 4), M.plaster2, hs.x - hs.w / 2 + 0.45 + i * 0.95, hs.h + 0.95, FRONT_Z - 0.1, {}); c.rotation.y = Math.PI / 4; }
  addTo(g, tbox(hs.w + 0.1, 0.28, 0.16, 1), M.plaster2, hs.x, hs.h - 1.1, FRONT_Z + 0.06, {});
  addTo(g, tbox(hs.w + 0.1, 0.28, 0.16, 1), M.plaster2, hs.x, 2.95, FRONT_Z + 0.06, {});
  // water tank + AC
  addTo(g, new THREE.CylinderGeometry(0.62, 0.62, 1.2, 14), M.tank, hs.x + hs.w * 0.25, hs.h + 1.3, fz + 1.5, {});
  addTo(g, box(1.0, 0.62, 0.42), whiteM, hs.x + hs.w / 2 - 1.3, hs.h * 0.55, FRONT_Z + 0.3, {});
  // windows: upper row (3)
  [-0.34, 0, 0.34].forEach((k, i) => {
    const wx = hs.x + k * hs.w, wy = hs.h - 2.1;
    if (Math.abs(wx - (hs.x + hs.dx)) < 1.0 && false) return;
    addTo(g, tbox(1.5, 1.7, 0.16, 1), M.plaster2, wx, wy, FRONT_Z + 0.02, {});
    const pane = addTo(g, box(1.2, 1.4, 0.12), M.winDark.clone(), wx, wy, FRONT_Z + 0.1, { cast: false });
    addTo(g, box(0.06, 1.4, 0.14), metal, wx, wy, FRONT_Z + 0.2, { cast: false }); addTo(g, box(1.2, 0.06, 0.14), metal, wx, wy, FRONT_Z + 0.2, { cast: false });
    for (let b = -2; b <= 2; b++) addTo(g, box(0.03, 1.4, 0.04), metal, wx + b * 0.24, wy, FRONT_Z + 0.26, { cast: false });
    o.wins.push(pane);
  });
  // door: frame, dark recess, pivot leaf
  const dX = hs.x + hs.dx;
  addTo(g, tbox(1.8, 3.0, 0.22, 1), M.plaster2, dX, 1.5, FRONT_Z + 0.04, {});
  addTo(g, box(1.3, 2.5, 0.2), blackM, dX, 1.25, FRONT_Z + 0.04, { cast: false });
  const piv = new THREE.Group(); piv.position.set(dX - 0.65, 0, FRONT_Z + 0.12); g.add(piv);
  const dm = toon({ color: doorCols[hi % 4] });
  addTo(piv, box(1.3, 2.5, 0.1), dm, 0.65, 1.25, 0, {});
  addTo(piv, box(1.0, 0.95, 0.04), toon({ color: shade_(doorCols[hi % 4], 1.18) }), 0.65, 1.75, 0.07, { cast: false }); addTo(piv, box(1.0, 0.95, 0.04), toon({ color: shade_(doorCols[hi % 4], 1.18) }), 0.65, 0.65, 0.07, { cast: false });
  addTo(piv, new THREE.SphereGeometry(0.07, 8, 8), M.bronze, 1.1, 1.2, 0.1, { cast: false });
  o.doorPivot = piv; houseObjs.push(o);
  addTo(g, tbox(1.8, 0.16, 0.9, 1), curbM, dX, 0.08, FRONT_Z + 0.5, {}); // step
});
function shade_(hex, k) { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.round(Math.min(255, v * k)); return '#' + ((1 << 24) + (f(n >> 16) << 16) + (f(n >> 8 & 255) << 8) + f(n & 255)).toString(16).slice(1); }
// alley side door of our house (H1), facing +x
const sideDoor = new THREE.Group(); sideDoor.position.set(SIDE_DOOR.x, 0, SIDE_DOOR.z + 0.55); street.add(sideDoor);
addTo(street, tbox(0.2, 2.8, 1.6, 1), M.plaster2, SIDE_DOOR.x + 0.04, 1.4, SIDE_DOOR.z, {}); addTo(street, box(0.18, 2.4, 1.2), blackM, SIDE_DOOR.x + 0.06, 1.2, SIDE_DOOR.z, { cast: false });
addTo(sideDoor, box(0.1, 2.4, 1.2), toon({ color: '#6f4a35' }), 0.12, 1.2, -0.6, {});
// alley walls (the gap between our house and the next)
addTo(street, tbox(3.6, 0.2, 9, 3), walkM, -10, 0.05, -10.5, { cast: false });
// street lamps
const lampBulbs = [];
LAMPS.forEach((x) => {
  addTo(street, new THREE.CylinderGeometry(0.1, 0.14, 6.6, 8), M.iron, x, 3.3, -4.4, {});
  const arm = addTo(street, tbox(1.6, 0.14, 0.14, 1), M.iron, x + 0.7, 6.55, -4.4, {});
  addTo(street, tbox(0.9, 0.18, 0.5, 1), M.iron, x + 1.5, 6.55, -4.4, {});
  const bulb = addTo(street, new THREE.SphereGeometry(0.28, 10, 8), toon({ color: '#ffe9a8' }), x + 1.5, 6.38, -4.4, { cast: false }); lampBulbs.push(bulb);
});
const haloTex = P.tex(P.radial('255,226,160', 0.9));
const halos = LAMPS.map((x) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); m.position.set(x + 1.5, 6.38, -4.2); m.userData.ndSkip = true; m.renderOrder = 3; street.add(m); return m; });
// light pools on the pavement
const poolTex = P.tex(P.radial('255,226,160', 0.5));
LAMPS.forEach((x) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(9, 5), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); m.rotation.x = -Math.PI / 2; m.position.set(x + 1.5, 0.06, -2.4); m.userData.ndSkip = true; street.add(m); });
// palm trees
const palm = (x, z, h = 6.5, lean = 0.12) => {
  const g = new THREE.Group(); g.position.set(x, 0, z); street.add(g);
  for (let i = 0; i < 9; i++) { const seg = add(new THREE.CylinderGeometry(0.2 - i * 0.008, 0.23 - i * 0.008, h / 9 + 0.05, 8), M.trunk, Math.sin(i / 9 * lean * 4) * 0.4, (i + 0.5) * h / 9, 0, g); seg.rotation.z = -lean * (i / 9); }
  const top = new THREE.Group(); top.position.set(Math.sin(lean * 4) * 0.4, h, 0); g.add(top);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; const f = add(new THREE.ConeGeometry(0.34, 3.0, 4), M.palmLeaf, Math.cos(a) * 0.9, -0.1, Math.sin(a) * 0.9, top); f.scale.set(1, 1, 0.3); f.rotation.set(Math.sin(a) * 1.3, 0, -Math.cos(a) * 1.3); f.rotation.order = 'ZXY'; f.position.y = 0.2 - 0.3; }
  add(new THREE.SphereGeometry(0.3, 8, 6), M.trunk, 0, 0.1, 0, top);
  return g;
};
palm(4, -5.2, 7, 0.1); palm(-27, -5.3, 6, -0.08); palm(31, -5.2, 6.5, 0.1); palm(16, 5.4, 6, 0.06);
// the old car (faces +x), camera-side door pivots
const carG = new THREE.Group(); carG.position.set(CAR.x, 0, CAR.z); street.add(carG);
{
  const body = new THREE.Shape(); [[-2.3, 0.3], [-2.3, 0.85], [-1.7, 0.95], [-0.9, 0.98], [-0.5, 1.5], [1.0, 1.5], [1.5, 1.0], [2.2, 0.92], [2.3, 0.36], [1.9, 0.3]].forEach(([x, y], i) => i ? body.lineTo(x, y) : body.moveTo(x, y));
  const bg = new THREE.ExtrudeGeometry(body, { depth: 1.8, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.05, bevelSegments: 1 }); bg.translate(0, 0, -0.9);
  add(bg, M.carBody, 0, 0, 0, carG);
  const win = new THREE.Shape(); [[-0.78, 1.02], [-0.46, 1.44], [0.98, 1.44], [1.36, 1.02]].forEach(([x, y], i) => i ? win.lineTo(x, y) : win.moveTo(x, y));
  for (const sd of [-1, 1]) { const pane = new THREE.Mesh(new THREE.ShapeGeometry(win), carPane); pane.position.set(0, 0, sd * 0.97); if (sd < 0) pane.rotation.y = Math.PI; carG.add(pane); pane.userData.nd = null; }
  // rust patches
  for (const [x, y, w, h, sd] of [[-1.6, 0.62, 0.7, 0.25, 1], [1.7, 0.6, 0.55, 0.3, 1], [-0.1, 0.45, 0.9, 0.18, 1], [0.8, 1.2, 0.3, 0.2, 1]]) add(box(w, h, 0.03), M.rust, x, y, 0.93 * sd, carG, { cast: false });
  add(box(0.06, 0.46, 0.04), M.carBody, 0.25, 1.24, 0.95, carG, { cast: false });
  // wheels + bumpers + lights
  for (const x of [-1.35, 1.4]) for (const z of [-0.82, 0.82]) { const w = add(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 14), M.tire, x, 0.36, z, carG); w.rotation.x = Math.PI / 2; const hub = add(new THREE.CylinderGeometry(0.17, 0.17, 0.28, 10), metal, x, 0.36, z, carG, { cast: false }); hub.rotation.x = Math.PI / 2; }
  add(box(0.18, 0.2, 1.9), metal, 2.38, 0.55, 0, carG); add(box(0.18, 0.2, 1.9), metal, -2.38, 0.55, 0, carG);
  const hl = [-0.62, 0.62].map((z) => add(new THREE.SphereGeometry(0.17, 10, 8), toon({ color: '#e8e0c0' }), 2.3, 0.82, z, carG, { cast: false })); carG.userData.headlights = hl;
  // camera-side door (z=+): door hole + pivot leaf
  carG.userData.hole = add(box(1.15, 0.56, 0.05), blackM, 0.0, 1.22, 0.9, carG, { cast: false }); carG.userData.hole.visible = false;
  const dp = new THREE.Group(); dp.position.set(0.62, 0, 0.92); carG.add(dp);
  const leaf = new THREE.Shape(); [[-1.3, 0.38], [-1.3, 0.96], [-0.5, 1.5], [0.0, 1.5], [0.0, 0.38]].forEach(([x, y], i) => i ? leaf.lineTo(x, y) : leaf.moveTo(x, y));
  const lg = new THREE.ExtrudeGeometry(leaf, { depth: 0.08, bevelEnabled: false }); add(lg, M.carBody, 0, 0, 0, dp);
  const lw = new THREE.Shape(); [[-1.0, 1.0], [-0.55, 1.42], [-0.06, 1.42], [-0.06, 1.0]].forEach(([x, y], i) => i ? lw.lineTo(x, y) : lw.moveTo(x, y));
  const lwm = new THREE.Mesh(new THREE.ShapeGeometry(lw), carPane); lwm.position.z = 0.09; dp.add(lwm); add(box(0.3, 0.05, 0.06), metal, -0.9, 1.0, 0.1, dp, { cast: false });
  carG.userData.doorPivot = dp;
}
// dumpster (lid pivots at the back)
const dumpG = new THREE.Group(); dumpG.position.set(DUMP.x, 0, DUMP.z); street.add(dumpG);
{ add(tbox(2.2, 1.2, 1.3, 1.5), M.green, 0, 0.8, 0, dumpG); add(box(2.3, 0.1, 0.1), M.greenD, 0, 1.42, 0.62, dumpG);
  for (const x of [-0.9, 0.9]) add(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8), M.tire, x, 0.12, 0.6, dumpG).rotation.x = Math.PI / 2;
  const lp = new THREE.Group(); lp.position.set(0, 1.4, -0.66); dumpG.add(lp); add(tbox(2.3, 0.1, 1.4, 1.5), M.greenD, 0, 0.05, 0.7, lp); dumpG.userData.lid = lp; }
// background: far houses on the other side + low hills + distant skyline
{ const r = P.rng(77); for (let i = 0; i < 16; i++) { const x = -70 + i * 11, h = 5 + r() * 4; const m = [M.plasterA, M.plasterB, M.plasterC, M.plasterD][i % 4]; addTo(street, tbox(8 + r() * 2, h, 8, 2.2), m, x, h / 2, 18 + r() * 2, {}); addTo(street, tbox(8.4, 0.6, 8.4, 2), M.plaster2, x, h + 0.3, 18, {}); for (let k = 0; k < 3; k++) if (r() < 0.45) addTo(street, box(1, 1.2, 0.1), toon({ color: '#ffd98a' }), x - 2.4 + k * 2.4, h - 1.8, 13.9, { cast: false }); }
  for (let i = 0; i < 12; i++) { const h = 40 + r() * 30; add(new THREE.SphereGeometry(h, 14, 8), toon({ color: '#2a2250' }), -200 + i * 55, -h * 0.55, -150 - r() * 60, scene, { cast: false }); } }
// stars + moon
const starGeo = new THREE.BufferGeometry(); { const r = P.rng(5), a = []; for (let i = 0; i < 400; i++) { const th = r() * Math.PI * 2, ph = Math.acos(0.25 + r() * 0.75); a.push(1000 * Math.sin(ph) * Math.cos(th), 1000 * Math.cos(ph), 1000 * Math.sin(ph) * Math.sin(th)); } starGeo.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); }
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#fff3d6', size: 5, sizeAttenuation: false, fog: false })); stars.userData.ndSkip = true; scene.add(stars);
const moon = new THREE.Mesh(new THREE.CircleGeometry(60, 32), new THREE.MeshBasicMaterial({ color: '#f6f0d2', fog: false })); moon.position.set(-130, 330, -820); moon.lookAt(0, 0, 0); moon.userData.ndSkip = true; scene.add(moon);
const moonHalo = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), new THREE.MeshBasicMaterial({ map: P.tex(P.radial('255,240,190', 0.55)), transparent: true, depthWrite: false, fog: false })); moonHalo.position.copy(moon.position); moonHalo.lookAt(0, 0, 0); moonHalo.userData.ndSkip = true; scene.add(moonHalo);
// roof sleeper bed (on house 4)
const roofBed = new THREE.Group(); roofBed.position.set(HOUSES[4].x + 1, HOUSES[4].h + 0.72, -9.5); street.add(roofBed);
add(tbox(2.0, 0.22, 1.0, 1), toon({ color: '#e8e0d0' }), 0, 0.11, 0, roofBed); add(tbox(0.45, 0.1, 0.55, 1), toon({ color: '#ffffff' }), -0.7, 0.27, 0, roofBed);

// ---------- interiors ----------
const rooms = {};
const wallMat = (c) => toon({ color: c });
function roomShell(name, w, d, hgt, wallC, floorMat, ceilC = '#e6dcc8') {
  const g = new THREE.Group(); g.position.set(...ROOMS[name]); scene.add(g); rooms[name] = g;
  add(tbox(w, 0.2, d, 2), floorMat, 0, -0.1, 0, g, { cast: false });
  add(tbox(w, hgt, 0.2, 2), wallMat(wallC), 0, hgt / 2, -d / 2, g); add(tbox(0.2, hgt, d, 2), wallMat(wallC), -w / 2, hgt / 2, 0, g); add(tbox(0.2, hgt, d, 2), wallMat(wallC), w / 2, hgt / 2, 0, g);
  add(tbox(w, 0.2, d, 2), wallMat(ceilC), 0, hgt + 0.1, 0, g, { cast: false }); add(tbox(w, hgt, 0.2, 2), wallMat(wallC), 0, hgt / 2, d / 2 + 0.6, g);
  add(box(w, 0.14, 0.12), wallMat('#ffffff'), 0, 0.07, -d / 2 + 0.1, g, { cast: false });
  return g;
}
const paneCanvas = document.createElement('canvas'); paneCanvas.width = 256; paneCanvas.height = 320; const paneCtx = paneCanvas.getContext('2d');
const paneTex = new THREE.CanvasTexture(paneCanvas); paneTex.colorSpace = THREE.SRGBColorSpace; let paneKey = '';
function drawPane(dawn, mx) {
  const key = dawn.toFixed(2) + '|' + (mx == null ? 'n' : mx.toFixed(2)); if (key === paneKey) return; paneKey = key;
  const g = paneCtx, lerpc = (a, b, t) => Math.round(a + (b - a) * t);
  const gr = g.createLinearGradient(0, 0, 0, 320); gr.addColorStop(0, `rgb(${lerpc(24, 112, dawn)},${lerpc(16, 92, dawn)},${lerpc(54, 170, dawn)})`); gr.addColorStop(1, `rgb(${lerpc(70, 250, dawn)},${lerpc(52, 182, dawn)},${lerpc(120, 138, dawn)})`);
  g.fillStyle = gr; g.fillRect(0, 0, 256, 320);
  if (dawn < 0.6) { g.fillStyle = '#f6f0d2'; g.beginPath(); g.arc(190, 60, 24, 0, 7); g.fill(); for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(255,243,214,.8)'; g.fillRect((i * 97) % 256, (i * 53) % 150, 2, 2); } } else { g.fillStyle = 'rgba(255,230,170,.8)'; g.beginPath(); g.arc(70, 250, 40, 0, 7); g.fill(); }
  g.fillStyle = dawn > 0.5 ? '#4a3a68' : '#150d2c'; for (let i = 0; i < 6; i++) g.fillRect(i * 46 - 10, 220 + (i * 37) % 40, 54, 120);
  if (mx != null) { const x = 20 + mx * 216; g.fillStyle = '#05030a'; g.fillRect(x - 16, 150, 32, 170); g.beginPath(); g.arc(x, 132, 20, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - 18, 126); g.lineTo(x - 26, 76); g.lineTo(x - 6, 116); g.fill(); g.beginPath(); g.moveTo(x + 18, 126); g.lineTo(x + 26, 76); g.lineTo(x + 6, 116); g.fill(); }
  paneTex.needsUpdate = true;
}
const paneMat = new THREE.MeshBasicMaterial({ map: paneTex });
const clockCanvas = document.createElement('canvas'); clockCanvas.width = 256; clockCanvas.height = 128; const clockCtx = clockCanvas.getContext('2d'); const clockTex = new THREE.CanvasTexture(clockCanvas); clockTex.colorSpace = THREE.SRGBColorSpace; let clockKey = '';
function drawClock(text, col) {
  const key = text + col; if (key === clockKey) return; clockKey = key; const g = clockCtx; g.fillStyle = '#120a14'; g.fillRect(0, 0, 256, 128);
  const SEG = { '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd', '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abcfgd' };
  const dig = (ch, x, y, w, h) => { const t = w * .22, s = SEG[ch] || '', sg = { a: [x + t, y, w - 2 * t, t], d: [x + t, y + h - t, w - 2 * t, t], g: [x + t, y + h / 2 - t / 2, w - 2 * t, t], f: [x, y + t, t, h / 2 - t], b: [x + w - t, y + t, t, h / 2 - t], e: [x, y + h / 2, t, h / 2 - t], c: [x + w - t, y + h / 2, t, h / 2 - t] }; for (const k in sg) { g.fillStyle = s.includes(k) ? col : 'rgba(255,80,90,.08)'; g.fillRect(...sg[k]); } };
  const [h, m] = text.split(':'); dig(h, 24, 20, 50, 88); dig(m[0], 100, 20, 50, 88); dig(m[1], 168, 20, 50, 88); g.fillStyle = col; g.fillRect(84, 44, 8, 8); g.fillRect(84, 76, 8, 8); clockTex.needsUpdate = true;
}
const wallClockC = document.createElement('canvas'); wallClockC.width = wallClockC.height = 256; const wcx = wallClockC.getContext('2d'); const wallClockTex = new THREE.CanvasTexture(wallClockC); wallClockTex.colorSpace = THREE.SRGBColorSpace; let wcKey = '';
function drawWallClock(h, m, s) {
  const key = [h, m, s.toFixed(1)].join(); if (key === wcKey) return; wcKey = key; const g = wcx; g.clearRect(0, 0, 256, 256); g.fillStyle = '#f6eedd'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#7a4e36'; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.strokeStyle = '#241726'; g.lineWidth = 7; g.beginPath(); g.moveTo(128 + Math.sin(a) * 96, 128 - Math.cos(a) * 96); g.lineTo(128 + Math.sin(a) * 110, 128 - Math.cos(a) * 110); g.stroke(); }
  const ha = ((h % 12) + m / 60) / 12 * 6.283, ma = m / 60 * 6.283, sa = s / 60 * 6.283; g.lineCap = 'round'; g.strokeStyle = '#241726'; g.lineWidth = 12; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.sin(ha) * 56, 128 - Math.cos(ha) * 56); g.stroke(); g.lineWidth = 8; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.sin(ma) * 86, 128 - Math.cos(ma) * 86); g.stroke();
  g.strokeStyle = '#e4573d'; g.lineWidth = 4; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.sin(sa) * 96, 128 - Math.cos(sa) * 96); g.stroke(); g.fillStyle = '#241726'; g.beginPath(); g.arc(128, 128, 9, 0, 7); g.fill(); wallClockTex.needsUpdate = true;
}
const rugC = document.createElement('canvas'); rugC.width = rugC.height = 256; { const g = rugC.getContext('2d'); g.fillStyle = '#8a2b34'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#e9c46a'; g.lineWidth = 8; g.strokeRect(14, 14, 228, 228); g.lineWidth = 3; g.strokeRect(30, 30, 196, 196); g.fillStyle = '#e9c46a'; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(128, 60 + i * 50); g.lineTo(168, 100 + i * 50 - 25); g.lineTo(128, 140 + i * 50 - 50); g.lineTo(88, 100 + i * 50 - 25); g.fill(); } }
const rugM = toon({ map: P.tex(rugC, 2, 2) });
// bedroom
{ const g = roomShell('bed', 6, 6, 3, '#6b5a9a', toon({ color: '#5a4a78' }), '#4a3f6a');
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.1), paneMat); pane.position.set(-0.9, 1.7, -2.88); pane.userData.nd = null; g.add(pane);
  add(tbox(2.0, 0.14, 0.2, 1), toon({ color: '#e9dcc4' }), -0.9, 0.62, -2.82, g); add(tbox(0.14, 2.4, 0.2, 1), toon({ color: '#e9dcc4' }), -1.82, 1.7, -2.84, g); add(tbox(0.14, 2.4, 0.2, 1), toon({ color: '#e9dcc4' }), 0.02, 1.7, -2.84, g); add(tbox(2.0, 0.14, 0.2, 1), toon({ color: '#e9dcc4' }), -0.9, 2.78, -2.82, g);
  add(box(0.08, 2.1, 0.06), toon({ color: '#e9dcc4' }), -0.9, 1.7, -2.84, g); add(box(1.7, 0.08, 0.06), toon({ color: '#e9dcc4' }), -0.9, 1.7, -2.84, g);
  for (const sx of [-1.9, 0.1]) add(tbox(0.7, 2.5, 0.12, 1), toon({ color: '#c96e8c' }), sx, 1.7, -2.76, g);
  add(tbox(2.2, 0.4, 2.7, 1.5), toon({ color: '#a9744c' }), 1.55, 0.2, -1.5, g); add(tbox(2.0, 0.34, 2.5, 1.5), toon({ color: '#f1ead8' }), 1.55, 0.57, -1.5, g); add(tbox(2.3, 1.1, 0.14, 1), toon({ color: '#8a5a3c' }), 1.55, 0.9, -2.8, g);
  add(tbox(0.8, 0.16, 0.5, 1), toon({ color: '#ffffff' }), 1.55 - 0.5, 0.82, -2.35, g); g.userData.blanket = add(tbox(2.0, 0.3, 1.7, 1.5), toon({ color: '#e9b5c6' }), 1.55, 0.86, -0.95, g);
  add(tbox(0.8, 0.8, 0.7, 1), toon({ color: '#7a4e36' }), -0.3, 0.4, -2.3, g); const ck = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), new THREE.MeshBasicMaterial({ map: clockTex })); ck.position.set(-0.3, 1.0, -1.94); ck.userData.nd = null; g.add(ck); add(tbox(0.78, 0.4, 0.2, 1), toon({ color: '#2b2340' }), -0.3, 1.0, -2.16, g); g.userData.clock = ck;
  const rg = add(new THREE.CylinderGeometry(1.2, 1.2, 0.03, 24), toon({ color: '#c9b27a' }), -0.9, 0.02, -0.4, g, { cast: false }); }
// living room (majlis style)
{ const g = roomShell('living', 8, 6, 3.2, '#b0805f', toon({ map: P.tex(rugC, 4, 3) }), '#dccfb4');
  for (const [x, z, w, d, r] of [[-3.2, 0, 0.9, 5.4, 0], [0, -2.5, 6.4, 0.9, 0]]) { add(tbox(w, 0.35, d, 1), toon({ color: '#9e3b3b' }), x, 0.18, z, g); add(tbox(w * (d > w ? 0.35 : 1), d > w ? 0.5 : 0.5, d * (d > w ? 1 : 0.35), 1), toon({ color: '#b24a4a' }), x + (d > w ? -0.3 : 0), 0.6, z + (d > w ? 0 : -0.28), g); }
  const wc = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), new THREE.MeshBasicMaterial({ map: wallClockTex })); wc.position.set(2.2, 2.2, -2.88); wc.userData.nd = null; g.add(wc);
  const dl = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.4), paneMat); dl.position.set(-0.1, 1.2, -2.92); dl.userData.nd = null; g.add(dl);
  add(tbox(1.8, 2.7, 0.14, 1), toon({ color: '#e9dcc4' }), -0.1, 1.35, -2.86, g);
  const dp = new THREE.Group(); dp.position.set(-0.8, 0, -2.78); g.add(dp); add(box(1.4, 2.4, 0.1), toon({ color: '#8a5a3c' }), 0.7, 1.2, 0, dp); add(box(1.0, 0.95, 0.04), toon({ color: '#a06a46' }), 0.7, 1.75, 0.07, dp, { cast: false }); add(box(1.0, 0.95, 0.04), toon({ color: '#a06a46' }), 0.7, 0.65, 0.07, dp, { cast: false }); g.userData.door = dp; g.userData.wc = wc; }
// kitchen (tap close-up)
{ const g = roomShell('kitchen', 5, 4, 3, '#78a5a8', toon({ color: '#d9d0c0' }), '#e6dcc8');
  const tile = document.createElement('canvas'); tile.width = tile.height = 128; { const c = tile.getContext('2d'); c.fillStyle = '#e8f1f2'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#8fb5b8'; c.lineWidth = 4; c.strokeRect(2, 2, 124, 124); }
  add(tbox(5, 3, 0.1, 1), toon({ map: P.tex(tile, 5, 3) }), 0, 1.5, -1.9, g, { cast: false }); add(tbox(2.2, 0.2, 0.9, 1), toon({ color: '#b9c2cc' }), 0, 0.9, -1.4, g); add(tbox(2.2, 0.9, 0.9, 1), toon({ color: '#9a7a5a' }), 0, 0.45, -1.4, g);
  add(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 10), metal, 0, 1.55, -1.75, g); const sp = add(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 10), metal, 0.27, 1.95, -1.75, g); sp.rotation.z = Math.PI / 2; add(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 10), metal, 0.52, 1.85, -1.75, g);
  const hp = new THREE.Group(); hp.position.set(0, 1.98, -1.75); g.add(hp); add(box(0.5, 0.07, 0.1), toon({ color: '#e4573d' }), 0, 0.04, 0, hp); add(box(0.08, 0.1, 0.08), metal, 0, 0, 0, hp); g.userData.handle = hp;
  const water = add(new THREE.CylinderGeometry(0.05, 0.05, 1, 8), toon({ color: '#8fd3ff' }), 0.52, 1.35, -1.75, g, { cast: false }); g.userData.water = water; }
// classroom
{ const g = roomShell('school', 8, 6, 3.2, '#e9d9b8', toon({ color: '#b9a27e' }), '#f1ead8');
  add(tbox(4.4, 1.5, 0.1, 1), toon({ color: '#2f4f46' }), 0, 1.8, -2.88, g); add(tbox(4.6, 0.08, 0.14, 1), toon({ color: '#8a5a3c' }), 0, 1.0, -2.84, g);
  for (const x of [-2.4, 0, 2.4]) add(tbox(1.5, 0.08, 0.7, 1), toon({ color: '#b98a55' }), x, 0.7, -1.2, g); }
// car interior (steering wheel close-up)
{ const g = roomShell('wheel', 4, 3, 2, '#2a2340', toon({ color: '#1a1530' }), '#241e38');
  add(tbox(4, 0.9, 1.0, 1), toon({ color: '#2b2538' }), 0, 0.55, -1.0, g); const pane = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.1), paneMat); pane.position.set(0, 1.5, -1.45); pane.userData.nd = null; g.add(pane);
  const wh = new THREE.Group(); wh.position.set(0, 0.95, -0.3); g.add(wh); const tr = add(new THREE.TorusGeometry(0.34, 0.045, 10, 28), toon({ color: '#3a3346' }), 0, 0, 0, wh); add(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12), toon({ color: '#4a4258' }), 0, 0, 0, wh).rotation.x = Math.PI / 2; for (const a of [0, 2.1, 4.2]) { const sp = add(box(0.34, 0.04, 0.04), toon({ color: '#3a3346' }), Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0, wh); sp.rotation.z = a; }
  g.userData.wheel = wh; g.userData.hornPad = add(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 12), toon({ color: '#c9c2d6' }), 0, 0, 0.02, wh); g.userData.hornPad.rotation.x = Math.PI / 2; }
// inside the dumpster: dark, one thin strip of light
{ const g = roomShell('dump', 3, 3, 2, '#0a0812', toon({ color: '#0a0812' }), '#0a0812'); const strip = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.06), new THREE.MeshBasicMaterial({ color: '#fff0b8' })); strip.position.set(0, 1.55, -1.2); strip.userData.nd = null; g.add(strip); g.userData.strip = strip; }
const roofBedFlag = roofBed;
