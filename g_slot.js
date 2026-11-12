// 레나 — LAST CALL (오락실): 빚 갚기 슬롯 로그라이크. 계산 코어(CORE)는 순수 함수라 Node로 시뮬레이션한다.
'use strict';
(() => {
// ---------- 계산 코어 ----------
const SY = ['cherry', 'coin', 'heart', 'lips', 'bolt', 'star', 'crown'];
const SN = { cherry: '체리', coin: '동전', heart: '하트', lips: '입술', bolt: '번개', star: '별', crown: '왕관', skull: '해골' };
const BV = { cherry: 2, coin: 2, heart: 3, lips: 3, bolt: 5, star: 5, crown: 7 };
const BW = { cherry: 1.3, coin: 1.3, heart: 1, lips: 1, bolt: .8, star: .8, crown: .5 };
const PV = { h3: 1, h4: 2, h5: 3, v: 1, d: 1, zig: 4, up: 7, down: 7, eye: 8, jack: 10 };
const PN = { h3: '가로 3', h4: '가로 4', h5: '가로 5', v: '세로', d: '대각선', zig: '지그재그', up: '눈썹(위)', down: '눈썹(아래)', eye: '눈', jack: '잭팟' };
const ix = (r, c) => r * 5 + c;
const FIX = [];
for (let c = 0; c < 5; c++) FIX.push({ k: 'v', cells: [ix(0, c), ix(1, c), ix(2, c)] });
for (let c = 0; c < 3; c++) { FIX.push({ k: 'd', cells: [ix(0, c), ix(1, c + 1), ix(2, c + 2)] }); FIX.push({ k: 'd', cells: [ix(2, c), ix(1, c + 1), ix(0, c + 2)] }); }
FIX.push({ k: 'zig', cells: [ix(0, 0), ix(1, 1), ix(2, 2), ix(1, 3), ix(0, 4)] }, { k: 'zig', cells: [ix(2, 0), ix(1, 1), ix(0, 2), ix(1, 3), ix(2, 4)] });
FIX.push({ k: 'up', cells: [0, 1, 2, 3, 4, ix(1, 0), ix(1, 4)] }, { k: 'down', cells: [10, 11, 12, 13, 14, ix(1, 0), ix(1, 4)] });
FIX.push({ k: 'eye', cells: [ix(0, 1), ix(0, 2), ix(0, 3), ix(1, 0), ix(1, 4), ix(2, 1), ix(2, 2), ix(2, 3)] });
FIX.push({ k: 'jack', cells: [...Array(15).keys()] });
const DEBT = [75, 200, 650, 2200, 12500, 33000, 66000, 200000, 1000000];
const LEVER = [7, 14, 28, 42, 56, 140, 168, 196, 224];
const RESTOCK = [3, 6, 20, 69, 300, 1000, 2000, 7000, 43000];
const FINAL = 9;
let HEAT = 2.05;
let HARD = 1; // 난이도는 하나(어려움): 빚이 마감마다 10%씩 더 불어남 // 마감마다 기계가 달아오름(전체 배수)

// 부적: r 등급(0 흔함·1 조금 귀함·2 귀함·3 전설), p 티켓 값, free = 칸 안 차지, lock = 도전 과제로 열림
const CH = [
  { id: 'chlip', n: '체리 립밤', r: 0, p: 1, i: 's/d_cherry', d: '체리 값 +2', f: m => { m.sv.cherry += 2; } },
  { id: 'purse', n: '구리 동전 지갑', r: 0, p: 1, i: 'st_coin', d: '동전 값 +2', f: m => { m.sv.coin += 2; } },
  { id: 'nheart', n: '네온 하트', r: 0, p: 2, i: 'st_heart', d: '하트가 더 자주 + 값 +1', f: m => { m.w.heart += .8; m.sv.heart += 1; } },
  { id: 'lipst', n: '레나의 립스틱', r: 1, p: 2, i: 'st_lips', d: '입술 배수 ×2', f: m => { m.sm.lips *= 2; } },
  { id: 'batt', n: '번개 배터리', r: 1, p: 3, i: 'st_bolt', d: '번개 배수 ×2', f: m => { m.sm.bolt *= 2; } },
  { id: 'shade', n: '별빛 선글라스', r: 1, p: 3, i: 'st_star', d: '별 배수 ×2', f: m => { m.sm.star *= 2; } },
  { id: 'crown', n: '플라스틱 왕관', r: 1, p: 3, i: 's/d_crown', d: '왕관이 더 자주 + 값 +2', f: m => { m.w.crown += .5; m.sv.crown += 2; } },
  { id: 'cbomb', n: '체리 폭탄', r: 1, p: 3, i: 's/d_cherry', d: '체리 배수 ×3', f: m => { m.sm.cherry *= 3; } },
  { id: 'gcoin', n: '황금 동전', r: 1, p: 3, i: 'st_coin', d: '동전 배수 ×3', f: m => { m.sm.coin *= 3; } },
  { id: 'vtape', n: '세로 테이프', r: 0, p: 2, i: 'st_tape', d: '세로줄 ×3', f: m => { m.pm.v *= 3; } },
  { id: 'dsti', n: '사선 스티커', r: 0, p: 2, i: 'st_peace', d: '대각선 ×3', f: m => { m.pm.d *= 3; } },
  { id: 'ruler', n: '가로 줄자', r: 1, p: 3, i: 'st_tape', d: '가로줄(3·4·5) ×2', f: m => { m.pm.h3 *= 2; m.pm.h4 *= 2; m.pm.h5 *= 2; } },
  { id: 'cord', n: '꼬인 전화선', r: 1, p: 3, i: 'st_phone', d: '지그재그 ×3', f: m => { m.pm.zig *= 3; } },
  { id: 'brow', n: '해골 눈썹', r: 2, p: 3, i: 'st_skull', d: '눈썹(위·아래) ×2', f: m => { m.pm.up *= 2; m.pm.down *= 2; } },
  { id: 'cateye', n: '고양이 눈', r: 2, p: 4, i: 's/d_halo', d: '눈 ×3', f: m => { m.pm.eye *= 3; } },
  { id: 'gum', n: '잭팟 껌', r: 2, p: 4, i: 's/d_bheart', d: '잭팟 ×3', f: m => { m.pm.jack *= 3; } },
  { id: 'umb4', n: '네잎 우산', r: 1, p: 3, i: 's/d_lights', d: '돌릴 때마다 행운 +2', f: m => { m.luck += 2; } },
  { id: 'wet', n: '젖은 부적', r: 0, p: 2, i: 's/d_bdots', d: '행운 +4, 대신 끊김 +1%p (저주)', curse: 1, f: m => { m.luck += 4; m.sk += .01; } },
  { id: 'skumb', n: '해골 우산', r: 2, p: 3, i: 'st_skull', d: '마감마다 통화 끊김을 한 번 막아요', f: m => { m.umb = 1; } },
  { id: 'piggy', n: '저금통 해골', r: 1, p: 2, i: 'cur/debt', d: 'ATM 이자 +3%p', f: m => { m.int += .03; } },
  { id: 'recv', n: '여분의 수화기', r: 2, p: 4, i: 'st_phone', d: '라운드마다 돌리기 +2번', f: m => { m.spins += 2; } },
  { id: 'cards', n: '티켓 집게', r: 1, p: 3, i: 'cur/phone', d: '라운드가 끝날 때마다 티켓 +1', f: m => { m.cards += 1; } },
  { id: 'ledger', n: '외상 장부', r: 2, p: 4, i: 'st_tape', d: '갚을 빚 −10%', f: m => { m.debt *= .9; } },
  { id: 'coupon', n: '할인 쿠폰', r: 0, p: 1, i: 's/d_token', d: '다시 채우기 반값 · 부적 값 −1 (칸 안 차지)', free: 1, f: m => { m.disc = 1; } },
  { id: 'snow', n: '눈덩이 테이프', r: 2, p: 4, i: 's/d_disco', d: '줄 3개 이상 걸리면 전체 배수 +0.2 (계속 쌓임)', chain: 1, f: (m, R) => { m.G *= 1 + .2 * (R.chain.snow || 0); } },
  { id: 'redbtn', n: '빨간 버튼', r: 1, p: 3, i: 's/d_neon', d: '마감마다 한 번: 다음 돌리기 행운 +10', charge: 1, f: () => {} },
  { id: 'loser', n: '꽝 수집가', r: 0, p: 1, i: 's/d_duck', d: '꽝마다 칩 +2×마감 (칸 안 차지)', free: 1, f: m => { m.miss += 2; } },
  { id: 'dual', n: '이중 회선', r: 2, p: 5, i: 's/d_notes', d: '한 번에 줄 2개 이상이면 ×1.5', f: m => { m.multi *= 1.5; } },
  { id: 'devil', n: '악마의 계약', r: 3, p: 5, i: 's/d_anger', d: '전체 ×2, 대신 끊김 +3%p (저주)', curse: 1, f: m => { m.G *= 2; m.sk += .03; } },
  { id: 'photo', n: '레나의 사진', r: 3, p: 6, i: 's/d_blush', d: '모든 그림 배수 ×2', f: m => { SY.forEach(s => { m.sm[s] *= 2; }); } },
  // 도전 과제로 열리는 부적
  { id: 'rain', n: '빗방울 렌즈', r: 2, p: 4, i: 's/d_bdots', lock: 'a_skull', d: '통화가 끊긴 뒤 그 마감 동안 전체 ×2', f: (m, R) => { if (R.skDl) m.G *= 2; } },
  { id: 'bones', n: '뼈 주사위', r: 1, p: 3, i: 'st_skull', lock: 'a_dl3', d: '행운이 7 이상인 돌리기는 ×2', f: m => { m.lucky7 = 1; } },
  { id: 'vip', n: 'VIP 회선', r: 2, p: 5, i: 'st_phone', lock: 'a_call5', d: '레나의 전화 다시 걸기 공짜', f: m => { m.freecall = 1; } },
  { id: 'atm2', n: '해골 은행장', r: 2, p: 4, i: 'cur/debt', lock: 'a_atm', d: 'ATM 이자 +7%p', f: m => { m.int += .07; } },
  { id: 'jack2', n: '네온 잭팟 간판', r: 3, p: 6, i: 's/d_neon', lock: 'a_jack', d: '잭팟 ×5, 눈 ×2', f: m => { m.pm.jack *= 5; m.pm.eye *= 2; } },
  { id: 'cat', n: '고양이 프사', r: 3, p: 6, i: 's/d_plush', lock: 'a_win', d: '돌릴 때마다 행운 +3, 그림 값 +1', f: m => { m.luck += 3; SY.forEach(s => { m.sv[s] += 1; }); } },
  { id: 'cherry2', n: '체리 나무', r: 2, p: 4, i: 's/d_cherry', lock: 'a_cherry', d: '체리 값 +5, 더 자주', f: m => { m.sv.cherry += 5; m.w.cherry += .8; } },
  { id: 'lips2', n: '키스 마크', r: 2, p: 4, i: 'st_lips', lock: 'a_rich', d: '입술·하트 배수 ×3', f: m => { m.sm.lips *= 3; m.sm.heart *= 3; } }
];
const CHM = Object.fromEntries(CH.map(c => [c.id, c]));

function rng(R) { let t = (R.rs = (R.rs + 0x6D2B79F5) | 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
const rint = (R, a, b) => a + Math.floor(rng(R) * (b - a + 1));
function wpick(R, w) { const ks = Object.keys(w); let t = 0; ks.forEach(k => { t += w[k]; }); let x = rng(R) * t; for (const k of ks) if ((x -= w[k]) < 0) return k; return ks[ks.length - 1]; }

function newRun(seed, o = {}) {
  const R = { rs: seed | 0, dl: 1, rd: 1, ph: 'round', chips: 30, atm: 0, cards: 3, spins: 0, ch: [], chain: {}, k: 0, miss: 0, perm: { sv: {}, sm: {}, pm: {}, pa: 0, luck: 0, slots: 0 }, luckDl: 0, umbUsed: 0, btnUsed: 0, boost: 0, skDl: 0, skSeen: 0, hard: o.hard == null ? HARD : o.hard, restockN: 0, offers: [], call: null, recall: 0, endless: 0, unl: o.unl || [], log: { jack: 0, bestWin: 0, calls: 0, skulls: 0 } };
  roll(R); return R;
}
function mods(R) {
  const m = { sv: {}, sm: {}, w: {}, pm: {}, pa: R.perm.pa, luck: R.perm.luck, sk: 0, int: 0, spins: 0, cards: 0, debt: 1, disc: 0, G: 1, umb: 0, miss: 0, multi: 1, lucky7: 0, freecall: 0 };
  SY.forEach(s => { m.sv[s] = BV[s] + (R.perm.sv[s] || 0); m.sm[s] = R.perm.sm[s] || 1; m.w[s] = BW[s]; });
  Object.keys(PV).forEach(k => { m.pm[k] = R.perm.pm[k] || 1; });
  R.ch.forEach(id => CHM[id] && CHM[id].f(m, R));
  m.heat = Math.pow(HEAT, R.dl - 1); m.G *= m.heat;
  return m;
}
const slots = R => 7 + R.perm.slots;
const used = R => R.ch.filter(id => !CHM[id].free).length;
function debtOf(R, dl = R.dl) { const base = dl <= FINAL ? DEBT[dl - 1] : DEBT[FINAL - 1] * Math.pow(5, dl - FINAL); return Math.ceil(base * Math.pow(1 + .1 * R.hard, dl - 1) * mods(R).debt); }
const leverOf = dl => dl <= FINAL ? LEVER[dl - 1] : LEVER[FINAL - 1] + 28 * (dl - FINAL);
function restockOf(R) { const b = R.dl <= FINAL ? RESTOCK[R.dl - 1] : RESTOCK[FINAL - 1] * Math.pow(3, R.dl - FINAL); return Math.ceil(b * (1 + .2 * R.restockN) * (mods(R).disc ? .5 : 1)); }
const priceOf = (R, id) => Math.max(1, CHM[id].p - (mods(R).disc ? 1 : 0) - (R.saleDl === R.dl ? 1 : 0));

function roll(R) { // 가게 4칸
  const pool = CH.filter(c => !R.ch.includes(c.id) && (!c.lock || R.unl.includes(c.lock)));
  const out = [];
  while (out.length < 4 && pool.length) { const w = {}; pool.forEach(c => { w[c.id] = [6, 4, 2, .8][c.r]; }); const id = wpick(R, w); out.push(id); pool.splice(pool.findIndex(c => c.id === id), 1); }
  R.offers = out;
}
function restock(R) { const c = restockOf(R); if (R.chips < c) return false; R.chips -= c; R.restockN++; roll(R); return true; }
function buy(R, id) {
  const c = CHM[id]; if (!c || !R.offers.includes(id)) return 'no';
  const p = priceOf(R, id); if (R.cards < p) return 'cards'; if (!c.free && used(R) >= slots(R)) return 'full';
  R.cards -= p; R.ch.push(id); R.offers = R.offers.filter(x => x !== id); return 'ok';
}
function sell(R, id) { const i = R.ch.indexOf(id); if (i < 0) return 0; R.ch.splice(i, 1); const g = Math.max(1, Math.floor(CHM[id].p / 2)); R.cards += g; delete R.chain[id]; return g; }
function deposit(R, n) { n = Math.max(0, Math.min(R.chips, Math.floor(n))); R.chips -= n; R.atm += n; return n; }
const canPayEarly = R => R.ph === 'round' && R.atm + R.chips >= debtOf(R);

function startRound(R, mode) { // mode 7 | 3
  if (R.ph !== 'round') return 'no';
  const cost = leverOf(R.dl), m = mods(R);
  if (R.chips >= cost) { R.chips -= cost; R.spins = (mode === 3 ? 3 : 7) + m.spins; if (mode === 3) R.cards += 2; }
  else { R.spins = 7 + m.spins; } // 칩이 모자라면 공짜(7번)
  R.ph = 'spin'; return 'ok';
}
function luckOf(R, m) {
  let L = m.luck + R.luckDl + R.boost;
  if (R.dl === 1 && rng(R) < .3) L += rint(R, 4, 8);
  else if (R.k % 7 === 0) L += rint(R, 7, 9);
  else if (R.k % 3 === 0) L += rint(R, 5, 7);
  else if (rng(R) < .2) L += rint(R, 3, 5);
  if (R.miss >= 4) L += 5 + (R.miss - 4);
  return L;
}
function judge(g, m) {
  const wins = [];
  const add = (k, cells) => { const s = g[cells[0]]; if (s === 'skull') return; wins.push({ k, s, cells, amt: 0 }); };
  for (let r = 0; r < 3; r++) { let c = 0; while (c < 5) { let e = c; while (e + 1 < 5 && g[ix(r, e + 1)] === g[ix(r, c)]) e++; const L = e - c + 1; if (L >= 3) add('h' + L, Array.from({ length: L }, (_, j) => ix(r, c + j))); c = e + 1; } }
  FIX.forEach(p => { const s = g[p.cells[0]]; if (p.cells.every(i => g[i] === s)) add(p.k, p.cells); });
  wins.forEach(w => { w.amt = Math.floor(m.sv[w.s] * m.sm[w.s] * (PV[w.k] + m.pa) * m.pm[w.k]); });
  return wins;
}
function spin(R) {
  if (R.ph !== 'spin' || R.spins <= 0) return null;
  const m = mods(R); R.k++; R.spins--;
  const w = {}; SY.forEach(s => { w[s] = m.w[s]; });
  const g = Array.from({ length: 15 }, () => wpick(R, w));
  const L = luckOf(R, m); R.boost = 0;
  if (L > 0) { const pickS = wpick(R, w), cells = [...Array(15).keys()]; for (let i = 0; i < Math.min(15, L); i++) { const j = i + Math.floor(rng(R) * (15 - i)); [cells[i], cells[j]] = [cells[j], cells[i]]; g[cells[i]] = pickS; } }
  const res = { g, wins: [], tot: 0, skull: 0, luck: L, lost: 0, blocked: 0 };
  const pSk = R.dl === 1 && R.rd === 1 ? 0 : Math.min(.3, .013 + m.sk); // 첫 라운드는 연습
  if (rng(R) < pSk) {
    if (m.umb && !R.umbUsed) { R.umbUsed = 1; res.blocked = 1; }
    else { g[6] = g[7] = g[8] = 'skull'; res.skull = 1; res.lost = R.chips; R.chips = 0; R.skDl = 1; R.skSeen = 1; R.log.skulls++; R.miss++; end(R); return res; }
  }
  res.wins = judge(g, m);
  let tot = res.wins.reduce((a, x) => a + x.amt, 0);
  if (res.wins.length >= 2) tot *= m.multi;
  if (m.lucky7 && L >= 7) tot *= 2;
  tot = Math.floor(tot * m.G);
  if (res.wins.length >= 3 && R.ch.includes('snow')) R.chain.snow = (R.chain.snow || 0) + 1;
  if (res.wins.some(x => x.k === 'jack')) R.log.jack++;
  if (!tot) { R.miss++; if (m.miss) { tot = m.miss * R.dl; res.consol = 1; } } else R.miss = 0;
  res.tot = tot; R.chips += tot; R.log.bestWin = Math.max(R.log.bestWin, tot);
  end(R); return res;
}
function end(R) { if (R.spins > 0) return; const m = mods(R); R.chips += Math.floor(R.atm * (.07 + m.int)); R.cards += m.cards; R.rd++; if (R.rd > 3) deadline(R); else R.ph = 'round'; }
function payEarly(R) { if (!canPayEarly(R)) return false; const skip = 4 - R.rd; R.cards += 4 * skip; R.rd = 4; deadline(R); return true; }
function deadline(R) {
  const d = debtOf(R);
  if (R.atm + R.chips < d) { R.ph = 'over'; return; }
  if (R.atm >= d) R.atm -= d; else { R.chips -= d - R.atm; R.atm = 0; }
  R.chips += 6 * R.dl; R.cards += 2;
  if (R.dl === FINAL && !R.endless) { R.ph = 'win'; return; }
  next(R);
}
function next(R) { R.dl++; R.rd = 1; R.k = 0; R.luckDl = 0; R.umbUsed = 0; R.btnUsed = 0; R.skDl = 0; R.restockN = 0; R.recall = 0; R.ph = 'call'; R.call = callOpts(R); roll(R); }
function goEndless(R) { if (R.ph !== 'win') return; R.endless = 1; next(R); }

// 레나의 전화: 4개 중 1개
const CALL = {
  chip: { t: (R, o) => `칩 +${o.v}`, d: '현금으로 바로', a: (R, o) => { R.chips += o.v; } },
  card: { t: () => '티켓 +3', d: '부적 살 돈', a: R => { R.cards += 3; } },
  luck: { t: () => '이번 마감 행운 +3', d: '돌릴 때마다', a: R => { R.luckDl += 3; } },
  smul: { t: (R, o) => `${SN[o.s]} 배수 ×2`, d: '이번 판 내내', a: (R, o) => { R.perm.sm[o.s] = (R.perm.sm[o.s] || 1) * 2; } },
  sval: { t: (R, o) => `${SN[o.s]} 값 +${o.v}`, d: '이번 판 내내', a: (R, o) => { R.perm.sv[o.s] = (R.perm.sv[o.s] || 0) + o.v; } },
  pmul: { t: (R, o) => `${PN[o.p]} 배수 ×2`, d: '이번 판 내내', a: (R, o) => { R.perm.pm[o.p] = (R.perm.pm[o.p] || 1) * 2; } },
  padd: { t: () => '모든 줄 값 +1', d: '이번 판 내내', a: R => { R.perm.pa += 1; } },
  slot: { t: () => '부적 칸 +1', d: '칸이 하나 늘어요', a: R => { R.perm.slots += 1; } },
  sale: { t: () => '가게 할인', d: '이번 마감 부적 값 −1', a: R => { R.saleDl = R.dl; } },
  plk: { t: () => '행운 영구 +1', d: '이번 판 내내', a: R => { R.perm.luck += 1; } },
  dbl: { t: () => '칩 ×2', d: '대신 끊김 확률 +2%p (위험)', red: 1, a: R => { R.chips *= 2; R.ch.push('wet2'); } }
};
function callOpts(R) {
  const ids = Object.keys(CALL).filter(k => k !== 'dbl' || R.skSeen), out = [];
  while (out.length < 4 && ids.length) {
    const id = ids.splice(rint(R, 0, ids.length - 1), 1)[0], o = { id };
    if (id === 'chip') o.v = Math.ceil(debtOf(R) * .25);
    if (id === 'smul' || id === 'sval') o.s = SY[rint(R, 0, 6)];
    if (id === 'sval') o.v = 1 + Math.floor(R.dl / 2);
    if (id === 'pmul') o.p = ['v', 'd', 'h3', 'zig', 'eye'][rint(R, 0, 4)];
    out.push(o);
  }
  return out;
}
const callText = (R, o) => ({ t: CALL[o.id].t(R, o), d: CALL[o.id].d, red: CALL[o.id].red || 0 });
CH.push({ id: 'wet2', n: '빨간 약속', r: 0, p: 0, i: 's/d_anger', d: '끊김 +2%p (레나의 위험한 전화)', curse: 1, free: 1, hide: 1, f: m => { m.sk += .02; } }); CHM.wet2 = CH[CH.length - 1];
const recallCost = R => mods(R).freecall ? 0 : Math.max(1, R.dl - 1) + R.recall;
function recall(R) { const c = recallCost(R); if (R.cards < c) return false; R.cards -= c; R.recall++; R.call = callOpts(R); return true; }
function takeCall(R, i) { if (R.ph !== 'call' || !R.call || !R.call[i]) return false; const o = R.call[i]; CALL[o.id].a(R, o); R.log.calls++; R.call = null; R.ph = 'round'; return true; }
function pressRed(R) { if (!R.ch.includes('redbtn') || R.btnUsed) return false; R.btnUsed = 1; R.boost = 10; return true; }
const skullP = R => Math.min(.3, .013 + mods(R).sk);

const CORE = { setHeat: h => { HEAT = h; }, setHard: h => { HARD = h; }, SY, SN, BV, BW, PV, PN, FIX, CH, CHM, DEBT, LEVER, FINAL, newRun, mods, debtOf, leverOf, restockOf, priceOf, roll, restock, buy, sell, deposit, canPayEarly, payEarly, startRound, spin, judge, callOpts, callText, takeCall, recall, recallCost, pressRed, goEndless, skullP, slots, used, rng };
if (typeof module !== 'undefined') module.exports = CORE;
if (typeof window === 'undefined' || !window.ARC) return;
window.JACKPOT = CORE;

// ---------- 화면 ----------
const { frame, talk, gcAdd, gc } = window.ARC;
const IM = n => `assets/lena/${n}.webp`;
const SIM = { cherry: 's/d_cherry', coin: 'st_coin', heart: 'st_heart', lips: 'st_lips', bolt: 'st_bolt', star: 'st_star', crown: 's/d_crown', skull: 'st_skull' };
const NAME = 'LAST CALL';
const TK = '<i class="bp-tk"></i>';
const css = `
.bp-hd{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.bp-hd div{position:relative;padding:7px 6px 6px;border:2px solid #000;border-radius:4px;background:url(assets/lena/paper_white.webp) center/cover,#f3efe6;color:#111;text-align:center;box-shadow:2px 2px 0 #000;min-width:0}
.bp-hd div:nth-child(1){background-image:url(assets/lena/paper_pink.webp)}.bp-hd div:nth-child(4){background-image:url(assets/lena/paper_yellow.webp)}
.bp-hd small{display:flex;align-items:center;justify-content:center;gap:2px;font-size:10.5px;font-weight:800;opacity:.75;white-space:nowrap}.bp-hd small .ci{width:13px;height:13px}
.bp-hd b{display:block;font-family:'Space Mono',monospace;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bp-dl{display:flex;align-items:center;gap:8px;font-family:'Black Han Sans';font-size:17px;color:#fff;text-shadow:2px 2px 0 #000}
.bp-dl i{display:flex;gap:4px;margin-left:auto}.bp-dl i u{width:12px;height:12px;border-radius:50%;border:2px solid #000;background:#2a2d33}.bp-dl i u.on{background:var(--pink)}.bp-dl i u.now{background:var(--yel)}
.bp-dl em{font-style:normal;font-family:'Space Mono',monospace;font-size:11.5px;color:#ff8fb6;text-shadow:none}
.bp-name{position:relative;margin:14px 6px 4px;padding:22px 14px 16px;border:2px solid #000;border-radius:2px;background:url(assets/lena/paper_white.webp) center/cover,#f3efe6;background-color:var(--pc,#f3efe6);background-blend-mode:multiply;color:#111;text-align:center;box-shadow:6px 7px 0 rgba(0,0,0,.55);transform:rotate(-1.4deg);font-family:'Black Han Sans';font-size:clamp(34px,11.5vw,50px);line-height:.95;letter-spacing:-.5px;text-shadow:3px 3px 0 var(--pk,#ff3d9a)}
.bp-name::before,.bp-name::after{content:"";position:absolute;top:-10px;width:58px;height:20px;background:url(assets/lena/tape_white.webp) center/100% 100%;opacity:.95}.bp-name::before{left:10px;transform:rotate(-14deg)}.bp-name::after{right:10px;transform:rotate(11deg)}
.bp-name small{display:block;margin-top:10px;font-family:Pretendard;font-size:14px;font-weight:800;letter-spacing:0;text-shadow:none;opacity:.78}
.bp-panel{position:relative;padding:12px;border-radius:4px;border:2px solid #000;background:url(assets/lena/paper_white.webp) center/cover,#f3efe6;color:#111;box-shadow:4px 4px 0 var(--teal)}
.bp-panel::before{content:"";position:absolute;left:50%;top:-9px;width:54px;height:16px;margin-left:-27px;background:url(assets/lena/tape_pink1.webp) center/100% 100%}
.bp-panel h4{font-family:'Black Han Sans';font-weight:400;font-size:17px;margin:0 0 8px}
.bp-panel .hint{color:#444}
.bp-row{display:flex;gap:8px;flex-wrap:wrap}.bp-row>button{flex:1 1 40%;min-height:46px}
.bp-go{min-height:52px;border-radius:12px;border:2px solid #000;background:var(--pink);color:#fff;font-family:'Black Han Sans';font-size:17px;box-shadow:0 3px 0 #000}
.bp-go.t{background:var(--teal);color:#111}.bp-go.y{background:var(--yel);color:#111}.bp-go:disabled{filter:grayscale(.7);opacity:.55}
.bp-go small{display:block;font-family:Pretendard;font-size:11.5px;font-weight:700;opacity:.85}
.bp-ch{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.bp-c{position:relative;display:flex;align-items:center;gap:8px;min-height:62px;padding:8px;border-radius:6px;border:2px solid #000;background:#fff;color:#111;text-align:left;box-shadow:2px 2px 0 #000}
.bp-c img{flex:none;width:34px;height:34px}.bp-c b{display:block;font-size:13px;line-height:1.2;word-break:keep-all}.bp-c small{display:block;font-size:11px;line-height:1.3;opacity:.75;word-break:keep-all}
.bp-c.r1{box-shadow:2px 2px 0 var(--teal)}.bp-c.r2{box-shadow:2px 2px 0 var(--pink)}.bp-c.r3{background:#fff7b0;box-shadow:2px 2px 0 #b8860b}.bp-c.cur{border-color:#d0124f}
.bp-c em{position:absolute;right:4px;top:-9px;font-style:normal;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;padding:1px 6px;border-radius:8px;background:var(--yel);border:2px solid #000;display:flex;align-items:center;gap:2px}.bp-c em .ci{width:12px;height:12px}
.bp-c.fire{animation:bpf .6s 2}@keyframes bpf{50%{background:#fff36b;transform:scale(1.04)}}
.bp-mine{display:flex;flex-wrap:wrap;gap:6px}.bp-mine button{display:flex;align-items:center;gap:4px;height:36px;padding:0 9px 0 4px;border-radius:18px;border:2px solid #000;background:#fff;color:#111;font-size:12px;font-weight:800}.bp-mine img{width:26px;height:26px}.bp-mine .cur{background:#ffd6e4}
.bp-lines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2}
.bp-lines polyline{fill:none;stroke:var(--pink);stroke-width:4;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 3px #fff);stroke-dasharray:400;stroke-dashoffset:400;animation:bpl .35s forwards}@keyframes bpl{to{stroke-dashoffset:0}}
.bp-pop{position:absolute;left:50%;top:6%;transform:translateX(-50%);z-index:5;white-space:nowrap;padding:4px 12px;border-radius:14px;border:2px solid #000;background:var(--yel);color:#111;font-family:'Black Han Sans';font-size:17px;box-shadow:2px 2px 0 #000;animation:bpp .9s forwards;pointer-events:none}@keyframes bpp{0%{opacity:0;transform:translate(-50%,8px) scale(.8)}20%{opacity:1;transform:translate(-50%,0) scale(1.05)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-10px)}}
.bp-skull .rwin{animation:bps .5s 2}@keyframes bps{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.bp-skull .cab::after{content:"";position:absolute;inset:0;background:rgba(255,46,110,.35);mix-blend-mode:multiply;animation:bpr 1s forwards;pointer-events:none}@keyframes bpr{to{opacity:0}}
.bp-coin{position:fixed;width:26px;height:26px;z-index:60;pointer-events:none;background:url(assets/lena/cur/chip.webp) center/contain no-repeat}
.bp-call{position:relative;padding:14px 12px 12px;border-radius:16px;border:3px solid #000;background:linear-gradient(160deg,#1f2a2e,#0f1416);box-shadow:5px 5px 0 var(--pink)}
.bp-call .ring{display:flex;align-items:center;gap:10px;font-family:'Black Han Sans';font-size:18px;margin-bottom:10px}.bp-call .ring i{width:46px;height:46px;border-radius:50%;background:url(assets/lena/face.jpg) 50% 30%/cover;border:2px solid #000;box-shadow:2px 2px 0 var(--teal);animation:bpring .5s infinite alternate}.app.outside .bp-call .ring i{background-image:url(assets/lena/cat.jpg)}
@keyframes bpring{to{transform:rotate(6deg)}}
.bp-opt{display:block;width:100%;min-height:54px;margin-top:8px;padding:8px 12px;border-radius:8px;border:2px solid #000;background:url(assets/lena/paper_white.webp) center/cover,#f3efe6;color:#111;text-align:left;box-shadow:3px 3px 0 var(--teal)}
.bp-opt b{display:block;font-size:15px}.bp-opt small{font-size:12px;opacity:.75}.bp-opt.red{background:#ffd6e4;box-shadow:3px 3px 0 var(--hot)}
.bp-ach{display:grid;gap:6px}.bp-ach div{display:flex;gap:8px;align-items:center;font-size:12.5px;line-height:1.35;word-break:keep-all}.bp-ach div b{flex:none;width:22px;height:22px;border-radius:50%;border:2px solid #000;display:grid;place-items:center;font-size:12px;background:#ddd}.bp-ach div.ok b{background:var(--teal)}
.bp-mini.cabw{max-width:170px;padding-right:0}
.abody.slg .sl-felt{gap:6px;padding:8px 10px;justify-content:flex-start;overflow:hidden}
.slg .sl-felt .tb-lb{flex:none;gap:6px;min-height:22px}.sl-rd{display:flex;gap:4px;margin-left:2px}.sl-rd u{width:11px;height:11px;border-radius:50%;border:2px solid #000;background:#0d3324}.sl-rd u.on{background:var(--pink)}.sl-rd u.now{background:var(--yel)}
.sl-sk{margin-left:auto;font-style:normal;font-family:'Space Mono',monospace;font-size:11.5px;color:#ffb3cf}
.slg .sl-cabw{flex:1 1 0;min-height:0;width:100%;max-width:none;padding:0;margin:0;display:flex;justify-content:center}
.slg .sl-cab{height:100%;max-width:100%;aspect-ratio:5/2.8;width:auto;background:none;filter:none}
.slg .sl-cab .rwin{position:absolute;inset:0;width:auto;height:auto;gap:3px;padding:3px;border-radius:10px;background:#0a2018;border:2px solid #000;box-shadow:0 3px 0 rgba(0,0,0,.5)}
.slg .sl-cab .reel{border-radius:6px;background:var(--paper)}.slg .sl-cab .rwin::after{border-radius:10px}
.slg .bp-mine{flex:none;display:flex;flex-wrap:nowrap;align-items:center;gap:5px;overflow-x:auto;scrollbar-width:none;min-height:30px}.slg .bp-mine::-webkit-scrollbar{display:none}
.slg .bp-mine>*{flex:none}.slg .bp-mine button{width:30px;height:30px;padding:0;border-radius:50%;justify-content:center;background:var(--paper)}.slg .bp-mine button img{width:22px;height:22px}
.bp-mt{font:800 11.5px Pretendard;color:#d9f2e4;white-space:nowrap}.bp-mt.dim{opacity:.6}
.sl-pills button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:0;padding:0 4px;border-radius:14px!important;line-height:1.1}
.sl-pills button small{display:flex;align-items:center;gap:2px;font:800 10.5px Pretendard;opacity:.7;white-space:nowrap}.sl-pills button small .ci{width:12px;height:12px}
.sl-pills button b{font-size:13.5px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}.sl-pills button:last-child{background:#fff6b8}
.slg .tb-act button{line-height:1.15}.slg .tb-act .tb-mul{font-size:11px}
.tb-act button.sl-q{flex:0 0 74px;font-size:13px;background:linear-gradient(#5a6068,#30353b);color:#e3e7ea}
.tb-act button.sl-red{flex:.8;background:linear-gradient(#ff7a7a,#e0303f);color:#fff;font-size:14px}
.sl-title{font-family:'Black Han Sans';font-size:clamp(30px,10vw,44px);text-align:center;color:var(--yel);text-shadow:3px 3px 0 #000;margin-top:auto}.sl-title+.tb-hint{margin-bottom:auto;color:#d9f2e4}
.slg .sl-felt.slshop .bp-ch{flex:none;display:flex;overflow-x:auto;gap:8px;padding:9px 2px 2px;scrollbar-width:none}.slg .sl-felt.slshop .bp-ch::-webkit-scrollbar{display:none}
.slg .sl-felt.slshop .bp-c{flex:none;width:150px;min-height:56px;padding:6px}.slg .sl-felt.slshop .bp-c img{width:28px;height:28px}
.sl-mini{margin-left:auto;height:28px;padding:0 10px;border-radius:14px;border:2px solid #000;background:var(--paper);color:#111;font:800 11.5px Pretendard}
.sl-atm{flex:none;display:flex;gap:5px;margin-top:auto}.sl-atm button{flex:1;min-height:40px;padding:0 4px;border-radius:10px;border:2px solid #000;background:var(--paper);color:#111;font:800 12.5px Pretendard;box-shadow:0 2px 0 #000;word-break:keep-all;line-height:1.15}.sl-atm button.pay{background:var(--yel)}
.slg .sl-felt.slcall{justify-content:center}.slg .sl-felt.slcall .bp-opt{flex:1 1 0;min-height:0;max-height:62px;margin:0;padding:4px 10px;display:flex;flex-direction:column;justify-content:center}.slg .sl-felt.slcall .bp-opt b{font-size:14px}.slg .sl-felt.slcall .bp-opt small{font-size:11.5px}
.slg .sl-felt.slach .bp-ach{flex:1 1 0;min-height:0;overflow:auto;gap:4px;color:#e9f5ef}.slg .sl-felt.slach .bp-ach div{font-size:12px}
.bp-tk{display:inline-block;width:18px;height:12px;margin-right:2px;vertical-align:-1px;background:linear-gradient(90deg,#ff3d9a 0 70%,#ffd6e4 70% 72%,#ff3d9a 72%);border:1.5px solid #000;border-radius:2px;-webkit-mask:radial-gradient(circle at 0 50%,#0000 3px,#000 3.5px) left/51% 100% no-repeat,radial-gradient(circle at 100% 50%,#0000 3px,#000 3.5px) right/51% 100% no-repeat;mask:radial-gradient(circle at 0 50%,#0000 3px,#000 3.5px) left/51% 100% no-repeat,radial-gradient(circle at 100% 50%,#0000 3px,#000 3.5px) right/51% 100% no-repeat}
.bp-tkout{position:absolute;left:50%;bottom:9%;z-index:6;display:flex;align-items:center;justify-content:center;gap:6px;width:46%;height:30px;margin-left:-23%;background:repeating-linear-gradient(90deg,#ff3d9a 0 22%,#ffd6e4 22% 23%);border:2px solid #000;border-radius:3px;color:#fff;font-family:'Black Han Sans';font-size:15px;text-shadow:1px 1px 0 #000;transform-origin:top;animation:bptk 1.6s forwards;pointer-events:none}
@keyframes bptk{0%{transform:translateY(-10px) scaleY(.1);opacity:0}25%{transform:translateY(0) scaleY(1);opacity:1}70%{transform:translateY(14px)}100%{transform:translateY(40px) rotate(-8deg);opacity:0}}
.sc.six{background:#111!important}.sc.six img{filter:grayscale(1) contrast(1.4) brightness(.8)}
.sc.six::after{content:"";position:absolute;inset:0;z-index:2;background:repeating-linear-gradient(0deg,rgba(255,255,255,.35) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(0,0,0,.4) 0 2px,transparent 2px 5px);mix-blend-mode:screen;animation:bpst .12s steps(2) infinite}
@keyframes bpst{50%{background-position:0 2px,3px 0;opacity:.6}}
.bp-cut{position:absolute;left:0;right:0;top:10%;z-index:7;text-align:center;pointer-events:none;animation:bpct 1.9s forwards}
.bp-cut b{display:inline-block;padding:4px 14px;border:3px solid #000;border-radius:8px;background:#111;color:#9ff5e4;font-family:'Black Han Sans';font-size:clamp(30px,10vw,44px);letter-spacing:2px;box-shadow:4px 4px 0 var(--hot);text-shadow:0 0 3px rgba(47,224,200,.7)}
.bp-cut svg{display:block;width:70%;height:40px;margin:6px auto 0;overflow:visible}.bp-cut polyline{fill:none;stroke:#2fe0c8;stroke-width:3;filter:drop-shadow(0 0 4px #2fe0c8);stroke-dasharray:600;stroke-dashoffset:600;animation:bpl .9s forwards}
@keyframes bpct{0%{opacity:0;transform:translateY(-8px)}10%{opacity:1;transform:none}14%{transform:translateX(-5px)}18%{transform:translateX(5px)}22%{transform:none}85%{opacity:1}100%{opacity:0}}
.bp-dead{position:fixed;inset:0;z-index:58;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.35) 0 2px,transparent 2px 4px),rgba(0,20,18,.45);animation:bpdead 1.5s forwards}@keyframes bpdead{0%{opacity:0}8%{opacity:1}20%{opacity:.4}30%{opacity:1}100%{opacity:0}}
.sc.hit{background:#fff36b!important;animation:bphit .45s cubic-bezier(.3,1.8,.5,1)}
.sc.hit img{filter:drop-shadow(0 0 6px #fff) drop-shadow(0 0 2px #f2ea3a)}
@keyframes bphit{0%{transform:scale(1)}40%{transform:scale(1.22);background:#fff}100%{transform:scale(1)}}
.bp-num{position:absolute;z-index:6;transform:translate(-50%,-50%);font-family:'Black Han Sans';font-size:clamp(20px,7.5vw,32px);color:#fff36b;-webkit-text-stroke:1.5px #000;text-shadow:3px 3px 0 #000,0 0 14px rgba(242,234,58,.9);white-space:nowrap;pointer-events:none;animation:bpnum .8s cubic-bezier(.2,1.6,.4,1) forwards}
.bp-num small{display:block;font-size:.45em;color:#fff;-webkit-text-stroke:0;text-align:center}
@keyframes bpnum{0%{transform:translate(-50%,-30%) scale(.3)}30%{transform:translate(-50%,-50%) scale(1.25)}50%{transform:translate(-50%,-50%) scale(1)}85%{opacity:1}100%{opacity:0;transform:translate(-50%,-90%) scale(1)}}
.bp-tot{position:absolute;left:50%;top:58%;z-index:7;transform:translate(-50%,-50%);padding:6px 16px;border:3px solid #000;border-radius:10px;background:var(--yel);color:#111;font-family:'Black Han Sans';font-size:clamp(26px,9vw,40px);white-space:nowrap;box-shadow:4px 4px 0 #000,0 0 30px rgba(242,234,58,.8);animation:bptot 1.3s cubic-bezier(.2,1.6,.4,1) forwards;pointer-events:none}
.bp-tot small{display:block;font-size:.38em;text-align:center;color:#d0124f}
@keyframes bptot{0%{transform:translate(-50%,-50%) scale(.2) rotate(-10deg)}25%{transform:translate(-50%,-50%) scale(1.15) rotate(3deg)}40%{transform:translate(-50%,-50%) scale(1) rotate(-2deg)}85%{opacity:1}100%{opacity:0}}
.bp-shk{animation:bpshk .3s}@keyframes bpshk{25%{transform:translate(-4px,2px)}50%{transform:translate(4px,-2px)}75%{transform:translate(-2px,-1px)}}
.bp-jack{position:fixed;inset:0;z-index:59;display:grid;place-items:center;pointer-events:none;background:rgba(0,0,0,.35);animation:bpjb 2.6s forwards}
.bp-jack b{font-family:'Black Han Sans';font-size:clamp(48px,17vw,90px);background:linear-gradient(90deg,#ff3d9a,#f2ea3a,#2fe0c8,#ff3d9a);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-stroke:2px #000;filter:drop-shadow(4px 4px 0 #000);animation:bpjr .6s linear infinite,bpjz 2.6s cubic-bezier(.2,1.6,.4,1) forwards}
@keyframes bpjr{to{background-position:300% 0}}@keyframes bpjz{0%{transform:scale(.2)}20%{transform:scale(1.15)}30%{transform:scale(1)}}@keyframes bpjb{0%,85%{opacity:1}100%{opacity:0}}
.bp-tier{display:flex;gap:6px;flex-wrap:wrap}.bp-tier button{min-width:44px;height:40px;border-radius:10px;border:2px solid #000;background:#fff;color:#111;font-weight:800}.bp-tier button.on{background:var(--pink);color:#fff}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
const nf = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + 'K' : String(Math.floor(n));
const ACH = [
  ['a_first', '첫 판을 시작했어요', ''], ['a_skull', '통화가 처음 끊겼어요', 'rain'], ['a_dl3', '마감 3을 넘겼어요', 'bones'], ['a_atm', 'ATM에 1,000칩을 모았어요', 'atm2'],
  ['a_cherry', '한 번에 500칩 이상 벌었어요', 'cherry2'], ['a_jack', '잭팟(15칸 한 그림)', 'jack2'], ['a_rich', '마감 6을 넘겼어요', 'lips2'], ['a_call5', '레나의 전화를 5번 받았어요', 'vip'],
  ['a_win', '마감 9 — 빚을 다 갚았어요', 'cat'], ['a_end', '끝없는 밤 마감 10을 넘겼어요', ''], ['a_end12', '끝없는 밤 마감 12를 넘겼어요', ''], ['a_daily', '오늘의 판을 했어요', '']
];
function meta() { if (!S.slotMeta) S.slotMeta = { best: 0, wins: 0, hardMax: 0, hard: 0, unl: [], ach: {}, seen: {}, calls: 0, daily: {} }; return S.slotMeta; }
function ach(id) { const M = meta(); if (M.ach[id]) return; M.ach[id] = dk(new Date()); const a = ACH.find(x => x[0] === id); if (a[2] && !M.unl.includes(id)) M.unl.push(id); toast(`도전 과제: ${a[1]}${a[2] ? ` → 새 부적 '${CHM[a[2]].n}'` : ''}`); }
let R = null, busy = false, last = null;
function persist() { S.slot2 = R; save(); }
function checkAch() { if (!R) return; const M = meta(); if (R.skSeen) ach('a_skull'); if (R.dl > 3) ach('a_dl3'); if (R.dl > 6) ach('a_rich'); if (R.atm >= 1000) ach('a_atm'); if (R.log.bestWin >= 500) ach('a_cherry'); if (R.log.jack) ach('a_jack'); if (M.calls >= 5) ach('a_call5'); if (R.endless && R.dl > 10) ach('a_end'); if (R.endless && R.dl > 12) ach('a_end12'); R.ch.forEach(id => { M.seen[id] = 1; }); }
function enter() { delete S.slotRun; R = S.slot2 || null; tk0 = R ? R.cards : null; if (R) R.unl = meta().unl; R ? draw() : lobby(); }
// v140 다른 테이블 게임과 같은 틀: 딜러 띠(밖 모드는 고양이) → 초록 테이블(.tb-felt) → 결과 줄(.tb-res) → 숫자 알약 줄 → 버튼 줄(.tb-act). 기계 그림 없음
function top(B, t) { if (ARC.dealer) { ARC.dealer(B, t); B.classList.add('slg'); } else talk(B, 'l', t); }
function felt(B, cls) { const F = el('div', 'tb-felt sl-felt' + (cls ? ' ' + cls : '')); B.appendChild(F); return F; }
function lb(F, a, b) { const d = el('div', 'tb-lb'); d.append(el('span', null, a)); if (b != null) { const x = el('b'); x.innerHTML = b; d.appendChild(x); } F.appendChild(d); return d; }
function resLine(B, t, k) { const d = el('div', 'tb-res ' + (k || ''), t || ''); d.id = 'tray'; B.appendChild(d); return d; }
function pills(B, list) { const r = el('div', 'tb-bet sl-pills'); list.forEach(([k, a, v, f]) => { const x = el('button'); x.innerHTML = `<small>${k === 'tk' ? TK : k ? ci(k) : ''}${a}</small><b>${v}</b>`; if (f) x.onclick = f; else x.tabIndex = -1; r.appendChild(x); }); B.appendChild(r); }
function acts(B, list) { const r = el('div', 'tb-act'); list.forEach(([t, c, f, dis, id]) => { const b = el('button', c || ''); b.innerHTML = t; if (dis) b.disabled = true; if (id) b.id = id; b.onclick = f; r.appendChild(b); }); B.appendChild(r); return r; }
function stats(B) { const m = mods(R), intr = Math.floor(R.atm * (.07 + m.int)); pills(B, [['debt', '빚', nf(debtOf(R))], ['chip', '칩', nf(R.chips)], ['debt', 'ATM' + (intr ? ` +${nf(intr)}` : ''), nf(R.atm)], ['tk', '티켓', R.cards]]); }
const quit = () => { if (!confirm('이번 판 그만둘래? 넘긴 마감만큼 동전은 줄게.')) return; R.ph = 'over'; R.quit = 1; finish(); };
let achOn = false;
function lobby() {
  frame(NAME, B => {
    const M = meta(), n = ACH.filter(x => M.ach[x[0]]).length; top(B, '빚 갚는 슬롯이야. 마감 9번 넘기면 다 갚는 거고, 내가 옆에서 봐 줄게.');
    const F = felt(B, achOn ? 'slach' : '');
    if (achOn) { lb(F, `도전 과제 ${n}/${ACH.length}`); const L = el('div', 'bp-ach'); ACH.forEach(([id, t, u]) => { const d = el('div', M.ach[id] ? 'ok' : ''); d.append(el('b', null, M.ach[id] ? '✓' : ''), el('span', null, t + (u ? ` → 부적 '${CHM[u].n}'` : ''))); L.appendChild(d); }); F.appendChild(L); }
    else { F.appendChild(el('div', 'sl-title', NAME)); F.appendChild(el('div', 'tb-hint', '레버를 당겨 칩을 벌고, 라운드 3번마다 빚(마감)을 갚아. 가운데 해골 셋이면 통화가 끊겨서 손에 든 칩이 날아가. ATM에 넣어 두면 안전하고 이자도 붙어.')); }
    resLine(B, '');
    pills(B, [['', '최고 마감', M.best], ['', '클리어', M.wins], ['', '도감', `${Object.keys(M.seen).length}/${CH.filter(c => !c.hide).length}`], ['', achOn ? '닫기' : '도전 과제', `${n}/${ACH.length}`, () => { achOn = !achOn; lobby(); }]]);
    const today = dk(new Date()), dd = M.daily[today];
    const go = (seed, daily) => { if (gc() < 3) { toast('게임 동전이 모자라. (3개 필요)'); return; } gcAdd(-3); coinSound(); achOn = false; R = newRun(seed, { unl: M.unl }); tk0 = R.cards; R.daily = daily ? today : ''; ach('a_first'); if (daily) { M.daily = { [today]: { best: dd ? dd.best : 0 } }; ach('a_daily'); } persist(); draw(); };
    acts(B, [[`새 판 시작<small class="tb-mul">동전 ${ci('gc')}3</small>`, 'go', () => go((Date.now() * 9301) ^ (Math.random() * 1e9), 0)], [`오늘의 판<small class="tb-mul">${dd ? `오늘 최고 마감 ${dd.best}` : '오늘 모두 같은 판'}</small>`, 'tl', () => go([...today].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261), 1)]]);
  }, true);
}
function head(F) {
  const d = lb(F, `${R.endless ? '끝없는 밤 · ' : ''}마감 ${R.dl}${R.endless ? '' : '/' + FINAL}`, ''), i = el('i', 'sl-rd'); for (let k = 1; k <= 3; k++) i.appendChild(el('u', k < R.rd ? 'on' : k === R.rd ? 'now' : '')); d.lastChild.replaceWith(i);
  d.appendChild(el('em', 'sl-sk', `끊김 ${(skullP(R) * 100).toFixed(1)}%`)); return d;
}
// 릴 = 테이블 위 5×3 종이 칸 (애니메이션이 쓰는 id·클래스 rwin/reel/strip/sc/bpl 그대로, .cab은 숫자 팝 자리)
function reels(F, g) {
  const C = el('div', 'cab sl-cab'), win = el('div', 'rwin'); win.id = 'rwin';
  g = g || (last && last.g) || Array.from({ length: 15 }, (_, i) => SY[(i * 3 + R.dl) % 7]);
  for (let c = 0; c < 5; c++) { const reel = el('div', 'reel'), strip = el('div', 'strip'); strip.style.setProperty('--n', 3); strip.style.height = '100%';
    for (let r = 0; r < 3; r++) { const sc = el('div', 'sc'), i = el('img'); sc.dataset.i = r * 5 + c; i.src = IM(SIM[g[r * 5 + c]]); i.alt = SN[g[r * 5 + c]]; sc.appendChild(i); strip.appendChild(sc); }
    reel.appendChild(strip); win.appendChild(reel); }
  const sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('class', 'bp-lines'); sv.setAttribute('viewBox', '0 0 100 60'); sv.setAttribute('preserveAspectRatio', 'none'); sv.id = 'bpl'; win.appendChild(sv);
  C.appendChild(win); const W = el('div', 'cabw sl-cabw'); W.appendChild(C); F.appendChild(W); lvSet = null; return W;
}
function mine(F) {
  const vis = R.ch.filter(id => !CHM[id].hide), M = el('div', 'bp-mine');
  M.appendChild(el('span', 'bp-mt', `부적 ${used(R)}/${slots(R)}${R.chain.snow ? ` · 눈덩이 +${(R.chain.snow * .2).toFixed(1)}` : ''} · ×${nf(mods(R).heat)}`)); if (!vis.length) M.appendChild(el('span', 'bp-mt dim', R.ph === 'round' ? '— 가게에서 사' : '— 아직 없어'));
  vis.forEach(id => { const c = CHM[id], b = el('button', c.curse ? 'cur' : ''), i = el('img'); b.dataset.id = id; i.src = IM(c.i); i.alt = c.n; b.title = c.n; b.appendChild(i);
    b.onclick = () => { if (R.ph === 'round' && confirm(`${c.n}: ${c.d}\n\n팔까? 티켓 ${Math.max(1, Math.floor(c.p / 2))}장`)) { sell(R, id); persist(); draw(); } else if (R.ph !== 'round') toast(`${c.n}: ${c.d}`); }; M.appendChild(b); });
  F.appendChild(M);
}
function lineOf() {
  if (R.ph === 'spin') return R.say || '한 번 당겨 봐. 7 셋이면 오늘 밤은 네 거야.';
  if (R.ph === 'round') { const d = debtOf(R), have = R.atm + R.chips; return R.say || (have >= d ? `빚 ${nf(d)}은 모였어. 일찍 갚으면 남은 라운드마다 티켓 4장.` : R.rd === 3 ? `(해골이 장부를 톡톡) 마지막 라운드야. ${nf(d - have)}칩 더.` : `라운드 ${R.rd}/3. 칩은 ATM에 넣어 둬 — 통화 끊기면 손에 든 건 날아가.`); }
  if (R.ph === 'call') return pick([`마감 ${R.dl - 1} 넘겼네? …하나 골라. 내 선물이야.`, '살아 있었네. 다행. 이 중에 하나만 가져가.', '해골이 투덜대던데. 그래서 하나 더 챙겨 왔어.']);
  if (R.ph === 'win') return `…진짜 다 갚았어? 해골이 장부 덮었어. ${S.name || '송휘'}, 오늘 밤은 내 거야.`;
  return R.won ? '수고했어. 장부는 내가 태워 버릴게.' : R.quit ? '도망가는 거야? …다음엔 끝까지 봐.' : `(해골이 장부에 빨간 줄을 긋는다) 마감 ${R.dl}에서 ${nf(debtOf(R) - R.atm - R.chips)}칩 모자랐어.`;
}
function draw() {
  if (!R) return lobby();
  checkAch();
  if (R.ph === 'over' && R.reward == null) { finish(); return; }
  frame(NAME, B => {
    top(B, lineOf()); if (R.ph !== 'spin') R.say = '';
    if (R.ph === 'spin') {
      const F = felt(B); head(F); reels(F); mine(F); resLine(B, ''); stats(B);
      const L = [[`레버 당기기<small class="tb-mul">남은 ${R.spins}번 · 라운드 ${R.rd}/3</small>`, 'go', () => pull(), false, 'bpgo']];
      if (R.ch.includes('redbtn')) L.push([R.btnUsed ? '빨간 버튼<small class="tb-mul">씀</small>' : '빨간 버튼<small class="tb-mul">행운 +10</small>', 'sl-red', () => { pressRed(R); persist(); tone([880, 1320], .08, .06, 'square'); draw(); }, !!R.btnUsed]);
      L.push(['그만두기', 'sl-q', quit]); acts(B, L);
    } else if (R.ph === 'round') roundUI(B);
    else if (R.ph === 'call') callUI(B);
    else if (R.ph === 'win') winUI(B);
    else if (R.ph === 'over') overUI(B);
  }, true);
}
function roundUI(B) {
  const d = debtOf(R), lev = leverOf(R.dl), free = R.chips < lev, rc = restockOf(R), F = felt(B, 'slshop');
  const h = lb(F, `라운드 ${R.rd} 준비 · 부적 가게`); const rb = el('button', 'sl-mini', `다시 채우기 ${nf(rc)}칩`); rb.onclick = () => { if (!restock(R)) { toast('손에 든 칩이 모자라.'); return; } coinSound(); persist(); draw(); }; h.appendChild(rb);
  const G = el('div', 'bp-ch');
  R.offers.forEach(id => { const c = CHM[id], x = el('button', 'bp-c r' + c.r + (c.curse ? ' cur' : '')), i = el('img'), t = el('div'); i.src = IM(c.i); i.alt = ''; t.append(el('b', null, c.n), el('small', null, c.d)); const em = el('em'); em.innerHTML = TK + priceOf(R, id); x.append(i, t, em);
    x.onclick = () => { const r = buy(R, id); if (r === 'cards') toast('티켓이 모자라.'); else if (r === 'full') toast('부적 칸이 꽉 찼어. 아래 내 부적을 누르면 팔 수 있어.'); else if (r === 'ok') { tone([660, 990], .07, .05, 'triangle'); meta().seen[id] = 1; persist(); draw(); } }; G.appendChild(x); });
  if (!R.offers.length) G.appendChild(el('div', 'tb-hint', '다 샀어.'));
  F.appendChild(G); mine(F);
  const a = el('div', 'sl-atm'), A = (t, f, c) => { const b = el('button', c || '', t); b.onclick = f; a.appendChild(b); };
  A(`ATM에 넣기 (${lev} 남김)`, () => { deposit(R, R.chips - lev); coinSound(); persist(); draw(); }); A('전부 넣기', () => { deposit(R, R.chips); coinSound(); persist(); draw(); });
  if (canPayEarly(R)) A(`빚 ${nf(d)} 갚기`, () => { payEarly(R); coinSound(); setTimeout(coinSound, 150); after(); }, 'pay');
  F.appendChild(a);
  resLine(B, ''); stats(B);
  acts(B, [[`7번 돌리기<small class="tb-mul">${free ? '이번은 공짜' : `레버 값 ${lev}칩`}</small>`, 'go', () => { startRound(R, 7); persist(); draw(); }], [`3번 + 티켓 2<small class="tb-mul">레버 값 ${lev}칩</small>`, 'tl', () => { const t = R.cards; startRound(R, 3); persist(); draw(); tkOut(R.cards - t); tk0 = R.cards; }, free], ['그만두기', 'sl-q', quit]]);
}
function callUI(B) {
  const F = felt(B, 'slcall'); lb(F, '☎ 레나의 전화 — 하나 골라');
  R.call.forEach((o, i) => { const t = callText(R, o), b = el('button', 'bp-opt' + (t.red ? ' red' : '')); b.append(el('b', null, t.t), el('small', null, t.d)); b.onclick = () => { takeCall(R, i); meta().calls++; tone([523, 784], .1, .06, 'triangle'); persist(); draw(); }; F.appendChild(b); });
  resLine(B, ''); stats(B);
  acts(B, [[`다시 걸기<small class="tb-mul">티켓 ${recallCost(R)}</small>`, '', () => { if (!recall(R)) { toast('티켓이 모자라.'); return; } dtmf(5); persist(); draw(); }], ['그만두기', 'sl-q', quit]]);
}
function winUI(B) {
  const M = meta(); if (!R.counted) { R.counted = 1; M.wins++; ach('a_win'); persist(); }
  const F = felt(B); F.appendChild(el('div', 'sl-title', '빚 다 갚았어')); F.appendChild(el('div', 'tb-hint', `여기서 끝내면 게임 동전 +${Math.min(60, R.dl * 2 + 20)}. 끝없는 밤으로 가면 빚이 계속 커지고, 넘긴 마감마다 동전이 더 붙어.`));
  resLine(B, '클리어!', 'w'); stats(B);
  acts(B, [['끝없는 밤으로', 'go', () => { goEndless(R); persist(); draw(); }], ['여기서 끝내기', 'tl', () => { R.ph = 'over'; finish(); }]]);
}
function finish() {
  const M = meta(), passed = R.ph === 'win' ? R.dl : R.dl - 1; R.passed = passed; R.won = R.ph === 'win' || R.endless;
  const g = Math.min(60, passed * 2 + (R.won ? 20 : 0)); R.reward = g;
  M.best = Math.max(M.best, passed); if (R.daily && M.daily[R.daily]) M.daily[R.daily].best = Math.max(M.daily[R.daily].best, passed);
  R.ph = 'over'; if (g) gcAdd(g); persist(); draw();
}
function overUI(B) {
  const F = felt(B); F.appendChild(el('div', 'sl-title', `넘긴 마감 ${R.passed}`)); F.appendChild(el('div', 'tb-hint', `가장 크게 번 한 번 ${nf(R.log.bestWin)}칩 · 잭팟 ${R.log.jack}번 · 통화 끊김 ${R.log.skulls}번 · 레나의 전화 ${R.log.calls}번`));
  resLine(B, `게임 동전 +${R.reward}`, R.reward ? 'w' : 'l'); stats(B);
  acts(B, [['다시 하기', 'go', () => { S.slot2 = null; R = null; save(); lobby(); }]]);
}
let tk0 = null;
function tkOut(n) { const c = document.querySelector('#arc .cab'); if (!c || n <= 0) return; const t = el('div', 'bp-tkout'); t.innerHTML = `티켓 +${n}`; c.appendChild(t); [0, 80, 160].forEach(d => setTimeout(() => tone([1400], .02, .03, 'square'), d)); setTimeout(() => t.remove(), 1650); }
function after() { // 마감이 바뀌었을 수 있음
  if (R.ph === 'over') { finish(); return; }
  if (R.ph === 'call') { tone([1046, 1318, 1046, 1318], .12, .06, 'sine'); }
  persist(); draw();
  if (tk0 != null && R.cards > tk0) tkOut(R.cards - tk0); tk0 = R.cards;
}
// 레버
let lvSet = null;
function leverEl() {
  const L = el('div', 'lvr'), bs = el('div', 'bs'), arm = el('div', 'arm'), ball = el('div', 'ball'); L.append(bs, arm, ball);
  const set = p => { const H = L.clientHeight || 200, piv = H * .54, len = H * .48, by = piv - len * Math.cos(Math.PI * p), sc = 1 + .35 * Math.sin(Math.PI * p); ball.style.top = by + 'px'; ball.style.transform = `scale(${sc})`; arm.style.top = Math.min(by, piv) + 'px'; arm.style.height = Math.abs(by - piv) + 'px'; };
  lvSet = set; requestAnimationFrame(() => set(0));
  let drag = null;
  L.onpointerdown = e => { if (busy) return; drag = { y: e.clientY, p: 0 }; L.setPointerCapture(e.pointerId); };
  L.onpointermove = e => { if (!drag) return; drag.p = Math.max(0, Math.min(1, (e.clientY - drag.y) / (L.clientHeight * .8))); set(drag.p); };
  L.onpointerup = L.onpointercancel = () => { if (!drag) return; const p = drag.p; drag = null; if (p < .08) return pull(); back(p); if (p > .55) go(); };
  return L;
}
function back(from) { const t0 = performance.now(); const f = now => { const u = Math.min(1, (now - t0) / 380); lvSet && lvSet(Math.max(0, from * (1 - u) * Math.cos(u * 8) ** 2)); if (u < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); tone([180], .06, .04, 'square'); }
function pull() { if (busy) return; const t0 = performance.now(); const f = now => { const u = Math.min(1, (now - t0) / 240); lvSet && lvSet(u); if (u < 1) requestAnimationFrame(f); else { back(1); go(); } }; requestAnimationFrame(f); }
let skip = false;
const wait = ms => new Promise(r => { const t0 = Date.now(); const k = () => (skip || Date.now() - t0 >= ms) ? r() : setTimeout(k, 30); k(); });
async function go() {
  if (busy || !R || R.ph !== 'spin') return; busy = true; skip = false;
  const old = (last && last.g) || null, res = spin(R); last = res; persist();
  const gb = $('bpgo'); if (gb) { gb.disabled = true; gb.innerHTML = '돌아가는 중…<small>화면을 누르면 빨리 멈춰요</small>'; }
  const win = $('rwin'); const tapSkip = () => { skip = true; }; win && win.closest('.abody').addEventListener('pointerdown', tapSkip);
  const reels = [...document.querySelectorAll('#rwin .reel')], keys = SY, N = 20;
  // 두근두근: 앞 4줄만으로 거의 완성된 줄이 있으면 마지막 릴을 느리게
  const g = res.g, tease = FIX.concat([{ cells: [0, 1, 2, 3, 4] }, { cells: [5, 6, 7, 8, 9] }, { cells: [10, 11, 12, 13, 14] }]).some(p => { const a = p.cells.filter(i => i % 5 !== 4), b = p.cells.filter(i => i % 5 === 4); return b.length && a.length >= 2 && a.every(i => g[i] === g[a[0]] && g[i] !== 'skull'); });
  const tick = setInterval(() => tone([900 + Math.random() * 200], .015, .012, 'square'), 90);
  await Promise.all(reels.map((reel, c) => new Promise(res2 => {
    const strip = reel.querySelector('.strip'); strip.innerHTML = ''; strip.style.setProperty('--n', N); strip.style.height = (N / 3 * 100) + '%';
    const cur = old ? [old[c], old[5 + c], old[10 + c]] : [keys[0], keys[1], keys[2]];
    [g[c], g[5 + c], g[10 + c], ...Array.from({ length: N - 6 }, () => pick(keys)), ...cur].forEach((k, j) => { const sc = el('div', 'sc'), i = el('img'); if (j < 3) sc.dataset.i = j * 5 + c; i.src = IM(SIM[k]); i.alt = ''; sc.appendChild(i); strip.appendChild(sc); });
    strip.style.transition = 'none'; strip.style.transform = `translateY(${-(N - 3) / N * 100}%)`; strip.classList.add('blur'); void strip.offsetHeight;
    const dur = skip ? 200 : 700 + c * 230 + (c === 4 && tease ? 900 : 0);
    strip.style.transition = `transform ${dur}ms cubic-bezier(.25,.75,.3,1.06)`; strip.style.transform = 'translateY(0)';
    const t0 = Date.now(); const chk = () => { if (Date.now() - t0 >= dur || (skip && Date.now() - t0 > 120)) { strip.style.transition = 'none'; strip.style.transform = 'translateY(0)'; strip.classList.remove('blur'); tone([300 + c * 70], .05, .05, 'square'); res2(); } else setTimeout(chk, 30); }; setTimeout(chk, 30);
    if (c === 4 && tease && !skip) setTimeout(() => tone([1200, 1400, 1600], .09, .05, 'triangle'), 700 + c * 230);
  })));
  clearInterval(tick);
  const tray = $('tray'), cab = document.querySelector('#arc .cabw');
  if (res.skull) {
    [6, 7, 8].forEach(i => { const x = document.querySelector(`#rwin .sc[data-i="${i}"]`); x && x.classList.add('six'); });
    cab && cab.classList.add('bp-skull'); const c6 = document.querySelector('#arc .cab');
    if (c6) { const k = el('div', 'bp-cut'); k.innerHTML = '<b>뚝 — 통화 끊김</b><svg viewBox="0 0 100 20" preserveAspectRatio="none"><polyline points="0,10 30,10 36,2 42,18 48,10 100,10"/></svg>'; c6.appendChild(k); }
    const dd = el('div', 'bp-dead'); document.body.appendChild(dd); setTimeout(() => dd.remove(), 1600);
    [0, 500, 1000].forEach(d => setTimeout(() => tone([480, 620], .3, .07, 'sine'), d)); if (tray) tray.textContent = res.lost ? `−${nf(res.lost)}` : '뚝';
    R.say = res.lost ? `(해골 셋이 웃는다) 손에 든 ${nf(res.lost)}칩 날아갔어. …ATM에 넣어 두랬잖아.` : '(뚝— 해골이 수화기를 내려놨다) 다행히 손에 든 칩은 없었어.'; R.sayW = 'sk';
    await wait(1700);
  } else {
    if (res.blocked) { pop('해골 우산이 끊김을 막았어!'); R.say = '(해골 우산이 펴졌다) 이번엔 봐줬대.'; R.sayW = 'sk'; await wait(700); }
    const sv = $('bpl'), cabE = document.querySelector('#arc .cab'), wE = $('rwin'); let run = 0, n = 0;
    const NOTE = [523, 587, 659, 784, 880, 988, 1047, 1175, 1319, 1568];
    for (const w of res.wins) {
      if (sv) { sv.innerHTML = ''; const pl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'); pl.setAttribute('points', w.cells.map(i => `${(i % 5) * 20 + 10},${Math.floor(i / 5) * 20 + 10}`).join(' ')); sv.appendChild(pl); }
      document.querySelectorAll('#rwin .sc.hit').forEach(x => x.classList.remove('hit')); void (wE && wE.offsetWidth); w.cells.forEach(i => { const x = document.querySelector(`#rwin .sc[data-i="${i}"]`); x && x.classList.add('hit'); });
      run += w.amt; n++;
      if (cabE && wE) { const cx = w.cells.reduce((a, i) => a + i % 5, 0) / w.cells.length, cy = w.cells.reduce((a, i) => a + Math.floor(i / 5), 0) / w.cells.length; const q = el('div', 'bp-num'); q.innerHTML = `+${nf(w.amt)}<small>${PN[w.k]}</small>`; const wr = wE.getBoundingClientRect(), cr = cabE.getBoundingClientRect(); q.style.left = ((wr.left - cr.left + wr.width * (cx + .5) / 5) / cr.width * 100) + '%'; q.style.top = ((wr.top - cr.top + wr.height * (cy + .5) / 3) / cr.height * 100) + '%'; cabE.appendChild(q); setTimeout(() => q.remove(), 820); }
      if (tray) tray.textContent = '+' + nf(run);
      tone([NOTE[Math.min(9, n - 1)], NOTE[Math.min(9, n - 1)] * 1.5], .07, .06, 'square'); coinSound();
      const cw = document.querySelector('#arc .cabw'); if (cw && w.amt >= 10) { cw.classList.remove('bp-shk'); void cw.offsetWidth; cw.classList.add('bp-shk'); }
      await wait(res.wins.length > 6 ? 360 : 560);
    }
    const jack = res.wins.some(w => w.k === 'jack');
    if (res.tot) {
      if (tray) count(tray, res.tot);
      if (cabE) { const t = el('div', 'bp-tot'); t.innerHTML = `+${nf(res.tot)}<small>${res.wins.length}줄${mods(R).G !== 1 ? ` · 전체 ×${nf(mods(R).G)}` : ''}</small>`; cabE.appendChild(t); setTimeout(() => t.remove(), 1350); }
      [0, 90, 180, 270].forEach((d, i) => setTimeout(() => tone([NOTE[i * 2] * 2], .05, .05, 'triangle'), d));
      if (jack) { const J = el('div', 'bp-jack'); J.appendChild(el('b', null, 'JACKPOT')); document.body.appendChild(J); setTimeout(() => J.remove(), 2700); burst(40); [0, 150, 300, 450, 600].forEach((d, i) => setTimeout(() => tone([NOTE[i + 3], NOTE[i + 5]], .12, .07, 'square'), d)); await wait(1400); }
      else if (res.tot >= debtOf(R) * .1 || res.wins.length >= 4) burst(Math.min(30, 8 + res.wins.length * 2));
    }
    else if (tray) tray.textContent = res.consol ? `꽝 +${res.tot}` : '꽝';
    R.say = jack ? '잭팟!! …기계가 너한테 반했나 봐.' : res.tot >= debtOf(R) * .3 ? pick(['대박. 지금 나 보고 웃은 거 맞지?', '해골이 장부 떨어뜨렸어.']) : res.tot ? pick(['좋아, 그 손맛.', '조금씩이라도 모아.', '티끌 모아 빚 갚기.']) : pick(['꽝. …괜찮아, 나 아직 여기 있어.', '(해골이 어깨를 으쓱한다)', '다음 거 당겨.']); R.sayW = res.tot ? 'l' : 'sk';
    await wait(res.tot ? 700 : 350);
  }
  win && win.closest('.abody') && win.closest('.abody').removeEventListener('pointerdown', tapSkip);
  busy = false; after();
}
function pop(t) { const w = $('rwin'); if (!w) return; const p = el('div', 'bp-pop', t); w.parentNode.appendChild(p); setTimeout(() => p.remove(), 950); }
function count(tr, n) { let v = 0; const st = Math.max(1, Math.ceil(n / 16)); const iv = setInterval(() => { v = Math.min(n, v + st); tr.textContent = '+' + nf(v); if (v >= n) clearInterval(iv); }, 40); }
function burst(n) { const w = $('rwin'); if (!w) return; const b = w.getBoundingClientRect(); for (let i = 0; i < n; i++) { const c = el('div', 'bp-coin'); document.body.appendChild(c); const x0 = b.left + b.width / 2, y0 = b.bottom, vx = (Math.random() - .5) * 9, vy = -8 - Math.random() * 7; let x = x0, y = y0, vy2 = vy, t = 0; const f = () => { t++; x += vx; vy2 += .55; y += vy2; c.style.transform = `translate(${x - 13}px,${y - 13}px) rotate(${t * 12}deg)`; if (t < 70 && y < innerHeight + 30) requestAnimationFrame(f); else c.remove(); }; requestAnimationFrame(f); } }
window.ARC.reg({ id: 'slot', order: 5, name: NAME, ban: 'slot', icon: IM('s/d_cherry'), color: '#f2ea3a', cost: 3, sub: () => `해골 빚 갚기 슬롯 · 최고 마감 ${meta().best}${S.slot2 && S.slot2.ph !== 'over' ? ' · 이어하기' : ''}`, start: enter });
window.lenaSlot = { get R() { return R; }, set R(v) { R = v; }, draw, lobby, CORE };
})();
