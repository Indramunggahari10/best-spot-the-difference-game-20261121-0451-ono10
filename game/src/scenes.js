// scenes.js — the three hand-drawn scenes of Lantern Harbor.
// Every scene is painted twice: the left panel with no differences applied,
// the right panel with every difference applied. A difference is one entry in
// a scene's `diffs` list: an id, a hit point, a radius, a name, and the
// painter's conditional branch that draws (or removes) it when applied.
// All art is original vector work drawn with the Canvas 2D API — no images.

export const PANEL_W = 620;
export const PANEL_H = 400;

// ---- tiny canvas helpers -------------------------------------------------
function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}
function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
}
function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath(); ctx.fill();
}
function line(ctx, x1, y1, x2, y2, stroke, width) {
  ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}
function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
}
function gull(ctx, x, y, s, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 2.4 * s; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 9 * s, y); ctx.quadraticCurveTo(x - 4 * s, y - 7 * s, x, y);
  ctx.quadraticCurveTo(x + 4 * s, y - 7 * s, x + 9 * s, y);
  ctx.stroke();
}
function paperLantern(ctx, x, y, s, color, lit) {
  if (lit) {
    const glow = ctx.createRadialGradient(x, y, 2, x, y, 34 * s);
    glow.addColorStop(0, 'rgba(255, 214, 120, 0.85)');
    glow.addColorStop(1, 'rgba(255, 214, 120, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x, y, 34 * s, 0, Math.PI * 2); ctx.fill();
  }
  ellipse(ctx, x, y, 13 * s, 16 * s, color);
  ctx.strokeStyle = 'rgba(120, 30, 20, 0.55)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(x, y, 13 * s, 16 * s, 0, 0, Math.PI * 2); ctx.stroke();
  line(ctx, x - 8 * s, y - 6 * s, x + 8 * s, y - 6 * s, 'rgba(120,30,20,0.5)', 1);
  line(ctx, x - 8 * s, y + 6 * s, x + 8 * s, y + 6 * s, 'rgba(120,30,20,0.5)', 1);
  rect(ctx, x - 4 * s, y - 20 * s, 8 * s, 4 * s, '#8a5a2b');
  rect(ctx, x - 3 * s, y + 16 * s, 6 * s, 5 * s, '#f6c453');
}
function sailboat(ctx, x, y, s, bob, stripe, hullColor) {
  const by = y + bob;
  // hull
  poly(ctx, [[x - 42 * s, by], [x + 42 * s, by], [x + 30 * s, by + 16 * s], [x - 30 * s, by + 16 * s]], hullColor);
  rect(ctx, x - 42 * s, by - 3 * s, 84 * s, 4 * s, '#5b3a1e');
  // mast + sail
  line(ctx, x, by - 62 * s, x, by, '#5b3a1e', 3 * s);
  poly(ctx, [[x + 3 * s, by - 60 * s], [x + 3 * s, by - 6 * s], [x + 40 * s, by - 6 * s]], '#fff8ea');
  if (stripe) poly(ctx, [[x + 3 * s, by - 34 * s], [x + 22 * s, by - 34 * s], [x + 22 * s, by - 24 * s], [x + 3 * s, by - 24 * s]], '#d94f30');
  poly(ctx, [[x - 3 * s, by - 52 * s], [x - 3 * s, by - 6 * s], [x - 30 * s, by - 6 * s]], '#ffe9b8');
  // flag
  poly(ctx, [[x, by - 62 * s], [x + 16 * s, by - 58 * s], [x, by - 54 * s]], '#d94f30');
}
function catSitting(ctx, x, y, s, color) {
  // a small sitting cat, side view
  ellipse(ctx, x, y, 13 * s, 11 * s, color);            // body
  circle(ctx, x + 9 * s, y - 13 * s, 8 * s, color);     // head
  poly(ctx, [[x + 3 * s, y - 19 * s], [x + 6 * s, y - 27 * s], [x + 9 * s, y - 19 * s]], color);
  poly(ctx, [[x + 11 * s, y - 20 * s], [x + 14 * s, y - 27 * s], [x + 16 * s, y - 19 * s]], color);
  ellipse(ctx, x + 15 * s, y + 2 * s, 9 * s, 3.5 * s, color); // tail curl
  circle(ctx, x + 12 * s, y - 14 * s, 1.4 * s, '#ffe9a8');    // eye
}
function waterLines(ctx, y0, y1, t, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let row = 0; row < 4; row++) {
    const y = y0 + row * ((y1 - y0) / 4);
    for (let i = 0; i < 5; i++) {
      const x = 40 + i * 120 + ((row * 37) % 60);
      const w = 26 + 8 * Math.sin(t * 0.9 + i + row);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
    }
  }
}

// ---- Scene 1: Harbor Dawn (7 differences) --------------------------------
function paintHarbor(ctx, W, H, t, applied) {
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, 250);
  sky.addColorStop(0, '#ffe3ae'); sky.addColorStop(0.6, '#ffd194'); sky.addColorStop(1, '#ffc07a');
  rect(ctx, 0, 0, W, 250, sky);
  // sun
  circle(ctx, 520, 70, 34, '#fff3c4');
  circle(ctx, 520, 70, 26, '#ffe066');
  if (applied.has('sunrays')) {
    ctx.strokeStyle = '#f2a541'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + 0.2;
      line(ctx, 520 + Math.cos(a) * 40, 70 + Math.sin(a) * 40,
        520 + Math.cos(a) * 52, 70 + Math.sin(a) * 52, '#f2a541', 4);
    }
  }
  // gulls
  gull(ctx, 250, 70, 1, '#5b4a35');
  gull(ctx, 340, 52, 0.85, '#5b4a35');
  if (applied.has('gull')) gull(ctx, 330, 96, 0.9, '#5b4a35');
  // distant hills
  poly(ctx, [[0, 245], [90, 205], [190, 240], [300, 200], [420, 238], [520, 208], [620, 242], [620, 260], [0, 260]], '#7fae9e');
  // sea
  const sea = ctx.createLinearGradient(0, 240, 0, 400);
  sea.addColorStop(0, '#3f8f8a'); sea.addColorStop(1, '#14655f');
  rect(ctx, 0, 240, W, 160, sea);
  waterLines(ctx, 262, 310, t, 'rgba(255,255,255,0.35)');
  // lighthouse
  poly(ctx, [[62, 250], [102, 250], [96, 130], [68, 130]], '#fff6e8');
  rect(ctx, 66, 200, 32, 12, '#d94f30');
  rect(ctx, 70, 160, 24, 12, '#d94f30');
  rect(ctx, 60, 122, 44, 10, '#5b3a1e');           // gallery
  rect(ctx, 72, 96, 20, 28, '#2b2118');             // light room
  circle(ctx, 82, 110, 7, applied.has('beam') ? '#ffe066' : '#8a94a0');
  poly(ctx, [[68, 96], [96, 96], [82, 78]], '#d94f30'); // roof
  line(ctx, 82, 78, 82, 66, '#5b3a1e', 2);
  poly(ctx, [[82, 66], [98, 70], [82, 74]], '#f2a541'); // flag
  if (applied.has('beam')) {
    const beam = ctx.createLinearGradient(92, 110, 260, 110);
    beam.addColorStop(0, 'rgba(255, 224, 102, 0.75)');
    beam.addColorStop(1, 'rgba(255, 224, 102, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath(); ctx.moveTo(92, 100); ctx.lineTo(260, 78); ctx.lineTo(260, 132); ctx.lineTo(92, 120); ctx.closePath(); ctx.fill();
  }
  // boats
  sailboat(ctx, 300, 252, 1, Math.sin(t * 1.1) * 2, applied.has('sailstripe'), '#b5651d');
  sailboat(ctx, 480, 272, 0.7, Math.sin(t * 1.1 + 2) * 2, false, '#7a4a21');
  // buoy
  const buoyColor = applied.has('buoy') ? '#2e7d4f' : '#d94f30';
  ellipse(ctx, 430, 300 + Math.sin(t * 1.4) * 2, 14, 10, buoyColor);
  rect(ctx, 424, 286 + Math.sin(t * 1.4) * 2, 12, 8, '#fff6e8');
  // dock
  rect(ctx, 0, 320, W, 80, '#8a5a2b');
  ctx.strokeStyle = '#6b4423'; ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 62) line(ctx, x, 320, x, 400, '#6b4423', 2);
  line(ctx, 0, 348, W, 348, '#6b4423', 2);
  line(ctx, 0, 376, W, 376, '#6b4423', 2);
  // crates (one goes missing on the right panel)
  rect(ctx, 150, 330, 34, 26, '#c98f3d'); rect(ctx, 150, 330, 34, 5, '#a86f24');
  rect(ctx, 186, 336, 28, 20, '#b5772e'); rect(ctx, 186, 336, 28, 4, '#96621f');
  if (!applied.has('crate')) { rect(ctx, 168, 308, 30, 22, '#d9a44a'); rect(ctx, 168, 308, 30, 4, '#b5772e'); }
  // fishing net on a post
  line(ctx, 120, 320, 120, 282, '#5b3a1e', 4);
  ctx.strokeStyle = '#e8d9bf'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(120, 296, 16, 0, Math.PI * 2); ctx.stroke();
  line(ctx, 106, 292, 134, 300, '#e8d9bf', 1.2); line(ctx, 106, 300, 134, 292, '#e8d9bf', 1.2);
  // cat (present only on the left panel)
  if (!applied.has('cat')) catSitting(ctx, 480, 352, 1, '#3a3230');
  // bucket of fish
  ellipse(ctx, 560, 356, 16, 7, '#5b6b7a');
  rect(ctx, 546, 336, 28, 20, '#6b7a89');
  ellipse(ctx, 554, 334, 7, 3, '#c0c8d0'); ellipse(ctx, 566, 336, 7, 3, '#aab4c0');
}

// ---- Scene 2: Night Market (10 differences) ------------------------------
function paintMarket(ctx, W, H, t, applied) {
  // night sky
  const sky = ctx.createLinearGradient(0, 0, 0, 330);
  sky.addColorStop(0, '#1c2340'); sky.addColorStop(1, '#3a2b58');
  rect(ctx, 0, 0, W, 330, sky);
  // stars
  const stars = [[40, 30], [150, 50], [210, 24], [330, 40], [420, 26], [560, 44], [590, 120], [30, 120], [250, 130]];
  for (const [x, y] of stars) star(ctx, x, y, 2.5 + (x % 3), '#ffe9a8');
  // moon: full on the left, crescent on the right
  circle(ctx, 90, 62, 26, '#f6eec8');
  if (applied.has('moon')) circle(ctx, 100, 56, 22, '#1c2340');
  // kite (right panel only)
  if (applied.has('kite')) {
    poly(ctx, [[480, 58], [500, 74], [480, 90], [460, 74]], '#f2a541');
    line(ctx, 480, 90, 470, 130, '#ffe9a8', 1.4);
    circle(ctx, 472, 118, 3, '#d94f30');
  }
  // lantern string
  line(ctx, 0, 84, W, 66, '#0c0f22', 2);
  const lanternXs = [60, 130, 200, 270, 340, 410, 480, 550];
  lanternXs.forEach((x, i) => {
    const y = 84 - (x / W) * 18 + 12;
    const color = (i === 4 && applied.has('lantern')) ? '#f6c453' : (i % 2 === 0 ? '#d94f30' : '#e8632c');
    const sway = Math.sin(t * 0.8 + i) * 2;
    line(ctx, x, y - 16, x, y - 14, '#0c0f22', 1.5);
    paperLantern(ctx, x + sway, y, 0.85, color, true);
  });
  // ground
  rect(ctx, 0, 330, W, 70, '#4a3a52');
  ctx.fillStyle = '#5d4a68';
  for (let r = 0; r < 2; r++) for (let x = 0; x < W; x += 46) {
    ctx.beginPath(); ctx.ellipse(x + 23 + (r * 20), 348 + r * 22, 20, 8, 0, 0, Math.PI * 2); ctx.fill();
  }
  // stall builder
  function stall(x, w, awning, sign) {
    rect(ctx, x, 170, w, 160, '#6b4423');
    rect(ctx, x + 8, 178, w - 16, 60, '#2b2118'); // back wall opening
    // striped awning
    for (let i = 0; i < 6; i++) rect(ctx, x + (i * w) / 6, 148, w / 6, 24, i % 2 === 0 ? awning : '#fff6e8');
    poly(ctx, [[x - 6, 172], [x + w + 6, 172], [x + w, 148], [x, 148]], 'rgba(0,0,0,0.15)');
    rect(ctx, x, 238, w, 10, '#8a5a2b'); // counter
    rect(ctx, x + 6, 248, 8, 82, '#5b3a1e'); rect(ctx, x + w - 14, 248, 8, 82, '#5b3a1e');
    if (sign) { rect(ctx, x + w / 2 - 26, 120, 52, 20, '#e8d9bf'); }
  }
  stall(48, 150, '#d94f30', false);
  stall(236, 150, applied.has('awning') ? '#14655f' : '#d94f30', true);
  stall(424, 150, '#f2a541', false);
  // fruit stall: oranges (one missing on the right)
  const orangeSpots = [[96, 232], [122, 232], [148, 232], [109, 214], [135, 214], [122, 198]];
  orangeSpots.forEach(([x, y], i) => {
    if (applied.has('orange') && i === 5) return;
    circle(ctx, x, y, 9, '#f2820a');
    circle(ctx, x - 3, y - 3, 2.5, '#ffb35c');
  });
  rect(ctx, 84, 236, 84, 8, '#8a5a2b');
  // steamer stall: baskets (3 vs 2)
  const baskets = applied.has('steamer') ? 2 : 3;
  for (let i = 0; i < baskets; i++) {
    const y = 232 - i * 13;
    ellipse(ctx, 311, y, 30, 8, '#c98f3d');
    rect(ctx, 281, y - 9, 60, 9, '#a86f24');
  }
  circle(ctx, 311, 232 - baskets * 13 - 2, 4, '#f6c453'); // steam puff
  ellipse(ctx, 311, 222 - baskets * 13, 8, 5, 'rgba(255,255,255,0.5)');
  // banner on the right stall: fish vs flower
  rect(ctx, 462, 178, 74, 52, '#fff6e8');
  if (applied.has('banner')) {
    circle(ctx, 499, 204, 12, '#e8632c');
    for (let p = 0; p < 5; p++) {
      const a = (p * Math.PI * 2) / 5;
      ellipse(ctx, 499 + Math.cos(a) * 15, 204 + Math.sin(a) * 15, 6, 4, '#f2a541');
    }
    circle(ctx, 499, 204, 5, '#d94f30');
  } else {
    ellipse(ctx, 499, 204, 20, 9, '#14655f');
    poly(ctx, [[519, 204], [530, 196], [530, 212]], '#14655f');
    circle(ctx, 485, 201, 2.5, '#fff');
  }
  // wooden sign with an arrow (direction flips)
  rect(ctx, 196, 288, 8, 44, '#5b3a1e');
  rect(ctx, 176, 268, 48, 22, '#e8d9bf');
  ctx.strokeStyle = '#2b2118'; ctx.lineWidth = 2.4;
  if (applied.has('sign')) { line(ctx, 214, 279, 186, 279, '#2b2118', 2.4); poly(ctx, [[186, 279], [194, 273], [194, 285]], '#2b2118'); }
  else { line(ctx, 186, 279, 214, 279, '#2b2118', 2.4); poly(ctx, [[214, 279], [206, 273], [206, 285]], '#2b2118'); }
  // stall window lantern (lit vs dark)
  paperLantern(ctx, 448, 212, 0.8, '#d94f30', !applied.has('windowdark'));
  if (applied.has('windowdark')) { ellipse(ctx, 448, 212, 11, 13, '#4a2c2c'); }
  // cat on a crate (left panel only)
  rect(ctx, 524, 330, 52, 26, '#8a5a2b');
  if (!applied.has('cat')) catSitting(ctx, 550, 322, 0.9, '#2b2118');
  // paper fan on the middle stall counter
  poly(ctx, [[400, 240], [428, 240], [414, 214]], '#f2a541');
  line(ctx, 414, 240, 414, 214, '#d94f30', 1.5);
}

// ---- Scene 3: Lantern Festival (12 differences) --------------------------
function paintFestival(ctx, W, H, t, applied) {
  // dusk sky
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#2c2140'); sky.addColorStop(0.6, '#6b3a5e'); sky.addColorStop(1, '#c96f4a');
  rect(ctx, 0, 0, W, 300, sky);
  // moon with craters on the right panel
  circle(ctx, 520, 70, 30, '#f6eec8');
  if (applied.has('moon')) { circle(ctx, 510, 62, 5, '#d9cba0'); circle(ctx, 530, 78, 4, '#d9cba0'); circle(ctx, 524, 58, 3, '#d9cba0'); }
  // stars, one bright star only on the right
  const stars = [[40, 40], [140, 30], [200, 60], [300, 28], [380, 50], [460, 30], [580, 130], [90, 110]];
  for (const [x, y] of stars) star(ctx, x, y, 2.5, '#ffe9a8');
  if (applied.has('star')) star(ctx, 250, 46, 7, '#fff3c4');
  // fireworks
  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = (i * Math.PI * 2) / n;
      line(ctx, x, y, x + Math.cos(a) * 26, y + Math.sin(a) * 26, color, 2.5);
      circle(ctx, x + Math.cos(a) * 30, y + Math.sin(a) * 30, 2.5, color);
    }
    circle(ctx, x, y, 4, '#fff3c4');
  }
  burst(420, 90, '#f2a541', 10);
  if (applied.has('firework')) burst(180, 80, '#7fb8d9', 10);
  // river
  const river = ctx.createLinearGradient(0, 300, 0, 400);
  river.addColorStop(0, '#274b63'); river.addColorStop(1, '#12283a');
  rect(ctx, 0, 300, W, 100, river);
  waterLines(ctx, 316, 386, t, 'rgba(255, 214, 120, 0.28)');
  // pagoda (left)
  rect(ctx, 66, 150, 76, 150, '#7a3b2e');
  for (let tier = 0; tier < 3; tier++) {
    const y = 150 - tier * 34;
    poly(ctx, [[52, y + 22], [156, y + 22], [142, y], [66, y]], tier % 2 === 0 ? '#2e7d4f' : '#d94f30');
    rect(ctx, 70, y + 22, 68, 10, '#5b3a1e');
  }
  rect(ctx, 96, 96, 16, 14, '#f6c453'); // top finial
  circle(ctx, 104, 92, 5, '#f6c453');
  // pagoda window: lit vs dark
  rect(ctx, 92, 190, 16, 22, applied.has('pagoda') ? '#2b2118' : '#ffe066');
  rect(ctx, 92, 240, 16, 22, '#ffe066');
  // stone lantern on the bank (lit vs unlit)
  rect(ctx, 52, 316, 18, 26, '#8a94a0');
  rect(ctx, 46, 308, 30, 10, '#6b7a89');
  if (!applied.has('stonelantern')) {
    const glow = ctx.createRadialGradient(61, 300, 2, 61, 300, 22);
    glow.addColorStop(0, 'rgba(255, 214, 120, 0.9)'); glow.addColorStop(1, 'rgba(255, 214, 120, 0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(61, 300, 22, 0, Math.PI * 2); ctx.fill();
    circle(ctx, 61, 300, 6, '#ffe066');
  }
  // willow (right)
  line(ctx, 560, 300, 560, 150, '#5b3a1e', 10);
  line(ctx, 560, 180, 520, 150, '#5b3a1e', 6);
  ctx.strokeStyle = '#2e7d4f'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  const branches = [[500, 170, 496, 250], [530, 160, 528, 258], [560, 155, 562, 262], [590, 165, 596, 252]];
  for (const [x1, y1, x2, y2] of branches) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2 + 6, (y1 + y2) / 2, x2, y2); ctx.stroke();
  }
  if (applied.has('willow')) {
    ctx.beginPath(); ctx.moveTo(545, 165); ctx.quadraticCurveTo(540, 210, 546, 262); ctx.stroke();
    circle(ctx, 546, 262, 3, '#2e7d4f');
  }
  // arched bridge
  ctx.fillStyle = '#a34a2a';
  ctx.beginPath();
  ctx.moveTo(200, 320); ctx.quadraticCurveTo(310, 218, 420, 320);
  ctx.lineTo(420, 336); ctx.quadraticCurveTo(310, 246, 200, 336); ctx.closePath(); ctx.fill();
  // bridge rails: 3 posts vs 2 (one missing on the right)
  const posts = applied.has('railpost') ? [230, 310] : [230, 310, 390];
  for (const x of posts) { rect(ctx, x - 3, 252, 6, 34, '#7a3b2e'); circle(ctx, x, 250, 5, '#f6c453'); }
  line(ctx, 214, 258, 406, 258, '#7a3b2e', 4);
  // bridge lantern: red vs gold
  paperLantern(ctx, 310, 232, 0.9, applied.has('bridgelantern') ? '#f6c453' : '#d94f30', true);
  // couple on the bridge with a paper lantern (pink vs blue)
  circle(ctx, 322, 268, 7, '#2b2118'); rect(ctx, 315, 275, 14, 18, '#14655f');
  circle(ctx, 342, 268, 7, '#2b2118'); rect(ctx, 335, 275, 14, 18, '#d94f30');
  paperLantern(ctx, 332, 252, 0.7, applied.has('couplelantern') ? '#7fb8d9' : '#e8638a', true);
  // floating lanterns on the river (5 vs 4)
  const floats = [[90, 372], [150, 362], [210, 378], [280, 366], [470, 374]];
  floats.forEach(([x, y], i) => {
    if (applied.has('floatlantern') && i === 1) return;
    paperLantern(ctx, x, y + Math.sin(t * 1.2 + i) * 1.5, 0.55, '#f2a541', true);
  });
  // koi fish (right panel only)
  if (applied.has('koi')) {
    ellipse(ctx, 350, 356, 16, 7, '#e8632c');
    poly(ctx, [[366, 356], [376, 348], [376, 364]], '#e8632c');
    circle(ctx, 338, 354, 2, '#2b2118');
  }
  // jumping fish arc (right panel only)
  if (applied.has('jumpfish')) {
    ctx.strokeStyle = '#7fb8d9'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(450, 336, 14, Math.PI, 0); ctx.stroke();
    ellipse(ctx, 450, 318, 8, 4, '#c0c8d0');
    circle(ctx, 436, 336, 3, 'rgba(255,255,255,0.7)'); circle(ctx, 464, 336, 3, 'rgba(255,255,255,0.7)');
  }
}

// ---- scene catalogue ------------------------------------------------------
export const SCENES = [
  {
    id: 'harbor',
    name: 'Harbor Dawn',
    tagline: 'A fishing harbor wakes up — 7 changes hide in the morning light.',
    paint: paintHarbor,
    diffs: [
      { id: 'sunrays', x: 520, y: 70, r: 40, label: 'the sun grew rays' },
      { id: 'beam', x: 150, y: 104, r: 36, label: 'the lighthouse beam' },
      { id: 'gull', x: 330, y: 96, r: 26, label: 'an extra gull' },
      { id: 'buoy', x: 430, y: 300, r: 26, label: 'the buoy changed color' },
      { id: 'crate', x: 183, y: 319, r: 30, label: 'a crate vanished' },
      { id: 'cat', x: 480, y: 348, r: 28, label: 'the dock cat' },
      { id: 'sailstripe', x: 300, y: 225, r: 34, label: 'a stripe on the sail' },
    ],
  },
  {
    id: 'market',
    name: 'Night Market',
    tagline: 'Lanterns, oranges and steam — 10 changes hide among the stalls.',
    paint: paintMarket,
    diffs: [
      { id: 'moon', x: 90, y: 62, r: 30, label: 'the moon turned crescent' },
      { id: 'lantern', x: 340, y: 82, r: 22, label: 'a lantern turned gold' },
      { id: 'orange', x: 122, y: 198, r: 26, label: 'a missing orange' },
      { id: 'awning', x: 311, y: 160, r: 30, label: 'the awning changed color' },
      { id: 'steamer', x: 311, y: 206, r: 28, label: 'a steamer basket vanished' },
      { id: 'banner', x: 499, y: 204, r: 28, label: 'the banner changed sign' },
      { id: 'sign', x: 200, y: 279, r: 26, label: 'the sign arrow flipped' },
      { id: 'cat', x: 550, y: 322, r: 26, label: 'the market cat' },
      { id: 'windowdark', x: 448, y: 212, r: 24, label: 'a dark stall window' },
      { id: 'kite', x: 480, y: 74, r: 26, label: 'a kite in the sky' },
    ],
  },
  {
    id: 'festival',
    name: 'Lantern Festival',
    tagline: 'Fireworks over the river — 12 changes hide in the celebration.',
    paint: paintFestival,
    diffs: [
      { id: 'firework', x: 180, y: 80, r: 30, label: 'a second firework' },
      { id: 'koi', x: 350, y: 356, r: 26, label: 'a koi in the river' },
      { id: 'floatlantern', x: 150, y: 362, r: 22, label: 'a floating lantern vanished' },
      { id: 'pagoda', x: 100, y: 201, r: 22, label: 'a dark pagoda window' },
      { id: 'willow', x: 546, y: 214, r: 26, label: 'an extra willow branch' },
      { id: 'bridgelantern', x: 310, y: 232, r: 22, label: 'the bridge lantern turned gold' },
      { id: 'star', x: 250, y: 46, r: 20, label: 'a bright new star' },
      { id: 'moon', x: 520, y: 70, r: 34, label: 'craters on the moon' },
      { id: 'stonelantern', x: 61, y: 300, r: 26, label: 'the stone lantern went dark' },
      { id: 'couplelantern', x: 332, y: 252, r: 24, label: 'a blue paper lantern' },
      { id: 'jumpfish', x: 450, y: 322, r: 24, label: 'a jumping fish' },
      { id: 'railpost', x: 390, y: 266, r: 22, label: 'a missing bridge post' },
    ],
  },
];
