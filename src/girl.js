export const GW = 36, GH = 68;

const OY = 6, BH = GH - OY;
const INK = '#0b0809';
const HAIR_END = { short: 22, medium: 31, long: 44 };

const H = (hairStyle, hairLength = 'medium', bangs = false) => ({ hairStyle, hairLength, bangs });
export const HAIRS = [
  H('wavy'),
  H('curly', 'short'), H('curly'), H('curly', 'long'), H('curly', 'medium', true), H('curlybun'),
  H('coily', 'short'), H('coily'), H('coily', 'long'), H('coily', 'medium', true), H('highpuff'),
  H('wavy', 'short'), H('wavy', 'short', true), H('wavy', 'long'), H('wavy', 'medium', true), H('wavy', 'long', true), H('wavybun'), H('wavypony'),
  H('straight', 'short'), H('straight', 'short', true), H('straight'), H('straight', 'medium', true), H('straight', 'long'), H('straight', 'long', true), H('sleekbun'), H('ponytail'), H('pigtails'),
  H('puffs', 'short'), H('puffs'), H('puffs', 'long'),
  H('twists', 'short'), H('twists'), H('twists', 'long'), H('twists', 'long', true), H('twistbun'),
  H('braids', 'short'), H('braids'), H('braids', 'long'), H('braids', 'long', true), H('braidbun'),
  H('locs', 'short'), H('locs'), H('locs', 'long'), H('locs', 'long', true), H('locbun'),
  H('curly', 'short', true), H('curlypony'), H('curlypigtails'), H('coily', 'long', true), H('coilypuff'), H('curly', 'long', true)
];

export const HIJABS = ['none', 'wrap', 'amira', 'long'];

const TOP_SLEEVE = { tee: 'short', crop: 'short', tank: 'none', longsleeve: 'long', button: 'long', turtleneck: 'long', hoodie: 'long', tunic: 'long' };
const DRESS_SLEEVE = { sundress: 'none', babydoll: 'puff', slip: 'none', bodycon: 'none', long: 'long', abaya: 'bell' };
export const TOPS = Object.keys(TOP_SLEEVE);
export const BOTTOMS = ['pleated', 'mini', 'midi', 'maxi', 'pants', 'wideleg', 'shorts'];
export const DRESSES = ['none', ...Object.keys(DRESS_SLEEVE)];

export const BODIES = ['petite', 'slim', 'curvy', 'midsize', 'plus', 'plus2', 'plus3', 'plus4'];

export const DEFAULT_LOOK = {
  body: 'curvy', blushOn: true,
  hairStyle: 'wavy', hairLength: 'medium', bangs: false, hijab: 'none',
  top: 'tee', bottom: 'pleated', dress: 'none',
  skin: '#b39169', hair: '#2a1f21', hijabColor: '#141114', lips: '#8b4a2f', blush: '#b28562',
  brows: '#3a2420', eyes: '#4a2f2c',
  topColor: '#2a232f', bottomColor: '#1f1a24', dressColor: '#2a232f', socks: '#1f1a24', shoes: '#15111a'
};

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const target = amt < 0 ? 0 : 255, k = Math.abs(amt);
  return '#' + [n >> 16, (n >> 8) & 255, n & 255]
    .map(v => Math.round(v + (target - v) * k).toString(16).padStart(2, '0')).join('');
}

function tint(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  return '#' + [n >> 16, (n >> 8) & 255, n & 255]
    .map(v => Math.min(255, Math.round(v * f + 8)).toString(16).padStart(2, '0')).join('');
}

const tone = (hex) => ({ c: hex, sh: shade(hex, -0.4), hi: shade(hex, 0.15) });

const hash = (xx, yy) => {
  let h = (xx * 374761393 + yy * 668265263) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
};

const STRANDS = ['braids', 'twists', 'locs'];
const FLUFFY = ['curly', 'coily'];
const TEX = { curlybun: 'curly', highpuff: 'coily', puffs: 'coily', sleekbun: 'straight', ponytail: 'straight', pigtails: 'straight', wavybun: 'wavy', wavypony: 'wavy', curlypony: 'curly', curlypigtails: 'curly', coilypuff: 'coily', braidbun: 'braids', locbun: 'locs', twistbun: 'twists' };
const UPDOS = ['curlybun', 'highpuff', 'sleekbun', 'ponytail', 'wavybun', 'wavypony', 'pigtails', 'curlypony', 'curlypigtails', 'coilypuff', 'braidbun', 'locbun', 'twistbun', 'puffs'];
const ROPE_BUNS = ['braidbun', 'locbun', 'twistbun'];
const OPENING = { wrap: [7.2, 7.6], amira: [6.9, 7.4], long: [7.2, 7.6] };
const inOval = (xx, yy, [rx, ry]) => ((xx - 17.5) / rx) ** 2 + ((yy - 14.5) / ry) ** 2;

function hairline(style, tex, bangs, kind) {
  if (style === 'hijab') return (xx, yy) => inOval(xx, yy, OPENING[kind]) > 1;
  if (UPDOS.includes(style)) return (xx, yy) => yy <= 5;
  if (bangs) {
    if (tex === 'wavy' || tex === 'straight') return (xx, yy) => yy <= 8 || (yy === 9 && (xx < 12 || xx > 23));
    if (FLUFFY.includes(tex)) return (xx, yy) => yy <= 6 || (yy <= 8 && xx % 3 !== 1);
    return (xx, yy) => yy <= 6 || (yy <= 9 && xx % 3 !== 1);
  }
  if (tex === 'wavy') return (xx, yy) => yy <= 6 || (yy <= 13 && xx >= 14 + (yy - 6) * 1.5);
  if (tex === 'straight') return (xx, yy) => yy <= 5 || (yy <= 8 && (xx <= 11 || xx >= 24));
  if (tex === 'curly') return (xx, yy) => yy <= 5 || (yy === 6 && xx % 3 !== 1);
  if (tex === 'coily') return (xx, yy) => yy <= 5 || (yy === 6 && xx % 2 === 0);
  if (tex === 'twists') return (xx, yy) => yy <= 5 || (yy === 6 && xx % 3 === 0);
  if (tex === 'locs') return (xx, yy) => yy <= 5 || (yy <= 7 && xx % 4 === 0);
  return (xx, yy) => yy <= 5;
}

export function buildDoll(look, blink = false) {
  const g = Array.from({ length: GH }, () => Array(GW).fill(null));
  const px = (xx, yy, c) => { if (xx >= 0 && xx < GW && yy >= -OY && yy < BH) g[yy + OY][xx] = c; };
  const get = (xx, yy) => (xx >= 0 && xx < GW && yy >= -OY && yy < BH ? g[yy + OY][xx] : null);
  const rect = (xx, yy, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(xx + i, yy + j, c); };
  const ell = (cx, cy, rx, ry, c) => {
    for (let j = Math.floor(cy - ry); j <= Math.ceil(cy + ry); j++)
      for (let i = Math.floor(cx - rx); i <= Math.ceil(cx + rx); i++)
        if (((i - cx) / rx) ** 2 + ((j - cy) / ry) ** 2 <= 1) px(i, j, c);
  };
  const kind = HIJABS.includes(look.hijab) && look.hijab !== 'none' ? look.hijab : null;
  const base = kind ? look.hijabColor || DEFAULT_LOOK.hijabColor : look.hair;
  const C = {
    skin: look.skin, skinSh: shade(look.skin, -0.12), blush: look.blush,
    lip: look.lips,
    hair: base, hairSh: shade(base, -0.35), hairHi: tint(base, 1.45), hairMid: tint(base, 1.22), brow: look.brows || shade(look.hair, 0.1), nose: shade(look.skin, -0.18),
    iris: look.eyes || '#4a2f2c', white: '#e5e5f2',
    shoe: look.shoes, shoeHi: shade(look.shoes, 0.2)
  };
  const style = kind ? 'hijab' : HAIRS.some(h => h.hairStyle === look.hairStyle) ? look.hairStyle : 'wavy';
  const tex = TEX[style] || style;
  const len = HAIR_END[look.hairLength] ? look.hairLength : 'medium';
  const end = HAIR_END[len];

  const put = (xx, yy, c) => { px(xx, yy, c); px(35 - xx, yy, c); };
  const rope = (x0, top, bottom, kind, phase) => {
    for (let yy = top; yy <= bottom; yy++) {
      const r = yy - top + phase;
      if (kind === 'braids') {
        const p = [[C.hairMid, C.hair], [C.hair, C.hairSh], [C.hair, C.hairMid], [C.hairSh, C.hair]][r % 4];
        put(x0, yy, p[0]); put(x0 + 1, yy, p[1]);
      } else if (kind === 'twists') {
        const p = [[C.hairMid, C.hair, C.hairSh], [C.hair, C.hairMid, C.hair], [C.hairSh, C.hair, C.hairMid]][r % 3];
        for (let i = 0; i < 3; i++) put(x0 + i, yy, p[i]);
      } else {
        put(x0, yy, C.hairSh); put(x0 + 1, yy, C.hairMid); put(x0 + 2, yy, C.hair);
      }
    }
  };
  const ropeW = { braids: 2, twists: 3, locs: 3 }, ropeStep = { braids: 3, twists: 4, locs: 4 };
  const domeTop = (x, cx, cy, rx, ry) => Math.ceil(cy - ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)));
  const ropeColumns = (kind, from, to) => {
    const xs = [];
    for (let x0 = from; x0 + ropeW[kind] - 1 <= to; x0 += ropeStep[kind]) xs.push(x0);
    return xs;
  };
  const ropes = (xs, topOf, bottomOf, kind) => xs.forEach((x0, i) => rope(x0, topOf(x0), bottomOf(x0), kind, i));

  if (style === 'hijab') {
    ell(17.5, 12, kind === 'amira' ? 10.5 : 11.5, kind === 'amira' ? 12 : 12.5, C.hair);
  } else if (STRANDS.includes(style)) {
    const w = ropeW[style];
    ell(17.5, 11.5, 11, 11, C.hairSh);
    const xs = ropeColumns(style, 5, 17);
    const ends = (x0) => end - hash(x0, 3) % 4;
    for (let yy = 12; yy < end - 3; yy++) for (let xx = xs[0]; xx <= 17; xx++) put(xx, yy, C.hairSh);
    ropes(xs, (x0) => domeTop(x0 + w / 2, 17.5, 11.5, 11, 11), ends, style);
  } else if (ROPE_BUNS.includes(style)) {
    const w = ropeW[tex];
    ell(17.5, 11.5, 10.5, 10.5, C.hairSh);
    ell(17.5, -2, 6.5, 4.5, C.hairSh);
    ropes(ropeColumns(tex, 7, 17), (x0) => domeTop(x0 + w / 2, 17.5, 11.5, 10.5, 10.5), () => 13, tex);
    ropes(ropeColumns(tex, 11, 17), (x0) => domeTop(x0 + w / 2, 17.5, -2, 6.5, 4.5), (x0) => Math.floor(-2 + 4.5 * Math.sqrt(Math.max(0, 1 - ((x0 + w / 2 - 17.5) / 6.5) ** 2))), tex);
    rect(14, 2, 8, 1, C.hairSh);
  } else if (style === 'puffs') {
    const r = { short: 5, medium: 6.5, long: 8 }[len];
    ell(17.5, 11, 9.5, 10, C.hair);
    ell(17.5 - 9 - r * 0.2, 5, r, r, C.hair); ell(17.5 + 9 + r * 0.2, 5, r, r, C.hair);
  } else if (style === 'coilypuff') {
    ell(17.5, 11, 10, 10.5, C.hair);
    ell(17.5, 21, 13, 6.5, C.hair);
  } else if (style === 'highpuff') {
    ell(17.5, 11, 9.5, 10, C.hair);
    ell(17.5, -1, 9, 6, C.hair);
  } else if (style === 'curlybun') {
    ell(17.5, 11, 10.5, 10.5, C.hair);
    ell(17.5, -1.5, 7, 5, C.hair);
  } else if (style === 'sleekbun' || style === 'wavybun') {
    const messy = style === 'wavybun';
    ell(17.5, 11, messy ? 11.5 : 10.5, 11, C.hair);
    ell(17.5, messy ? -1.5 : -2, messy ? 6 : 5, messy ? 4.5 : 3.5, C.hair);
    if (messy) { px(12, -4, C.hair); px(23, -3, C.hair); px(16, -6, C.hair); put(8, 14, C.hair); put(8, 15, C.hair); }
    rect(15, 1, 6, 1, C.hairSh);
  } else if (style === 'ponytail' || style === 'wavypony' || style === 'curlypony') {
    const wave = style === 'ponytail' ? 0 : 0.8, fat = style === 'curlypony' ? 1.5 : 0;
    ell(17.5, 11, style === 'ponytail' ? 10.5 : 11.5, 11, C.hair);
    for (let yy = -3; yy <= 34; yy++) {
      const cx = 27.5 + 2.2 * Math.sin((yy + 3) * 0.11) + wave * Math.sin(yy * 0.5), hw = (yy < 0 ? 2 : Math.max(1, 3.2 - Math.max(0, yy - 28) * 0.4)) + fat;
      for (let xx = Math.round(cx - hw); xx <= Math.round(cx + hw); xx++) px(xx, yy, C.hair);
    }
    rect(25, 1, 3, 2, C.hairSh);
  } else if (style === 'pigtails' || style === 'curlypigtails') {
    const fat = style === 'curlypigtails' ? 1.5 : 0;
    ell(17.5, 11, 10.5 + fat, 11, C.hair);
    for (let yy = 15; yy <= 34; yy++) {
      const hw = (yy < 18 ? 1.5 : Math.max(1, 2.5 - Math.max(0, yy - 30) * 0.4)) + (yy < 18 ? 0 : fat);
      for (let xx = Math.round(6 - hw); xx <= Math.round(6 + hw); xx++) put(xx, yy, C.hair);
    }
    rect(4, 17, 5, 1, C.hairSh); rect(27, 17, 5, 1, C.hairSh);
  } else if (style === 'coily' && len === 'short') {
    ell(17.5, 10.5, 10, 9.5, C.hair);
  } else {
    const crown = { wavy: [12.5, 11], straight: [10.5, 11], curly: [13.5, 11.5], coily: [15.5, 12.5] }[style];
    ell(17.5, 11, crown[0], crown[1], C.hair);
    for (let yy = 14; yy <= end; yy++) {
      const d = yy - 14, left = end - yy;
      let l = 7, r = 28;
      if (style === 'wavy') { l = 7 + 1.8 * Math.sin(d * 0.6); r = 28 + 1.8 * Math.sin(d * 0.6 + 2.2); }
      if (style === 'curly') { l = 5.5 - d * 0.1 + 1.4 * Math.sin(d * 1.2); r = 29.5 + d * 0.1 + 1.4 * Math.sin(d * 1.2 + 1); }
      if (style === 'coily') { l = 3.5 - d * 0.1 + Math.sin(d * 1.7); r = 31.5 + d * 0.1 + Math.sin(d * 1.7 + 1.3); }
      const taper = style === 'straight' ? 0 : Math.max(0, 3 - left) * (style === 'coily' ? 2 : 1.2);
      for (let xx = Math.round(l + taper); xx <= Math.round(r - taper); xx++) px(xx, yy, C.hair);
    }
  }

  const isHair = (xx, yy) => get(xx, yy) === C.hair;
  if (FLUFFY.includes(tex)) {
    const fuzz = tex === 'curly' ? 3 : 2;
    const edge = [], bump = [];
    for (let yy = -OY; yy < BH; yy++) for (let xx = 0; xx < GW; xx++) {
      if (!isHair(xx, yy) || (isHair(xx + 1, yy) && isHair(xx - 1, yy) && isHair(xx, yy - 1))) continue;
      const h = hash(xx, yy + OY) % 6;
      if (h < fuzz) edge.push([xx, yy]);
      else if (h === 5 && tex !== 'curly') bump.push([xx + (isHair(xx + 1, yy) ? -1 : 1), yy - (isHair(xx, yy - 1) ? 0 : 1)]);
    }
    edge.forEach(([xx, yy]) => px(xx, yy, null));
    bump.forEach(([xx, yy]) => px(xx, yy, C.hair));
  }
  for (let yy = -OY; yy < BH; yy++) for (let xx = 0; xx < GW; xx++) {
    if (!isHair(xx, yy)) continue;
    const h = hash(xx, yy + OY) % 9;
    if (tex === 'straight' && yy <= 6 && yy === 2 + Math.round(((xx - 17.5) / 7) ** 2 * 2)) px(xx, yy, C.hairHi);
    if (tex === 'straight' && style !== 'straight' && yy < 0 && yy === -4 + Math.round(((xx - 17.5) / 4) ** 2)) px(xx, yy, C.hairHi);
    if (style === 'ponytail' && yy > 2 && xx === Math.round(27.5 + 2.2 * Math.sin((yy + 3) * 0.11))) px(xx, yy, C.hairMid);
    if (tex === 'wavy' && (xx * 2 + yy) % 9 === 0 && (yy > 14 || yy < 1)) px(xx, yy, C.hairSh);
    if (tex === 'curly') { if (h === 0) px(xx, yy, C.hairHi); else if (h === 1) px(xx, yy, C.hairSh); }
    if (tex === 'coily') { if (h < 2) px(xx, yy, C.hairHi); else if (h < 4) px(xx, yy, C.hairSh); }
  }
  const dress = DRESS_SLEEVE[look.dress] ? look.dress : null;
  const top = dress ? null : (TOP_SLEEVE[look.top] ? look.top : 'tee');
  const bottom = dress ? null : (BOTTOMS.includes(look.bottom) ? look.bottom : 'pleated');
  const T = tone(look.topColor), B = tone(look.bottomColor), D = tone(look.dressColor || look.topColor), S = dress ? D : T, K = tone(look.socks || look.bottomColor);
  const sleeve = dress ? DRESS_SLEEVE[dress] : TOP_SLEEVE[top];
  const legsCovered = dress ? dress === 'long' || dress === 'abaya' : ['pants', 'wideleg', 'maxi'].includes(bottom);

  [[14, 12], [19, 19]].forEach(([lx, sx]) => {
    rect(lx, 46, 3, 9, C.skin);
    if (bottom === 'pleated') { rect(lx, 51, 3, 4, K.c); rect(lx, 51, 3, 1, K.hi); }
    rect(sx, 55, 5, 2, C.shoe); rect(sx, 56, 5, 1, C.shoeHi);
  });
  if (!legsCovered) {
    rect(12, 46, 12, 3, C.skin); rect(13, 49, 10, 1, C.skin); rect(17, 46, 1, 4, INK); rect(18, 46, 1, 4, C.skinSh);
  }

  if (top === 'hoodie') rect(12, 22, 12, 4, T.sh);
  rect(16, 22, 4, 4, C.skin);
  rect(12, 26, 12, 1, C.skin); rect(11, 27, 14, 10, C.skin); rect(12, 37, 12, 9, C.skin);
  rect(9, 27, 3, 4, C.skin); rect(24, 27, 3, 4, C.skin);

  const flare = (from, rows, rate, t, folds) => {
    for (let r = 0; r < rows; r++) {
      const sx0 = 11 - Math.floor(r * rate), sx1 = 24 + Math.floor(r * rate);
      rect(sx0, from + r, sx1 - sx0 + 1, 1, r === rows - 1 ? t.sh : t.c);
      if (folds && r >= 2 && r < rows - 1) for (let i = sx0 + 2; i < sx1; i += 4) px(i, from + r, t.sh);
    }
  };
  const body = (t, from = 26, to = 36) => {
    rect(12, from, 12, 1, t.c); rect(11, from + 1, 14, to - from, t.c); rect(11, to, 14, 1, t.sh);
  };

  if (bottom === 'pleated') {
    for (let r = 0; r < 9; r++) {
      const sx0 = 11 - Math.floor(r * 0.5) + (r === 0 ? 1 : 0), sx1 = 24 + Math.floor(r * 0.5) - (r === 0 ? 1 : 0);
      rect(sx0, 37 + r, sx1 - sx0 + 1, 1, r === 8 ? B.hi : B.c);
      if (r >= 1 && r < 8) for (let i = sx0 + 2; i < sx1; i += 4) px(i, 37 + r, B.sh);
    }
  } else if (bottom === 'mini') {
    for (let r = 0; r < 8; r++) rect(12 - Math.floor(r * 0.4), 37 + r, 12 + 2 * Math.floor(r * 0.4), 1, r === 7 ? B.sh : r === 0 ? B.hi : B.c);
  } else if (bottom === 'midi') {
    flare(37, 14, 0.3, B, true);
  } else if (bottom === 'maxi') {
    flare(37, 18, 0.35, B, true);
  } else if (bottom === 'pants') {
    rect(12, 37, 12, 9, B.c); rect(12, 37, 12, 1, B.hi);
    [13, 18].forEach(lx => { rect(lx, 46, 5, 9, B.c); rect(lx, 54, 5, 1, B.sh); });
    px(17, 46, B.sh); px(17, 47, B.sh);
  } else if (bottom === 'wideleg') {
    rect(12, 37, 12, 9, B.c); rect(12, 37, 12, 1, B.hi);
    for (let r = 0; r < 9; r++) {
      const f = Math.floor(r * 0.35), c = r === 8 ? B.sh : B.c;
      rect(13 - f, 46 + r, 5 + f, 1, c); rect(18, 46 + r, 5 + f, 1, c);
    }
    px(17, 46, B.sh); px(17, 47, B.sh); px(17, 48, B.sh);
  } else if (bottom === 'shorts') {
    rect(12, 37, 12, 12, B.c); rect(12, 37, 12, 1, B.hi); rect(12, 48, 12, 1, B.sh);
    rect(17, 44, 1, 5, INK);
  }

  if (dress === 'sundress' || dress === 'slip') {
    rect(12, 28, 12, 9, D.c);
    for (let yy = 26; yy <= 28; yy++) rect(15, yy, 6, 1, C.skin);
    rect(13, 26, 1, 2, D.c); rect(22, 26, 1, 2, D.c);
    rect(12, 36, 12, 1, D.sh);
    if (dress === 'sundress') flare(37, 13, 0.6, D, true);
    else flare(37, 14, 0.3, D, true);
  } else if (dress === 'babydoll') {
    rect(12, 26, 12, 1, D.c); rect(11, 27, 14, 5, D.c);
    rect(14, 26, 8, 2, C.skin); rect(11, 31, 14, 1, D.sh);
    for (let r = 0; r < 14; r++) {
      const sx0 = 11 - Math.floor(r * 0.55), sx1 = 24 + Math.floor(r * 0.55);
      rect(sx0, 32 + r, sx1 - sx0 + 1, 1, r === 13 ? D.sh : D.c);
      if (r >= 2 && r < 13) for (let i = sx0 + 2; i < sx1; i += 4) px(i, 32 + r, D.sh);
    }
  } else if (dress === 'bodycon') {
    rect(12, 26, 12, 1, D.c); rect(11, 27, 14, 10, D.c); rect(12, 37, 12, 13, D.c);
    rect(15, 26, 6, 2, C.skin); rect(13, 26, 2, 1, C.skin); rect(21, 26, 2, 1, C.skin);
    rect(12, 49, 12, 1, D.sh);
    [[13, 39], [20, 41], [14, 43], [19, 45], [13, 47]].forEach(([xx, yy]) => rect(xx, yy, 3, 1, D.sh));
  } else if (dress === 'long') {
    body(D); rect(15, 26, 6, 1, D.sh);
    flare(37, 18, 0.4, D, true);
  } else if (dress === 'abaya') {
    for (let yy = 26; yy <= 54; yy++) {
      const w0 = yy === 26 ? 12 : 11 - Math.floor((yy - 27) * 0.2), w1 = yy === 26 ? 23 : 24 + Math.floor((yy - 27) * 0.2);
      rect(w0, yy, w1 - w0 + 1, 1, yy === 54 ? D.sh : D.c);
    }
    rect(15, 26, 6, 1, D.sh);
    for (let yy = 30; yy < 54; yy++) px(17, yy, D.sh);
  } else if (top === 'tee' || top === 'crop') {
    const hem = top === 'crop' ? 32 : 36;
    for (let yy = 26; yy <= hem; yy++) rect(yy === 26 ? 12 : 11, yy, yy === 26 ? 12 : 14, 1, T.c);
    rect(11, 29, 6, 2, T.hi); rect(19, 29, 6, 2, T.hi);
    if (top === 'tee') { rect(11, 32, 6, 1, T.sh); rect(19, 32, 6, 1, T.sh); }
    rect(11, hem, 14, 1, T.sh);
    if (top === 'crop') px(17, 35, C.skinSh);
    [[26, 14, 21], [27, 15, 20], [28, 16, 19]].forEach(([yy, a, b]) => {
      rect(a, yy, b - a + 1, 1, C.skin); px(a - 1, yy, T.hi); px(b + 1, yy, T.hi);
    });
  } else if (top === 'tank') {
    rect(12, 27, 12, 10, T.c);
    rect(13, 26, 2, 1, T.c); rect(21, 26, 2, 1, T.c);
    rect(15, 27, 6, 2, C.skin); rect(12, 36, 12, 1, T.sh);
  } else if (top === 'longsleeve') {
    body(T); rect(16, 26, 4, 1, C.skin);
  } else if (top === 'button') {
    body(T);
    rect(16, 26, 4, 1, C.skin); rect(17, 27, 2, 1, C.skin);
    px(15, 26, T.hi); px(20, 26, T.hi); px(16, 27, T.hi); px(19, 27, T.hi);
    for (let yy = 28; yy < 36; yy++) px(17, yy, T.sh);
    px(18, 29, T.hi); px(18, 32, T.hi); px(18, 35, T.hi);
  } else if (top === 'turtleneck') {
    body(T);
    rect(15, 22, 6, 4, T.c); rect(15, 25, 6, 1, T.sh);
    for (let xx = 16; xx <= 19; xx += 2) rect(xx, 22, 1, 3, T.sh);
  } else if (top === 'hoodie') {
    rect(12, 25, 12, 1, T.c); rect(11, 26, 14, 12, T.c);
    rect(16, 25, 4, 1, C.skin); rect(17, 26, 2, 1, C.skin);
    rect(15, 27, 1, 4, T.hi); rect(20, 27, 1, 4, T.hi);
    rect(13, 32, 10, 1, T.sh); rect(13, 33, 1, 2, T.sh); rect(22, 33, 1, 2, T.sh);
    rect(11, 37, 14, 1, T.sh);
  } else if (top === 'tunic') {
    rect(12, 26, 12, 1, T.c);
    for (let yy = 27; yy <= 40; yy++) rect(yy >= 37 ? 10 : 11, yy, yy >= 37 ? 16 : 14, 1, yy === 40 ? T.sh : T.c);
    rect(15, 26, 6, 1, T.sh);
  }

  if (sleeve === 'short') {
    rect(8, 27, 4, 4, S.c); rect(24, 27, 4, 4, S.c);
    rect(8, 30, 4, 1, S.sh); rect(24, 30, 4, 1, S.sh);
  } else if (sleeve === 'puff') {
    rect(8, 27, 4, 3, S.c); rect(24, 27, 4, 3, S.c);
    rect(9, 27, 2, 1, S.hi); rect(25, 27, 2, 1, S.hi);
    rect(8, 29, 4, 1, S.sh); rect(24, 29, 4, 1, S.sh);
  } else if (sleeve === 'long' || sleeve === 'bell') {
    rect(8, 27, 3, 12, S.c); rect(25, 27, 3, 12, S.c);
    const bw = sleeve === 'bell' ? 4 : 3, bx = sleeve === 'bell' ? 7 : 8;
    if (sleeve === 'bell') { rect(7, 33, 4, 6, S.c); rect(25, 33, 4, 6, S.c); }
    rect(bx, 38, bw, 1, S.sh); rect(25, 38, bw, 1, S.sh);
  }
  if (dress !== 'abaya' && dress !== 'babydoll') { rect(11, 33, 1, 4, null); rect(24, 33, 1, 4, null); }

  if (kind === 'wrap' || kind === 'amira') {
    const snug = kind === 'amira';
    for (let yy = 18; yy <= 25; yy++) {
      const w = yy <= 21 ? (snug ? 10 : 11) : (snug ? 7.5 : 8.5) + (yy - 22) * 0.6;
      for (let xx = Math.round(17.5 - w); xx <= Math.round(17.5 + w - 1); xx++) px(xx, yy, C.hair);
    }
    rect(snug ? 9 : 8, 25, snug ? 18 : 20, 1, C.hairSh);
    if (!snug) for (let yy = 21; yy <= 24; yy++) { px(11, yy, C.hairSh); px(24, yy, C.hairSh); }
  } else if (kind === 'long') {
    for (let yy = 18; yy <= 31; yy++) {
      const w = yy <= 21 ? 11 : yy <= 27 ? 9 + (yy - 22) * 0.4 : 11 - (yy - 27) * 1.6;
      for (let xx = Math.round(17.5 - w); xx <= Math.round(17.5 + w - 1); xx++) px(xx, yy, yy === 31 || (yy > 27 && Math.abs(xx - 17.5) > w - 1.5) ? C.hairSh : C.hair);
    }
    for (let yy = 21; yy <= 29; yy++) { px(Math.round(11 + (yy - 21) * 0.4), yy, C.hairSh); px(Math.round(24 - (yy - 21) * 0.4), yy, C.hairSh); }
  }
  if (sleeve === 'long' || sleeve === 'bell') {
    rect(9, 39, 2, 2, C.skin); rect(25, 39, 2, 2, C.skin);
  } else {
    rect(9, 31, 2, 9, C.skin); rect(25, 31, 2, 9, C.skin);
  }
  if (STRANDS.includes(style) && len !== 'short') {
    ropes(style === 'braids' ? [7, 10] : [7], () => 19, (x0) => end - hash(x0, 3) % 4, style);
  }

  const bang = hairline(style, tex, look.bangs, kind);
  ell(17.5, 13.5, 7.5, 8.5, C.skin);
  for (let yy = 4; yy <= 22; yy++) for (let xx = 9; xx <= 26; xx++) {
    if (((xx - 17.5) / 7.5) ** 2 + ((yy - 13.5) / 8.5) ** 2 > 1) continue;
    if (!bang(xx, yy)) continue;
    if (kind) px(xx, yy, inOval(xx, yy, OPENING[kind]) <= 1.45 ? (kind === 'amira' ? C.hairSh : C.hairMid) : C.hair);
    else px(xx, yy, FLUFFY.includes(tex) && hash(xx, yy) % 5 === 0 ? C.hairHi : C.hair);
  }
  if (!kind) rect(15, 23, 6, 1, C.skinSh);
  const eyePx = (xx, yy, c) => { if (!bang(xx, yy)) px(xx, yy, c); };
  rect(11, 10, 3, 1, C.brow);
  if (!bang(23, 10)) rect(22, 10, 3, 1, C.brow);
  const eyeCol = (k) => k === 'W' ? C.white : (k === 'H' ? '#ffffff' : C.iris);
  if (blink) {
    for (let i = 0; i < 4; i++) { eyePx(11 + i, 13, INK); eyePx(21 + i, 13, INK); }
  } else {
    for (let i = 0; i < 4; i++) { eyePx(11 + i, 12, INK); eyePx(21 + i, 12, INK); }
    px(10, 12, INK); px(10, 11, INK);
    [['W','E','H','E'], ['W','E','E','E']].forEach((row, j) => row.forEach((k, i) => eyePx(11 + i, 13 + j, eyeCol(k))));
    [['E','H','E','W'], ['E','E','E','W']].forEach((row, j) => row.forEach((k, i) => eyePx(21 + i, 13 + j, eyeCol(k))));
  }
  if (look.blushOn !== false) { rect(11, 15, 3, 2, C.blush); rect(22, 15, 3, 2, C.blush); }
  px(17, 16, C.nose); px(18, 16, C.nose);
  rect(16, 18, 4, 2, C.lip);

  const widen = (row, col, n, left) => row.map((v, x) => left
    ? (x <= col - n ? row[x + n] : x <= col ? row[col] : v)
    : (x >= col + n ? row[x - n] : x >= col ? row[col] : v));
  const narrow = (row, col, n, left) => row.map((v, x) => left
    ? (x > col ? v : x < n ? null : row[x - n])
    : (x < col ? v : x > GW - 1 - n ? null : row[x + n]));
  const spread = { petite: -2, slim: -1, curvy: 0, midsize: 1, plus: 2, plus2: 3, plus3: 4, plus4: 5 }[look.body] || 0;
  const arms = spread >= 4 ? 2 : spread >= 2 ? 1 : 0;
  const hips = spread >= 5 ? 3 : spread >= 4 ? 2 : spread >= 3 ? 1 : 0;
  for (let yy = 26; yy < BH; yy++) {
    let row = g[yy + OY];
    if (spread > 0) {
      row = widen(widen(row, 14, spread, true), 21, spread, false);
      if (arms && yy <= 40) row = widen(widen(row, 9 - spread, arms, true), 26 + spread, arms, false);
      const h = yy >= 41 && yy <= 52 ? (yy < 43 || yy > 50 ? Math.min(1, hips) : hips) : 0;
      if (h) row = widen(widen(row, 14, h, true), 21, h, false);
    } else if (spread < 0) {
      row = narrow(narrow(row, 14, -spread, true), 21, -spread, false);
    }
    g[yy + OY] = row;
  }

  const out = [];
  for (let yy = 0; yy < GH; yy++) for (let xx = 0; xx < GW; xx++) if (g[yy][xx]) {
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const nx = xx + dx, ny = yy + dy;
      if (nx >= 0 && nx < GW && ny >= 0 && ny < GH && !g[ny][nx]) out.push([nx, ny]);
    });
  }
  out.forEach(([xx, yy]) => { g[yy][xx] = INK; });
  return g;
}

export function drawDoll(ctx, grid, ox, oy, scale) {
  for (let yy = 0; yy < GH; yy++) for (let xx = 0; xx < GW; xx++) {
    if (grid[yy][xx]) { ctx.fillStyle = grid[yy][xx]; ctx.fillRect(ox + xx * scale, oy + yy * scale, scale, scale); }
  }
}
