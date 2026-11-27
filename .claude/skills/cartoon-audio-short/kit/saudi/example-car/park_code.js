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
  const foam = []; const r = P.rng(21); for (let i = 0; i < 46; i++) { const m = add(new THREE.SphereGeometry(0.22 + r() * 0.2, 8, 6), toon({ color: '#ffffff' }), (r() - 0.5) * 4.2, 0.95 + r() * 0.6 + (Math.abs((r() - 0.5)) < 0.25 ? 0.6 : 0), -2.2 + (r() - 0.5) * 1.9, g, { cast: false }); m.userData.p = [m.position.x, m.position.y, r() * 6.28]; foam.push(m); }
  const brushes = [-3.6, 3.6].map((x) => { const b = add(new THREE.CylinderGeometry(0.35, 0.35, 3.2, 10), toon({ color: '#e4573d' }), x, 1.7, -2.2, g); return b; });
  g.userData.foam = foam; g.userData.brushes = brushes;
  add(box(9, 0.06, 0.06), toon({ color: '#6b8ea0' }), 0, 3.6, 3.0, g, { cast: false });
}
