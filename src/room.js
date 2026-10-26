import { GW, GH, DEFAULT_LOOK, buildDoll, shade } from './girl';

export const DEFAULT_ROOM = { wall: '#9c5c7e', floor: '#1b131f', bed: '#cf7a93', rug: '#cf7a93', furniture: '#2c262f', mirror: '#c98a9d', lamp: '#ff9fd0' };

export function startRoom(cv, grainCv) {
  const W = 407, H = 204, VX = 24;
  const x = cv.getContext('2d');

  const P = {
    wallA: '#2a1a2c', wallB: '#2e1c30',
    floor: '#1b131f', trim: '#9b5a8c',
    dark: '#221c25', darker: '#171219', mid: '#2c262f',
    pink: '#cf7a93', pinkL: '#e08fa5', pinkD: '#a85a78',
    neon: '#ffe3ec', neonIn: '#ff9fbd',
    curtain: '#3a2539', curtainD: '#2f1d2e',
    night1: '#27254a', night2: '#3b2f5c',
    win: '#e8a64a', moonPale: '#efe2fa'
  };

  const R = (px, py, w, h, col) => { x.fillStyle = col; x.fillRect(px, py, w, h); };
  const dot = (px, py, col) => R(px, py, 1, 1, col);

  function arch(x0, y0, w, h, col) {
    const r = w / 2;
    R(x0, y0 + r, w, h - r, col);
    for (let dy = 0; dy < r; dy++) {
      const dx = Math.sqrt(r*r - (r - dy - 0.5) ** 2);
      R(Math.round(x0 + r - dx), y0 + dy, Math.round(dx * 2), 1, col);
    }
  }

  let _seed = 7;
  const rnd = () => (_seed = (_seed * 16807) % 2147483647) / 2147483647;
  const GX0 = 153, GX1 = 221, GBOT = 72;
  const farB = [], nearB = [], winDots = [], antennas = [], signs = [];
  for (let bx = GX0; bx < GX1;) {
    const w = 5 + Math.floor(rnd() * 6), h = 11 + Math.floor(rnd() * 12);
    farB.push([bx, Math.min(w, GX1 - bx), h]); bx += w - 1;
  }
  for (let bx = GX0; bx < GX1;) {
    const w = Math.min(6 + Math.floor(rnd() * 7), GX1 - bx), h = 6 + Math.floor(rnd() * 11);
    nearB.push([bx, w, h]);
    for (let wx = bx + 1; wx < bx + w - 1; wx += 2)
      for (let wy = GBOT - h + 2; wy < GBOT - 1; wy += 3)
        if (rnd() < .45) winDots.push([wx, wy, rnd() * 6, rnd() < .7 ? 0 : 1]);
    if (w >= 7 && rnd() < .5) antennas.push([bx + (w >> 1), GBOT - h]);
    else if (w >= 6 && rnd() < .5) signs.push([bx + w - 2, GBOT - h + 2]);
    bx += w;
  }
  const winStars = [[158,38],[167,41],[176,37],[192,40],[200,37],[214,41],[162,44],[183,43]];

  let lampOn = true, lampLevel = 1, t = 0;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let wallT = -1;

  const WALL_W = 375, WALL_H = 162;
  const wallImg = x.createImageData(WALL_W, WALL_H);
  const wallR = new Float32Array(WALL_W * WALL_H), wallA = new Float32Array(WALL_W * WALL_H);
  const HCX = 275 - 24, HCY = 40, HUNIT = 34;
  for (let j = 0; j < WALL_H; j++) for (let i = 0; i < WALL_W; i++) {
    const dx = i - HCX, dy = j - HCY;
    const th = Math.atan2(-dy, dx);
    const s = Math.sin(th);
    const rh = Math.max(0.35, 2 - 2 * s + s * Math.sqrt(Math.abs(Math.cos(th))) / (s + 1.4));
    wallR[j * WALL_W + i] = Math.sqrt(dx * dx + dy * dy) / (rh * HUNIT);
    wallA[j * WALL_W + i] = th;
  }
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  let SMOKE = [[26, 15, 32], [44, 25, 48], [74, 40, 66], [112, 62, 94], [156, 92, 126]];
  let RUG = P.pink;
  const F = { mid: '#2c262f', dark: '#221c25', darker: '#171219', top: '#35303a', edge: '#3a3340', hi: '#4a4350', low: '#25202a', soft: '#2a242d' };
  let GLASS = '#c98a9d', GLASS_HI = '#e3aab9', LAMP = '#ff9fd0', LAMP_RGB = '255,113,206', GLOW_RGB = '255,110,140', SHELF_RGB = '207,122,147';
  const PURPLE = [[24, 15, 36], [40, 26, 62], [66, 42, 104], [102, 70, 152], [140, 104, 190]];
  function drawSmokeWall() {
    const tt = still ? 0 : t;
    if (wallT >= 0 && (still || tt - wallT < 0.12)) {
      x.putImageData(wallImg, 0, 0);
      return;
    }
    wallT = tt;
    const d = wallImg.data, LV = 10;
    for (let j = 0; j < WALL_H; j++) {
      const fade = 1 - 0.18 * (j / WALL_H), vy = j * 0.03;
      const wv = Math.sin(vy * 1.4 + tt * 0.3) * 0.9;
      for (let i = 0; i < WALL_W; i++) {
        const idx = j * WALL_W + i, rho = wallR[idx], th = wallA[idx], ux = i * 0.03;
        const warp = wv + Math.sin(ux * 1.7 - tt * 0.22) * 0.8;
        const ph = rho * 4.6 - tt * 0.45 + th + warp * 0.7;
        const ph2 = rho * 7.4 - tt * 0.3 + 2 * th + 1.3 + warp * 0.9;
        const f = Math.sin(ph) + 0.45 * Math.sin(ph2);
        let n = Math.pow(Math.min(1, Math.max(0, f / 2.9 + 0.5)), 1.5) * fade;
        n += 0.2 * Math.max(0, 1 - rho) * fade;
        const hd = (rho - (1 + 0.015 * Math.sin(tt * 1.2))) / 0.05;
        n += 0.45 * Math.exp(-hd * hd) * fade;
        n = Math.min(1, Math.floor(Math.min(1, n) * 0.68 * LV + BAYER[(j & 3) * 4 + (i & 3)] / 16) / LV);
        const pos = n * (SMOKE.length - 1), k = Math.min(SMOKE.length - 2, Math.floor(pos)), m = pos - k;
        const c0 = SMOKE[k], c1 = SMOKE[k + 1], p0 = PURPLE[k], p1 = PURPLE[k + 1], o = idx * 4;
        const pm = Math.pow(Math.max(0, Math.sin(rho * 3.3 + tt * 0.25 - th + ux * 0.6)), 3) * 0.26;
        d[o] = (c0[0] + (c1[0] - c0[0]) * m) * (1 - pm) + (p0[0] + (p1[0] - p0[0]) * m) * pm;
        d[o + 1] = (c0[1] + (c1[1] - c0[1]) * m) * (1 - pm) + (p0[1] + (p1[1] - p0[1]) * m) * pm;
        d[o + 2] = (c0[2] + (c1[2] - c0[2]) * m) * (1 - pm) + (p0[2] + (p1[2] - p0[2]) * m) * pm;
        d[o + 3] = 255;
      }
    }
    x.putImageData(wallImg, 0, 0);
  }

  function wall() {
    drawSmokeWall();
    R(0, 0, 24, H, '#0b080d');
    R(24, 162, 375, 34, P.floor);
    R(24, 162, 375, 1, P.trim);
    R(25, 196, 375, 1, P.trim);
    R(399, 0, 1, 197, P.trim);
  }

  function painting() {
    const HEART = [
      '..XXXXX...XXXXX..',
      '.XXXXXXX.XXXXXXX.',
      'XXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXX',
      '.XXXXXXXXXXXXXXX.',
      '..XXXXXXXXXXXXX..',
      '...XXXXXXXXXXX...',
      '....XXXXXXXXX....',
      '.....XXXXXXX.....',
      '......XXXXX......',
      '.......XXX.......',
      '........X........'
    ];
    R(59, 49, 36, 27, P.pinkD);
    R(60, 50, 34, 25, P.pink);
    R(61, 51, 32, 23, '#2a1f2c');
    x.globalCompositeOperation = 'lighter';
    const hg = x.createRadialGradient(77, 62, 2, 77, 62, 16);
    hg.addColorStop(0, 'rgba(255,110,160,.22)'); hg.addColorStop(1, 'rgba(255,110,160,0)');
    x.fillStyle = hg; x.fillRect(61, 51, 32, 23);
    x.globalCompositeOperation = 'source-over';
    HEART.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) if (row[rx] === 'X') dot(68 + rx, 55 + ry, ry >= 8 ? '#e0668f' : (ry >= 4 ? '#f27aa4' : '#ff8fb8'));
    });
    [[71,57],[72,57],[70,58],[71,58]].forEach(([hx, hy]) => dot(hx, hy, '#ffd0e0'));
    R(61, 51, 32, 1, 'rgba(0,0,0,.25)');
  }

  function windowScene() {
    const tw = (i) => 0.5 + 0.5 * Math.sin(t * 2 + i * 1.7);
    R(150, 23, 73, 55, P.darker);
    for (let yy = 0; yy < 46; yy++) {
      const k = Math.pow(yy / 45, 1.4);
      R(GX0, 27 + yy, GX1 - GX0 - 1, 1, `rgb(${Math.round(24 + 120 * k)},${Math.round(16 + 36 * k)},${Math.round(54 + 62 * k)})`);
    }
    winStars.forEach(([sx, sy], i) => { x.globalAlpha = .4 + .6 * tw(i); dot(sx, sy, '#e3d6f7'); });
    x.globalAlpha = 1;
    farB.forEach(([bx, bw, bh]) => R(bx, GBOT - bh, bw, bh, '#2a1a40'));
    nearB.forEach(([bx, bw, bh]) => R(bx, GBOT - bh, bw, bh, '#120c20'));
    winDots.forEach(([wx, wy, ph, kind]) => {
      if (Math.sin(t * .6 + ph * 3) > -0.85) dot(wx, wy, kind ? P.win : '#ff9fc5');
    });
    signs.forEach(([sx, sy]) => { R(sx, sy, 1, 6, '#ff71ce'); R(sx + 1, sy + 1, 1, 2, '#ffb3cf'); });
    antennas.forEach(([ax, at]) => {
      R(ax, at - 4, 1, 4, '#120c20');
      x.globalAlpha = .45 + .55 * (0.5 + 0.5 * Math.sin(t * 1.4 + ax));
      dot(ax, at - 4, '#ff71ce');
      x.globalAlpha = 1;
    });
    for (let yy = 27; yy < 34; yy++) R(GX0, yy, GX1 - GX0 - 1, 1, yy % 2 ? '#1f1727' : '#2d2236');
    R(GX0, 34, GX1 - GX0 - 1, 2, '#3a2b44');
    R(GX0, 36, GX1 - GX0 - 1, 1, P.pinkD);
    dot(GX0 + 2, 35, '#ff9fc5'); dot(GX1 - 4, 35, '#ff9fc5');
    R(GX0 + 4, 37, 1, 9, '#3a2b44'); R(GX0 + 3, 46, 3, 2, '#3a2b44');
    R(150, 23, 73, 4, P.darker);
    R(150, 23, 3, 55, P.darker); R(221, 23, 2, 55, P.darker);
    R(150, 72, 73, 5, P.darker);
    R(185, 36, 2, 36, P.darker);
    R(150, 23, 73, 1, '#2b1a2a');
    R(148, 77, 77, 2, '#2e2234');
    R(148, 79, 77, 1, P.pinkD);
  }

  function bed() {
    R(65, 108, 60, 32, F.mid);
    R(64, 109, 62, 30, F.mid);
    R(66, 107, 58, 1, F.edge);
    R(68, 120, 22, 11, P.pink); R(69, 119, 20, 1, P.pinkL);
    R(94, 120, 25, 11, P.pink); R(95, 119, 23, 1, P.pinkL);
    R(90, 121, 4, 10, P.pinkD);
    R(61, 132, 67, 10, P.pinkD);
    R(62, 133, 65, 8, P.pink);
    R(61, 131, 67, 1, P.pinkL);
    R(58, 141, 74, 22, F.dark);
    R(58, 141, 74, 2, F.soft);
    R(59, 163, 72, 5, F.darker);
    R(60, 168, 8, 3, F.darker); R(122, 168, 8, 3, F.darker);
  }

  function rug() {
    R(135, 165, 78, 21, RUG);
    R(137, 163, 74, 2, RUG);
    R(133, 168, 2, 15, RUG); R(213, 167, 2, 16, RUG);
    R(137, 186, 74, 1, RUG);
  }

  function nightstand() {
    R(169, 131, 35, 39, F.mid);
    R(168, 130, 37, 3, F.top);
    R(171, 138, 31, 14, F.dark); R(171, 154, 31, 13, F.dark);
    R(184, 144, 5, 1, F.hi); R(184, 160, 5, 1, F.hi);
    R(171, 170, 4, 2, F.darker); R(198, 170, 4, 2, F.darker);
  }

  function lamp() {
    const pts = [];
    for (let dy = -10; dy <= 10; dy++) for (let dx = -10; dx <= 10; dx++) {
      const bx = dx + 6, by = dy + 2;
      if (dx * dx + dy * dy <= 100 && bx * bx + by * by > 56) pts.push([dx, dy]);
    }
    const has = new Set(pts.map(([dx, dy]) => dx + ',' + dy));
    if (lampOn) {
      x.globalCompositeOperation = 'lighter';
      const g = x.createRadialGradient(180, 115, 2, 180, 115, 18);
      g.addColorStop(0, `rgba(${LAMP_RGB},.35)`); g.addColorStop(1, `rgba(${LAMP_RGB},0)`);
      x.fillStyle = g; x.fillRect(160, 95, 40, 40);
      x.globalCompositeOperation = 'source-over';
    }
    pts.forEach(([dx, dy]) => {
      const edge = !has.has((dx + 1) + ',' + dy) || !has.has((dx - 1) + ',' + dy) || !has.has(dx + ',' + (dy + 1)) || !has.has(dx + ',' + (dy - 1));
      if (edge) dot(178 + dx, 115 + dy, lampOn ? LAMP : '#5a3a50');
    });
    R(177, 125, 2, 2, F.hi);
    R(173, 127, 11, 3, F.mid); R(173, 127, 11, 1, F.hi);
  }

  function mirror() {
    arch(227, 108, 31, 60, F.darker);
    arch(229, 110, 27, 56, F.soft);
    arch(231, 112, 23, 52, GLASS);
    [[235,130],[236,129],[237,128],[238,127],[235,135],[236,134],[237,133]].forEach(([a, b]) => dot(a, b, GLASS_HI));
    R(226, 166, 33, 2, F.darker);
    R(224, 160, 3, 8, F.darker); R(258, 160, 3, 8, F.darker);
  }

  function dresser() {
    R(286, 128, 87, 1, F.hi);
    R(287, 129, 85, 2, F.top);
    R(287, 131, 85, 1, F.darker);
    x.globalAlpha = .75; R(289, 132, 81, 1, `rgb(${SHELF_RGB})`); x.globalAlpha = 1;
    x.globalCompositeOperation = 'lighter';
    const dg = x.createLinearGradient(0, 133, 0, 142);
    dg.addColorStop(0, `rgba(${SHELF_RGB},.14)`); dg.addColorStop(1, `rgba(${SHELF_RGB},0)`);
    x.fillStyle = dg; x.fillRect(289, 133, 81, 9);
    x.globalCompositeOperation = 'source-over';
    R(292, 133, 4, 37, F.mid); R(292, 133, 1, 37, F.edge);
    R(363, 133, 4, 37, F.mid); R(363, 133, 1, 37, F.edge);
    R(292, 153, 75, 2, F.mid); R(292, 153, 75, 1, F.edge);
    R(291, 170, 6, 2, F.darker); R(362, 170, 6, 2, F.darker);
    R(338, 133, 24, 20, F.mid);
    R(340, 135, 20, 7, F.dark); R(347, 138, 6, 1, F.hi);
    R(340, 144, 20, 7, F.dark); R(347, 147, 6, 1, F.hi);
    R(302, 144, 24, 9, F.low); R(302, 144, 24, 1, F.edge);
    R(304, 147, 17, 1, '#1c171e'); R(304, 149, 17, 1, '#1c171e');
    dot(323, 146, '#cf7a93');
    R(297, 134, 1, 36, F.darker); R(297, 170, 5, 1, F.darker);
    const OX = 309, OY = 103;
    const L = (lx, ly, w, h, col) => R(OX + lx, OY + ly, w, h, col);
    const LD = (lx, ly, col) => dot(OX + lx, OY + ly, col);
    R(307, 101, 45, 26, '#0a070c');
    R(307, 101, 45, 1, F.edge);

    for (let ly = 3; ly < 21; ly++) {
      const k = (ly - 3) / 17;
      L(0, ly, 41, 1, `rgb(${Math.round(16 + 34 * k)},${Math.round(9 + 8 * k)},${Math.round(22 + 16 * k)})`);
    }
    const bloom = (bx, by, br, al, col) => {
      x.globalAlpha = al;
      for (let ly = Math.max(3, by - br); ly <= Math.min(20, by + br); ly++)
        for (let lx = Math.max(0, bx - br); lx <= Math.min(40, bx + br); lx++)
          if ((lx - bx) ** 2 + (ly - by) ** 2 <= br * br) LD(lx, ly, col);
      x.globalAlpha = 1;
    };
    bloom(20, 24, 14, .22, '#cf7a93'); bloom(20, 24, 9, .22, '#cf7a93'); bloom(38, 4, 6, .12, '#cf7a93');
    LD(5, 17, '#d99aae');

    L(0, 0, 41, 2, '#08060a'); L(0, 2, 41, 1, '#cf7a93');
    LD(1, 0, '#cf7a93'); LD(3, 0, '#cf7a93'); L(1, 1, 3, 1, '#cf7a93');
    L(6, 1, 3, 1, '#d99aae'); L(10, 1, 4, 1, '#d99aae'); L(15, 1, 3, 1, '#d99aae'); L(19, 1, 3, 1, '#d99aae');
    L(33, 0, 4, 2, '#cf7a93'); LD(37, 0, '#cf7a93'); L(38, 1, 2, 1, '#f0ccd7');

    L(2, 4, 5, 4, '#cf7a93'); L(2, 4, 2, 1, '#e08fa5'); L(2, 5, 5, 1, '#e6b0c0'); L(2, 8, 5, 1, '#d99aae');
    L(2, 10, 4, 5, '#cf7a93'); L(3, 11, 2, 3, '#140e18'); LD(3, 12, '#e08fa5'); L(2, 15, 5, 1, '#d99aae');
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++)
      if (dx * dx + dy * dy <= 9.5 && (dx - 2) ** 2 + (dy + 1) ** 2 > 6) LD(37 + dx, 9 + dy, '#efe2fa');

    x.globalAlpha = .55; L(13, 5, 21, 11, '#000000'); x.globalAlpha = 1;
    L(12, 4, 21, 2, '#cf7a93'); L(12, 5, 21, 1, '#a85a78');
    LD(13, 4, '#08060a'); LD(15, 4, '#f0ccd7'); LD(17, 4, '#d99aae'); L(22, 4, 8, 1, '#f0ccd7');
    L(12, 6, 21, 9, '#140e18');
    L(14, 13, 9, 1, '#3a2536');
    for (let i = 0; i < 5; i++) {
      const h = 2 + Math.round(2 + 2 * Math.sin(t * 0.5 + i * 1.3));
      L(14 + i * 2, 13 - h, 1, h, i % 2 ? '#d99aae' : '#cf7a93');
    }
    L(14, 14, 9, 1, '#47303f');
    L(25, 7, 5, 5, '#2a1a2c');
    LD(26, 8, '#cf7a93'); LD(28, 8, '#cf7a93'); L(26, 9, 3, 1, '#cf7a93'); LD(27, 10, '#cf7a93');
    for (let i = 0; i < 2; i++) { const h = 1 + Math.floor(1.5 + 1.5 * Math.sin(t * 1.3 + i * 1.7)); L(31 + i, 11 - h, 1, h, '#e08fa5'); }
    L(24, 13, 8, 1, '#3a2536');
    L(24, 13, 1 + Math.floor(((t * 0.4) % 1) * 7), 1, '#cf7a93');
    L(24, 14, 5, 1, '#5a3a50');

    x.globalAlpha = .55; L(9, 14, 15, 7, '#000000'); x.globalAlpha = 1;
    L(8, 13, 16, 2, '#e08fa5'); L(8, 14, 16, 1, '#a85a78');
    LD(9, 13, '#08060a'); L(11, 13, 5, 1, '#f0ccd7'); LD(22, 13, '#08060a');
    L(8, 15, 16, 6, '#140e18');
    L(10, 16, 10, 1, '#5a3a50'); L(10, 18, 6, 1, '#3a2536');
    if (Math.floor(t * 2) % 2) LD(17, 18, '#e08fa5');

    R(303, 127, 53, 1, F.hi);
    R(325, 127, 9, 1, F.mid);
    x.globalCompositeOperation = 'lighter';
    const lg = x.createRadialGradient(329, 114, 2, 329, 114, 34);
    lg.addColorStop(0, `rgba(${SHELF_RGB},.10)`); lg.addColorStop(1, `rgba(${SHELF_RGB},0)`);
    x.fillStyle = lg; x.fillRect(290, 80, 80, 60);
    x.globalCompositeOperation = 'source-over';
  }

  let look = DEFAULT_LOOK, girlGrids = {};
  const girlGrid = (blink) => {
    const k = blink ? 1 : 0;
    if (!girlGrids[k]) girlGrids[k] = buildDoll(look, blink);
    return girlGrids[k];
  };

  let girlHopT = -10;
  const GIRL_X = 78, GIRL_Y = 126;
  function girl() {
    const hopAge = t - girlHopT;
    const hop = hopAge >= 0 && hopAge < 0.5 ? Math.round(5 * Math.sin(hopAge / 0.5 * Math.PI)) : 0;
    const gx = GIRL_X, gy = GIRL_Y - hop;

    x.fillStyle = 'rgba(8,3,12,.35)';
    x.fillRect(gx + 9, GIRL_Y + 63, 18, 1); x.fillRect(gx + 11, GIRL_Y + 64, 14, 1);
    const g = girlGrid((t % 4.6) < 0.15);
    for (let yy = 0; yy < GH; yy++) for (let xx = 0; xx < GW; xx++) {
      if (g[yy][xx]) { x.fillStyle = g[yy][xx]; x.fillRect(gx + xx, gy + yy, 1, 1); }
    }
    if (hopAge >= 0 && hopAge < 1.4) {
      x.globalAlpha = 1 - hopAge / 1.4;
      const hy = Math.round(gy - 8 - hopAge * 8);
      [[1,0],[3,0],[0,1],[1,1],[2,1],[3,1],[4,1],[1,2],[2,2],[3,2],[2,3]].forEach(([hx, hyy]) => dot(gx + 15 + hx, hy + hyy, '#e08fa5'));
      x.globalAlpha = 1;
    }
  }

  function lighting() {
    let g;

    if (lampLevel > 0.02) {
      x.globalCompositeOperation = 'lighter';
      g = x.createRadialGradient(186, 124, 2, 186, 124, 62);
      g.addColorStop(0, `rgba(${GLOW_RGB},${.30 * lampLevel})`);
      g.addColorStop(1, `rgba(${GLOW_RGB},0)`);
      x.fillStyle = g; x.fillRect(118, 70, 140, 120);
      x.globalCompositeOperation = 'source-over';
    }
    x.fillStyle = `rgba(8,3,12,${.38 * (1 - lampLevel)})`;
    x.fillRect(0, 0, W, H);
  }

  let last = 0, raf = 0;
  function frame(ms) {
    raf = requestAnimationFrame(frame);
    if (ms - last < 66) return;
    last = ms; t = ms / 1000;
    lampLevel += ((lampOn ? 1 : 0) - lampLevel) * 0.25;

    x.setTransform(1, 0, 0, 1, -VX, 0);
    x.clearRect(0, 0, W, H);
    wall();
    x.save(); x.translate(18, 0); painting(); x.restore();
    windowScene();
    x.save(); x.translate(0, 3); bed(); x.restore();
    x.save(); x.translate(11, 0); rug(); x.restore();
    nightstand();
    x.save(); x.translate(8, 0); lamp(); x.restore();
    x.save(); x.translate(4, 0); mirror(); x.restore();
    dresser();
    lighting();
    girl();
  }
  raf = requestAnimationFrame(frame);

  const onClick = (e) => {
    const r = cv.getBoundingClientRect();
    const px = VX + (e.clientX - r.left) / r.width * cv.width;
    const py = (e.clientY - r.top) / r.height * cv.height;
    if (px >= GIRL_X + 4 && px <= GIRL_X + 33 && py >= GIRL_Y && py <= GIRL_Y + 64) {
      girlHopT = t;
    } else if (px >= 175 && px <= 197 && py >= 104 && py <= 132) {
      lampOn = !lampOn;
    }
  };
  cv.addEventListener('click', onClick);

  const gc = grainCv.getContext('2d');
  const img = gc.createImageData(grainCv.width, grainCv.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i+1] = img.data[i+2] = v;
    img.data[i+3] = Math.random() < .5 ? 255 : 0;
  }
  gc.putImageData(img, 0, 0);

  return {
    setColors(room) {
      const n = parseInt(room.wall.slice(1), 16), rgb = [n >> 16, (n >> 8) & 255, n & 255];
      SMOKE = [0.17, 0.29, 0.47, 0.72, 1].map(k => rgb.map(v => v * k));
      P.trim = room.wall;
      P.floor = room.floor;
      P.pink = room.bed; P.pinkL = shade(room.bed, 0.15); P.pinkD = shade(room.bed, -0.2);
      RUG = room.rug;
      const fb = room.furniture;
      Object.assign(F, { mid: fb, dark: shade(fb, -0.22), darker: shade(fb, -0.47), top: shade(fb, 0.04), edge: shade(fb, 0.07), hi: shade(fb, 0.13), low: shade(fb, -0.15), soft: shade(fb, -0.05) });
      GLASS = room.mirror; GLASS_HI = shade(room.mirror, 0.3);
      LAMP = room.lamp;
      const ln = parseInt(room.lamp.slice(1), 16);
      const lc = [ln >> 16, (ln >> 8) & 255, ln & 255], top = Math.max(1, ...lc);
      LAMP_RGB = lc.map(v => Math.round(v * 255 / top)).join(',');
      GLOW_RGB = room.lamp === '#ff9fd0' ? '255,110,140' : LAMP_RGB;
      SHELF_RGB = room.lamp === '#ff9fd0' ? '207,122,147' : LAMP_RGB;
      wallT = -1;
    },
    setLook(next) {
      look = next;
      girlGrids = {};
    },
    stop() {
      cancelAnimationFrame(raf);
      cv.removeEventListener('click', onClick);
    }
  };
}
