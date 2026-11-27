import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { SHOTS, TOTAL, shotAt, camAt, dofAt, LIGHTS, lightFor, actorsAt, worldAt, fxAt } from './story.js';
import { drawCaptions } from './caps.js';
import { HOUSES, FRONT_Z, CAR, DUMP, WALL_X, SIDE_DOOR, LAMPS, ROOMS } from './layout.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.08, 1500);
const rx = (a) => a * Math.PI / 180;

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff') => toon({ map: P.tex(c, rx_, ry_), color });
const M = {
  plasterA: texM(P.plaster(8, 34), 1, 1, '#f3dfb8'), plasterB: texM(P.plaster(18, 26), 1, 1, '#e7c79c'), plasterC: texM(P.plaster(28, 205), 1, 1, '#b4cbdc'), plasterD: texM(P.plaster(38, 12), 1, 1, '#e6b39c'),
  plaster2: toon({ color: '#f6eee0' }), plaster3: toon({ color: '#cdbb9d' }), tank: toon({ color: '#cfdbe6' }), winDark: toon({ color: '#1b2236' }),
  iron: toon({ color: '#3e3550' }), bronze: toon({ color: '#b08a4a' }), trunk: toon({ color: '#7a5a3a' }), palmLeaf: toon({ color: '#3f7a3a' }),
  carBody: toon({ color: '#c9b27a' }), rust: toon({ color: '#9a5a30' }), tire: toon({ color: '#15121c' }), green: toon({ color: '#3e7a5a' }), greenD: toon({ color: '#2f604a' }),
};
const carPane = new THREE.MeshToonMaterial({ gradientMap: grad, color: '#5d7488', side: THREE.DoubleSide });

// ---------- ink / normal-depth contract ----------
const NOINK = 'noink'; // userData flag: never outlined (cards, fx, water handled specially)
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`,
  side: THREE.DoubleSide,
});
const cardNd = (map) => new THREE.ShaderMaterial({
  uniforms: { map: { value: map } },
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`,
  side: THREE.DoubleSide,
});
const waterNd = new THREE.ShaderMaterial({
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }`,
});

// ---------- helpers ----------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, opts = {}) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = opts.cast ?? true; m.receiveShadow = true; parent.add(m); return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const uvScale = (geo, su, sv) => { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return geo; };
/** box with world-scaled UVs per face (texel density 1 tile per `t` metres) */
const tbox = (w, h, d, t = 2) => {
  const g = box(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); }
  return g;
};

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .35*pow(max(s,0.), 24.)*step(.001,sunSize));
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const pl = new THREE.PointLight('#ffffff', 0, 30, 2); scene.add(pl);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 40, 600);

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
// ---------- mall parking + car wash ----------
function makeCar(col, paneCol = '#6f8aa6') {
  const g = new THREE.Group(), body = new THREE.Shape(); [[-2.3, 0.3], [-2.3, 0.85], [-1.7, 0.95], [-0.9, 0.98], [-0.5, 1.5], [1.0, 1.5], [1.5, 1.0], [2.2, 0.92], [2.3, 0.36], [1.9, 0.3]].forEach(([x, y], i) => i ? body.lineTo(x, y) : body.moveTo(x, y));
  const bg = new THREE.ExtrudeGeometry(body, { depth: 1.8, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.05, bevelSegments: 1 }); bg.translate(0, 0, -0.9); add(bg, toon({ color: col }), 0, 0, 0, g);
  const win = new THREE.Shape(); [[-0.78, 1.02], [-0.46, 1.44], [0.98, 1.44], [1.36, 1.02]].forEach(([x, y], i) => i ? win.lineTo(x, y) : win.moveTo(x, y));
  const pm = new THREE.MeshToonMaterial({ gradientMap: grad, color: paneCol, side: THREE.DoubleSide });
  for (const sd of [-1, 1]) { const pane = new THREE.Mesh(new THREE.ShapeGeometry(win), pm); pane.position.set(0, 0, sd * 0.97); if (sd < 0) pane.rotation.y = Math.PI; g.add(pane); }
  add(box(0.06, 0.46, 0.04), toon({ color: col }), 0.25, 1.24, 0.95, g, { cast: false });
  for (const x of [-1.35, 1.4]) for (const z of [-0.82, 0.82]) { const w = add(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 14), M.tire, x, 0.36, z, g); w.rotation.x = Math.PI / 2; const hub = add(new THREE.CylinderGeometry(0.17, 0.17, 0.28, 10), metal, x, 0.36, z, g, { cast: false }); hub.rotation.x = Math.PI / 2; }
  add(box(0.18, 0.2, 1.9), metal, 2.38, 0.55, 0, g); add(box(0.18, 0.2, 1.9), metal, -2.38, 0.55, 0, g);
  for (const z of [-0.62, 0.62]) add(new THREE.SphereGeometry(0.17, 10, 8), toon({ color: '#f3efd8' }), 2.3, 0.82, z, g, { cast: false });
  return g;
}
const lightPanelM = new THREE.MeshBasicMaterial({ color: '#fff8e0' });
{ // parking garage
  const g = new THREE.Group(); g.position.set(...ROOMS.park); scene.add(g); rooms.park = g;
  add(tbox(44, 0.2, 18, 3), toon({ color: '#8e8b98' }), 0, -0.1, -1, g, { cast: false });
  for (let x = -20; x <= 20; x += 4.8) add(box(0.12, 0.02, 5.0), toon({ color: '#f1efe2' }), x - 2.4, 0.02, -5.3, g, { cast: false });
  add(tbox(44, 0.2, 18, 2), toon({ color: '#cfc9bf' }), 0, 3.5, -1, g, { cast: false });
  add(tbox(44, 3.4, 0.3, 2), toon({ color: '#bdb6a8' }), 0, 1.7, -8.2, g); add(tbox(0.3, 3.4, 18, 2), toon({ color: '#bdb6a8' }), -22, 1.7, -1, g); add(tbox(0.3, 3.4, 18, 2), toon({ color: '#bdb6a8' }), 22, 1.7, -1, g); add(tbox(44, 3.4, 0.3, 2), toon({ color: '#bdb6a8' }), 0, 1.7, 7.2, g);
  for (let x = -18; x <= 18; x += 6) for (const z of [-5, 0.5]) { const lp = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.06, 0.5), lightPanelM); lp.position.set(x, 3.38, z); lp.userData.nd = null; g.add(lp); }
  const pillars = [[-15, '#f2c14e'], [-9, '#d94a3d'], [-3, '#3f7fd2'], [3, '#3ea65a'], [9, '#8a56c2'], [15, '#ee8a3a']];
  pillars.forEach(([x, c]) => { add(tbox(0.85, 3.4, 0.85, 1.5), toon({ color: c }), x, 1.7, -3.7, g); add(box(0.9, 0.5, 0.9), toon({ color: '#f5f0e2' }), x, 2.2, -3.7, g, { cast: false }); add(box(0.9, 0.3, 0.9), toon({ color: '#2a2630' }), x, 0.15, -3.7, g); });
  const cols = ['#c9d2da', '#2f4f7a', '#b8352f', '#e9e2cf', '#3d3d48', '#5a8a62', '#c4a152', '#8a8f9a', '#a9b6c9'];
  let k = 0; for (let x = -19; x <= 19; x += 4.8) { if (Math.abs(x + 7.6) < 2.4) continue; const car = makeCar(cols[k++ % cols.length]); car.position.set(x, 0, -6.2); g.add(car); }
  const pc = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), new THREE.MeshBasicMaterial({ map: wallClockTex })); pc.position.set(-12, 2.6, -8.0); pc.userData.nd = null; g.add(pc); g.userData.clock = pc;
  add(box(1.1, 0.7, 0.05), toon({ color: '#2f6fd0' }), -7.6, 2.4, -8.0, g, { cast: false });
}
{ // car wash bay
  const g = new THREE.Group(); g.position.set(...ROOMS.wash); scene.add(g); rooms.wash = g;
  add(tbox(14, 0.2, 10, 2), toon({ color: '#7fa6b8' }), 0, -0.1, -1, g, { cast: false }); add(tbox(14, 4, 0.3, 2), toon({ color: '#cfe6ee' }), 0, 2, -5.4, g); add(tbox(0.3, 4, 10, 2), toon({ color: '#cfe6ee' }), -7, 2, -1, g); add(tbox(0.3, 4, 10, 2), toon({ color: '#cfe6ee' }), 7, 2, -1, g); add(tbox(14, 0.2, 10, 2), toon({ color: '#e8f1f4' }), 0, 4, -1, g, { cast: false }); add(tbox(14, 4, 0.3, 2), toon({ color: '#cfe6ee' }), 0, 2, 4.2, g);
  for (const x of [-5, 0, 5]) { const lp = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.06, 0.5), lightPanelM); lp.position.set(x, 3.9, -1); lp.userData.nd = null; g.add(lp); }
  const car = makeCar('#9fc4dc', '#4b6f88'); car.position.set(0, 0, -2.2); g.add(car);
  const foam = []; const r = P.rng(21); for (let i = 0; i < 46; i++) { const m = add(new THREE.SphereGeometry(0.13 + r() * 0.14, 8, 6), toon({ color: '#ffffff' }), (r() - 0.5) * 4.2, 0.95 + r() * 0.6 + (Math.abs((r() - 0.5)) < 0.25 ? 0.6 : 0), -2.2 + (r() - 0.5) * 1.9, g, { cast: false }); m.userData.p = [m.position.x, m.position.y, r() * 6.28]; foam.push(m); }
  const brushes = [-3.6, 3.6].map((x) => { const b = add(new THREE.CylinderGeometry(0.35, 0.35, 3.2, 10), toon({ color: '#e4573d' }), x, 1.7, -2.2, g); return b; });
  g.userData.foam = foam; g.userData.brushes = brushes;
  add(box(9, 0.06, 0.06), toon({ color: '#6b8ea0' }), 0, 3.6, 3.0, g, { cast: false });
}

const roofBedFlag = roofBed;

// ---------- cards ----------
const CW = 1200, CH = 2000, CM = 2.25; // canvas px, card height in metres (design 600x1000 -> 2.25 m)
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.6));
class Card {
  constructor(scale = 1) {
    [this.c, this.g] = (() => { const c = document.createElement('canvas'); c.width = CW; c.height = CH; return [c, c.getContext('2d')]; })();
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false;
  }
  draw(key, fn) {
    if (key === this.key) return; this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0);
    const p = new T.Pen(g); fn(p); this.t.needsUpdate = true;
  }
}
const cards = []; const getCard = (i) => cards[i] || (cards[i] = new Card());

// ---------- render targets & post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 1.6 }, fogCol: { value: new THREE.Color() },
  fade: { value: 0 }, sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.22 }, flash: { value: 0 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash, fade; uniform vec3 fogCol, lift, gain; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    float e = 0.; float rr = r * clamp(7./d, .62, 1.25);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue;            // character cards: never outlined by the world ink
      if (card) ds = 1e4;                        // sky
      vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.006, .02, (ds - d)/d));                           // depth jump, near side only
      if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9); // crease
    }
    return e * (1. - smoothstep(140., 520., d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.012,.01,.014), e);
    if (flash < -0.5) c = vec3(e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    c = mix(c, vec3(1.), flash); c = mix(c, vec3(0.), fade);
    gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
const dofScene = fs(new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4); }
  void main(){
    float c0 = coc(vUv);
    if (cinf < .5 || c0 < .6) { gl_FragColor = linearToOutputTexel(vec4(texture2D(src, vUv).rgb, 1.)); return; }
    vec3 acc = vec3(0.); float wsum = 0.;
    for (int i=0;i<48;i++){ float fi = float(i); float r = sqrt((fi+.5)/48.); float a = fi*2.39996;
      vec2 o = vec2(cos(a), sin(a))*r*c0/res; float cs = coc(vUv+o);
      float w = smoothstep(r*c0-1.5, r*c0+.5, cs + .5);
      acc += texture2D(src, vUv+o).rgb*w; wsum += w; }
    gl_FragColor = linearToOutputTexel(vec4(acc/max(wsum,1e-3), 1.)); }` }));
// final copy with sRGB handled by the renderer output (we render to screen with linear->sRGB in the shader chunk)
dofScene.children[0].material.toneMapped = false;

// ---------- per-frame state ----------
const tmpV = new THREE.Vector3();
function applyLight(L, f) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi;
  sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = L.sat; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000');
  pl.visible = !!L.pl; if (L.pl) { pl.color.set(L.pl.color); pl.intensity = L.pl.i; pl.distance = L.pl.dist || 30; pl.position.set(...L.pl.pos); }
}
function placeSun(L, focus) {
  // sun direction from azimuth/elevation in world space
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 80); sun.target.position.copy(focus);
  const ext = L.shadowExt || 30, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 200; sc.updateProjectionMatrix();
}

function worldState(S, f) {
  const pl_ = S.place;
  street.visible = pl_ === 'street'; stars.visible = moon.visible = moonHalo.visible = pl_ === 'street';
  for (const k in rooms) rooms[k].visible = pl_ === k;
  if (pl_ === 'street') {
    houseObjs.forEach((o, i) => { o.doorPivot.rotation.y = -(S.doors?.[i] || 0) * 1.55; const lit = S.lit?.[i] || 0; o.wins.forEach((w, k) => w.material.color.set(lit && (lit === 1 || (lit >> k) & 1) ? '#ffd98a' : '#1b2236')); });
    sideDoor.rotation.y = -(S.sideDoor || 0) * 1.5;
    const car = carG.userData; car.doorPivot.rotation.y = (S.carDoor || 0) * 1.15; car.hole.visible = (S.carDoor || 0) > 0.05;
    car.headlights.forEach((h) => h.material.color.set(S.carLights ? '#fff4b8' : '#e8e0c0'));
    carPane.color.set(S.carMon ? '#07050c' : '#5d7488');
    dumpG.userData.lid.rotation.x = -(S.dumpLid || 0) * 1.5;
    const on = S.lamps !== false; halos.forEach((h) => { h.visible = on; }); lampBulbs.forEach((b) => b.material.color.set(on ? '#ffe9a8' : '#6a6480'));
    roofBed.visible = !!S.roofBed; carG.rotation.z = Math.sin(f * 1.7) * 0.003 * (S.carShake || 0) + 0; carG.position.y = Math.abs(Math.sin(f * 2.3)) * 0.03 * (S.carShake || 0);
  }
  if (pl_ === 'bed') { drawPane(S.dawn || 0, S.winMon); drawClock(S.clock || '3:33', S.clockCol || '#ff4d5e'); }
  if (pl_ === 'living') { rooms.living.userData.door.rotation.y = -(S.livDoor || 0) * 1.45; drawPane(0, null); drawWallClock(...(S.wallClock || [3, 30, f / 3])); }
  if (pl_ === 'kitchen') { const k = rooms.kitchen.userData; k.handle.rotation.y = (S.tapRot || 0); k.water.visible = (S.water || 0) > 0.02; k.water.scale.set(1 + (S.water || 0), 1, 1 + (S.water || 0)); }
  if (pl_ === 'park') { drawWallClock(...(S.pc || [7, 0, 0])); }
  if (pl_ === 'wash') { const w = rooms.wash.userData; w.foam.forEach((b, i) => { const p = b.userData.p; b.position.y = p[1] + Math.sin(f * 0.15 + p[2]) * 0.05; b.scale.setScalar(1 + 0.12 * Math.sin(f * 0.2 + i)); }); w.brushes.forEach((b, i) => { b.rotation.y = f * (i ? -0.5 : 0.5); }); }
  if (pl_ === 'wheel') { drawPane(0, null); const w = rooms.wheel.userData; w.hornPad.position.z = (S.horn ? -0.03 : 0.02); w.wheel.rotation.z = (S.horn ? Math.sin(f * 1.7) * 0.05 : 0); }
}

function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.forEach((a, i) => {
    const c = getCard(i);
    c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);
    c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1;
    c.mesh.castShadow = a.shadow !== false;
    c.mesh.renderOrder = a.order || 2;
    if (a.blob !== false && a.y < DECK + 0.5) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? DECK) + 0.02, a.z); c.blob.scale.set(0.95 * s, 0.6 * s, 1); }
  });
}

const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip) { o.userData.vis0 = o.visible; o.visible = false; return; }
      if (o === sky || o.userData.sky) { o.userData.vis0 = o.visible; o.visible = false; return; }
      o.material = o.userData.nd || ndMat;
    } else {
      o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; }
    }
  });
};

window.renderFrame = (f) => {
  const S = shotAt(f), L = lightFor(S, f), C = camAt(f);
  applyLight(L, f);
  camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const W_ = worldAt(f); worldState(W_, f);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  drawActors([...actorsAt(f, T), ...fxAt(f, T)], camera);
  sky.position.copy(camera.position); stars.position.copy(camera.position);
  // pass A: colour
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  // pass B: normal + depth
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  if (window.DEBUG_ND) { const dm = new THREE.MeshBasicMaterial({ map: rtNd.texture }); const ds = fs(dm); renderer.setRenderTarget(null); renderer.render(ds, fsCam); return true; }
  // ink + grade
  const D = dofAt(f);
  inkU.px.value = 2.5; inkU.flash.value = window.DEBUG_E ? -1 : (C.flash || 0); inkU.fade.value = C.fade || 0; inkU.vig.value = L.vig ?? 0.22;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  // lens
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};
window.TOTAL = TOTAL;
const ov = document.getElementById('o'), octx = ov.getContext('2d');
window.grab = (f, q) => { window.renderFrame(f); octx.setTransform(1, 0, 0, 1, 0, 0); octx.drawImage(canvas, 0, 0); if (!window.NOCAP) drawCaptions(octx, f / 30); return ov.toDataURL('image/jpeg', q); };
document.fonts.load('800 76px Taj', 'عربي').then(() => { window.ready = true; });
